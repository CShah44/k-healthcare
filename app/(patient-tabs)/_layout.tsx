import { Tabs } from 'expo-router';
import { Heart, FileText, Users, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Platform } from 'react-native';

export default function PatientTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopColor: 'rgba(59, 130, 246, 0.1)',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          height: Platform.OS === 'ios' ? 85 : 65,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
          borderRadius: 20,
          marginHorizontal: 10,
          marginBottom: 10,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 11,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Heart 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? color : 'transparent'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: ({ color, size, focused }) => (
            <FileText 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="family-tree"
        options={{
          title: 'Family',
          tabBarIcon: ({ color, size, focused }) => (
            <Users 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <User 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      
      {/* Hide these screens from tab bar */}
      <Tabs.Screen
        name="appointments"
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
    </Tabs>
  );
}
