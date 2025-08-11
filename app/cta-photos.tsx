import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PhotoCapture from '../src/components/PhotoCapture';
import { photoService, Photo } from '../src/services/photoService';

export default function CTAPhotoScreen() {
  const params = useLocalSearchParams<{ ctaId: string; ctaName: string }>();
  let { ctaId, ctaName } = params;
  const router = useRouter();
  
  // Si aucun ctaId n'est fourni, on en générera un automatiquement lors de la prise de photo
  if (!ctaId) {
    console.log('🔄 Aucun ctaId fourni, sera généré lors de la prise de photo');
  }
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ctaId) {
      loadPhotos();
    }
  }, [ctaId]);

  const loadPhotos = async () => {
    if (!ctaId) return;
    
    setLoading(true);
    try {
      const ctaPhotos = await photoService.getPhotosByCTA(ctaId);
      setPhotos(ctaPhotos);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les photos');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoTaken = async (photoData: {
    photoUri: string;
    licensePlate: string;
    vehicleType: string;
    center: string;
    validityDate: string;
    photoBase64: string;
    latitude?: number;
    longitude?: number;
    adresse?: string;
    timestamp_photo?: string;
  }) => {
    // Générer un ctaId automatiquement si aucun n'est fourni
    const finalCtaId = ctaId || Math.floor(Math.random() * 1000000) + 1000000; // ID numérique entre 1000000 et 1999999
    console.log('🔄 Utilisation du ctaId:', finalCtaId);

    try {
      const newPhoto = await photoService.addPhoto({
        ...photoData,
        ctaId: finalCtaId,
      });

      setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
      
      Alert.alert(
        'Succès',
        `Photo ajoutée avec la plaque ${photoData.licensePlate}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la photo');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await photoService.deletePhoto(photoId);
      setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
      
      Alert.alert('Succès', 'Photo supprimée');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer la photo');
    }
  };

  const handleAddPhoto = () => {
    setShowCamera(true);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  const renderPhotoItem = ({ item }: { item: Photo }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item.uri }} style={styles.photoImage} />
      <View style={styles.photoInfo}>
        <Text style={styles.licensePlate}>Plaque: {item.licensePlate}</Text>
        <Text style={styles.vehicleType}>Type: {item.vehicleType}</Text>
        <Text style={styles.center}>Centre: {item.center}</Text>
        <Text style={styles.visitDate}>
          Visite: {new Date(item.visitDate).toLocaleDateString()}
        </Text>
        <Text style={styles.validityDate}>
          Validité: {new Date(item.validityDate).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePhoto(item.id)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  if (showCamera) {
    return (
      <PhotoCapture
        onPhotoTaken={handlePhotoTaken}
        onClose={handleCloseCamera}
        ctaId={ctaId || ''}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>
          Photos - {ctaName || 'CTA'}
        </Text>
        
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto}>
          <Text style={styles.addButtonText}>📷 Prendre une photo</Text>
        </TouchableOpacity>

        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id}
          style={styles.photoList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Chargement...' : 'Aucune photo pour ce CTA'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoList: {
    flex: 1,
  },
  photoItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  photoImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  photoInfo: {
    flex: 1,
  },
  licensePlate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  vehicleType: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 3,
  },
  center: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  visitDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  validityDate: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 10,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 