import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

export interface Photo {
  id: string;
  uri: string;
  licensePlate: string;
  timestamp: Date;
  ctaId: string;
  vehicleType: string;
  center: string;
  visitDate: string;
  validityDate: string;
  photoBase64: string;
  latitude?: number;
  longitude?: number;
  adresse?: string;
  timestamp_photo?: string;
  // Juste le PDF de la fiche de contrôle
  ficheControlePDF?: string;
}

class PhotoService {
  private readonly STORAGE_KEY = 'cta_photos';

  // Récupérer toutes les photos
  async getAllPhotos(): Promise<Photo[]> {
    try {
      const photosJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (photosJson) {
        const photos = JSON.parse(photosJson);
        // Convertir les timestamps en objets Date
        return photos.map((photo: any) => ({
          ...photo,
          timestamp: new Date(photo.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des photos:', error);
      return [];
    }
  }

  // Récupérer les photos d'un CTA spécifique
  async getPhotosByCTA(ctaId: string): Promise<Photo[]> {
    try {
      const allPhotos = await this.getAllPhotos();
      return allPhotos.filter(photo => photo.ctaId === ctaId);
    } catch (error) {
      console.error('Erreur lors de la récupération des photos du CTA:', error);
      return [];
    }
  }

  // Ajouter une nouvelle photo (stockage local + base de données)
  async addPhoto(photoData: {
    photoUri: string;
    licensePlate: string;
    vehicleType: string;
    center: string;
    validityDate: string;
    photoBase64: string;
    ctaId: string;
    latitude?: number;
    longitude?: number;
    adresse?: string;
    timestamp_photo?: string;
    ficheControlePDF?: string;
  }): Promise<Photo> {
    try {
      const newPhoto: Photo = {
        ...photoData,
        uri: photoData.photoUri, // Mapper photoUri vers uri
        id: this.generateId(),
        timestamp: new Date(),
        visitDate: new Date().toISOString().split('T')[0],
        // Utiliser le timestamp_photo fourni ou générer un nouveau
        timestamp_photo: photoData.timestamp_photo || new Date().toISOString().slice(0, 19).replace('T', ' '),
      };

      // 1. Sauvegarder en base de données
      await this.savePhotoToDatabase(newPhoto);

      // 2. Sauvegarder en local pour l'interface
      const existingPhotos = await this.getAllPhotos();
      const updatedPhotos = [...existingPhotos, newPhoto];
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedPhotos));
      
      // Log sans la base64 pour plus de clarté
    const logPhoto = { ...newPhoto };
    logPhoto.photoBase64 = logPhoto.photoBase64 ? `[BASE64 - ${logPhoto.photoBase64.length} caractères]` : 'null';
    console.log('Photo ajoutée avec succès:', logPhoto);
      return newPhoto;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la photo:', error);
      throw new Error('Impossible d\'ajouter la photo');
    }
  }

  // Sauvegarder la photo en base de données
  private async savePhotoToDatabase(photo: Photo): Promise<void> {
    try {
      console.log('🔐 Tentative de sauvegarde en base...');
      
      const token = (global as any).authToken;
      console.log('🔑 Token disponible:', !!token);
      console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'null');
      

      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const requestBody = {
        immatriculation: photo.licensePlate,
        date_visite: photo.visitDate,
        centre: photo.center,
        date_validite: photo.validityDate,
        type_vehicule: photo.vehicleType,
        photo_base64: photo.photoBase64,
        cta_id: photo.ctaId,
        latitude: photo.latitude,
        longitude: photo.longitude,
        adresse: photo.adresse,
        timestamp_photo: photo.timestamp_photo,
        // Juste le PDF de la fiche de contrôle
        fiche_controle_pdf: photo.ficheControlePDF || null,
      };

      // Log des données sans la photo base64 pour plus de clarté
      const logData = { ...requestBody };
      logData.photo_base64 = logData.photo_base64 ? `[BASE64 - ${logData.photo_base64.length} caractères]` : 'null';
      
      console.log('📤 Données à envoyer:', logData);
      console.log('🌐 URL API:', `${API_BASE_URL}/cta/photo`);

      const response = await fetch(`${API_BASE_URL}/cta/photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Réponse reçue:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur API:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde en base');
      }

      const responseData = await response.json();
      console.log('✅ Photo sauvegardée en base de données:', responseData);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde en base:', error);
      throw error;
    }
  }

  // Supprimer une photo
  async deletePhoto(photoId: string): Promise<boolean> {
    try {
      const existingPhotos = await this.getAllPhotos();
      const updatedPhotos = existingPhotos.filter(photo => photo.id !== photoId);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedPhotos));
      
      console.log('Photo supprimée avec succès:', photoId);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la photo:', error);
      throw new Error('Impossible de supprimer la photo');
    }
  }

  // Mettre à jour une photo (par exemple, corriger la plaque)
  async updatePhoto(photoId: string, updates: Partial<Photo>): Promise<Photo | null> {
    try {
      const existingPhotos = await this.getAllPhotos();
      const photoIndex = existingPhotos.findIndex(photo => photo.id === photoId);
      
      if (photoIndex === -1) {
        throw new Error('Photo non trouvée');
      }

      const updatedPhoto = { ...existingPhotos[photoIndex], ...updates };
      existingPhotos[photoIndex] = updatedPhoto;
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingPhotos));
      
      console.log('Photo mise à jour avec succès:', updatedPhoto);
      return updatedPhoto;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo:', error);
      throw new Error('Impossible de mettre à jour la photo');
    }
  }

  // Rechercher des photos par plaque d'immatriculation
  async searchPhotosByLicensePlate(licensePlate: string): Promise<Photo[]> {
    try {
      const allPhotos = await this.getAllPhotos();
      const searchTerm = licensePlate.toLowerCase();
      
      return allPhotos.filter(photo => 
        photo.licensePlate.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Erreur lors de la recherche de photos:', error);
      return [];
    }
  }

  // Obtenir les statistiques des photos
  async getPhotoStats(): Promise<{
    totalPhotos: number;
    photosByCTA: Record<string, number>;
    photosByVehicleType: Record<string, number>;
    recentPhotos: Photo[];
  }> {
    try {
      const allPhotos = await this.getAllPhotos();
      
      const photosByCTA = allPhotos.reduce((acc, photo) => {
        acc[photo.ctaId] = (acc[photo.ctaId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const photosByVehicleType = allPhotos.reduce((acc, photo) => {
        acc[photo.vehicleType] = (acc[photo.vehicleType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const recentPhotos = allPhotos
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);

      return {
        totalPhotos: allPhotos.length,
        photosByCTA,
        photosByVehicleType,
        recentPhotos
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        totalPhotos: 0,
        photosByCTA: {},
        photosByVehicleType: {},
        recentPhotos: []
      };
    }
  }

  // Nettoyer toutes les photos (pour les tests)
  async clearAllPhotos(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('Toutes les photos ont été supprimées');
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les photos:', error);
      throw new Error('Impossible de supprimer toutes les photos');
    }
  }

  // Générer un ID unique
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const photoService = new PhotoService(); 