/**
 * Palette de couleurs CNSR harmonisée pour toute l'application
 * Couleurs soft et professionnelles inspirées du logo CNSR
 */

// Couleurs principales CNSR
const cnsrPrimary = '#3498db';      // Bleu principal (Flat UI Blue)
const cnsrSecondary = '#2980b9';    // Bleu foncé (Flat UI Dark Blue)
const cnsrAccent = '#2c3e50';       // Bleu gris foncé (Flat UI Dark Gray)
const cnsrLight = '#ecf0f1';        // Gris très clair (Flat UI Light Gray)
const cnsrMedium = '#bdc3c7';       // Gris moyen (Flat UI Medium Gray)
const cnsrDark = '#34495e';         // Bleu gris (Flat UI Dark Blue Gray)

// Couleurs d'état
const cnsrSuccess = '#27ae60';      // Vert (Flat UI Green)
const cnsrWarning = '#f39c12';      // Orange (Flat UI Orange)
const cnsrError = '#e74c3c';        // Rouge (Flat UI Red)
const cnsrInfo = '#3498db';         // Bleu info (même que primary)

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
