import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Create custom theme with properly extended types
type CustomColors = {
  card: string;
  customText: string; 
  border: string;
};

// Extend the basic theme
const createCustomTheme = (baseTheme: typeof MD3DarkTheme, customColors: CustomColors) => {
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...customColors
    },
    // Make our custom colors accessible through type declaration
    customColors
  };
};

// Dark theme (default)
export const darkTheme = createCustomTheme(
  MD3DarkTheme, 
  {
    card: '#252525',
    customText: '#ffffff',
    border: '#2c2c2c'
  }
);

// Light theme
export const lightTheme = createCustomTheme(
  MD3LightTheme, 
  {
    card: '#f2f2f2',
    customText: '#000000',
    border: '#e0e0e0'
  }
);

// Also set primary and other standard colors
darkTheme.colors.primary = '#6200ee';
darkTheme.colors.secondary = '#ffb300';
darkTheme.colors.background = '#121212';
darkTheme.colors.surface = '#1e1e1e';
darkTheme.colors.error = '#f44336';

lightTheme.colors.primary = '#6200ee';
lightTheme.colors.secondary = '#ffb300';
lightTheme.colors.background = '#f7f7f7';
lightTheme.colors.surface = '#ffffff';
lightTheme.colors.error = '#f44336';