import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import SupervisorDashboard from '../src/components/SupervisorDashboard';

export default function SupervisorScreen() {
  const handleBack = () => {
    // Navigation vers l'écran précédent
    // TODO: Implémenter la navigation
    console.log('Retour au menu principal');
  };

  return (
    <SupervisorDashboard onBack={handleBack} />
  );
} 