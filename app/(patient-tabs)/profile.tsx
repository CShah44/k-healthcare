import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Edit,
  ArrowLeftRight,
  Users,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  Info,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { createProfileStyles } from './styles/profile';

export default function ProfileScreen() {
  const { user, userData, logout } = useAuth();
  const { colors } = useTheme();
  const styles = createProfileStyles(colors);
  const [loading, setLoading] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
              router.replace('/auth/role-selection');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const profileMenuItems = [
    {
      id: 'edit',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: Edit,
      onPress: () => router.push('/(patient-tabs)/edit-profile'),
      color: Colors.primary,
    },
    {
      id: 'family',
      title: 'Family Members',
      subtitle: 'Manage family connections',
      icon: Users,
      onPress: () => router.push('/(patient-tabs)/family-tree'),
      color: Colors.medical.orange,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences and notifications',
      icon: Settings,
      onPress: () => router.push('/settings'),
      color: Colors.primary,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      icon: Bell,
      onPress: () => router.push('/notifications'),
      color: Colors.primary,
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Data protection and security',
      icon: Shield,
      onPress: () => router.push('/privacy'),
      color: Colors.primary,
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: HelpCircle,
      onPress: () => router.push('/help'),
      color: Colors.primary,
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and information',
      icon: Info,
      onPress: () => router.push('/about'),
      color: Colors.primary,
    },
  ];

  const inactiveItems = [
    {
      id: 'sync',
      title: 'Sync Health Data',
      subtitle: 'Connect with health apps',
      icon: ArrowLeftRight,
      onPress: () => router.push('/sync-data'),
      color: Colors.primary,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.backgroundGradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/(patient-tabs)/edit-profile')}
            >
              <Edit size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.profileHeader}>
              <Image
                source={{
                  uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
                }}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {userData?.firstName} {userData?.lastName}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                  {user?.email}
                </Text>
                <Text style={[styles.profilePhone, { color: colors.textSecondary }]}>
                  {userData?.phoneNumber || 'No phone number'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.editIcon, { backgroundColor: colors.surface }]}
                onPress={() => router.push('/(patient-tabs)/edit-profile')}
              >
                <Edit size={12} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Records</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>3</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Appointments</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>5</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Family</Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
            {profileMenuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={item.onPress}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                  <item.icon size={18} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Inactive Items */}
          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Coming Soon</Text>
            {inactiveItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.6 }]}
                onPress={item.onPress}
                disabled={true}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                  <item.icon size={18} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.textSecondary }]}>{item.title}</Text>
                  <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleSignOut}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.medical.red} />
            ) : (
              <>
                <LogOut size={18} color={Colors.medical.red} />
                <Text style={[styles.signOutText, { color: Colors.medical.red }]}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}