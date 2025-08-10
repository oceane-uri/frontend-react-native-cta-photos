// Configuration de l'API selon l'environnement
const API_CONFIG = {
  // Pour le développement local (émulateur Android/iOS)
  development: {
    baseURL: 'http://10.0.2.2:3000/api', // 10.0.2.2 pour émulateur Android
    // 'http://localhost:3000/api' pour émulateur iOS
  },
  // Pour l'appareil physique connecté au même réseau WiFi
  production: {
    baseURL: 'http://192.168.100.32:3000/api', // IP de votre ordinateur
  }
};

// Détecter l'environnement et le type d'appareil
const getApiBaseUrl = () => {
  // Utiliser l'IP de l'ordinateur pour l'app mobile
  return API_CONFIG.production.baseURL;
};

export const API_BASE_URL = getApiBaseUrl();

// Log pour debug
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environnement:', __DEV__ ? 'Development' : 'Production'); 