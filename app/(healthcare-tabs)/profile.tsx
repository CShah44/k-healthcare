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

export default function HealthcareProfileScreen() {
  const { userData: user, logout } = useAuth();

  const profileData = [
    { icon: Mail, label: 'Email', value: user?.email || 'Not provided' },
    { icon: Phone, label: 'Phone', value: user?.phoneNumber || 'Not provided' },
    { icon: Award, label: 'License Number', value: user?.licenseNumber || 'Not provided' },
    { icon: Building, label: 'Department', value: user?.department || 'Not provided' },
    { icon: MapPin, label: 'Hospital', value: user?.hospital || 'Not provided' },
  ];

  const professionalStats = [
    { label: 'Patients Treated', value: '247', icon: User },
    { label: 'Years Experience', value: '8', icon: Award },
    { label: 'Consultations', value: '1,234', icon: Stethoscope },
    { label: 'Success Rate', value: '98%', icon: Shield },
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
        { icon: Settings, label: 'Account Settings', action: () => {} },
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
    <SafeAreaView style={[GlobalStyles.container, styles.container]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/(healthcare-tabs)/edit-profile')}
          >
            <Edit size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <Edit size={12} color={Colors.surface} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>
            Dr. {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userRole}>
            {user?.role === 'doctor' ? 'Doctor' : 'Lab Assistant'} • {user?.department || 'General'}
          </Text>
          <Text style={styles.hospital}>{user?.hospital || 'Healthcare Institution'}</Text>
        </View>

        {/* Professional Stats */}
        <View style={styles.statsContainer}>
          {professionalStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statIcon}>
                <stat.icon size={18} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          {profileData.map((item, index) => (
            <View key={index} style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <item.icon size={18} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 &&
                      styles.menuItemBorder,
                  ]}
                  onPress={item.action}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIcon}>
                      <item.icon size={18} color={Colors.textSecondary} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <ChevronRight size={18} color={Colors.textLight} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={18} color={Colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            K Healthcare Professional v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
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
    fontFamily: 'Inter-Bold',
    color: Colors.text,
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
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  userName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 4,
  },

  userRole: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },

  hospital: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
  },

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },

  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  statIcon: {
    width: 36,
    height: 36,
    backgroundColor: Colors.medical.lightBlue,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },

  infoIcon: {
    width: 36,
    height: 36,
    backgroundColor: Colors.medical.lightBlue,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
  },

  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'Inter-Regular',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: 8,
  },

  logoutText: {
    fontSize: 16,
    color: Colors.error,
    fontFamily: 'Inter-SemiBold',
  },

  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  versionText: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
  },
});