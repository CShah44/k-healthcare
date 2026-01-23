import { Tabs, Redirect } from 'expo-router';
import { Heart, FileText, Users, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Platform, StatusBar, View, ActivityIndicator } from 'react-native';
import { layoutStyles } from '../../styles/layout';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { CustomTabBar } from '@/components/ui/CustomTabBar';

export default function PatientTabsLayout() {
  const { colors } = useTheme();
  const { userData, isLoading, user } = useAuth();

  // Only show loading if we have a user but userData is still loading
  // If no user, the root layout will handle redirect
  if (isLoading && user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If auth check is complete and user doesn't have patient role, redirect
  if (!isLoading && user && userData?.role !== 'patient') {
    return <Redirect href="/auth" />;
  }

  // If no user at all, let root layout handle it
  if (!isLoading && !user) {
    return <Redirect href="/auth" />;
  }

  return (
    <>
      <StatusBar
        barStyle={
          colors.background === Colors.light.background
            ? 'dark-content'
            : 'light-content'
        }
        backgroundColor={colors.background}
        translucent={Platform.OS === 'android'}
      />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="records" options={{ title: 'Records' }} />
        <Tabs.Screen
          name="upload-record"
          options={{
            title: 'Upload',
            // We need to allow it to be a navigable route for the tab bar to pick it up or we manually handle it.
            // If href is null, it might not be in the state.routes passed to tabBar.
            // However, CustomTabBar can manually navigate to it if it exists in the stack.
            // To be safe, we let it be a normal tab screen but we don't need to show it in the standard tab bar because we use a custom one.
          }}
        />
        <Tabs.Screen name="family-tree" options={{ title: 'Family' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

        {/* Hidden routes */}
        <Tabs.Screen name="member-records" options={{ href: null }} />
        <Tabs.Screen name="edit-profile" options={{ href: null }} />
        <Tabs.Screen name="access-requests" options={{ href: null }} />
        <Tabs.Screen name="allergies" options={{ href: null }} />
        <Tabs.Screen name="diagnoses" options={{ href: null }} />
        <Tabs.Screen name="visits" options={{ href: null }} />
        <Tabs.Screen name="vaccinations" options={{ href: null }} />
      </Tabs>
    </>
  );
}
