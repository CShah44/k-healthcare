import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, userData, isLoading } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading) return;
    if (!rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === 'auth';
    const inPatientGroup = segments[0] === '(patient-tabs)';
    const inHealthcareGroup = segments[0] === '(healthcare-tabs)';
    const isIndex = segments.length === 0 || segments[0] === 'index';

    // Don't interfere with index route - it handles its own navigation
    if (isIndex) return;

    if (!user && !inAuthGroup && !isIndex) {
      // Redirect to index (role-selection) if not authenticated (but not from index)
      router.replace('/');
    } else if (user && inAuthGroup) {
      // Redirect to signed-in state if authenticated and trying to access auth pages
      if (userData?.role === 'patient') {
        router.replace('/(patient-tabs)');
      } else if (userData?.role === 'doctor' || userData?.role === 'lab_assistant') {
        router.replace('/(healthcare-tabs)');
      }
    } else if (user) {
      // Strict Role-Based Access Control
      if (userData?.role === 'patient' && inHealthcareGroup) {
        router.replace('/(patient-tabs)');
      } else if ((userData?.role === 'doctor' || userData?.role === 'lab_assistant') && inPatientGroup) {
        router.replace('/(healthcare-tabs)');
      }
    }
  }, [user, userData, isLoading, segments, rootNavigationState]);


  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={Platform.OS === 'android'}
      />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(healthcare-tabs)" />
        <Stack.Screen name="(patient-tabs)" />
        <Stack.Screen name="auth" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'IvyMode-Regular': require('../assets/Fonts/ivy-mode-regular.ttf'),
    'Satoshi-Variable': require('../assets/Fonts/Satoshi-Variable.ttf'),
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
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}

