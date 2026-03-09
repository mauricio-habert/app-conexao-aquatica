import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
} from '@expo-google-fonts/source-sans-3';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { MockProvider } from '@/constants/MockContext';
import { AuthProvider, useAuth } from '@/constants/AuthContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

SplashScreen.preventAutoHideAsync();

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.accent,
  },
};

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.accent,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const protectedScreens = ['(tabs)', 'new-announcement', 'new-workout', 'new-competition'];
    const inAuthGroup = protectedScreens.includes(segments[0] as string);

    if (isAuthenticated && !inAuthGroup && segments[0] !== undefined) {
      // User is logged in but on welcome/login, send to tabs
      router.replace('/(tabs)');
    } else if (!isAuthenticated && inAuthGroup) {
      // User is not logged in but trying to access protected screens
      router.replace('/welcome');
    }
  }, [isAuthenticated, segments]);

  return (
    <MockProvider>
      <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
        <Stack>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="new-announcement" options={{ presentation: 'modal', title: 'Novo Recado' }} />
          <Stack.Screen name="new-workout" options={{ presentation: 'modal', title: 'Novo Treino' }} />
          <Stack.Screen name="new-competition" options={{ presentation: 'modal', title: 'Nova Competição' }} />
        </Stack>
      </ThemeProvider>
    </MockProvider>
  );
}
