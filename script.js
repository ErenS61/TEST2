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

// Variables pour gérer l'état des boutons flottants
let buttonsExpanded = false;
const buttonDelay = 100;

// Fonction pour initialiser les boutons flottants
function initFloatingButtons() {
  const mainButton = document.getElementById("mainFloatingButton");

  if (!mainButton) {
    console.error("Bouton principal non trouvé");
    return;
  }

  // Ajouter l'événement click sur le bouton principal
  mainButton.addEventListener("click", toggleButtons);

  console.log("Boutons flottants initialisés");
}

// Fonction pour basculer l'état des boutons
function toggleButtons() {
  const mainButton = document.getElementById("mainFloatingButton");
  const allButtons = document.querySelectorAll(".floating-buttons button:not(.main-button)");

  if (!mainButton) return;

  if (!buttonsExpanded) {
    // Déployer les boutons - transformation en "-"
    mainButton.innerHTML = '<i class="fa-solid fa-minus"></i>';

    // Animation pour chaque bouton avec un délai (du bas vers le haut)
    // Avec column-reverse, l'ordre est inversé donc on anime du premier au dernier
    Array.from(allButtons).forEach((button, index) => {
      setTimeout(() => {
        button.classList.add("visible");
      }, index * buttonDelay);
    });
  } else {
    // Replier les boutons - transformation en "+"
    mainButton.innerHTML = '<i class="fa-solid fa-plus"></i>';

    // Animation pour chaque bouton avec un délai (du haut vers le bas)
    // On inverse l'ordre pour l'animation de fermeture
    Array.from(allButtons)
      .reverse()
      .forEach((button, index) => {
        setTimeout(() => {
          button.classList.remove("visible");
        }, index * buttonDelay);
      });
  }

  buttonsExpanded = !buttonsExpanded;
}

// Ajouter l'initialisation au chargement
document.addEventListener("DOMContentLoaded", function () {
  initFloatingButtons();
});

// ==================== FONCTIONS EXISTANTES ====================

// Création des menus déroulants
function createVilleEtStationSelectors() {
  const container = document.getElementById("stationSelectorContainer");

  if (!container) {
    console.error("Conteneur des sélecteurs non trouvé");
    return;
  }

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

// Chargement des données de la station sélectionnée
function loadStationData() {
  if (!selectedStationId) return;

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
    timezone: "Europe/Paris",
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
      if (favButton) {
        favButton.style.display = "flex";

        // Vérifier si la station est déjà favorite
        const favorites = JSON.parse(localStorage.getItem("fuelFavorites")) || [];
        const isFavorite = favorites.some((fav) => fav.id === selectedStationId);
        favButton.classList.toggle("active", isFavorite);
      }

      const stationInfo = document.getElementById("stationInfo");
      if (stationInfo) {
        stationInfo.innerHTML = `<strong>${record.adresse}</strong><br>${record.cp} ${record.ville}, ${record.departement}, ${record.region}`;
      }

      const container = document.getElementById("carburantContainer");
      if (!container) return;

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
            timeZone: "Europe/Paris"
          });
        }

        container.innerHTML += `
          <div class="carburant">
            <div class="type">
              <i class="${icone}" style="color: ${couleur}; margin-right: 0.5rem;"></i>${nom}
            </div>
            <div class="prix">${prix ? prix.toFixed(3) + " €" : "N/A"}</div>
            <div class="maj">Dernière MàJ : ${majFormatted}</div>
          </div>`;
      }
    })
    .catch((err) => {
      console.error("Erreur lors du chargement des données :", err);
    });
}

