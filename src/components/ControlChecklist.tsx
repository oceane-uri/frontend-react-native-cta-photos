import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

// Types pour les points de contrôle
interface ControlPoint {
  id: string;
  name: string;
  function: string;
}

interface ControlResult {
  pointId: string;
  defectLevel: 'Mineur' | 'Majeur' | 'Critique' | null;
  result: 'Bon' | 'Mauvais' | null;
}

interface ControlChecklistProps {
  vehicleInfo: {
    licensePlate: string;
    vehicleType: string;
    center: string;
    visitDate: string;
    validityDate: string;
  };
  onComplete: (checklistData: ControlResult[]) => void;
  onBack: () => void;
}

// Points de contrôle organisés par fonction
const CONTROL_POINTS: ControlPoint[] = [
  // IDENTIFICATION
  { id: 'id_1', name: 'Plaque d\'immatriculation', function: 'IDENTIFICATION' },
  { id: 'id_2', name: 'Marque', function: 'IDENTIFICATION' },
  { id: 'id_3', name: 'Type', function: 'IDENTIFICATION' },
  { id: 'id_4', name: 'Date de 1ère mise en circulation', function: 'IDENTIFICATION' },
  
  // CAROSSERIE
  { id: 'car_1', name: 'Série (châssis)', function: 'CAROSSERIE' },
  { id: 'car_2', name: 'Tôlerie', function: 'CAROSSERIE' },
  
  // VISIBILITÉ
  { id: 'vis_1', name: 'Vitrage', function: 'VISIBILITÉ' },
  { id: 'vis_2', name: 'Rétroviseur(s)', function: 'VISIBILITÉ' },
  { id: 'vis_3', name: 'Essuie-glace', function: 'VISIBILITÉ' },
  { id: 'vis_4', name: 'Pare-Soleil', function: 'VISIBILITÉ' },
];

// Fonctions uniques
const FUNCTIONS = ['IDENTIFICATION', 'CAROSSERIE', 'VISIBILITÉ'];

export default function ControlChecklist({ vehicleInfo, onComplete, onBack }: ControlChecklistProps) {
  const [controlResults, setControlResults] = useState<ControlResult[]>(
    CONTROL_POINTS.map(point => ({
      pointId: point.id,
      defectLevel: null,
      result: null,
    }))
  );

  const updateControlResult = (pointId: string, field: 'defectLevel' | 'result', value: any) => {
    setControlResults(prev => 
      prev.map(result => 
        result.pointId === pointId 
          ? { ...result, [field]: value }
          : result
      )
    );
  };

  const getControlResult = (pointId: string): ControlResult | undefined => {
    return controlResults.find(result => result.pointId === pointId);
  };

  const validateChecklist = (): boolean => {
    const incompletePoints = controlResults.filter(result => 
      result.defectLevel === null || result.result === null
    );
    
    if (incompletePoints.length > 0) {
      Alert.alert(
        'Validation incomplète',
        `Veuillez compléter tous les points de contrôle (${incompletePoints.length} point(s) manquant(s))`
      );
      return false;
    }
    return true;
  };

  const handleComplete = () => {
    if (validateChecklist()) {
      Alert.alert(
        'Fiche de contrôle complétée',
        'Votre fiche a été envoyée au superviseur pour validation. Vous recevrez une notification une fois qu\'elle sera validée.',
        [
          { text: 'OK', onPress: () => onComplete(controlResults) }
        ]
      );
    }
  };

  const renderControlPoint = (point: ControlPoint) => {
    const result = getControlResult(point.id);
    
    return (
      <View key={point.id} style={styles.controlPoint}>
        <Text style={styles.pointName}>{point.name}</Text>
        
        <View style={styles.controlsRow}>
          {/* Niveau de défaillance */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Défaillance:</Text>
            <View style={styles.buttonGroup}>
              {(['Mineur', 'Majeur', 'Critique'] as const).map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.controlButton,
                    result?.defectLevel === level && styles.controlButtonSelected
                  ]}
                  onPress={() => updateControlResult(point.id, 'defectLevel', level)}
                >
                  <Text style={[
                    styles.controlButtonText,
                    result?.defectLevel === level && styles.controlButtonTextSelected
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Résultat */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Résultat:</Text>
            <View style={styles.buttonGroup}>
              {(['Bon', 'Mauvais'] as const).map(res => (
                <TouchableOpacity
                  key={res}
                  style={[
                    styles.controlButton,
                    result?.result === res && styles.controlButtonSelected
                  ]}
                  onPress={() => updateControlResult(point.id, 'result', res)}
                >
                  <Text style={[
                    styles.controlButtonText,
                    result?.result === res && styles.controlButtonTextSelected
                  ]}>
                    {res}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderFunctionSection = (functionName: string) => {
    const functionPoints = CONTROL_POINTS.filter(point => point.function === functionName);
    
    return (
      <View key={functionName} style={styles.functionSection}>
        <Text style={styles.functionTitle}>{functionName}</Text>
        {functionPoints.map(renderControlPoint)}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header avec informations du véhicule */}
      <View style={styles.header}>
        <Text style={styles.title}>Fiche de Contrôle Technique</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </View>

      {/* Informations du véhicule */}
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleInfoTitle}>Informations du Véhicule</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Plaque:</Text>
            <Text style={styles.infoValue}>{vehicleInfo.licensePlate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{vehicleInfo.vehicleType}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Centre:</Text>
            <Text style={styles.infoValue}>{vehicleInfo.center}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date visite:</Text>
            <Text style={styles.infoValue}>{vehicleInfo.visitDate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Validité:</Text>
            <Text style={styles.infoValue}>{vehicleInfo.validityDate}</Text>
          </View>
        </View>
      </View>

      {/* Points de contrôle */}
      <ScrollView style={styles.checklistContainer}>
        <Text style={styles.checklistTitle}>Points de Contrôle</Text>
        {FUNCTIONS.map(renderFunctionSection)}
      </ScrollView>

      {/* Bouton de validation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Générer la Fiche PDF</Text>
        </TouchableOpacity>
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
    marginBottom: 15,
    color: '#333',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  checklistContainer: {
    flex: 1,
    margin: 15,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  functionSection: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  functionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 15,
    textAlign: 'center',
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 5,
  },
  controlPoint: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pointName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlGroup: {
    flex: 1,
    marginRight: 10,
  },
  controlLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    flex: 1,
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  controlButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  controlButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  controlButtonTextSelected: {
    color: 'white',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 