// Vider le cache à chaque démarrage
if ("serviceWorker" in navigator && "caches" in window) {
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      caches.delete(cacheName);
    });
  });
}

// Migration des anciens favoris (objet) vers nouveau format (tableau)
const oldFavorites = JSON.parse(localStorage.getItem("fuelFavorites"));
if (oldFavorites && !Array.isArray(oldFavorites)) {
  const newFavorites = Object.values(oldFavorites);
  localStorage.setItem("fuelFavorites", JSON.stringify(newFavorites));
}

// Variables pour stocker les sélections
const selectedCity = localStorage.getItem("selectedCity") || "";
const selectedStationId = localStorage.getItem("stationId") || "";
let currentStationData = null;

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
    document.getElementById("favoriteButton").style.display = "none";
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
      document.getElementById("favoriteButton").style.display = "none";
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
      "carburants_rupture_temporaire",
      "geom"
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

      // Stocker les données de la station courante
      currentStationData = {
        ...record,
        nom: nomStation
      };

      // Afficher le bouton favori
      const favButton = document.getElementById("favoriteButton");
      favButton.style.display = "block";

      // Vérifier si la station est déjà favorite (version optimisée)
      const favorites = JSON.parse(localStorage.getItem("fuelFavorites")) || [];
      const isFavorite = favorites.some((fav) => fav.id === selectedStationId);
      favButton.classList.toggle("active", isFavorite);

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
  document.getElementById("favoriteButton").style.display = "none";
}

// Fonctions pour les favoris
function toggleFavorite() {
  if (!selectedStationId || !currentStationData) return;

  const favorites = JSON.parse(localStorage.getItem("fuelFavorites") || "[]");
  const favButton = document.getElementById("favoriteButton");
  const existingIndex = favorites.findIndex((fav) => fav.id === selectedStationId);

  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    favButton.classList.remove("active");
    showSystemMessage("Station retirée des favoris", true);
  } else {
    favorites.push({
      id: selectedStationId,
      name:
        currentStationData.nom || document.getElementById("pageTitle").textContent.replace("⛽ Prix Carburants - ", ""),
      address: currentStationData.adresse || "",
      city: currentStationData.ville || ""
    });
    favButton.classList.add("active");
    showSystemMessage("Station ajoutée aux favoris");
  }

  localStorage.setItem("fuelFavorites", JSON.stringify(favorites));
}