// Fonctions pour les favoris
function toggleFavorite() {
  if (!selectedStationId || !currentStationData) return;

  const favorites = JSON.parse(localStorage.getItem("fuelFavorites") || "[]");
  const favButton = document.getElementById("favoriteButton");
  const existingIndex = favorites.findIndex((fav) => fav.id === selectedStationId);

  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    if (favButton) favButton.classList.remove("active");
    showSystemMessage("Station retirée des favoris", true);
  } else {
    favorites.push({
      id: selectedStationId,
      name:
        currentStationData.nom || document.getElementById("pageTitle").textContent.replace("⛽ Prix Carburants - ", ""),
      address: currentStationData.adresse || "",
      city: currentStationData.ville || ""
    });
    if (favButton) favButton.classList.add("active");
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
      <h2>⭐ Stations Favorites (${favorites.length})</h2>
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
    if (villeSelect) {
      villeSelect.value = ville;
      villeSelect.dispatchEvent(new Event("change"));
    }

    function selectStation() {
      if (stationSelect) {
        stationSelect.value = stationId;
        stationSelect.dispatchEvent(new Event("change"));

        // Mettre à jour l'étoile IMMÉDIATEMENT
        const favorites = JSON.parse(localStorage.getItem("fuelFavorites")) || [];
        const favButton = document.getElementById("favoriteButton");
        if (favButton) {
          if (favorites.some((fav) => fav.id === stationId)) {
            favButton.classList.add("active");
          } else {
            favButton.classList.remove("active");
          }
        }

        document.querySelector(".favorites-modal")?.remove();
      }
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

// === Bouton Carte ===
function showMap() {
  const modal = document.createElement("div");
  modal.className = "map-modal";

  modal.innerHTML = `
    <div class="map-content">
      <button class="close-map" onclick="this.parentElement.parentElement.remove()">&times;</button>
      <h2>🗺️ Carte des stations</h2>
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

  // Ajouter le bouton de localisation en haut à gauche
  const locateControl = L.control({ position: "topleft" });
  locateControl.onAdd = function (map) {
    const div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-locate-control");
    div.innerHTML = `
      <a href="#" title="Se localiser" class="locate-button">
        <i class="fa-solid fa-location-crosshairs"></i>
      </a>
    `;

    div.onclick = function (e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      locateUser();
    };

    return div;
  };
  locateControl.addTo(map);

  // Fonction pour localiser l'utilisateur
  function locateUser() {
    if (navigator.geolocation) {
      // Afficher une animation de chargement
      const locateButton = document.querySelector(".leaflet-locate-control .locate-button");
      if (locateButton) {
        locateButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        locateButton.style.opacity = "0.8";
      }

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // Animation fluide vers la position
          map.flyTo([lat, lon], 13, {
            duration: 1,
            easeLinearity: 0.25
          });

          // Supprimer le marqueur précédent s'il existe
          if (window.userLocationMarker) {
            map.removeLayer(window.userLocationMarker);
          }

          // Ajouter un nouveau marqueur
          window.userLocationMarker = L.circleMarker([lat, lon], {
            radius: 8,
            fillColor: "#3388ff",
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
          })
            .addTo(map)
            .bindPopup("<b>📍 Vous êtes ici</b>", {
              className: "user-location-popup"
            });

          // Rétablir l'icône originale après un délai
          setTimeout(() => {
            if (locateButton) {
              locateButton.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
              locateButton.style.opacity = "1";
            }
            window.userLocationMarker.openPopup();
          }, 1000);
        },
        function (err) {
          console.warn("Géolocalisation refusée :", err.message);
          showSystemMessage("Géolocalisation refusée", true);

          // Rétablir l'icône originale en cas d'erreur
          const locateButton = document.querySelector(".leaflet-locate-control .locate-button");
          if (locateButton) {
            locateButton.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
            locateButton.style.opacity = "1";
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      showSystemMessage("Géolocalisation non supportée", true);
    }
  }

  // Localiser l'utilisateur automatiquement au chargement
  locateUser();

  // Compter le nombre total de stations
  let stationsLoaded = 0;
  const totalStations = Object.values(stationsParVille).reduce(function (acc, stations) {
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

  // Fonction pour charger une station individuelle (version améliorée)
  function loadStation(station, ville) {
    const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?select=id,geom,adresse,ville,gazole_prix,e10_prix&refine=id:${station.id}&limit=1&_=${Date.now()}`;

    fetch(url)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        const record = data.results[0];
        if (!record || !record.geom || !record.geom.lon || !record.geom.lat) {
          console.warn("Coordonnées manquantes pour:", station.nom);
          stationsLoaded++;
          checkAllStationsLoaded();
          return;
        }

        const lon = record.geom.lon;
        const lat = record.geom.lat;

        // Construction du contenu du popup avec logo
        let popupContent = `
  <div class="popup-container">
    <div class="popup-header">
      <b>${record.nom || station.nom}</b><br>
      ${record.adresse || ""}, ${record.ville || ville}
    </div>
    <div class="popup-prices-with-logo">
      <div class="popup-prices">
`;

        // Gazole - vérifier si disponible
        if (record.gazole_prix !== null && record.gazole_prix !== undefined) {
          popupContent += `
        <div class="price-line">
          Gazole : <span class="fuel-price">${record.gazole_prix.toFixed(3)} €</span>
        </div>
  `;
        } else {
          popupContent += `
        <div class="price-line">
          Gazole : <span class="fuel-unavailable">Indisponible</span>
        </div>
  `;
        }

        // SP95-E10 - vérifier si disponible
        if (record.e10_prix !== null && record.e10_prix !== undefined) {
          popupContent += `
        <div class="price-line">
          SP95-E10 : <span class="fuel-price">${record.e10_prix.toFixed(3)} €</span>
        </div>
  `;
        } else {
          popupContent += `
        <div class="price-line">
          SP95-E10 : <span class="fuel-unavailable">Indisponible</span>
        </div>
  `;
        }

        popupContent += `
      </div>
      ${station.logo ? `<div class="popup-logo"><img src="${station.logo}" alt="Logo"></div>` : ""}
    </div>
    <div class="popup-footer">
      <button onclick="selectStationFromMap('${station.id}')" class="popup-button">
        Voir détails
      </button>
      <button onclick="navigateToStation(${lat}, ${lon}, '${(record.adresse || "") + ", " + (record.ville || ville)}')" class="popup-button navigate-button">
        Y aller
      </button>
    </div>
  </div>
`;

        // Marqueur personnalisé
        const customIcon = L.divIcon({
          className: "custom-map-marker",
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
      .catch(function (err) {
        console.error("Erreur chargement station:", station.nom, err);
        stationsLoaded++;
        checkAllStationsLoaded();
      });
  }

  // Charger toutes les stations
  Object.entries(stationsParVille).forEach(function ([ville, stations]) {
    stations.forEach(function (station) {
      loadStation(station, ville);
    });
  });
}

// Fonction pour naviguer vers une station
function navigateToStation(lat, lon, address) {
  // Vérifier si l'utilisateur a déjà fait un choix
  const navigationPreference = localStorage.getItem("navigationPreference");

  if (navigationPreference) {
    // Utiliser le choix précédent
    openNavigationApp(lat, lon, address, navigationPreference);
  } else {
    // Demander à l'utilisateur de choisir
    showNavigationChoiceModal(lat, lon, address);
  }
}

// Fonction pour afficher le choix de navigation
function showNavigationChoiceModal(lat, lon, address) {
  const modal = document.createElement("div");
  modal.className = "navigation-modal";

  modal.innerHTML = `
    <div class="navigation-content">
      <button class="close-navigation" onclick="this.parentElement.parentElement.remove()">&times;</button>
      <h2>Choisir une application de navigation</h2>
      <div class="navigation-options">
        <button class="navigation-option" onclick="selectNavigationApp(${lat}, ${lon}, '${address.replace(/'/g, "\\'")}', 'google')">
          <i class="fa-brands fa-google"></i>
          Google Maps
        </button>
        <button class="navigation-option" onclick="selectNavigationApp(${lat}, ${lon}, '${address.replace(/'/g, "\\'")}', 'apple')">
          <i class="fa-brands fa-apple"></i>
          Apple Plans
        </button>
      </div>
      <div class="navigation-remember">
        <input type="checkbox" id="rememberChoice">
        <label for="rememberChoice">Se souvenir de mon choix</label>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.style.display = "flex";
}

// Fonction pour sélectionner une application de navigation
function selectNavigationApp(lat, lon, address, app) {
  const rememberChoice = document.getElementById("rememberChoice")?.checked;

  if (rememberChoice) {
    localStorage.setItem("navigationPreference", app);
  }

  openNavigationApp(lat, lon, address, app);

  // Fermer le modal
  document.querySelector(".navigation-modal")?.remove();
}

// Fonction pour ouvrir l'application de navigation choisie
function openNavigationApp(lat, lon, address, app) {
  let url;

  if (app === "google") {
    // Google Maps
    url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
  } else {
    // Apple Maps
    url = `https://maps.apple.com/?daddr=${lat},${lon}&dirflg=d&t=m`;
  }

  window.open(url, "_blank");
}

// Fonction pour sélectionner une station depuis la carte
function selectStationFromMap(stationId) {
  let found = false;

  Object.entries(stationsParVille).forEach(function ([ville, stations]) {
    if (found) return;

    const station = stations.find(function (s) {
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
  const villeSelect = document.getElementById("villeSelector");
  const stationSelect = document.getElementById("stationSelector");

  if (villeSelect) {
    villeSelect.value = ville;
    villeSelect.dispatchEvent(new Event("change"));
  }

  setTimeout(function selectStation() {
    if (stationSelect) {
      stationSelect.value = stationId;
      stationSelect.dispatchEvent(new Event("change"));
      document.querySelector(".map-modal")?.remove();
    }
  }, 100);
}

function refreshPage() {
  location.reload();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==================== INITIALISATION ====================

// Fonction d'initialisation principale
function initApp() {
  console.log("Initialisation de l'application");

  // Initialiser les menus déroulants
  createVilleEtStationSelectors();

  // Charger les données de la station si une station est sélectionnée
  if (selectedStationId) {
    loadStationData();
  } else {
    // Si aucune station sélectionnée, vider l'affichage
    const carburantContainer = document.getElementById("carburantContainer");
    const stationInfo = document.getElementById("stationInfo");
    const favoriteButton = document.getElementById("favoriteButton");

    if (carburantContainer) carburantContainer.innerHTML = "";
    if (stationInfo) stationInfo.innerHTML = "";
    if (favoriteButton) favoriteButton.style.display = "none";
  }

  // Initialiser les boutons flottants
  initFloatingButtons();

  // Afficher le bouton des favoris
  const favoritesButton = document.getElementById("favoritesButton");
  if (favoritesButton) favoritesButton.style.display = "flex";

  // Démarrer la mise à jour automatique
  actualiserALHeure();

  console.log("Application initialisée");
}

// Démarrer l'application lorsque le DOM est chargé
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
