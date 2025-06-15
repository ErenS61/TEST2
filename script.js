// Vider le cache à chaque démarrage
if ("serviceWorker" in navigator && "caches" in window) {
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      caches.delete(cacheName);
    });
  });
}

// Variables pour stocker les sélections
const selectedCity = localStorage.getItem("selectedCity") || "";
const selectedStationId = localStorage.getItem("stationId") || "";

// Création des menus déroulants
function createVilleEtStationSelectors() {
  const container = document.getElementById("stationSelectorContainer");

  // Création du sélecteur de ville
  const villeSelect = document.createElement("select");
  villeSelect.id = "villeSelector";
  villeSelect.innerHTML = '<option value="">Choisir une ville...</option>';

  // Remplissage des villes
  Object.keys(stationsParVille)
    .sort()
    .forEach((ville) => {
      const option = document.createElement("option");
      option.value = ville;
      option.textContent = ville;
      if (ville === selectedCity) option.selected = true;
      villeSelect.appendChild(option);
    });

  // Création du sélecteur de station
  const stationSelect = document.createElement("select");
  stationSelect.id = "stationSelector";
  stationSelect.style.display = selectedCity ? "inline-block" : "none";
  stationSelect.innerHTML = '<option value="">Choisir une station...</option>';

  // Remplissage des stations si une ville est sélectionnée
  if (selectedCity && stationsParVille[selectedCity]) {
    stationsParVille[selectedCity].forEach((station) => {
      const option = document.createElement("option");
      option.value = station.id;
      option.textContent = station.nom;
      if (station.id === selectedStationId) option.selected = true;
      stationSelect.appendChild(option);
    });
  }

  // Gestion du changement de ville
  villeSelect.addEventListener("change", function () {
    const ville = this.value;
    localStorage.setItem("selectedCity", ville);
    localStorage.removeItem("stationId");

    // Mise à jour du sélecteur de stations
    stationSelect.innerHTML = '<option value="">Choisir une station...</option>';
    stationSelect.style.display = "none";

    if (ville && stationsParVille[ville]) {
      stationsParVille[ville].forEach((station) => {
        const option = document.createElement("option");
        option.value = station.id;
        option.textContent = station.nom;
        stationSelect.appendChild(option);
      });
      stationSelect.style.display = "inline-block";
    }

    // Réinitialiser l'affichage
    document.getElementById("carburantContainer").innerHTML = "";
    document.getElementById("pageTitle").textContent = "⛽ Prix Carburants";
    document.getElementById("stationInfo").innerHTML = "";
  });

  // Gestion du changement de station
  stationSelect.addEventListener("change", function () {
    const stationId = this.value;

    if (stationId) {
      localStorage.setItem("stationId", stationId);
      location.reload();
    } else {
      localStorage.removeItem("stationId");
      document.getElementById("carburantContainer").innerHTML = "";
      document.getElementById("pageTitle").textContent = "⛽ Prix Carburants";
      document.getElementById("stationInfo").innerHTML = "";
    }
  });

  container.innerHTML = "";
  container.appendChild(villeSelect);
  container.appendChild(stationSelect);
}

createVilleEtStationSelectors();

// === CHARGEMENT DES DONNÉES DE LA STATION ===

