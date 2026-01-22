import { Tabs, Redirect } from 'expo-router';
import { Heart, FileText, Users, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Platform, StatusBar, View, ActivityIndicator } from 'react-native';
import { layoutStyles } from '../../styles/layout';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

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
        barStyle={colors.background === Colors.light.background ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
        translucent={Platform.OS === 'android'}
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            ...layoutStyles.tabBarStyle,
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            shadowColor: colors.shadow,
          },
          tabBarLabelStyle: {
            ...layoutStyles.tabBarLabelStyle,
            fontFamily: 'Satoshi-Variable',
          },
          tabBarIconStyle: layoutStyles.tabBarIconStyle,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Heart size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="records"
          options={{
            title: 'Records',
            tabBarIcon: ({ color, size }) => (
              <FileText size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="family-tree"
          options={{
            title: 'Family',
            tabBarIcon: ({ color, size }) => (
              <Users size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} strokeWidth={2} />
            ),
          }}
        />

        {/* Hidden routes - these won't appear in the tab bar */}
        <Tabs.Screen
          name="member-records"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="upload-record"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="edit-profile"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="access-requests"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}
