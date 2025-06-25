import { Stack } from 'expo-router';
import { useEffect, useState, createContext, useCallback } from 'react';
import { useColorScheme, Dimensions, StatusBar as RNStatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { darkTheme, lightTheme } from '../src/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import Animated, { FadeIn } from 'react-native-reanimated';

// Keep splash screen visible while loading resources
SplashScreen.preventAutoHideAsync();

// Get screen dimensions for responsive layouts
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Create a context to provide theme toggle functionality across the app
type ThemeContextType = {
  toggleTheme: () => Promise<void>;
  theme: typeof darkTheme;
  themeType: 'dark' | 'light';
  dimensions: {
    width: number;
    height: number;
    isSmallDevice: boolean;
  };
};

export const ThemeContext = createContext<ThemeContextType>({
  toggleTheme: async () => {},
  theme: darkTheme,
  themeType: 'dark',
  dimensions: {
    width,
    height,
    isSmallDevice
  }
});

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<'dark' | 'light' | null>(null);
  const [appIsReady, setAppIsReady] = useState(false);
  
  // Load fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
  });
  
  useEffect(() => {
    async function prepare() {
      try {
        // Load saved theme preference
        const savedTheme = await AsyncStorage.getItem('theme');
        setThemeType(savedTheme === 'light' ? 'light' : 'dark');
        
        // Artificially delay for smoother splash experience
        await new Promise(resolve => setTimeout(resolve, 1200));
      } catch (e) {
        console.warn(e);
        // Default to dark theme if loading fails
        setThemeType('dark');
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);
  
  // Toggle theme function to be passed down to components
  const toggleTheme = useCallback(async () => {
    const newTheme = themeType === 'dark' ? 'light' : 'dark';
    setThemeType(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme', error);
    }
  }, [themeType]);
  
  // Use dark theme by default until theme is loaded
  const theme = themeType === 'light' ? lightTheme : darkTheme;
  
  if (!appIsReady || !fontsLoaded || !themeType) {
    return null; // Still showing splash screen
  }
  
  return (
    <ThemeContext.Provider value={{ 
      toggleTheme, 
      theme, 
      themeType,
      dimensions: {
        width,
        height,
        isSmallDevice
      }
    }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <RNStatusBar 
            barStyle={theme.dark ? 'light-content' : 'dark-content'} 
            backgroundColor="transparent" 
            translucent 
          />
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Animated.View 
              style={{ flex: 1, backgroundColor: theme.colors.background }}
              entering={FadeIn.duration(400)}
            >
              <Stack 
                initialRouteName="index"
                screenOptions={{
                  headerShown: false,
                  contentStyle: {
                    backgroundColor: theme.colors.background,
                  },
                  animation: 'fade_from_bottom',
                  animationDuration: 250,
                  navigationBarHidden: true,
                  navigationBarColor: 'transparent',
                }}
              />
            </Animated.View>
          </GestureHandlerRootView>
        </PaperProvider>
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}