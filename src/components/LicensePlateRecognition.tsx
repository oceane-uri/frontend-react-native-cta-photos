import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';

interface LicensePlateRecognitionProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (licensePlate: string) => void;
  imageUri?: string;
}

export default function LicensePlateRecognition({ 
  visible, 
  onClose, 
  onConfirm, 
  imageUri 
}: LicensePlateRecognitionProps) {
  const [manualPlate, setManualPlate] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedPlate, setDetectedPlate] = useState<string | null>(null);

  const simulateRecognition = async () => {
    setIsAnalyzing(true);
    
    // Simulation d'un délai d'analyse
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Génération d'un numéro de plaque fictif
    const fakePlate = generateFakeLicensePlate();
    setDetectedPlate(fakePlate);
    setIsAnalyzing(false);
  };

  const generateFakeLicensePlate = (): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let plate = '';
    // Format: 2 lettres + 3 chiffres + 2 lettres (format français)
    for (let i = 0; i < 2; i++) {
      plate += letters[Math.floor(Math.random() * letters.length)];
    }
    for (let i = 0; i < 3; i++) {
      plate += numbers[Math.floor(Math.random() * numbers.length)];
    }
    for (let i = 0; i < 2; i++) {
      plate += letters[Math.floor(Math.random() * letters.length)];
    }
    
    return plate;
  };

  const handleConfirm = () => {
    const finalPlate = manualPlate.trim() || detectedPlate;
    
    if (!finalPlate) {
      Alert.alert('Erreur', 'Veuillez saisir ou confirmer un numéro de plaque');
      return;
    }

    onConfirm(finalPlate);
    onClose();
    setManualPlate('');
    setDetectedPlate(null);
  };

  const handleManualInput = (text: string) => {
    // Validation basique du format de plaque
    const cleanText = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setManualPlate(cleanText);
  };

  const handleRetry = () => {
    setDetectedPlate(null);
    setIsAnalyzing(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Reconnaissance de Plaque</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {imageUri && (
              <View style={styles.imagePreview}>
                <Text style={styles.imageLabel}>Image analysée</Text>
              </View>
            )}

            {!detectedPlate && !isAnalyzing && (
              <TouchableOpacity
                style={styles.analyzeButton}
                onPress={simulateRecognition}
              >
                <Text style={styles.analyzeButtonText}>
                  🔍 Analyser la photo
                </Text>
              </TouchableOpacity>
            )}

            {isAnalyzing && (
              <View style={styles.analyzingContainer}>
                <Text style={styles.analyzingText}>Analyse en cours...</Text>
                <Text style={styles.analyzingSubtext}>
                  Reconnaissance de la plaque d'immatriculation
                </Text>
              </View>
            )}

            {detectedPlate && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>Plaque détectée :</Text>
                <Text style={styles.detectedPlate}>{detectedPlate}</Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleRetry}
                  >
                    <Text style={styles.retryButtonText}>🔄 Réessayer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.manualInputContainer}>
              <Text style={styles.manualInputLabel}>
                Ou saisissez manuellement :
              </Text>
              <TextInput
                style={styles.manualInput}
                value={manualPlate}
                onChangeText={handleManualInput}
                placeholder="Ex: AB123CD"
                maxLength={7}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.finalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  imagePreview: {
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageLabel: {
    color: '#666',
    fontSize: 14,
  },
  analyzeButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyzingContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  analyzingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  detectedPlate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  retryButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  manualInputContainer: {
    marginBottom: 20,
  },
  manualInputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  manualInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
    backgroundColor: '#f8f9fa',
  },
  finalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 