// Configuration pour l'API de reconnaissance de plaques
// Plusieurs options gratuites disponibles

export const PLATE_RECOGNITION_CONFIG = {
  // Option 1: Plate Recognizer (gratuit, 2500 requêtes/mois)
  plateRecognizer: {
    enabled: true,
    apiUrl: 'https://api.platerecognizer.com/v1/plate-reader/',
    apiKey: '3acf347077bd34d7a4828366a7ca596fd6da9708', // Clé API Plate Recognizer
    freeLimit: 2500,
    format: 'CEDEAO',
  },

  // Option 2: OpenALPR (gratuit, open source)
  openALPR: {
    enabled: false,
    apiUrl: 'https://api.openalpr.com/v2/recognize',
    apiKey: 'YOUR_API_KEY_HERE',
    freeLimit: 1000,
    format: 'CEDEAO',
  },

  // Option 3: OCR.space (gratuit, 500 requêtes/jour)
  ocrSpace: {
    enabled: false,
    apiUrl: 'https://api.ocr.space/parse/image',
    apiKey: 'YOUR_API_KEY_HERE',
    freeLimit: 500,
    format: 'CEDEAO',
  },

  // Configuration par défaut
  default: 'plateRecognizer',
};

// Fonction pour obtenir la configuration active
export const getActiveConfig = () => {
  const configName = PLATE_RECOGNITION_CONFIG.default;
  return PLATE_RECOGNITION_CONFIG[configName];
};

// Fonction pour valider le format de plaque CEDEAO
export const validateCEDEAOFormat = (plate: string): boolean => {
  // Format CEDEAO: 2 lettres + 3 chiffres + 2 lettres (ex: AB-123-CD)
  const cedaoRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
  return cedaoRegex.test(plate);
};

// Fonction pour formater une plaque au format CEDEAO
export const formatToCEDEAO = (plate: string): string => {
  // Supprimer tous les caractères non alphanumériques
  const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '');
  
  if (cleanPlate.length === 7) {
    // Format: AABB123 -> AA-BB-123
    return `${cleanPlate.slice(0, 2)}-${cleanPlate.slice(2, 4)}-${cleanPlate.slice(4)}`;
  } else if (cleanPlate.length === 6) {
    // Format: AA123B -> AA-123-B
    return `${cleanPlate.slice(0, 2)}-${cleanPlate.slice(2, 5)}-${cleanPlate.slice(5)}`;
  }
  
  return plate; // Retourner tel quel si le format n'est pas reconnu
};

// Messages d'erreur localisés
export const ERROR_MESSAGES = {
  fr: {
    noPlateDetected: 'Aucune plaque détectée',
    invalidFormat: 'Format de plaque invalide',
    apiError: 'Erreur de l\'API de reconnaissance',
    networkError: 'Erreur de connexion réseau',
    manualEntry: 'Saisie manuelle',
    retake: 'Reprendre',
  },
  en: {
    noPlateDetected: 'No plate detected',
    invalidFormat: 'Invalid plate format',
    apiError: 'Recognition API error',
    networkError: 'Network connection error',
    manualEntry: 'Manual entry',
    retake: 'Retake',
  },
};

// Obtenir le message d'erreur dans la langue actuelle
export const getErrorMessage = (key: string, language: string = 'fr') => {
  return ERROR_MESSAGES[language]?.[key] || ERROR_MESSAGES.fr[key] || key;
}; 