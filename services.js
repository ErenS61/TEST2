// Fichier de configuration des services des stations essence
// Mapping des services avec leurs icônes Font Awesome et couleurs

const servicesConfig = {
    // Services de base - Couleur: Bleu
    "Automate CB 24/24": { icon: "fa-solid fa-credit-card", color: "#3399ff" },
    "Vente de gaz domestique (Butane, Propane)": { icon: "fa-solid fa-fire", color: "#ff6600" },
    "Vente de fioul domestique": { icon: "fa-solid fa-gas-pump", color: "#cccc00" },
    "Vente de pétrole lampant": { icon: "fa-solid fa-gas-pump", color: "#cccc00" },
    "Carburant additivé": { icon: "fa-solid fa-flask", color: "#9966cc" },
    "Station de gonflage": { icon: "fa-solid fa-tire-flat", color: "#3399ff" },
    "Vente d'additifs carburants": { icon: "fa-solid fa-vial", color: "#9966cc" },

    // Services véhicules - Couleur: Vert
    "Lavage automatique": { icon: "fa-solid fa-car-wash", color: "#33cc33" },
    "Lavage manuel": { icon: "fa-solid fa-hand-sparkles", color: "#33cc33" },
    Laverie: { icon: "fa-solid fa-washing-machine", color: "#33cc33" },

    "Location de véhicule": { icon: "fa-solid fa-car-key", color: "#33cc33" },
    "Relais colis": { icon: "fa-solid fa-box-isometric-tape", color: "#33cc33" },
    "Services réparation / entretien": { icon: "fa-solid fa-screwdriver-wrench", color: "#33cc33" },
    Douches: { icon: "fa-solid fa-shower", color: "#33cc33" },

    // Services boutique - Couleur: Orange
    "Boutique alimentaire": { icon: "fa-solid fa-shop", color: "#ff9933" },
    "Boutique non alimentaire": { icon: "fa-solid fa-store", color: "#ff9933" },

    "Restauration à emporter": { icon: "fa-solid fa-hamburger", color: "#ff6600" },
    "Restauration sur place": { icon: "fa-solid fa-utensils", color: "#ff6600" },
    Bar: { icon: "fa-solid fa-coffee", color: "#ff6600" },
    "Toilettes publiques": { icon: "fa-solid fa-restroom-simple", color: "#ff9933" },

    // Services financiers - Couleur: Violet
    "DAB (Distributeur automatique de billets)": { icon: "fa-solid fa-money-from-bracket", color: "#9966cc" },

    // Services divers - Couleur: Cyan
    Wifi: { icon: "fa-solid fa-wifi", color: "#00ccff" },
    "Espace bébé": { icon: "fa-solid fa-baby", color: "#ff99cc" },

    "Aire de camping-cars": { icon: "fa-solid fa-campground", color: "#33cc33" },

    "Bornes électriques": { icon: "fa-solid fa-charging-station", color: "#00ffcc" },

    // Services professionnels - Couleur: Gris
    "Piste poids lourds": { icon: "fa-solid fa-truck", color: "#cccccc" },

    // Services carburants spécifiques - Couleur: Jaune
    GNV: { icon: "fa-solid fa-gas-pump", color: "#cccc00" }
};

// Fonction pour obtenir l'icône d'un service
function getServiceIcon(serviceName) {
    return servicesConfig[serviceName]?.icon || "fa-solid fa-question-circle";
}

// Fonction pour obtenir la couleur d'un service
function getServiceColor(serviceName) {
    return servicesConfig[serviceName]?.color || "#aaaaaa";
}
