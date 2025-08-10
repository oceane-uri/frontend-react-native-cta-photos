import { API_BASE_URL } from '../config/api';

// Service d'authentification
export const authService = {
  login: async (email, password) => {
    try {
      console.log('🔐 Tentative de connexion...');
      console.log('📧 Email:', email);
      console.log('🌐 URL:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Réponse reçue:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📦 Données reçues:', data);

      if (!response.ok) {
        console.error('❌ Erreur de connexion:', data.error || data.message);
        throw new Error(data.error || data.message || 'Erreur de connexion');
      }

      console.log('✅ Connexion réussie');
      return data;
    } catch (error) {
      console.error('💥 Erreur lors de la connexion:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion réseau.');
      }
      throw new Error(error.message || 'Erreur de connexion');
    }
  },

  verifyToken: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token invalide');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Erreur de vérification');
    }
  },
};

// Service des contrôles techniques
export const ctaService = {
  getAllCTAs: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cta/photos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du chargement');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Erreur lors du chargement');
    }
  },

  addCTA: async (token, ctaData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cta/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ctaData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'ajout');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Erreur lors de l\'ajout');
    }
  },

  searchByImmatriculation: async (token, immatriculation) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cta/search/${immatriculation}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la recherche');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Erreur lors de la recherche');
    }
  },
};

// Service des utilisateurs
export const userService = {
  getAllUsers: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du chargement');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Erreur lors du chargement');
    }
  },

  createUser: async (token, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Erreur lors de la création');
    }
  },
}; 