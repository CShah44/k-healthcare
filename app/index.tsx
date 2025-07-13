import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SplashScreen } from '@/components/ui/SplashScreen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import RoleSelectionScreen from './auth/role-selection';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  useFrameworkReady();

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

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
});