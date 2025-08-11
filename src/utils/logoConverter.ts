import { Asset } from 'expo-asset';

/**
 * Convertit le logo JPEG en base64
 * @returns Promise<string> - Le logo en base64
 */
export const getCompanyLogoBase64 = async (): Promise<string> => {
  try {
    // Charger le logo depuis les assets
    const logoAsset = Asset.fromModule(require('../../assets/images/Sans titre.jpeg'));
    await logoAsset.downloadAsync();
    
    if (logoAsset.localUri) {
      // Convertir le fichier en base64
      const response = await fetch(logoAsset.localUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      throw new Error('Logo non trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la conversion du logo:', error);
    
    // Retourner un logo par défaut en cas d'erreur
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iMTIiIGZpbGw9IiMyMTk2RjMiLz4KPHN2ZyB4PSIzMCIgeT0iMzAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyeiBNMTMgMTdoLTJ2LTZoMnY2em0wLThoLTJWN2gydjJ6Ii8+Cjwvc3ZnPgo8L3N2Zz4K';
  }
};

/**
 * Logo par défaut en base64 (fallback)
 */
export const getDefaultLogoBase64 = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iMTIiIGZpbGw9IiMyMTk2RjMiLz4KPHN2ZyB4PSIzMCIgeT0iMzAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyeiBNMTMgMTdoLTJ2LTZoMnY2em0wLThoLTJWN2gydjJ6Ii8+Cjwvc3ZnPgo8L3N2Zz4K';
}; 