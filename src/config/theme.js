import { DefaultTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  default: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '600',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
};

const theme = {
  ...DefaultTheme,
  roundness: 4,
  colors: {
    ...DefaultTheme.colors,
    primary: '#8A2BE2', // Purple
    accent: '#FFD700',  // Gold
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    disabled: '#A9A9A9',
    placeholder: '#A9A9A9',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    error: '#FF3B30', // Red for danger/critical states
    success: '#4CAF50', // Green for success states
    warning: '#FFA000', // Amber/orange for warning states
    info: '#2196F3', // Blue for informational states
    // Custom colors
    gold: '#FFD700',
    purple: '#8A2BE2',
    teal: '#009688',
    darkBackground: '#1E1E1E',
    mutedText: '#A9A9A9',
    // State-specific colors
    danger: '#FF3B30', // Alias for error
    amber: '#FFA000', // Alias for warning
    safe: '#4CAF50', // Alias for success
    // Accessibility
    errorContainer: '#FFEBEE',
    warningContainer: '#FFF8E1',
    successContainer: '#E8F5E9',
  },
  fonts: configureFonts(fontConfig),
  animation: {
    scale: 1.0,
  },
};

export default theme;
