import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Settings,
  Phone,
  Mail,
  MapPin,
  Award,
  Shield,
  FileText,
  Bell,
  CircleHelp as HelpCircle,
  LogOut,
  ChevronRight,
  CreditCard as Edit,
  Stethoscope,
  Building,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function HealthcareProfileScreen() {
  const { userData: user, logout } = useAuth();
  const { colors } = useTheme();

  const profileData = [
    { icon: Mail, label: 'Email', value: user?.email || 'Not provided' },
    { icon: Phone, label: 'Phone', value: user?.phoneNumber || 'Not provided' },
    {
      icon: Award,
      label: 'License Number',
      value: user?.licenseNumber || 'Not provided',
    },
    {
      icon: Building,
      label: 'Department',
      value: user?.department || 'Not provided',
    },
    {
      icon: MapPin,
      label: 'Hospital',
      value: user?.hospital || 'Not provided',
    },
  ];

  const menuSections = [
    {
      title: 'Professional',
      items: [
        {
          icon: Award,
          label: 'Credentials & Certifications',
          action: () => {},
        },
        { icon: Building, label: 'Hospital Affiliations', action: () => {} },
        { icon: FileText, label: 'Professional Documents', action: () => {} },
      ],
    },
    {
      title: 'App Settings',
      items: [
        { icon: Bell, label: 'Notifications', action: () => {} },
        {
          icon: Settings,
          label: 'Edit Profile',
          action: () => router.push('/(healthcare-tabs)/edit-profile'),
        },
        { icon: Shield, label: 'Privacy & Security', action: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', action: () => {} },
        { icon: FileText, label: 'Terms of Service', action: () => {} },
        { icon: Shield, label: 'Privacy Policy', action: () => {} },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <SafeAreaView
      style={[
        GlobalStyles.container,
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <LinearGradient
        colors={[
          colors.background,
          'rgba(59, 130, 246, 0.05)',
          'rgba(59, 130, 246, 0.02)',
          colors.background,
        ]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Profile
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/(healthcare-tabs)/edit-profile')}
          >
            <Edit size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={styles.profileImageContainer}>
            <View
              style={[
                styles.profileImage,
                {
                  backgroundColor: colors.surfaceSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                },
              ]}
            >
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <User size={40} color={colors.textSecondary} />
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.editImageButton,
                { backgroundColor: Colors.primary },
              ]}
              onPress={() => router.push('/(healthcare-tabs)/edit-profile')}
            >
              <Edit size={12} color={colors.surface} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            Dr. {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.userRole, { color: colors.textSecondary }]}>
            {user?.role === 'doctor' ? 'Doctor' : 'Lab Assistant'} •{' '}
            {user?.department || 'General'}
          </Text>
          <Text style={[styles.hospital, { color: colors.textTertiary }]}>
            {user?.hospital || 'Healthcare Institution'}
          </Text>

          {/* Letterhead Preview */}
          {user?.letterheadUrl && (
            <View style={{ marginTop: 24, width: '100%' }}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text, fontSize: 14, marginBottom: 8 },
                ]}
              >
                Letterhead Preview
              </Text>
              <Image
                source={{ uri: user.letterheadUrl }}
                style={{
                  width: '100%',
                  height: 80,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Professional Information
          </Text>
          {profileData.map((item, index) => (
            <View
              key={index}
              style={[styles.infoRow, { backgroundColor: colors.surface }]}
            >
              <View style={styles.infoIcon}>
                <item.icon size={18} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[styles.infoLabel, { color: colors.textSecondary }]}
                >
                  {item.label}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            <View
              style={[styles.menuCard, { backgroundColor: colors.surface }]}
            >
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={item.action}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIcon}>
                      <item.icon size={18} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.menuLabel, { color: colors.text }]}>
                      {item.label}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              { backgroundColor: colors.surface, borderColor: colors.error },
            ]}
            onPress={handleLogout}
          >
            <LogOut size={18} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textTertiary }]}>
            K Healthcare Professional v1.0.0
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  headerTitle: {
    fontSize: 24,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },

  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.medical.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },

  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  userName: {
    fontSize: 22,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },

  userRole: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 4,
    opacity: 0.8,
  },

  hospital: {
    fontSize: 12,
    fontFamily: 'Satoshi-Variable',
    opacity: 0.6,
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },

  infoIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.medical.lightBlue,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 2,
    opacity: 0.7,
  },

  infoValue: {
    fontSize: 15,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },

  menuCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  menuLabel: {
    fontSize: 15,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },

  logoutText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },

  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },

  versionText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Variable',
    opacity: 0.5,
  },
});
