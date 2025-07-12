export const Colors = {
  // Primary Brand Colors
  primary: '#009485', // teal
  primaryDark: '#004d40', // aqua deep
  primaryLight: '#80cbc4', // montecarlo
  primaryDeep: '#00332b', // deepteal
  accent: '#87CEEB', // sky blue

  // Light Mode Colors
  light: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceSecondary: '#F1F5F9',
    card: '#FFFFFF',
    cardSecondary: '#F8FAFC',
    
    text: '#1E293B',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    textInverse: '#FFFFFF',
    
    border: '#E2E8F0',
    borderSecondary: '#F1F5F9',
    divider: '#F1F5F9',
    
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowStrong: 'rgba(0, 0, 0, 0.15)',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Dark Mode Colors
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    card: '#1E293B',
    cardSecondary: '#334155',
    
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    textInverse: '#0F172A',
    
    border: '#334155',
    borderSecondary: '#475569',
    divider: '#334155',
    
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowStrong: 'rgba(0, 0, 0, 0.5)',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Medical Colors
  medical: {
    red: '#EF4444',
    orange: '#F59E0B',
    yellow: '#EAB308',
    green: '#10B981',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    teal: '#009485',
    cyan: '#06B6D4',
  },

  // Gradient Colors
  gradients: {
    primary: ['#009485', '#004d40'],
    secondary: ['#80cbc4', '#009485'],
    accent: ['#87CEEB', '#009485'],
    success: ['#10B981', '#059669'],
    warning: ['#F59E0B', '#D97706'],
    error: ['#EF4444', '#DC2626'],
  },

  // Status Colors
  status: {
    online: '#10B981',
    offline: '#6B7280',
    busy: '#EF4444',
    away: '#F59E0B',
  },

  // Chart Colors
  charts: {
    primary: '#009485',
    secondary: '#80cbc4',
    tertiary: '#87CEEB',
    quaternary: '#004d40',
    quinary: '#00332b',
  },
};

// Theme-aware color getter
export const getThemeColors = (isDark: boolean) => {
  return isDark ? Colors.dark : Colors.light;
};

// Dynamic color getter for components
export const getColor = (colorKey: keyof typeof Colors.light | keyof typeof Colors.dark, isDark: boolean = false) => {
  const theme = isDark ? Colors.dark : Colors.light;
  return theme[colorKey as keyof typeof theme];
};
