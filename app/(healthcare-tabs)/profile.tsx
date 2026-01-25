import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Edit,
  User,
  ChevronRight,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  Info,
  Calendar,
  FileText,
  Users,
  Palette,
  Award,
  Building,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
// Reuse the patient profile styles as requested, but we might need to inline them or import if possible.
// Since the user asked to "Do it exactly like @[app/(patient-tabs)/profile.tsx] 's styling",
// we will replicate the styling structure here.
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function HealthcareProfileScreen() {
  const { user, userData, logout } = useAuth();
  const { colors, isDarkMode } = useTheme();

  // Doctor/Healthcare specific counts (placeholder or fetched)
  const [patientCount, setPatientCount] = useState(0);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const doctorProfileItems = [
    {
      id: 'patients',
      title: 'My Patients',
      icon: Users,
      iconColor: '#009485', // Teal
      iconBg: '#CCFBF1',
      count: patientCount || null,
      onPress: () => router.push('/(healthcare-tabs)/patients'),
    },
    {
      id: 'prescriptions',
      title: 'Prescriptions',
      icon: FileText,
      iconColor: '#EAB308',
      iconBg: '#FEF9C3',
      onPress: () => router.push('/(healthcare-tabs)/records'), // Assuming records is where they see them
    },
    // Add more typical doctor items?
  ];

  const settingsItems = [
    {
      id: 'profile',
      title: 'Edit profile',
      icon: User,
      iconColor: '#EC4899',
      iconBg: '#FCE7F3',
      onPress: () => router.push('/(healthcare-tabs)/edit-profile'),
    },
    {
      id: 'theme',
      title: 'Appearance',
      icon: Palette,
      iconColor: '#8B5CF6',
      iconBg: '#EDE9FE',
      onPress: () => {}, // Handled by toggle
      showToggle: true,
    },
    {
      // Keeping relevant doctor settings
      id: 'credentials',
      title: 'Credentials & Licenses',
      icon: Award,
      iconColor: '#3B82F6',
      iconBg: '#DBEAFE',
      onPress: () => {}, // Placeholder
    },
    {
      id: 'hospital',
      title: 'Hospital Settings',
      icon: Building,
      iconColor: '#F59E0B',
      iconBg: '#FEF3C7',
      onPress: () => {}, // Placeholder
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: Shield,
      iconColor: '#10B981',
      iconBg: '#D1FAE5',
      onPress: () => {},
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      iconColor: '#3B82F6',
      iconBg: '#DBEAFE',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Profile Section */}
        <View style={styles.profileHeader}>
          <View style={styles.profilePhotoContainer}>
            {userData?.avatarUrl ? (
              <Image
                source={{ uri: userData.avatarUrl }}
                style={styles.profilePhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profilePhotoPlaceholder}>
                <User size={32} color={Colors.primary} strokeWidth={1.5} />
              </View>
            )}
            <TouchableOpacity
              style={styles.editPhotoButton}
              onPress={() => router.push('/(healthcare-tabs)/edit-profile')}
              activeOpacity={0.7}
            >
              <Edit size={14} color="#EC4899" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {userData?.firstName || 'Dr.'} {userData?.lastName || ''}
            </Text>

            <Text style={[styles.profileRole, { color: colors.textSecondary }]}>
              {userData?.specialty}
            </Text>

            <View style={styles.demographicsRow}>
              <View style={styles.demographicItem}>
                <Text
                  style={[
                    styles.demographicLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  LICENSE
                </Text>
                <Text style={[styles.demographicValue, { color: colors.text }]}>
                  {userData?.licenseNumber || 'N/A'}
                </Text>
              </View>
              <View
                style={[
                  styles.demographicDivider,
                  { backgroundColor: colors.border },
                ]}
              />
              <View style={styles.demographicItem}>
                <Text
                  style={[
                    styles.demographicLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  DEPT
                </Text>
                <Text style={[styles.demographicValue, { color: colors.text }]}>
                  {userData?.department || ''}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Letterhead Preview */}
        {userData?.letterheadUrl && (
          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Prescription Header
            </Text>
            <View
              style={[
                styles.letterheadContainer,
                { borderColor: colors.border },
              ]}
            >
              <Image
                source={{ uri: userData.letterheadUrl }}
                style={styles.letterheadImage}
                resizeMode="contain"
              />
            </View>
          </View>
        )}

        {/* Professional Profile Section */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Professional Dashboard
          </Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
            {doctorProfileItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index !== doctorProfileItems.length - 1 && {
                    borderBottomColor: colors.border,
                    borderBottomWidth: 1,
                  },
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.menuIcon, { backgroundColor: item.iconBg }]}
                >
                  <item.icon size={20} color={item.iconColor} strokeWidth={2} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  {item.title}
                </Text>
                {(item.count ?? 0) > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{item.count}</Text>
                  </View>
                )}
                <ChevronRight
                  size={18}
                  color={colors.textSecondary}
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Settings
          </Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index !== settingsItems.length - 1 && {
                    borderBottomColor: colors.border,
                    borderBottomWidth: 1,
                  },
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
                disabled={item.showToggle}
              >
                <View
                  style={[styles.menuIcon, { backgroundColor: item.iconBg }]}
                >
                  <item.icon size={20} color={item.iconColor} strokeWidth={2} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  {item.title}
                </Text>
                {item.showToggle ? (
                  <View style={{ marginLeft: 'auto' }}>
                    <ThemeToggle size={20} />
                  </View>
                ) : (
                  <ChevronRight
                    size={18}
                    color={colors.textSecondary}
                    style={{ marginLeft: 'auto' }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: Colors.medical.red }]}
          onPress={handleSignOut}
        >
          <LogOut size={20} color={Colors.medical.red} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textTertiary }]}>
            Svastheya
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profilePhotoContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6', // Neutral gray
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FCE7F3', // Light pink
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  profileName: {
    fontSize: 22,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileRole: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 16,
    textAlign: 'center',
  },
  demographicsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  demographicItem: {
    alignItems: 'center',
  },
  demographicLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    marginBottom: 2,
  },
  demographicValue: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
  demographicDivider: {
    width: 1,
    height: 20,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
    marginBottom: 12,
  },
  menuCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
  },
  countBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
    marginRight: 8,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  signOutText: {
    color: Colors.medical.red,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Variable',
  },
  letterheadContainer: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginTop: 12,
  },
  letterheadImage: {
    width: '100%',
    height: '100%',
  },
});
