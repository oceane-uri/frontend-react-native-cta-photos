import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import PDFService, { PDFGenerationData } from '../services/pdfService';

const { width, height } = Dimensions.get('window');

interface PDFPreviewProps {
  data: PDFGenerationData;
  onSave: (pdfBase64: string) => void;
  onBack: () => void;
}

export default function PDFPreview({ data, onSave, onBack }: PDFPreviewProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Générer le HTML de la fiche de contrôle
  React.useEffect(() => {
    generatePDF();
  }, [data]);

  const generatePDF = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pdfService = PDFService.getInstance();
      const html = await pdfService.generateControlChecklist(data);
      
      setHtmlContent(html);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur lors de la génération:', error);
      setError('Impossible de générer la fiche de contrôle');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const pdfService = PDFService.getInstance();
      const result = await pdfService.generateCompleteControlChecklist(data);
      
      if (result.pdfBase64) {
        onSave(result.pdfBase64);
      } else {
        // Si pas de PDF, utiliser l'HTML comme fallback
        onSave(result.html);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      Alert.alert(
        'Erreur',
        'Impossible de sauvegarder la fiche de contrôle. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    generatePDF();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Génération de la Fiche</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Génération de la fiche de contrôle...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Erreur de Génération</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Aperçu de la Fiche</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </View>



      {/* Prévisualisation HTML */}
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Fiche de Contrôle Technique</Text>
        <WebView
          source={{ html: htmlContent }}
          style={styles.webview}
          scrollEnabled={true}
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          onLoadEnd={() => setLoading(false)}
        />
      </View>

      {/* Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Sauvegarder la Fiche</Text>
        </TouchableOpacity>
        
        <View style={styles.infoText}>
          <Text style={styles.infoTextContent}>
            La fiche sera sauvegardée avec la photo et les données du contrôle
          </Text>
        </View>
      </View>
    </View>
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
    backgroundColor: '#2196F3',
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  vehicleInfo: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  vehicleInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  vehicleInfoSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  previewContainer: {
    flex: 1,
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: 'white',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    alignItems: 'center',
  },
  infoTextContent: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 