import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import ApercuFiche from './ApercuFiche';

interface FicheEnAttente {
  id: number;
  immatriculation: string;
  date_visite: string;
  centre: string;
  type_vehicule: string;
  technicien_name: string;
  created_at: string;
  statut_validation: 'en_attente' | 'validée' | 'rejetée';
  latitude?: number;
  longitude?: number;
  adresse?: string;
}

interface ApercuFicheSuperviseurProps {
  fiche: FicheEnAttente;
  onBack: () => void;
  onValidate: (ficheId: number) => void;
  onReject: (ficheId: number, commentaires: string) => void;
}

export default function ApercuFicheSuperviseur({
  fiche,
  onBack,
  onValidate,
  onReject
}: ApercuFicheSuperviseurProps) {
  const [loading, setLoading] = useState(false);

  const handleValidate = () => {
    Alert.alert(
      'Valider la fiche',
      `Êtes-vous sûr de vouloir valider la fiche de ${fiche.immatriculation} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Valider', 
          onPress: () => {
            setLoading(true);
            onValidate(fiche.id);
          },
          style: 'default'
        }
      ]
    );
  };

  const handleReject = () => {
    Alert.prompt(
      'Rejeter la fiche',
      'Veuillez indiquer la raison du rejet :',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Rejeter', 
          onPress: (commentaire) => {
            if (commentaire && commentaire.trim()) {
              setLoading(true);
              onReject(fiche.id, commentaire.trim());
            } else {
              Alert.alert('Erreur', 'Veuillez indiquer une raison pour le rejet');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  // Convertir les données de la fiche au format attendu par ApercuFiche
  const vehicleInfo = {
    licensePlate: fiche.immatriculation,
    vehicleType: fiche.type_vehicule,
    center: fiche.centre,
    visitDate: fiche.date_visite,
    validityDate: new Date(fiche.date_visite).toISOString().split('T')[0], // Calculer la validité
  };

  // Pour le moment, on utilise des résultats de contrôle vides
  // TODO: Récupérer les vrais résultats de contrôle depuis la base
  const controlResults: any[] = [];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Aperçu Fiche</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.cnsr.primary} />
          <Text style={styles.loadingText}>Traitement en cours...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ApercuFiche
      vehicleInfo={vehicleInfo}
      controlResults={controlResults}
      technicienName={fiche.technicien_name}
      isEditable={false}
      onValidate={handleValidate}
      onGeneratePDF={() => {
        Alert.alert(
          'Génération PDF',
          'Cette fonctionnalité sera implémentée dans la prochaine étape.',
          [{ text: 'OK' }]
        );
      }}
      onBack={onBack}
    />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
}); 