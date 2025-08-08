import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ctaService } from '../src/services/api';

export default function HomeScreen() {
  const [ctaList, setCtaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadCTAs = async () => {
    setLoading(true);
    try {
      const data = await ctaService.getAllCTAs(global.authToken);
      setCtaList(data);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCTAs();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCTAs();
  }, []);

  const renderCTACard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // Navigation vers les détails (à implémenter)
        Alert.alert('Détails', `Contrôle technique: ${item.immatriculation}`);
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.immatriculation}>{item.immatriculation}</Text>
        <Text style={styles.date}>{new Date(item.date_visite).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.centre}>Centre: {item.centre}</Text>
        <Text style={styles.technicien}>Technicien: {item.technicien_name}</Text>
        <Text style={styles.validite}>
          Validité: {new Date(item.date_validite).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contrôles Techniques</Text>
        <Text style={styles.subtitle}>
          Bonjour, {global.currentUser?.name || 'Utilisateur'}
        </Text>
      </View>

      <FlatList
        data={ctaList}
        renderItem={renderCTACard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Chargement...' : 'Aucun contrôle technique trouvé'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // Navigation vers l'ajout (à implémenter)
          Alert.alert('Ajouter', 'Fonctionnalité à venir');
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  list: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  immatriculation: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  cardContent: {
    gap: 5,
  },
  centre: {
    fontSize: 14,
    color: '#333',
  },
  technicien: {
    fontSize: 14,
    color: '#333',
  },
  validite: {
    fontSize: 14,
    color: '#666',
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
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
}); 