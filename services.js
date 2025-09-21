// Fichier de configuration des services des stations essence
// Mapping des services avec leurs icônes Font Awesome

const servicesConfig = {
    // Services de base
    "Automate CB 24/24": "fa-solid fa-credit-card",
    "Vente de gaz domestique (Butane, Propane)": "fa-solid fa-fire",
    "Vente de fioul domestique": "fa-solid fa-gas-pump",
    "Vente de pétrole lampant": "fa-solid fa-gas-pump",
    "Carburant additivé": "fa-solid fa-flask",
    "Station de gonflage": "fa-solid fa-tire-flat",
    "Vente d'additifs carburants": "fa-solid fa-vial",

    // Services véhicules
    "Lavage automatique": "fa-solid fa-car-wash",
    "Lavage manuel": "fa-solid fa-hand-sparkles",
    "Laverie": "fa-solid fa-washing-machine",

    "Location de véhicule": "fa-solid fa-car-key",
    "Relais colis": "fa-solid fa-box-isometric-tape",
    "Services réparation / entretien": "fa-solid fa-screwdriver-wrench",
    "Douches": "fa-solid fa-shower",

    // Services boutique
    "Boutique alimentaire": "fa-solid fa-shop",
    "Boutique non alimentaire": "fa-solid fa-store",

    "Restauration à emporter": "fa-solid fa-hamburger",
    "Restauration sur place": "fa-solid fa-utensils",
    "Bar": "fa-solid fa-coffee",
    "Toilettes publiques": "fa-solid fa-restroom-simple",

    // Services financiers
    "DAB (Distributeur automatique de billets)": "fa-solid fa-money-from-bracket",

    // Services divers
    "Wifi": "fa-solid fa-wifi",
    "Espace bébé": "fa-solid fa-baby",

    "Aire de camping-cars": "fa-solid fa-campground",

    "Bornes électriques": "fa-solid fa-charging-station",

    // Services professionnels
    "Piste poids lourds": "fa-solid fa-truck",

    // Services carburants spécifiques

    "GNV": "fa-solid fa-gas-pump"
};

// Fonction pour obtenir l'icône d'un service
function getServiceIcon(serviceName) {
    return servicesConfig[serviceName] || "fa-solid fa-question-circle";
}
