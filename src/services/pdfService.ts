import AsyncStorage from '@react-native-async-storage/async-storage';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

// Vérifier si la librairie PDF est disponible
const isPDFLibraryAvailable = () => {
  return RNHTMLtoPDF && typeof RNHTMLtoPDF.convert === 'function';
};

// Fonction utilitaire pour convertir en base64 (compatible React Native)
const convertToBase64 = (str: string): string => {
  try {
    // Essayer d'abord btoa (disponible sur certaines plateformes)
    if (typeof btoa === 'function') {
      return btoa(str);
    }
    // Fallback pour React Native
    return Buffer.from(str, 'utf8').toString('base64');
  } catch (error) {
    console.warn('⚠️ Erreur lors de la conversion base64, utilisation d\'une chaîne simple');
    return str;
  }
};

// Types pour la génération PDF
export interface ControlResult {
  pointId: string;
  defectLevel: 'Mineur' | 'Majeur' | 'Critique' | null;
  result: 'Bon' | 'Mauvais' | null;
}

export interface VehicleInfo {
  licensePlate: string;
  vehicleType: string;
  center: string;
  visitDate: string;
  validityDate: string;
}

export interface PDFGenerationData {
  vehicleInfo: VehicleInfo;
  controlResults: ControlResult[];
  technicienName: string;
  timestamp: string;
  companyLogo?: string; // Logo personnalisé en base64
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

// Fonctions de contrôle
const FUNCTIONS = ['IDENTIFICATION', 'CAROSSERIE', 'VISIBILITÉ'];

// Générer le HTML pour la fiche de contrôle
export const generateControlChecklistHTML = (data: PDFGenerationData): string => {
  const { vehicleInfo, controlResults, technicienName, timestamp } = data;
  
  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Logo de l'entreprise - optionnel, s'affiche seulement s'il est fourni
  // Évite l'affichage de base64 dans le terminal
  const companyLogo = data.companyLogo || null;

  // Obtenir les résultats par fonction
  const getResultsByFunction = (functionName: string) => {
    return controlResults.filter(result => {
      const pointId = result.pointId;
      if (functionName === 'IDENTIFICATION' && pointId.startsWith('id_')) return true;
      if (functionName === 'CAROSSERIE' && pointId.startsWith('car_')) return true;
      if (functionName === 'VISIBILITÉ' && pointId.startsWith('vis_')) return true;
      return false;
    });
  };

  // Générer le HTML pour un point de contrôle
  const generateControlPointHTML = (result: ControlResult) => {
    const pointName = CONTROL_POINTS_MAP[result.pointId] || result.pointId;
    const defectLevel = result.defectLevel || '';
    const resultStatus = result.result || '';
    
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-size: 12px;">${pointName}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-size: 12px;">
          ${defectLevel ? `<span style="color: ${getDefectLevelColor(defectLevel)}; font-weight: bold;">${defectLevel}</span>` : ''}
        </td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-size: 12px;">
          ${resultStatus ? `<span style="color: ${resultStatus === 'Bon' ? '#4CAF50' : '#f44336'}; font-weight: bold;">${resultStatus}</span>` : ''}
        </td>
      </tr>
    `;
  };

  // Générer le HTML pour une fonction
  const generateFunctionHTML = (functionName: string) => {
    const functionResults = getResultsByFunction(functionName);
    
    return `
      <div style="margin-bottom: 20px;">
        <h3 style="color: #2196F3; text-align: center; background-color: #f0f8ff; padding: 10px; margin: 0; border-radius: 5px;">
          ${functionName}
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left; font-size: 12px;">Point de Contrôle</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: center; font-size: 12px;">Niveau de Défaillance</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: center; font-size: 12px;">Résultat</th>
            </tr>
          </thead>
          <tbody>
            ${functionResults.map(generateControlPointHTML).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  // Couleurs pour les niveaux de défaillance
  const getDefectLevelColor = (level: string) => {
    switch (level) {
      case 'Mineur': return '#FF9800';
      case 'Majeur': return '#FF5722';
      case 'Critique': return '#D32F2F';
      default: return '#666';
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Fiche de Contrôle Technique</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: white;
          color: #2c3e50;
          position: relative;
          max-width: 100%;
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          padding: 25px 20px;
          margin-bottom: 30px;
          border-radius: 12px;
          position: relative;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 22px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header p {
          color: rgba(255, 255, 255, 0.9);
          margin: 5px 0;
          font-size: 13px;
        }
        .company-logo {
          position: absolute;
          top: 15px;
          left: 15px;
          width: 60px;
          height: 60px;
          border-radius: 6px;
          opacity: 0.3;
          z-index: -1;
        }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          opacity: 0.05;
          z-index: -1;
          pointer-events: none;
        }
        .watermark img {
          width: 300px;
          height: 300px;
        }
        .vehicle-info {
          background: linear-gradient(135deg, #ecf0f1, #bdc3c7);
          padding: 18px;
          border-radius: 12px;
          margin-bottom: 30px;
          border-left: 5px solid #3498db;
          box-shadow: 0 2px 10px rgba(52, 152, 219, 0.1);
        }
        .vehicle-info h2 {
          color: #2c3e50;
          margin-top: 0;
          font-size: 16px;
          margin-bottom: 15px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid rgba(52, 152, 219, 0.2);
          font-size: 13px;
        }
        .info-label {
          font-weight: 600;
          color: #34495e;
          flex: 0 0 45%;
          margin-right: 10px;
        }
        .info-value {
          color: #2c3e50;
          font-weight: 600;
          flex: 0 0 55%;
          text-align: right;
          word-break: break-word;
        }
        .checklist-section {
          margin-bottom: 30px;
        }
        .checklist-section h2 {
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
          margin-bottom: 20px;
          font-size: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
        }
        th, td {
          border: 1px solid #e8f4fd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e8f4fd;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          padding: 20px;
          border-radius: 12px;
        }
        .signature {
          text-align: center;
          flex: 1;
          margin-right: 20px;
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(52, 152, 219, 0.1);
        }
        .signature-line {
          border-top: 3px solid #3498db;
          width: 200px;
          margin: 15px auto;
          height: 3px;
          background: linear-gradient(90deg, #3498db, #2980b9);
          border-radius: 2px;
        }
        .technicien-name {
          font-size: 16px;
          font-weight: bold;
          color: #2c3e50;
          margin-top: 10px;
        }
        .timestamp {
          color: #34495e;
          font-size: 12px;
          flex: 1;
          text-align: right;
          background: white;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(52, 152, 219, 0.1);
        }
        /* Suppression du cercle stamp */
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
          .vehicle-info { page-break-inside: avoid; }
          .checklist-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <!-- Filigrane (seulement si logo disponible) -->
      ${companyLogo ? `
      <div class="watermark">
        <img src="${companyLogo}" alt="Logo entreprise" />
      </div>
      ` : ''}
      
      <!-- En-tête avec logo (seulement si logo disponible) -->
      <div class="header">
        ${companyLogo ? `<img src="${companyLogo}" alt="Logo CNSR" class="company-logo" />` : ''}
        <h1>FICHE DE CONTRÔLE TECHNIQUE AUTOMOBILE</h1>
        <p>République du Bénin - Ministère des Transports</p>
        <p>Centre National de Sécurité Routière (CNSR)</p>
        <p>Centre de Contrôle Technique Automobile</p>
      </div>

      <!-- Informations du véhicule -->
      <div class="vehicle-info">
        <h2>Informations du Véhicule</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Plaque d'immatriculation:</span>
            <span class="info-value">${vehicleInfo.licensePlate}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Type de véhicule:</span>
            <span class="info-value">${vehicleInfo.vehicleType}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Centre de contrôle:</span>
            <span class="info-value">${vehicleInfo.center}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date de visite:</span>
            <span class="info-value">${formatDate(vehicleInfo.visitDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date de validité:</span>
            <span class="info-value">${formatDate(vehicleInfo.validityDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Technicien:</span>
            <span class="info-value">${technicienName}</span>
          </div>
        </div>
      </div>

      <!-- Points de contrôle -->
      <div class="checklist-section">
        <h2>Points de Contrôle</h2>
        ${FUNCTIONS.map(generateFunctionHTML).join('')}
      </div>

      <!-- Résumé et signature -->
      <div class="footer">
        <div class="signature">
          <div class="signature-line"></div>
          <p><strong>Signature du Technicien</strong></p>
          <div class="technicien-name">${technicienName}</div>
        </div>
        <div class="timestamp">
          <p><strong>Document généré le:</strong></p>
          <p>Le ${formatDate(timestamp)}</p>
          <p>A ${new Date(timestamp).toLocaleTimeString('fr-FR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Service principal de génération PDF
export class PDFService {
  private static instance: PDFService;

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  // Générer la fiche de contrôle en HTML (pour conversion PDF)
  async generateControlChecklist(data: PDFGenerationData): Promise<string> {
    try {
      const html = generateControlChecklistHTML(data);
      
      // Sauvegarder temporairement en local pour debug (sans afficher l'HTML)
      await AsyncStorage.setItem('lastGeneratedHTML', html);
      
      console.log('✅ HTML de la fiche de contrôle généré avec succès');
      return html;
    } catch (error) {
      console.error('❌ Erreur lors de la génération HTML:', error);
      throw new Error('Impossible de générer la fiche de contrôle');
    }
  }

  // Convertir HTML en PDF avec react-native-html-to-pdf
  async convertHTMLToPDF(html: string): Promise<string> {
    try {
      // Vérifier si la librairie PDF est disponible
      if (!isPDFLibraryAvailable()) {
        console.warn('⚠️ Librairie PDF non disponible, utilisation du fallback HTML');
        const htmlBase64 = convertToBase64(html);
        return `data:text/html;base64,${htmlBase64}`;
      }

      console.log('🔄 Début de la conversion HTML vers PDF...');
      
      // Options de conversion PDF
      const options = {
        html: html,
        fileName: `fiche_controle_${Date.now()}`,
        directory: 'Documents',
        base64: true, // ⭐ IMPORTANT: Retourner en base64
      };
      
      console.log('📄 Conversion PDF en cours...');
      
      // Convertir HTML vers PDF - utiliser la méthode correcte
      const file = await RNHTMLtoPDF.convert(options);
      
      if (file && file.filePath) {
        console.log('✅ PDF généré avec succès');
        console.log('📊 Taille du fichier:', file.fileSize, 'bytes');
        
        // Le fichier est déjà en base64 grâce à l'option base64: true
        if (file.base64) {
          console.log('✅ PDF en base64 prêt');
          return file.base64;
        } else {
          throw new Error('PDF généré mais pas de base64 disponible');
        }
      } else {
        throw new Error('Échec de la génération du PDF');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la conversion PDF:', error);
      
      // Fallback: retourner l'HTML en base64 si la conversion échoue
      console.warn('⚠️ Utilisation de l\'HTML en base64 comme fallback');
      const htmlBase64 = convertToBase64(html);
      return `data:text/html;base64,${htmlBase64}`;
    }
  }

  // Générer la fiche complète (HTML + conversion PDF)
  async generateCompleteControlChecklist(data: PDFGenerationData): Promise<{
    html: string;
    pdfBase64?: string;
  }> {
    try {
      // 1. Générer l'HTML
      const html = await this.generateControlChecklist(data);
      
      // 2. Convertir en PDF (quand la librairie sera implémentée)
      let pdfBase64: string | undefined;
      try {
        pdfBase64 = await this.convertHTMLToPDF(html);
      } catch (pdfError) {
        console.warn('⚠️ Conversion PDF échouée, utilisation de l\'HTML:', pdfError);
      }
      
      return {
        html,
        pdfBase64,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la génération complète:', error);
      throw error;
    }
  }
}

export default PDFService; 