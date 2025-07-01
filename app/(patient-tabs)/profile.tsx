import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  Settings,
  Phone,
  Mail,
  Calendar,
  Heart,
  Shield,
  FileText,
  Bell,
  CircleHelp as HelpCircle,
  LogOut,
  ChevronRight,
  CreditCard as Edit,
  Users,
  ArrowLeftRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useAuth } from '@/contexts/AuthContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/constants/firebase';

export default function PatientProfileScreen() {
  const { 
    userData: user, 
    logout, 
    switchToAccount, 
    getAccessibleAccounts, 
    removeParentLink,
    isSwitchedAccount,
    originalUserId
  } = useAuth();
  const [accessibleAccounts, setAccessibleAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // Fetch accessible accounts when component mounts
  useEffect(() => {
    const fetchAccessibleAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const accounts = await getAccessibleAccounts();
        setAccessibleAccounts(accounts);
        console.log('Accessible accounts fetched:', accounts);
      } catch (error) {
        console.error('Error fetching accessible accounts:', error);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccessibleAccounts();
  }, [user?.linkedAccounts, user?.parentAccountId]);

  const handleSwitchAccount = async (accountId: string) => {
    try {
      await switchToAccount(accountId);
      Alert.alert('Success', 'Switched to account successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Check if user is 16+ and can remove parent link
  const canRemoveParentLink = (): boolean => {
    if (!user?.isChildAccount || !user?.dateOfBirth) return false;
    return calculateAge(user.dateOfBirth) >= 16;
  };

  const handleRemoveParentLink = () => {
    Alert.alert(
      'Remove Parent Link',
      'Are you sure you want to remove the link with your parent account? This will make your account independent and your parent will no longer be able to access it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Link',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeParentLink();
              Alert.alert('Success', 'Parent link removed successfully! Your account is now independent.');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const profileData = [
    { icon: Mail, label: 'Email', value: user?.email || 'Not provided' },
    { icon: Phone, label: 'Phone', value: user?.phoneNumber || 'Not provided' },
    {
      icon: Calendar,
      label: 'Date of Birth',
      value: user?.dateOfBirth || 'Not provided',
    },
    { icon: Heart, label: 'Blood Type', value: 'O+' },
  ];

  const menuSections = [
    {
      title: 'Health Information',
      items: [
        { icon: Heart, label: 'Emergency Contacts', action: () => {} },
        { icon: FileText, label: 'Medical Conditions', action: () => {} },
        { icon: Shield, label: 'Allergies', action: () => {} },
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
          <TouchableOpacity style={styles.editButton}>
            <Edit size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <Edit size={12} color={Colors.surface} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userRole}>
            {user?.isChildAccount ? 'Child Account' : 'Patient'}
          </Text>
          {user?.isChildAccount && (
            <Text style={styles.childAccountNote}>
              Managed by parent account
            </Text>
          )}
          {isSwitchedAccount && (
            <View style={styles.switchedAccountIndicator}>
              <Text style={styles.switchedAccountText}>
                👤 Switched Account
              </Text>
              <TouchableOpacity
                style={styles.switchBackButton}
                onPress={() => handleSwitchAccount(originalUserId || '')}
                activeOpacity={0.7}
              >
                <Text style={styles.switchBackButtonText}>Switch Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Accessible Accounts Section */}
        {accessibleAccounts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Switching</Text>
            <View style={styles.linkedAccountsCard}>
              <Text style={styles.linkedAccountsDescription}>
                {user?.isChildAccount 
                  ? "Switch back to your parent's account"
                  : "Switch between your account and your children's accounts"
                }
              </Text>
              {loadingAccounts ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                accessibleAccounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={styles.linkedAccountItem}
                    onPress={() => handleSwitchAccount(account.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.linkedAccountInfo}>
                      <View style={[
                        styles.linkedAccountAvatar,
                        account.type === 'parent' && styles.parentAccountAvatar
                      ]}>
                        <Text style={styles.linkedAccountInitials}>
                          {account.firstName[0]}
                          {account.lastName[0]}
                        </Text>
                      </View>
                      <View style={styles.linkedAccountDetails}>
                        <Text style={styles.linkedAccountName}>
                          {account.firstName} {account.lastName}
                        </Text>
                        <Text style={[
                          styles.linkedAccountType,
                          account.type === 'parent' && styles.parentAccountType
                        ]}>
                          {account.type === 'parent' ? 'Parent Account' : 'Child Account'}
                        </Text>
                      </View>
                    </View>
                    <ArrowLeftRight size={16} color={Colors.primary} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        )}

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
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

        {/* Remove Parent Link Section (for 16+ child accounts) */}
        {canRemoveParentLink() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Independence</Text>
            <TouchableOpacity
              style={styles.removeParentLinkButton}
              onPress={handleRemoveParentLink}
              activeOpacity={0.7}
            >
              <Users size={18} color={Colors.medical.orange} />
              <View style={styles.removeParentLinkContent}>
                <Text style={styles.removeParentLinkTitle}>
                  Remove Parent Link
                </Text>
                <Text style={styles.removeParentLinkDescription}>
                  You're 16+ and can make your account independent
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.medical.orange} />
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={18} color={Colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>K Healthcare v1.0.0</Text>
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
  },

  childAccountNote: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
    fontStyle: 'italic',
  },

  switchedAccountIndicator: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
  },

  switchedAccountText: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },

  switchBackButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },

  switchBackButtonText: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'Inter-SemiBold',
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

  // Linked Accounts Styles
  linkedAccountsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },

  linkedAccountsDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    lineHeight: 20,
  },

  linkedAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },

  linkedAccountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  linkedAccountAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  linkedAccountInitials: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Inter-Bold',
  },

  linkedAccountDetails: {
    flex: 1,
  },

  linkedAccountName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 2,
  },

  linkedAccountType: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  parentAccountAvatar: {
    backgroundColor: Colors.medical.orange,
  },

  parentAccountType: {
    color: Colors.medical.orange,
    fontFamily: 'Inter-SemiBold',
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

  // Remove Parent Link Styles
  removeParentLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.2)',
    gap: 12,
  },

  removeParentLinkContent: {
    flex: 1,
  },

  removeParentLinkTitle: {
    fontSize: 16,
    color: Colors.medical.orange,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },

  removeParentLinkDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
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
