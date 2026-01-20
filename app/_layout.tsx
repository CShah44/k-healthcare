import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, userData, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading) return;
    if (!rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === 'auth';
    const inPatientGroup = segments[0] === '(patient-tabs)';
    const inHealthcareGroup = segments[0] === '(healthcare-tabs)';

    if (!user && !inAuthGroup) {
      // Redirect to the login page if not authenticated
      router.replace('/auth');
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
    <ThemeProvider>
      <StatusBar style="auto" />
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
      {isLoading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', zIndex: 9999 }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </ThemeProvider>
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
      <RootLayoutNav />
    </AuthProvider>
  );
}

