import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import ApercuFicheSuperviseur from './ApercuFicheSuperviseur';

interface FicheEnAttente {
  id: number;
  immatriculation: string;
  date_visite: string;
  centre: string;
  type_vehicule: string;
  technicien_name: string;
  created_at: string;
  statut_validation: 'en_attente' | 'validée' | 'rejetée';
}

interface SupervisorDashboardProps {
  onBack: () => void;
}

export default function SupervisorDashboard({ onBack }: SupervisorDashboardProps) {
  const [fiches, setFiches] = useState<FicheEnAttente[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFiche, setSelectedFiche] = useState<FicheEnAttente | null>(null);

  useEffect(() => {
    loadFichesEnAttente();
  }, []);

  const loadFichesEnAttente = async () => {
    try {
      setLoading(true);
      // TODO: Appel API pour récupérer les fiches en attente
      // const response = await fetch('/api/supervisor/fiches-en-attente');
      // const data = await response.json();
      // setFiches(data.fiches);
      
      // Données de test pour le moment
      const fichesTest: FicheEnAttente[] = [
        {
          id: 1,
          immatriculation: 'CF7878RB',
          date_visite: '2024-01-15',
          centre: 'EKPE',
          type_vehicule: 'CTVL',
          technicien_name: 'Kokouvi',
          created_at: '2024-01-15 10:30:00',
          statut_validation: 'en_attente'
        }
      ];
      setFiches(fichesTest);
    } catch (error) {
      console.error('Erreur lors du chargement des fiches:', error);
      Alert.alert('Erreur', 'Impossible de charger les fiches en attente');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFichesEnAttente();
    setRefreshing(false);
  };

  const handleValider = (ficheId: number) => {
    Alert.alert(
      'Valider la fiche',
      'Êtes-vous sûr de vouloir valider cette fiche ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Valider', 
          onPress: () => validerFiche(ficheId),
          style: 'default'
        }
      ]
    );
  };

  const handleRejeter = (ficheId: number) => {
    Alert.prompt(
      'Rejeter la fiche',
      'Veuillez indiquer la raison du rejet :',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Rejeter', 
          onPress: (commentaire) => rejeterFiche(ficheId, commentaire || '')
        }
      ],
      'plain-text'
    );
  };

  const handleViewFiche = (fiche: FicheEnAttente) => {
    setSelectedFiche(fiche);
  };

  const validerFiche = async (ficheId: number) => {
    try {
      // TODO: Appel API pour valider la fiche
      console.log('✅ Fiche validée:', ficheId);
      Alert.alert('Succès', 'Fiche validée avec succès');
      await loadFichesEnAttente(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      Alert.alert('Erreur', 'Impossible de valider la fiche');
    }
  };

  const rejeterFiche = async (ficheId: number, commentaire: string) => {
    try {
      // TODO: Appel API pour rejeter la fiche
      console.log('❌ Fiche rejetée:', ficheId, 'Commentaire:', commentaire);
      Alert.alert('Succès', 'Fiche rejetée avec succès');
      await loadFichesEnAttente(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      Alert.alert('Erreur', 'Impossible de rejeter la fiche');
    }
  };

  const renderFicheItem = ({ item }: { item: FicheEnAttente }) => (
    <TouchableOpacity 
      style={styles.ficheItem} 
      onPress={() => handleViewFiche(item)}
      activeOpacity={0.7}
    >
      <View style={styles.ficheHeader}>
        <Text style={styles.plaqueText}>{item.immatriculation}</Text>
        <View style={[
          styles.statutBadge, 
          { backgroundColor: getStatutColor(item.statut_validation) }
        ]}>
          <Text style={styles.statutText}>{item.statut_validation.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.ficheDetails}>
        <Text style={styles.detailText}>Centre: {item.centre}</Text>
        <Text style={styles.detailText}>Type: {item.type_vehicule}</Text>
        <Text style={styles.detailText}>Technicien: {item.technicien_name}</Text>
        <Text style={styles.detailText}>Date: {new Date(item.date_visite).toLocaleDateString()}</Text>
      </View>

      <View style={styles.itemFooter}>
        <Text style={styles.tapHint}>👆 Appuyez pour voir l'aperçu</Text>
        
        {item.statut_validation === 'en_attente' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.validerButton]} 
              onPress={(e) => {
                e.stopPropagation();
                handleValider(item.id);
              }}
            >
              <Text style={styles.actionButtonText}>✅ Valider</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejeterButton]} 
              onPress={(e) => {
                e.stopPropagation();
                handleRejeter(item.id);
              }}
            >
              <Text style={styles.actionButtonText}>❌ Rejeter</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return '#FFA500';
      case 'validée': return '#4CAF50';
      case 'rejetée': return '#F44336';
      default: return '#999';
    }
  };

  // Si une fiche est sélectionnée, afficher son aperçu
  if (selectedFiche) {
    return (
      <ApercuFicheSuperviseur
        fiche={selectedFiche}
        onBack={() => setSelectedFiche(null)}
        onValidate={validerFiche}
        onReject={rejeterFiche}
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Dashboard Superviseur</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.cnsr.primary} />
          <Text style={styles.loadingText}>Chargement des fiches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Dashboard Superviseur</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{fiches.filter(f => f.statut_validation === 'en_attente').length}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{fiches.filter(f => f.statut_validation === 'validée').length}</Text>
            <Text style={styles.statLabel}>Validées</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{fiches.filter(f => f.statut_validation === 'rejetée').length}</Text>
            <Text style={styles.statLabel}>Rejetées</Text>
          </View>
        </View>

        <FlatList
          data={fiches}
          renderItem={renderFicheItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune fiche en attente de validation</Text>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.cnsr.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  ficheItem: {
    backgroundColor: 'white',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  ficheHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  plaqueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statutBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statutText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ficheDetails: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  validerButton: {
    backgroundColor: '#4CAF50',
  },
  rejeterButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  itemFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tapHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
}); 