function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem("fuelFavorites")) || [];
  const modal = document.createElement("div");
  modal.className = "favorites-modal";

  let favoritesHTML = "";
  if (favorites.length === 0) {
    favoritesHTML = '<div class="no-favorites">Aucune station favorite</div>';
  } else {
    // Affiche dans l'ordre du tableau (déjà ordonné par ajout)
    favorites.forEach(function (station) {
      favoritesHTML += `<div class="favorite-station" onclick="selectFavorite('${station.id}')">
        <div class="name">${station.name}</div>
        <div class="address">${station.address}, ${station.city}</div>
      </div>`;
    });
  }

  modal.innerHTML = `
    <div class="favorites-content">
      <button class="close-favorites" onclick="this.parentElement.parentElement.remove()">&times;</button>
      <h2>Stations Favorites (${favorites.length})</h2>
      <div id="favoritesList">${favoritesHTML}</div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.style.display = "flex";
}

function selectFavorite(stationId) {
  const villeSelect = document.getElementById("villeSelector");
  const stationSelect = document.getElementById("stationSelector");

  function handleStationSelection(ville, stationId) {
    villeSelect.value = ville;
    villeSelect.dispatchEvent(new Event("change"));

    function selectStation() {
      stationSelect.value = stationId;
      stationSelect.dispatchEvent(new Event("change"));

      // Mettre à jour l'étoile IMMÉDIATEMENT
      const favorites = JSON.parse(localStorage.getItem("fuelFavorites")) || [];
      const favButton = document.getElementById("favoriteButton");
      if (favorites.some((fav) => fav.id === stationId)) {
        favButton.classList.add("active");
      } else {
        favButton.classList.remove("active");
      }

      document.querySelector(".favorites-modal")?.remove();
    }

    setTimeout(selectStation, 100);
  }

  for (const [ville, stations] of Object.entries(stationsParVille)) {
    const station = findStationById(stations, stationId);
    if (station) {
      handleStationSelection(ville, stationId);
      return;
    }
  }
}

// Fonction helper pour trouver une station par ID
function findStationById(stations, id) {
  return stations.find(function (s) {
    return s.id === id;
  });
}

function showSystemMessage(message, isError = false) {
  const msg = document.createElement("div");
  msg.className = "system-message";
  msg.textContent = message;

  // Ajout de la classe pour les erreurs
  if (isError) {
    msg.classList.add("error-message");
  }

  document.body.appendChild(msg);

  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => msg.remove(), 500);
  }, 3000);
}

// Mise à jour automatique à l'heure pile
function actualiserALHeure() {
  const maintenant = new Date();
  const prochainHeure = new Date(maintenant);
  prochainHeure.setHours(maintenant.getHours() + 1);
  prochainHeure.setMinutes(0, 0, 0);
  const delai = prochainHeure.getTime() - maintenant.getTime();
  setTimeout(function () {
    location.reload();
  }, delai);
}
actualiserALHeure();

// === Bouton Carte ===
function showMap() {
  const modal = document.createElement("div");
  modal.className = "map-modal";

  modal.innerHTML = `
    <div class="map-content">
      <button class="close-map" onclick="this.parentElement.parentElement.remove()">&times;</button>
      <h2>Carte des stations</h2>
      <div id="map" style="width:100%;height:75vh;border-radius:8px;"></div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.style.display = "flex";

  // Initialiser la carte
  const map = L.map("map").setView([47.75, 7.3], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // Localiser l'utilisateur
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        map.setView([lat, lon], 13);
        
        L.circleMarker([lat, lon], {
          radius: 8,
          fillColor: "#3388ff",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map).bindPopup("<b>📍 Vous êtes ici</b>").openPopup();
      },
      function(err) {
        console.warn("Géolocalisation refusée :", err.message);
      }
    );
  }

  // Compter le nombre total de stations
  let stationsLoaded = 0;
  const totalStations = Object.values(stationsParVille).reduce(function(acc, stations) {
    return acc + stations.length;
  }, 0);

  // Fonction pour vérifier si toutes les stations sont chargées
  function checkAllStationsLoaded() {
    if (stationsLoaded === totalStations) {
      if (Object.keys(map._layers).length <= 1) {
        showSystemMessage("Aucune station avec coordonnées trouvée", true);
      }
    }
  }

  // Fonction pour charger une station individuelle
  function loadStation(station, ville) {
    const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?select=id,geom,adresse,ville,gazole_prix,e10_prix&refine=id:${station.id}&limit=1&_=${Date.now()}`;

    fetch(url)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        const record = data.results[0];
        if (!record || !record.geom || !record.geom.lon || !record.geom.lat) {
          console.warn("Coordonnées manquantes pour:", station.nom);
          stationsLoaded++;
          checkAllStationsLoaded();
          return;
        }

        const lon = record.geom.lon;
        const lat = record.geom.lat;

        // Modifié: Mise en gras de "Gazole" et "SP95-E10"
        const popupContent = `
          <b>${record.nom || station.nom}</b><br>
          ${record.adresse || ''}, ${record.ville || ville}<br>
          <br>
          ${record.gazole_prix ? `<b>Gazole</b> : ${record.gazole_prix.toFixed(3)} €` : ''}
          ${record.e10_prix ? `<br><b>SP95-E10</b> : ${record.e10_prix.toFixed(3)} €` : ''}
          <br><button onclick="selectStationFromMap('${station.id}')" 
               style="margin-top:8px;padding:4px 8px;background:#00ffcc;border:none;border-radius:4px;cursor:pointer;color:#1a1a1a;font-weight:bold">
               Voir détails
             </button>
        `;

        // Modifié: Utilisation d'un marqueur personnalisé
        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="background-color:#00ffcc; width:24px; height:24px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(0,0,0,0.5)">
                   <i class="fa-solid fa-gas-pump" style="color:#1a1a1a; font-size:12px"></i>
                 </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([lat, lon], { 
          title: record.nom || station.nom,
          icon: customIcon
        })
          .addTo(map)
          .bindPopup(popupContent);

        stationsLoaded++;
        checkAllStationsLoaded();
      })
      .catch(function(err) {
        console.error("Erreur chargement station:", station.nom, err);
        stationsLoaded++;
        checkAllStationsLoaded();
      });
  }

  // Charger toutes les stations
  Object.entries(stationsParVille).forEach(function([ville, stations]) {
    stations.forEach(function(station) {
      loadStation(station, ville);
    });
  });
}

// Fonction pour sélectionner une station depuis la carte
function selectStationFromMap(stationId) {
  let found = false;
  
  Object.entries(stationsParVille).forEach(function([ville, stations]) {
    if (found) return;
    
    const station = stations.find(function(s) { 
      return s.id === stationId; 
    });
    
    if (station) {
      found = true;
      handleStationSelection(ville, stationId);
    }
  });

  if (!found) {
    showSystemMessage("Station non trouvée", true);
  }
}

// Fonction helper pour la sélection de station
function handleStationSelection(ville, stationId) {
  const villeSelect = document.getElementById('villeSelector');
  const stationSelect = document.getElementById('stationSelector');
  
  villeSelect.value = ville;
  villeSelect.dispatchEvent(new Event('change'));
  
  setTimeout(function selectStation() {
    stationSelect.value = stationId;
    stationSelect.dispatchEvent(new Event('change'));
    document.querySelector('.map-modal')?.remove();
  }, 100);
}

function refreshPage() {
  location.reload();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Afficher le bouton des favoris dès le chargement
document.getElementById("favoritesButton").style.display = "block";