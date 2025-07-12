import { Tabs } from 'expo-router';
import { Heart, FileText, Users, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Platform } from 'react-native';
import { layoutStyles } from './styles/layout';
import { useTheme } from '@/contexts/ThemeContext';

export default function PatientTabsLayout() {
  const { colors } = useTheme();

  return (
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
        tabBarLabelStyle: layoutStyles.tabBarLabelStyle,
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
        name="appointments"
        options={{
          title: 'Appointments',
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
    </Tabs>
  );
}
