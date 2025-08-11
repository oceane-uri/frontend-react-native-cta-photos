import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  adresse?: string;
}

class LocationService {
  private static instance: LocationService;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Demander les permissions de localisation
  async requestLocationPermission(): Promise<boolean> {
    try {
      console.log('🔐 Demande de permission de localisation...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📱 Statut de permission:', status);
      return status === 'granted';
    } catch (error) {
      console.error('❌ Erreur lors de la demande de permission de localisation:', error);
      return false;
    }
  }

  // Vérifier les permissions de localisation
  async checkLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      console.log('🔍 Statut de permission actuel:', status);
      return status === 'granted';
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }

  // Obtenir la position actuelle
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      console.log('🔄 Début de la récupération de localisation...');
      
      // Vérifier les permissions
      const hasPermission = await this.checkLocationPermission();
      if (!hasPermission) {
        console.log('🔐 Demande de permission...');
        const granted = await this.requestLocationPermission();
        if (!granted) {
          console.log('❌ Permission de localisation refusée');
          return null;
        }
      }

      console.log('📱 Obtention de la position...');
      
      // Obtenir la position actuelle avec des options simples
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      console.log('✅ Position GPS obtenue:', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date(location.timestamp).toLocaleString(),
      });

      // Convertir les coordonnées en adresse
      try {
        console.log('🏠 Conversion des coordonnées en adresse...');
        const adresse = await this.reverseGeocode(locationData.latitude, locationData.longitude);
        if (adresse) {
          locationData.adresse = adresse;
          console.log('✅ Adresse obtenue:', adresse);
        } else {
          console.log('⚠️ Aucune adresse trouvée pour ces coordonnées');
        }
      } catch (error) {
        console.log('⚠️ Impossible de convertir les coordonnées en adresse:', error);
      }

      return locationData;
    } catch (error) {
      console.error('❌ Erreur lors de l\'obtention de la position:', error);
      return null;
    }
  }

  // Convertir les coordonnées en adresse (géocodage inverse)
  private async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      console.log('🔄 Géocodage inverse pour:', { latitude, longitude });
      
      // Utiliser l'API de géocodage inverse gratuite de Nominatim (OpenStreetMap)
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'CTA-App/1.0',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📡 Réponse Nominatim:', data);

      if (data.display_name) {
        // Extraire les informations principales de l'adresse
        const address = data.address;
        let adresse = '';

        if (address.road) {
          adresse += address.road;
          if (address.house_number) {
            adresse += ` ${address.house_number}`;
          }
          adresse += ', ';
        }

        if (address.postcode) {
          adresse += address.postcode;
          if (address.city || address.town || address.village) {
            adresse += ' ';
          }
        }

        if (address.city || address.town || address.village) {
          adresse += address.city || address.town || address.village;
        }

        if (address.country) {
          adresse += `, ${address.country}`;
        }

        const finalAdresse = adresse.trim();
        console.log('✅ Adresse formatée:', finalAdresse);
        return finalAdresse;
      }

      console.log('⚠️ Aucune adresse trouvée dans la réponse');
      return null;
    } catch (error) {
      console.error('❌ Erreur lors du géocodage inverse:', error);
      return null;
    }
  }

  // Formater la date et l'heure actuelles
  getCurrentTimestamp(): string {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:MM:SS
  }
}

export default LocationService; 