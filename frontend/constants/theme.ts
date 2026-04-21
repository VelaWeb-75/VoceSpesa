/**
 * VoceSpesa Design System
 * Palette dark mode premium con glassmorphism e gradient viola→rosa
 */

export const Colors = {
  // Background
  background: '#0A0E21',
  backgroundLight: '#0F1328',
  surface: '#1D1F33',
  surfaceLight: '#252742',
  surfaceGlass: 'rgba(29, 31, 51, 0.7)',
  surfaceGlassLight: 'rgba(37, 39, 66, 0.5)',

  // Primary & Accents
  primary: '#6C63FF',
  primaryLight: '#8B83FF',
  primaryDark: '#5A52E0',
  secondary: '#FF6584',
  secondaryLight: '#FF8FA3',
  accent: '#00D9A6',
  accentLight: '#33E4BC',

  // Semantic
  success: '#00D9A6',
  warning: '#FFB74D',
  warningLight: '#FFCC80',
  error: '#FF5252',
  errorLight: '#FF8A80',
  info: '#64B5F6',

  // Text
  text: '#FFFFFF',
  textSecondary: '#8D8DAA',
  textTertiary: '#5C5C7A',
  textInverse: '#0A0E21',

  // Border
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#6C63FF', '#FF6584'] as const,
  gradientDark: ['#0A0E21', '#1D1F33'] as const,
  gradientCard: ['rgba(29, 31, 51, 0.9)', 'rgba(29, 31, 51, 0.5)'] as const,
  gradientSuccess: ['#00D9A6', '#00B894'] as const,
};

// Colori per le categorie di spesa
export const CategoryColors = {
  food: '#FF6B6B',
  transport: '#4ECDC4',
  home: '#45B7D1',
  health: '#96CEB4',
  shopping: '#FFEAA7',
  entertainment: '#DDA0DD',
  education: '#98D8C8',
  work: '#F7DC6F',
  gifts: '#FF8A80',
  other: '#B0BEC5',
};

export const Fonts = {
  heading: 'Inter_700Bold',
  headingMedium: 'Inter_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  light: 'Inter_300Light',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  hero: 36,
  display: 48,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};

const theme = {
  Colors,
  CategoryColors,
  Fonts,
  Spacing,
  Radius,
  FontSizes,
  Shadows,
};

export default theme;
