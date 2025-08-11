/**
 * Palette de couleurs CNSR harmonisée pour toute l'application
 * Couleurs soft et professionnelles inspirées du logo CNSR
 */

// Couleurs principales CNSR - Orange foncé avec dégradé
const cnsrPrimary = '#FF8C00';      // Orange foncé principal (Dark Orange)
const cnsrSecondary = '#FF7F00';    // Orange foncé secondaire (Dark Orange 2)
const cnsrAccent = '#FF6B35';       // Orange rouge foncé (Dark Orange Red)
const cnsrLight = '#FFF8DC';        // Crème très clair (Cornsilk)
const cnsrMedium = '#FFE4B5';       // Crème moyen (Moccasin)
const cnsrDark = '#8B4513';         // Marron foncé (Saddle Brown)

// Couleurs d'état
const cnsrSuccess = '#27ae60';      // Vert (Flat UI Green)
const cnsrWarning = '#f39c12';      // Orange (Flat UI Orange)
const cnsrError = '#e74c3c';        // Rouge (Flat UI Red)
const cnsrInfo = '#FF8C00';         // Orange info (même que primary)

export const Colors = {
  // Couleurs CNSR principales
  cnsr: {
    primary: cnsrPrimary,
    secondary: cnsrSecondary,
    accent: cnsrAccent,
    light: cnsrLight,
    medium: cnsrMedium,
    dark: cnsrDark,
    success: cnsrSuccess,
    warning: cnsrWarning,
    error: cnsrError,
    info: cnsrInfo,
  },
  
  // Mode clair avec couleurs CNSR
  light: {
    text: cnsrAccent,
    background: '#fff',
    tint: cnsrPrimary,
    icon: cnsrDark,
    tabIconDefault: cnsrMedium,
    tabIconSelected: cnsrPrimary,
    card: '#fff',
    cardBorder: cnsrLight,
    button: cnsrPrimary,
    buttonText: '#fff',
    input: cnsrLight,
    inputBorder: cnsrMedium,
    success: cnsrSuccess,
    warning: cnsrWarning,
    error: cnsrError,
  },
  
  // Mode sombre avec couleurs CNSR
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: cnsrPrimary,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: cnsrPrimary,
    card: '#1a1b1c',
    cardBorder: cnsrAccent,
    button: cnsrPrimary,
    buttonText: '#fff',
    input: cnsrAccent,
    inputBorder: cnsrMedium,
    success: cnsrSuccess,
    warning: cnsrWarning,
    error: cnsrError,
  },
  
  // Couleurs communes
  common: {
    white: '#fff',
    black: '#000',
    transparent: 'transparent',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};
