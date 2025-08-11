import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LocationService, { LocationData } from '../services/locationService';

// Import expo-camera components
import {
  CameraView,
  useCameraPermissions,
  Camera,
} from 'expo-camera';

// Test d'import d'expo-camera
let CameraComponent: any = null;
let requestCameraPermissionsAsync: any = null;

try {
  // Examiner la structure complète d'expo-camera
  console.log('🔍 Structure complète d\'expo-camera:', {
    CameraView: typeof CameraView,
    Camera: typeof Camera,
    useCameraPermissions: typeof useCameraPermissions,
  });
  
  // Utiliser CameraView qui est le composant React correct
  if (CameraView && typeof CameraView === 'function') {
    CameraComponent = CameraView;
    console.log('✅ Utilisation de CameraView');
  } else if (Camera && typeof Camera === 'function') {
    CameraComponent = Camera;
    console.log('✅ Utilisation de Camera');
  } else {
    console.log('❌ Aucun composant Camera valide trouvé');
  }
  
  // Utiliser la nouvelle API de permissions
  requestCameraPermissionsAsync = Camera?.requestCameraPermissionsAsync;
  
  console.log('✅ Résultat final:', { 
    CameraComponent: typeof CameraComponent, 
    CameraIsComponent: typeof CameraComponent === 'function',
    useCameraPermissions: typeof useCameraPermissions,
    requestCameraPermissionsAsync: typeof requestCameraPermissionsAsync 
  });
} catch (error) {
  console.error('❌ Erreur import expo-camera:', error);
}

interface PhotoCaptureProps {
  onPhotoTaken: (photoData: {
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
  }) => void;
  onClose: () => void;
  ctaId: string;
}

const { width } = Dimensions.get('window');

// Types de véhicules et leurs validités
const VEHICLE_TYPES = [
  { label: 'Véhicule Léger (CTVL)', value: 'CTVL', validityMonths: 12 },
  { label: 'Poids Lourd (CTPL)', value: 'CTPL', validityMonths: 6 },
  { label: 'Taxi (CTTAXI)', value: 'CTTAXI', validityMonths: 3 },
];

// Centres de contrôle technique (centres réels du Bénin)
const CENTERS = [
  'EKPE',
  'LOKOSSA',
  'AGONLI',
  'POBE',
  'ALLADA',
  'OUAIDAH',
];

