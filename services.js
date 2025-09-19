// Fichier de configuration des services des stations essence
// Mapping des services avec leurs icônes Font Awesome

const servicesConfig = {
    // Services de base
    "Automate CB 24/24": "fa-solid fa-credit-card",
    "Vente de gaz domestique (Butane, Propane)": "fa-solid fa-gas-pump",
    "Vente de fioul domestique": "fa-solid fa-oil-can",
    "Vente de pétrole lampant": "fa-solid fa-fire",
    "Carburant additivé": "fa-solid fa-flask",
    "Station de gonflage": "fa-solid fa-wind",
    "Vente d'additifs carburants": "fa-solid fa-vial",

    // Services véhicules
    "Lavage automatique": "fa-solid fa-soap",
    "Lavage manuel": "fa-solid fa-hand-sparkles",
    "Lavage haute pression": "fa-solid fa-spray-can",
    Aspirateur: "fa-solid fa-wind",
    "Dégivrage / Antigel": "fa-solid fa-icicles",
    "Contrôle technique": "fa-solid fa-clipboard-check",
    "Révision véhicule": "fa-solid fa-tools",
    Vidange: "fa-solid fa-oil-can",
    Pneus: "fa-solid fa-circle",
    "Gonflage pneumatiques": "fa-solid fa-compress-alt",
    "Location de véhicule": "fa-solid fa-car",
    "Station de taxis": "fa-solid fa-taxi",

    // Services boutique
    "Boutique alimentaire": "fa-solid fa-utensils",
    "Boutique non alimentaire": "fa-solid fa-store",
    "Aire de pique-nique": "fa-solid fa-tree",
    "Restauration à emporter": "fa-solid fa-hamburger",
    "Restauration sur place": "fa-solid fa-utensils",
    Bar: "fa-solid fa-coffee",
    "Toilettes publiques": "fa-solid fa-restroom",
    Biotique: "fa-solid fa-leaf",
    Presse: "fa-solid fa-newspaper",
    "Produits régionaux": "fa-solid fa-gift",
    Tabac: "fa-solid fa-smoking",
    Pharmacie: "fa-solid fa-pills",
    Hygiène: "fa-solid fa-soap",

    // Services financiers
    "DAB (Distributeur automatique de billets)": "fa-solid fa-money-bill-wave",
    "Paiement sans contact": "fa-solid fa-wave-square",
    Traiteur: "fa-solid fa-cheese",
    "Paiement mobile": "fa-solid fa-mobile-alt",

    // Services divers
    "Wi-Fi": "fa-solid fa-wifi",
    "Espace bébé": "fa-solid fa-baby",
    "Consigne bagages": "fa-solid fa-suitcase",
    "Aire de camping-cars": "fa-solid fa-campground",
    Défibrillateur: "fa-solid fa-heartbeat",
    "Point d'eau": "fa-solid fa-tint",
    Electricité: "fa-solid fa-bolt",
    "Téléphone public": "fa-solid fa-phone",
    "Station de recharge pour véhicules électriques": "fa-solid fa-charging-station",
    "Borne de recharge pour véhicules électriques": "fa-solid fa-plug",
    "Véhicule électrique": "fa-solid fa-car-battery",

    // Services automobiles
    "Vente de véhicules neufs": "fa-solid fa-car",
    "Vente de véhicules d'occasion": "fa-solid fa-car-side",
    "Location de voitures": "fa-solid fa-key",
    "Assistance dépannage": "fa-solid fa-tools",
    "Contrôle pression pneus": "fa-solid fa-tachometer-alt",
    Graissage: "fa-solid fa-oil-can",

    // Services confort
    "Air comprimé": "fa-solid fa-wind",
    "Chaises longues": "fa-solid fa-chair",
    "Espace jeux enfants": "fa-solid fa-gamepad",
    Terrasse: "fa-solid fa-umbrella-beach",

    // Services professionnels
    "Poids lourds": "fa-solid fa-truck",
    Bus: "fa-solid fa-bus",
    "Accès handicapé": "fa-solid fa-wheelchair",
    "Carburant professionnel": "fa-solid fa-briefcase",

    // Services carburants spécifiques
    GPL: "fa-solid fa-fire",
    GNV: "fa-solid fa-gas-pump",
    Hydrogène: "fa-solid fa-atom",
    AdBlue: "fa-solid fa-tint",
    Bioéthanol: "fa-solid fa-leaf"
};

// Fonction pour obtenir l'icône d'un service
function getServiceIcon(serviceName) {
    return servicesConfig[serviceName] || "fa-solid fa-question-circle";
}