if (selectedStationId) {
  // Trouver le nom de la station sélectionnée
  let nomStation = "";
  Object.values(stationsParVille).some((stations) => {
    const station = stations.find((s) => s.id === selectedStationId);
    if (station) {
      nomStation = station.nom;
      return true;
    }
    return false;
  });

  // Mettre à jour le titre
  const pageTitle = document.getElementById("pageTitle");
  if (pageTitle) {
    pageTitle.textContent = `⛽ Prix Carburants - ${nomStation}`;
  }

  const baseUrl =
    "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records";
  const params = new URLSearchParams({
    select: [
      "id",
      "adresse",
      "cp",
      "ville",
      "departement",
      "region",
      "gazole_prix",
      "gazole_maj",
      "e85_prix",
      "e85_maj",
      "gplc_prix",
      "gplc_maj",
      "e10_prix",
      "e10_maj",
      "sp98_prix",
      "sp98_maj",
      "sp95_prix",
      "sp95_maj",
      "carburants_indisponibles",
      "carburants_rupture_temporaire"
    ].join(", "),
    limit: "1",
    refine: `id:${selectedStationId}`,
    lang: "fr",
    timezone: "UTC",
    _: Date.now().toString()
  });

  const url = `${baseUrl}?${params.toString()}`;

  const carburants = {
    gazole_prix: { nom: "Gazole (B7)", icone: "fa-solid fa-oil-can", couleur: "#cccc00", alias: "Gazole" },
    e85_prix: { nom: "E85", icone: "fa-solid fa-leaf", couleur: "#33cc33", alias: "E85" },
    gplc_prix: { nom: "GPLc (LPG)", icone: "fa-solid fa-fire", couleur: "#ff6600", alias: "GPLc" },
    e10_prix: { nom: "SP95-E10", icone: "fa-solid fa-gas-pump", couleur: "#3399ff", alias: "E10" },
    sp98_prix: { nom: "SP98 (E5)", icone: "fa-solid fa-car-side", couleur: "#ff3366", alias: "SP98" },
    sp95_prix: { nom: "SP95 (E5)", icone: "fa-solid fa-truck-pickup", couleur: "#66ccff", alias: "SP95" }
  };

  fetch(url, { cache: "no-store" })
    .then((res) => res.json())
    .then((data) => {
      const record = data.results[0];
      if (!record) return;

      const stationInfo = document.getElementById("stationInfo");
      stationInfo.innerHTML = `<strong>${record.adresse}</strong><br>${record.cp} ${record.ville}, ${record.departement}, ${record.region}`;

      const container = document.getElementById("carburantContainer");
      const indisponibles = record.carburants_indisponibles || [];
      const ruptures = record.carburants_rupture_temporaire || [];

      for (const [champ, { nom, icone, couleur, alias }] of Object.entries(carburants)) {
        const enRupture = ruptures.includes(alias);
        const estIndisponible = indisponibles.includes(alias);

        if (enRupture) {
          container.innerHTML += `
            <div class="rupture">
              <div class="type"><i class="${icone}"></i> ${nom}</div>
              <div class="message">Rupture de stock</div>
              <div class="maj">Non disponible</div>
            </div>`;
          continue;
        }

        if (estIndisponible) continue;

        const prix = record[champ];
        const majIso = record[champ.replace("_prix", "_maj")];
        let majFormatted = "Non disponible";

        if (majIso) {
          const date = new Date(majIso);
          majFormatted = date.toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC"
          });
        }

        container.innerHTML += `
          <div class="carburant">
            <div class="type">
              <i class="${icone}" style="color: ${couleur}; margin-right: 0.5rem;"></i>${nom}
            </div>
            <div class="prix">${prix ? prix.toFixed(3) + " €" : "N/A"}</div>
            <div class="maj">Dernière MàJ : ${majFormatted} (UTC)</div>
          </div>`;
      }
    })
    .catch((err) => {
      console.error("Erreur lors du chargement des données :", err);
    });
} else {
  // Si aucune station sélectionnée, vider l'affichage
  document.getElementById("carburantContainer").innerHTML = "";
  document.getElementById("stationInfo").innerHTML = "";
}

// Mise à jour automatique à l'heure pile
function actualiserALHeure() {
  const maintenant = new Date();
  const prochainHeure = new Date(maintenant);
  prochainHeure.setHours(maintenant.getHours() + 1);
  prochainHeure.setMinutes(0, 0, 0);
  const delai = prochainHeure.getTime() - maintenant.getTime();
  setTimeout(() => location.reload(), delai);
}
actualiserALHeure();

function refreshPage() {
  location.reload();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
