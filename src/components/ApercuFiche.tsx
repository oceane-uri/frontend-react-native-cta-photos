import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface VehicleInfo {
  licensePlate: string;
  vehicleType: string;
  center: string;
  visitDate: string;
  validityDate: string;
}

interface ControlResult {
  pointId: string;
  defectLevel: 'Mineur' | 'Majeur' | 'Critique' | null;
  result: 'Bon' | 'Mauvais' | null;
}

interface ApercuFicheProps {
  vehicleInfo: VehicleInfo;
  controlResults: ControlResult[];
  technicienName: string;
  isEditable: boolean; // true pour technicien, false pour superviseur
  onSendToSupervisor?: () => void;
  onValidate?: () => void;
  onGeneratePDF?: () => void;
  onBack: () => void;
}

// Points de contrôle avec leurs noms complets
const CONTROL_POINTS_MAP: { [key: string]: string } = {
  'id_1': 'Plaque d\'immatriculation',
  'id_2': 'Marque',
  'id_3': 'Type',
  'id_4': 'Date de 1ère mise en circulation',
  'car_1': 'Série (châssis)',
  'car_2': 'Tôlerie',
  'vis_1': 'Vitrage',
  'vis_2': 'Rétroviseur(s)',
  'vis_3': 'Essuie-glace',
  'vis_4': 'Pare-Soleil',
};

// Types de véhicules
const VEHICLE_TYPES = [
  { label: 'Véhicule Léger (CTVL)', value: 'CTVL' },
  { label: 'Poids Lourd (CTPL)', value: 'CTPL' },
  { label: 'Taxi (CTTAXI)', value: 'CTTAXI' },
];

// Centres de contrôle
const CENTERS = [
  'EKPE',
  'LOKOSSA',
  'AGONLI',
  'POBE',
  'ALLADA',
  'OUAIDAH',
];