export default function PhotoCapture({ onPhotoTaken, onClose, ctaId }: PhotoCaptureProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<string>('CTVL');
  const [center, setCenter] = useState<string>(CENTERS[0]);
  const [showForm, setShowForm] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const cameraRef = useRef<any>(null);

  // Always call the hook to maintain React Hook rules
  const [, requestPermission] = useCameraPermissions();

  useEffect(() => {
    (async () => {
      try {
        if (requestPermission && typeof requestPermission === 'function') {
          const { status } = await requestPermission();
          setHasPermission(status === 'granted');
        } else {
          setHasPermission(false);
          Alert.alert('Erreur', 'Caméra non disponible');
        }
      } catch (error) {
        console.error('Erreur de permission caméra:', error);
        setHasPermission(false);
      }
    })();
  }, [requestPermission]);

  // Si la caméra n'est pas disponible, afficher un message d'erreur
  if (!CameraComponent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Erreur Caméra</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Le composant Camera n&apos;est pas disponible</Text>
          <Text style={styles.errorText}>Vérifiez l&apos;installation d&apos;expo-camera</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onClose}>
            <Text style={styles.retryButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    console.log('📸 Tentative de capture...');
    console.log('🔍 cameraRef.current:', cameraRef.current);
    
    if (cameraRef.current) {
      try {
        console.log('✅ Référence caméra trouvée, capture en cours...');
        
        // Essayer d'abord takePictureAsync (pour Camera)
        if (typeof cameraRef.current.takePictureAsync === 'function') {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.8,
            base64: true,
          });
          
          console.log('📷 Photo capturée avec takePictureAsync - URI:', photo.uri, 'Base64:', photo.base64 ? `${photo.base64.length} caractères` : 'null');
          setCapturedImage(photo.uri);
          setPhotoBase64(photo.base64 || '');
          
          // Analyser la plaque d'immatriculation
          await analyzeLicensePlate(photo.uri);
          
          // Obtenir la localisation
          await getLocationData();
        } else {
          console.log('⚠️ takePictureAsync non disponible, essai avec takePicture...');
          // Essayer avec takePicture (pour CameraView)
          const photo = await cameraRef.current.takePicture();
          
          console.log('📷 Photo capturée avec takePicture - URI:', photo.uri, 'Base64:', photo.base64 ? `${photo.base64.length} caractères` : 'null');
          setCapturedImage(photo.uri);
          setPhotoBase64(photo.base64 || '');
          
          // Analyser la plaque d'immatriculation
          await analyzeLicensePlate(photo.uri);
          
          // Obtenir la localisation
          await getLocationData();
        }
      } catch (error) {
        console.error('❌ Erreur lors de la capture:', error);
        Alert.alert('Erreur', 'Impossible de prendre la photo');
      }
    } else {
      console.error('❌ Référence caméra non trouvée');
      Alert.alert('Erreur', 'Référence caméra non disponible');
    }
  };

  // Obtenir les données de localisation
  const getLocationData = async () => {
    setLocationLoading(true);
    try {
      const locationService = LocationService.getInstance();
      const location = await locationService.getCurrentLocation();
      
      if (location) {
        setLocationData(location);
        console.log('📍 Localisation obtenue:', location);
      } else {
        console.log('⚠️ Impossible d\'obtenir la localisation');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'obtention de la localisation:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  const analyzeLicensePlate = async (imageUri: string) => {
    setAnalyzing(true);
    try {
      // Utilisation de l'API Plate Recognizer avec votre token
      const formData = new FormData();
      formData.append('upload', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
        method: 'POST',
        headers: {
          'Authorization': 'Token 3acf347077bd34d7a4828366a7ca596fd6da9708', // Votre vrai token
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📡 Réponse API Plate Recognizer:', data);
        
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          let detectedPlate = result.plate;
          
          // Mettre en majuscules
          detectedPlate = detectedPlate.toUpperCase();
          
          // Ajouter le suffixe pays RB si pas présent
          if (!detectedPlate.includes('RB')) {
            detectedPlate = detectedPlate + 'RB';
          }
          
          console.log('✅ Plaque détectée:', detectedPlate);
          console.log('📊 Score de confiance:', result.score);
          console.log('📊 Score de détection:', result.dscore);
          
          // Vérifier la qualité de la détection
          if (result.score > 0.7 && result.dscore > 0.7) {
            setLicensePlate(detectedPlate);
            setShowForm(true);
            console.log('✅ Formulaire affiché avec plaque détectée');
          } else {
            console.log('⚠️ Qualité de détection faible, proposer la saisie manuelle');
            Alert.alert(
              'Qualité de détection faible',
              `Plaque détectée: ${detectedPlate}\nScore: ${(result.score * 100).toFixed(1)}%\nVoulez-vous la corriger manuellement ?`,
              [
                { text: 'Utiliser cette plaque', onPress: () => {
                  setLicensePlate(detectedPlate);
                  setShowForm(true);
                }},
                { text: 'Saisir manuellement', onPress: () => setShowForm(true) },
                { text: 'Reprendre', onPress: () => setCapturedImage(null) }
              ]
            );
          }
        } else {
          console.log('⚠️ Aucune plaque détectée dans la réponse');
          // Si pas de plaque détectée, demander la saisie manuelle
          Alert.alert(
            'Plaque non détectée',
            'Aucune plaque n\'a été détectée. Voulez-vous la saisir manuellement ?',
            [
              { text: 'Saisir manuellement', onPress: () => setShowForm(true) },
              { text: 'Reprendre', onPress: () => setCapturedImage(null) }
            ]
          );
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur API Plate Recognizer:', response.status, errorText);
        
        // En cas d'échec de l'API, utiliser la saisie manuelle
        Alert.alert(
          'Erreur API',
          `Erreur ${response.status}: Impossible de reconnaître la plaque. Voulez-vous la saisir manuellement ?`,
          [
            { text: 'Saisir manuellement', onPress: () => setShowForm(true) },
            { text: 'Reprendre', onPress: () => setCapturedImage(null) }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error);
      // En cas d'erreur, utiliser la saisie manuelle
      Alert.alert(
        'Erreur de reconnaissance',
        'Impossible de reconnaître la plaque. Voulez-vous la saisir manuellement ?',
        [
          { text: 'Saisir manuellement', onPress: () => setShowForm(true) },
          { text: 'Reprendre', onPress: () => setCapturedImage(null) }
        ]
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const calculateValidityDate = (vehicleType: string): string => {
    const today = new Date();
    const vehicleInfo = VEHICLE_TYPES.find(vt => vt.value === vehicleType);
    
    if (vehicleInfo) {
      const validityDate = new Date(today);
      validityDate.setMonth(today.getMonth() + vehicleInfo.validityMonths);
      return validityDate.toISOString().split('T')[0];
    }
    
    return today.toISOString().split('T')[0];
  };

  const handleConfirm = () => {
    console.log('🔍 handleConfirm appelé avec:', {
      licensePlate,
      vehicleType,
      center,
      capturedImage: !!capturedImage,
      photoBase64: photoBase64 ? `${photoBase64.length} caractères` : 'null'
    });

    if (!licensePlate.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le numéro de plaque');
      return;
    }

    if (!center) {
      Alert.alert('Erreur', 'Veuillez sélectionner un centre');
      return;
    }

    const validityDate = calculateValidityDate(vehicleType);

    // Obtenir le timestamp actuel
    const locationService = LocationService.getInstance();
    const timestamp_photo = locationService.getCurrentTimestamp();

    console.log('✅ Données à envoyer:', {
      photoUri: capturedImage!,
      licensePlate: licensePlate.trim(),
      vehicleType,
      center,
      validityDate,
      photoBase64: photoBase64 ? `${photoBase64.length} caractères` : 'null',
      latitude: locationData?.latitude,
      longitude: locationData?.longitude,
      adresse: locationData?.adresse,
      timestamp_photo,
    });

    console.log('📞 Appel de onPhotoTaken...');
    onPhotoTaken({
      photoUri: capturedImage!,
      licensePlate: licensePlate.trim(),
      vehicleType,
      center,
      validityDate,
      photoBase64,
      latitude: locationData?.latitude,
      longitude: locationData?.longitude,
      adresse: locationData?.adresse,
      timestamp_photo,
    });
    console.log('✅ onPhotoTaken appelé avec succès');
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setLicensePlate('');
    setShowForm(false);
    setPhotoBase64('');
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Demande de permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Pas d&apos;accès à la caméra</Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedImage && showForm) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Configuration du contrôle</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.formContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          
          <View style={styles.formField}>
            <Text style={styles.label}>Plaque d&apos;immatriculation</Text>
            <TextInput
              style={styles.input}
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholder="Ex: AB-123-CD"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Type de véhicule</Text>
            <TextInput
              style={styles.input}
              value={vehicleType}
              onChangeText={setVehicleType}
              placeholder="Ex: CTVL, CTPL, CTTAXI"
              autoCapitalize="characters"
            />
            <View style={styles.suggestionsContainer}>
              {VEHICLE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={styles.suggestionItem}
                  onPress={() => setVehicleType(type.value)}
                >
                  <Text style={styles.suggestionText}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Centre de contrôle</Text>
            <TextInput
              style={styles.input}
              value={center}
              onChangeText={setCenter}
              placeholder="Ex: EKPE, LOKOSSA, AGONLI"
              autoCapitalize="characters"
            />
            <View style={styles.suggestionsContainer}>
              {CENTERS.map((centerName) => (
                <TouchableOpacity
                  key={centerName}
                  style={styles.suggestionItem}
                  onPress={() => setCenter(centerName)}
                >
                  <Text style={styles.suggestionText}>{centerName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Date de visite</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Date de validité</Text>
            <Text style={styles.dateText}>
              {new Date(calculateValidityDate(vehicleType)).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={retakePhoto}>
            <Text style={styles.buttonText}>Reprendre</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.confirmButton]} 
            onPress={handleConfirm}
          >
            <Text style={styles.buttonText}>Confirmer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prise de photo du véhicule</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <CameraComponent style={styles.camera} type={cameraType} ref={cameraRef} />
      
      {/* Overlay de la caméra avec positionnement absolu */}
      <View style={styles.cameraOverlay}>
        <View style={styles.licensePlateFrame}>
          <Text style={styles.frameText}>Cadrez la plaque ici</Text>
          <Text style={styles.frameSubtext}>Format CEDEAO</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.flipButton} 
          onPress={() => setCameraType(cameraType === 'back' ? 'front' : 'back')}
        >
          <Text style={styles.flipButtonText}>🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <View style={styles.placeholderButton} />
      </View>

      {analyzing && (
        <View style={styles.analyzingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.analyzingText}>Analyse de la plaque...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 100, // Laisser de l'espace pour le header
    left: 0,
    right: 0,
    bottom: 120, // Laisser de l'espace pour les contrôles
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    pointerEvents: 'none', // Permettre aux clics de passer à travers
  },
  licensePlateFrame: {
    width: width * 0.8,
    height: 100,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  frameText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  frameSubtext: {
    color: '#2196F3',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#2196F3',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
  },
  placeholderButton: {
    width: 50,
    height: 50,
  },
  suggestionsContainer: {
    marginTop: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionItem: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suggestionText: {
    fontSize: 12,
    color: '#333',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: 'center',
  },
  formField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 50,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  button: {
    padding: 15,
    backgroundColor: '#666',
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 