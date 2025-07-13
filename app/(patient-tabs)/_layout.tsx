import { Tabs } from 'expo-router';
import { Heart, FileText, Users, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { layoutStyles } from './styles/layout';
import { useTheme } from '@/contexts/ThemeContext';

export default function PatientTabsLayout() {
  const { colors } = useTheme();

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={true}
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
          tabBarLabelStyle: { ...layoutStyles.tabBarLabelStyle, fontFamily: 'Satoshi-Variable' },
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
          name="appointments"
          options={{
            href: null,
          }}
        />
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
      </Tabs>
    </>
  );
}
