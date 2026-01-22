import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SplashScreen } from '@/components/ui/SplashScreen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import RoleSelectionScreen from './auth/role-selection';
import { Colors } from '@/constants/Colors';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, userData, isLoading } = useAuth();
  const router = useRouter();
  useFrameworkReady();

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Handle navigation after splash and auth check
  useEffect(() => {
    if (showSplash || isLoading) return;

    // If user is logged in, redirect to appropriate home immediately
    if (user && userData) {
      if (userData.role === 'patient') {
        router.replace('/(patient-tabs)');
      } else if (userData.role === 'doctor' || userData.role === 'lab_assistant') {
        router.replace('/(healthcare-tabs)');
      }
    }
    // If not logged in, stay on role-selection (handled by render)
  }, [showSplash, isLoading, user, userData, router]);

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show loading while checking auth or if user exists but userData is loading
  if (isLoading || (user && !userData)) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If logged in, show loading while redirecting (will redirect via useEffect)
  if (user && userData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If not logged in, show role selection
  return (
    <View style={styles.container}>
      <RoleSelectionScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});