export default function ApercuFiche({
  vehicleInfo: initialVehicleInfo,
  controlResults,
  technicienName,
  isEditable,
  onSendToSupervisor,
  onValidate,
  onGeneratePDF,
  onBack
}: ApercuFicheProps) {
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>(initialVehicleInfo);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!vehicleInfo.licensePlate.trim()) {
      Alert.alert('Erreur', 'La plaque d\'immatriculation est obligatoire');
      return;
    }
    if (!vehicleInfo.center) {
      Alert.alert('Erreur', 'Le centre est obligatoire');
      return;
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setVehicleInfo(initialVehicleInfo);
    setIsEditing(false);
  };

  const getDefectLevelColor = (level: string) => {
    switch (level) {
      case 'Mineur': return '#607D8B';
      case 'Majeur': return '#FF9800';
      case 'Critique': return '#F44336';
      default: return '#999';
    }
  };

  const getResultsByFunction = (functionName: string) => {
    return controlResults.filter(result => {
      const pointId = result.pointId;
      if (functionName === 'IDENTIFICATION' && pointId.startsWith('id_')) return true;
      if (functionName === 'CAROSSERIE' && pointId.startsWith('car_')) return true;
      if (functionName === 'VISIBILITÉ' && pointId.startsWith('vis_')) return true;
      return false;
    });
  };

  const renderVehicleInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📋 Informations du Véhicule</Text>
      
      {isEditing ? (
        <View style={styles.editContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Plaque d'immatriculation *</Text>
            <TextInput
              style={styles.input}
              value={vehicleInfo.licensePlate}
              onChangeText={(text) => setVehicleInfo(prev => ({ ...prev, licensePlate: text }))}
              placeholder="Ex: CF7878RB"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type de véhicule</Text>
            <View style={styles.pickerContainer}>
              {VEHICLE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.pickerOption,
                    vehicleInfo.vehicleType === type.value && styles.pickerOptionSelected
                  ]}
                  onPress={() => setVehicleInfo(prev => ({ ...prev, vehicleType: type.value }))}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    vehicleInfo.vehicleType === type.value && styles.pickerOptionTextSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Centre de contrôle *</Text>
            <View style={styles.pickerContainer}>
              {CENTERS.map((center) => (
                <TouchableOpacity
                  key={center}
                  style={[
                    styles.pickerOption,
                    vehicleInfo.center === center && styles.pickerOptionSelected
                  ]}
                  onPress={() => setVehicleInfo(prev => ({ ...prev, center }))}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    vehicleInfo.center === center && styles.pickerOptionTextSelected
                  ]}>
                    {center}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>💾 Sauvegarder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>❌ Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plaque :</Text>
            <Text style={styles.infoValue}>{vehicleInfo.licensePlate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type :</Text>
            <Text style={styles.infoValue}>{vehicleInfo.vehicleType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Centre :</Text>
            <Text style={styles.infoValue}>{vehicleInfo.center}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date visite :</Text>
            <Text style={styles.infoValue}>{new Date(vehicleInfo.visitDate).toLocaleDateString('fr-FR')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date validité :</Text>
            <Text style={styles.infoValue}>{new Date(vehicleInfo.validityDate).toLocaleDateString('fr-FR')}</Text>
          </View>
          
          {isEditable && (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>✏️ Modifier</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderControlResults = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔍 Points de Contrôle</Text>
      
      {['IDENTIFICATION', 'CAROSSERIE', 'VISIBILITÉ'].map((functionName) => {
        const results = getResultsByFunction(functionName);
        if (results.length === 0) return null;

        return (
          <View key={functionName} style={styles.functionGroup}>
            <Text style={styles.functionTitle}>{functionName}</Text>
            {results.map((result) => {
              const pointName = CONTROL_POINTS_MAP[result.pointId] || result.pointId;
              return (
                <View key={result.pointId} style={styles.controlPoint}>
                  <Text style={styles.pointName}>{pointName}</Text>
                  <View style={styles.pointResults}>
                    {result.defectLevel && (
                      <View style={[styles.defectBadge, { backgroundColor: getDefectLevelColor(result.defectLevel) }]}>
                        <Text style={styles.defectText}>{result.defectLevel}</Text>
                      </View>
                    )}
                    <View style={[styles.resultBadge, { backgroundColor: result.result === 'Bon' ? '#4CAF50' : '#F44336' }]}>
                      <Text style={styles.resultText}>{result.result}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      {isEditable ? (
        // Actions pour le technicien
        <TouchableOpacity style={styles.primaryButton} onPress={onSendToSupervisor}>
          <Text style={styles.primaryButtonText}>📤 Envoyer au Superviseur</Text>
        </TouchableOpacity>
      ) : (
        // Actions pour le superviseur
        <View style={styles.supervisorActions}>
          <TouchableOpacity style={styles.validateButton} onPress={onValidate}>
            <Text style={styles.validateButtonText}>✅ Valider la Fiche</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pdfButton} onPress={onGeneratePDF}>
            <Text style={styles.pdfButtonText}>📄 Générer PDF Final</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.footerRow}>
        <Text style={styles.footerLabel}>Technicien :</Text>
        <Text style={styles.footerValue}>{technicienName}</Text>
      </View>
      {!isEditable && (
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Superviseur :</Text>
          <Text style={styles.footerValue}>{(global as any).currentUser?.name || 'Superviseur'}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditable ? 'Aperçu Fiche (Technicien)' : 'Aperçu Fiche (Superviseur)'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderVehicleInfo()}
        {renderControlResults()}
        {renderActions()}
        {renderFooter()}
      </ScrollView>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.cnsr.primary,
    paddingTop: 10,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  editContainer: {
    gap: 15,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  pickerOptionSelected: {
    backgroundColor: Colors.cnsr.primary,
    borderColor: Colors.cnsr.primary,
  },
  pickerOptionText: {
    fontSize: 12,
    color: '#666',
  },
  pickerOptionTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContainer: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: Colors.cnsr.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  functionGroup: {
    marginBottom: 20,
  },
  functionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.cnsr.primary,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  controlPoint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pointName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  pointResults: {
    flexDirection: 'row',
    gap: 8,
  },
  defectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defectText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.cnsr.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  supervisorActions: {
    gap: 10,
  },
  validateButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  validateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pdfButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  footerLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  footerValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
}); 