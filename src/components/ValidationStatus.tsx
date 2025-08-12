import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface ValidationStatusProps {
  status: 'en_attente' | 'validée' | 'rejetée';
  commentaires?: string;
  dateValidation?: string;
  onRefresh?: () => void;
}

export default function ValidationStatus({ 
  status, 
  commentaires, 
  dateValidation, 
  onRefresh 
}: ValidationStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'en_attente': return '#FFA500';
      case 'validée': return '#4CAF50';
      case 'rejetée': return '#F44336';
      default: return '#999';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'en_attente': return '⏳';
      case 'validée': return '✅';
      case 'rejetée': return '❌';
      default: return '❓';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'en_attente': return 'En attente de validation';
      case 'validée': return 'Validée par le superviseur';
      case 'rejetée': return 'Rejetée par le superviseur';
      default: return 'Statut inconnu';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {status === 'en_attente' && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Votre fiche est en cours de validation par le superviseur.
          </Text>
          <Text style={styles.infoText}>
            Vous recevrez une notification une fois la validation terminée.
          </Text>
          {onRefresh && (
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>🔄 Actualiser</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {status === 'validée' && (
        <View style={styles.infoContainer}>
          <Text style={styles.successText}>
            🎉 Votre fiche a été validée par le superviseur !
          </Text>
          {dateValidation && (
            <Text style={styles.dateText}>
              Validée le : {new Date(dateValidation).toLocaleDateString('fr-FR')}
            </Text>
          )}
          {commentaires && (
            <View style={styles.commentairesContainer}>
              <Text style={styles.commentairesLabel}>Commentaires :</Text>
              <Text style={styles.commentairesText}>{commentaires}</Text>
            </View>
          )}
        </View>
      )}

      {status === 'rejetée' && (
        <View style={styles.infoContainer}>
          <Text style={styles.errorText}>
            ❌ Votre fiche a été rejetée par le superviseur.
          </Text>
          {dateValidation && (
            <Text style={styles.dateText}>
              Rejetée le : {new Date(dateValidation).toLocaleDateString('fr-FR')}
            </Text>
          )}
          {commentaires && (
            <View style={styles.commentairesContainer}>
              <Text style={styles.commentairesLabel}>Raison du rejet :</Text>
              <Text style={styles.commentairesText}>{commentaires}</Text>
            </View>
          )}
          <Text style={styles.actionText}>
            Veuillez corriger les points mentionnés et soumettre à nouveau.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  successText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  commentairesContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  commentairesLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentairesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  refreshButton: {
    backgroundColor: Colors.cnsr.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 