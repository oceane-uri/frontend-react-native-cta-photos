# 📸 Système de Capture Photo et Reconnaissance de Plaques

## 🎯 Vue d'ensemble

Ce système permet de capturer des photos de véhicules, reconnaître automatiquement les plaques d'immatriculation au format CEDEAO, et enregistrer toutes les informations en base de données avec calcul automatique des dates de validité.

## ✨ Fonctionnalités principales

### 🔒 Sécurité et restrictions
- **Caméra uniquement** : Accès à la galerie bloqué pour éviter la fraude
- **Authentification requise** : Toutes les opérations nécessitent un token JWT valide
- **Validation des données** : Vérification du format des plaques et des types de véhicules

### 📱 Interface utilisateur
- **Cadrage intelligent** : Guide visuel pour cadrer la plaque d'immatriculation
- **Sélection du type de véhicule** : CTVL, CTPL, CTTAXI avec validités différentes
- **Sélection du centre** : Liste des centres de contrôle technique disponibles
- **Formulaire de confirmation** : Vérification et modification des données avant enregistrement

### 🤖 Reconnaissance automatique
- **API gratuite** : Utilisation de Plate Recognizer (2500 requêtes/mois)
- **Format CEDEAO** : Reconnaissance des plaques au format africain standard
- **Fallback manuel** : Saisie manuelle en cas d'échec de la reconnaissance
- **Validation automatique** : Vérification du format des plaques détectées

### 📊 Gestion des données
- **Calcul automatique des validités** :
  - CTVL (Véhicule Léger) : 1 an
  - CTPL (Transport Public) : 6 mois
  - CTTAXI : 3 mois
- **Stockage local et distant** : Photos sauvegardées en local ET en base de données
- **Métadonnées complètes** : Date de visite, centre, type véhicule, etc.

## 🏗️ Architecture technique

### Frontend (React Native + Expo)
```
src/
├── components/
│   └── PhotoCapture.tsx          # Composant principal de capture
├── config/
│   └── plateRecognition.js       # Configuration des APIs de reconnaissance
├── services/
│   └── photoService.ts           # Service de gestion des photos
└── screens/
    └── CTAPhotoScreen.tsx        # Écran de gestion des photos CTA
```

### Backend (Node.js + Express)
```
backend/
├── routes/
│   └── photo-cta.js              # API REST pour les photos CTA
├── migrations/
│   └── add_vehicle_type.sql      # Migration de la base de données
└── test-database.js              # Script de test de la base
```

### Base de données (MySQL)
```sql
-- Table photo_cta avec nouvelle colonne
ALTER TABLE photo_cta 
ADD COLUMN type_vehicule ENUM('CTVL', 'CTPL', 'CTTAXI') NOT NULL DEFAULT 'CTVL';
```

## 🚀 Installation et configuration

### 1. Dépendances frontend
```bash
cd frontend-react-native
npm install @react-native-picker/picker @react-native-async-storage/async-storage
```

### 2. Migration de la base de données
```bash
cd backend
mysql -u root -p cta_database < migrations/add_vehicle_type.sql
```

### 3. Configuration des APIs
Éditez `frontend-react-native/src/config/plateRecognition.js` :
```javascript
plateRecognizer: {
  enabled: true,
  apiKey: 'VOTRE_CLE_API_ICI', // Obtenez-la sur https://platerecognizer.com
  // ...
}
```

### 4. Test de la base de données
```bash
cd backend
node test-database.js
```

## 🔧 Configuration des APIs de reconnaissance

### Plate Recognizer (Recommandé)
- **URL** : https://api.platerecognizer.com/
- **Limite gratuite** : 2500 requêtes/mois
- **Format supporté** : CEDEAO, européen, américain
- **Précision** : Très élevée

### Alternatives gratuites
- **OpenALPR** : 1000 requêtes/mois
- **OCR.space** : 500 requêtes/jour

## 📱 Utilisation

### 1. Capture de photo
1. Ouvrir l'écran CTA Photos
2. Appuyer sur "📷 Prendre une photo"
3. Cadrer la plaque d'immatriculation dans le guide bleu
4. Appuyer sur le bouton de capture

### 2. Reconnaissance automatique
- La photo est envoyée à l'API de reconnaissance
- La plaque est automatiquement détectée
- Si la reconnaissance échoue, saisie manuelle possible

### 3. Configuration du contrôle
- Vérifier/modifier la plaque détectée
- Sélectionner le type de véhicule
- Choisir le centre de contrôle
- La date de validité est calculée automatiquement

### 4. Enregistrement
- La photo est sauvegardée en local
- Les données sont insérées en base de données
- Confirmation de succès affichée

## 🔍 API Endpoints

### POST /api/photo-cta
Ajouter une nouvelle photo CTA
```json
{
  "immatriculation": "AB-123-CD",
  "date_visite": "2024-01-15",
  "centre": "Centre CTA Abidjan",
  "date_validite": "2025-01-15",
  "type_vehicule": "CTVL",
  "photo_base64": "data:image/jpeg;base64,...",
  "cta_id": "123"
}
```

### GET /api/photo-cta
Récupérer toutes les photos CTA

### GET /api/photo-cta/cta/:ctaId
Récupérer les photos d'un CTA spécifique

### GET /api/photo-cta/stats/overview
Statistiques générales des photos

## 🧪 Tests et validation

### Test de la base de données
```bash
cd backend
node test-database.js
```

### Test de l'API
```bash
# Test avec curl
curl -X POST http://localhost:3000/api/photo-cta \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "immatriculation": "AB-123-CD",
    "date_visite": "2024-01-15",
    "centre": "Centre CTA Abidjan",
    "date_validite": "2025-01-15",
    "type_vehicule": "CTVL",
    "photo_base64": "test",
    "cta_id": "1"
  }'
```

## 🚨 Dépannage

### Erreurs courantes

#### "Permission caméra refusée"
- Vérifier les permissions dans les paramètres du téléphone
- Redémarrer l'application

#### "API de reconnaissance non disponible"
- Vérifier la clé API dans la configuration
- Vérifier la limite de requêtes gratuites
- Utiliser la saisie manuelle en attendant

#### "Erreur de base de données"
- Vérifier la connexion MySQL
- Exécuter la migration si nécessaire
- Vérifier les logs du serveur

### Logs et debugging
```bash
# Logs du serveur backend
cd backend
npm start

# Logs React Native
cd frontend-react-native
npx expo start --clear
```

## 🔮 Évolutions futures

### Fonctionnalités prévues
- **Reconnaissance offline** : Modèle local pour la reconnaissance de plaques
- **Synchronisation** : Sync automatique avec le serveur central
- **Géolocalisation** : Enregistrement automatique du lieu de capture
- **Mode batch** : Capture de plusieurs véhicules en série

### Optimisations techniques
- **Compression des images** : Réduction de la taille des photos
- **Cache intelligent** : Mise en cache des plaques fréquentes
- **API multiple** : Fallback automatique entre différentes APIs

## 📞 Support

Pour toute question ou problème :
1. Vérifier la documentation
2. Consulter les logs d'erreur
3. Tester avec le script de validation
4. Contacter l'équipe de développement

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2024  
**Compatibilité** : React Native 0.70+, Expo SDK 49+ 