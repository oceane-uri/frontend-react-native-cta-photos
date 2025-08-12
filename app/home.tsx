import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { ctaService } from '../src/services/api';

export default function HomeScreen() {
  const [ctaList, setCtaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));

  const loadCTAs = async () => {
    setLoading(true);
    try {
      const data = await ctaService.getAllCTAs((global as any).authToken);
      setCtaList(data);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur de chargement');
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

  const toggleMenu = () => {
    if (isMenuOpen) {
      // Fermer le menu
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setIsMenuOpen(false));
    } else {
      // Ouvrir le menu
      setIsMenuOpen(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'new_cta':
        Alert.alert('Nouveau CTA', 'Créer un nouveau contrôle technique');
        break;
      case 'take_photo':
        router.push('/cta-photos');
        break;
      case 'scan_plate':
        Alert.alert('Scanner plaque', 'Scanner une plaque d\'immatriculation');
        break;
      case 'search_vehicle':
        Alert.alert('Rechercher véhicule', 'Rechercher un véhicule existant');
        break;
      case 'reports':
        Alert.alert('Rapports', 'Générer des rapports');
        break;
      case 'supervisor':
        router.push('/supervisor');
        break;
      default:
        break;
    }
    toggleMenu(); // Fermer le menu après l'action
  };

  const renderCTACard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => {
          // Navigation vers les détails (à implémenter)
          Alert.alert('Détails', `Contrôle technique: ${item.immatriculation}`);
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.immatriculation}>{item.immatriculation}</Text>
          <Text style={styles.date}>{new Date(item.date_visite).toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={styles.centre}>Centre: {item.centre}</Text>
          <Text style={styles.technicien}>Technicien: {item.technicien_name}</Text>
          <Text style={styles.validite}>
            Validité: {new Date(item.date_validite).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.photoButton}
          onPress={() => {
            router.push({
              pathname: '/cta-photos',
              params: { 
                ctaId: item.id.toString(),
                ctaName: item.immatriculation
              }
            });
          }}
        >
          <Text style={styles.photoButtonText}>📷 Photos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contrôles Techniques</Text>
        <Text style={styles.subtitle}>
          Bonjour, {(global as any).currentUser?.name || 'Utilisateur'}
        </Text>
        {/* Debug temporaire pour vérifier le rôle */}
        <Text style={styles.debugText}>
          Rôle: {(global as any).currentUser?.role || 'Non défini'}
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

      {/* Menu d'actions flottant */}
      {isMenuOpen && (
        <Animated.View 
          style={[
            styles.menuOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.menuOverlayTouchable}
            onPress={toggleMenu}
          />
        </Animated.View>
      )}

      {/* Actions du menu */}
      {isMenuOpen && (
        <Animated.View 
          style={[
            styles.menuActions,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.menuAction, styles.menuActionPrimary]}
            onPress={() => handleAction('new_cta')}
          >
            <Text style={styles.menuActionIcon}>🚗</Text>
            <Text style={styles.menuActionText}>Nouveau CTA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuAction, styles.menuActionSuccess]}
            onPress={() => handleAction('take_photo')}
          >
            <Text style={styles.menuActionIcon}>📸</Text>
            <Text style={styles.menuActionText}>Prendre photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuAction, styles.menuActionInfo]}
            onPress={() => handleAction('scan_plate')}
          >
            <Text style={styles.menuActionIcon}>🔍</Text>
            <Text style={styles.menuActionText}>Scanner plaque</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuAction, styles.menuActionWarning]}
            onPress={() => handleAction('search_vehicle')}
          >
            <Text style={styles.menuActionIcon}>🔎</Text>
            <Text style={styles.menuActionText}>Rechercher</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuAction, styles.menuActionSecondary]}
            onPress={() => handleAction('reports')}
          >
            <Text style={styles.menuActionIcon}>📊</Text>
            <Text style={styles.menuActionText}>Rapports</Text>
          </TouchableOpacity>

          {/* Bouton Superviseur - visible seulement pour les superviseurs */}
          {((global as any).currentUser?.role === 'superviseur' || 
            (global as any).currentUser?.role === 'admin' || 
            (global as any).currentUser?.role === 'superadmin') && (
            <TouchableOpacity
              style={[styles.menuAction, styles.menuActionSupervisor]}
              onPress={() => handleAction('supervisor')}
            >
              <Text style={styles.menuActionIcon}>👨‍💼</Text>
              <Text style={styles.menuActionText}>Superviseur</Text>
            </TouchableOpacity>
          )}
          
          {/* Debug temporaire pour vérifier la condition */}
          <View style={styles.debugContainer}>
            <Text style={styles.debugText2}>
              Condition: {((global as any).currentUser?.role === 'superviseur' || 
                (global as any).currentUser?.role === 'admin' || 
                (global as any).currentUser?.role === 'superadmin') ? 'VRAI' : 'FAUX'}
            </Text>
            <Text style={styles.debugText2}>
              Rôle actuel: {(global as any).currentUser?.role || 'Non défini'}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Bouton FAB principal */}
      <TouchableOpacity
        style={[styles.fab, isMenuOpen && styles.fabActive]}
        onPress={toggleMenu}
      >
        <Text style={styles.fabText}>{isMenuOpen ? '×' : '+'}</Text>
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
  debugText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.6,
    marginTop: 5,
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
    flex: 1,
  },
  cardInfo: {
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
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  photoButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
    zIndex: 1000,
  },
  fabActive: {
    backgroundColor: '#f44336',
    transform: [{ rotate: '45deg' }],
  },
  fabText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  menuOverlayTouchable: {
    flex: 1,
  },
  menuActions: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 1000,
    gap: 15,
  },
  menuAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 160,
  },
  menuActionPrimary: {
    backgroundColor: '#2196F3',
  },
  menuActionSuccess: {
    backgroundColor: '#4CAF50',
  },
  menuActionInfo: {
    backgroundColor: '#00BCD4',
  },
  menuActionWarning: {
    backgroundColor: '#FF9800',
  },
  menuActionSecondary: {
    backgroundColor: '#9C27B0',
  },
  menuActionSupervisor: {
    backgroundColor: '#FF9800',
  },
  debugContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  debugText2: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  menuActionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  menuActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 