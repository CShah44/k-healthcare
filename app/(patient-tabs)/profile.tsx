import React, { useState, useEffect } from 'react';
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
  User,
  Users,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  Info,
  ArrowLeftRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { createProfileStyles } from '../../styles/profile';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useCustomAlert } from '@/components/CustomAlert';
import { deletePatientAccount } from './services/accountDeletion';
import { Modal } from 'react-native';

export default function ProfileScreen() {
  const {
    user,
    userData,
    logout,
    switchToAccount,
    getAccessibleAccounts,
    isSwitchedAccount,
    originalUserId,
  } = useAuth();
  const { colors } = useTheme();
  const styles = createProfileStyles(colors);
  const [loading, setLoading] = useState(false);
  const [accessibleAccounts, setAccessibleAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const { showAlert, AlertComponent } = useCustomAlert();

  // Helper function to format user ID based on role
  const formatUserId = (customUserId: string | undefined, role: string) => {
    if (!customUserId) return 'ID not available';

    let rolePrefix = '';
    switch (role) {
      case 'patient':
        rolePrefix = 'pat';
        break;
      case 'doctor':
        rolePrefix = 'doc';
        break;
      case 'lab_assistant':
        rolePrefix = 'lab';
        break;
      default:
        rolePrefix = 'usr';
    }

    return `sva-${rolePrefix}-${customUserId}`;
  };

  useEffect(() => {
    const fetchAccessibleAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const accounts = await getAccessibleAccounts();
        setAccessibleAccounts(accounts);
      } catch (error) {
        console.error('Error fetching accessible accounts:', error);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccessibleAccounts();
  }, [userData?.linkedAccounts, userData?.parentAccountId]);

  const handleSwitchAccount = async (accountId: string) => {
    try {
      await switchToAccount(accountId);
      Alert.alert('Success', 'Switched to account successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignOut = () => {
    showAlert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/auth/patient-login');
          } catch (error) {
            showAlert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deletePatientAccount(user?.uid || '');
      // Auth state change will handle navigation to login
      // But we can force it just in case or if auth state update is slow
      router.replace('/auth/patient-login');
    } catch (error: any) {
      setIsDeleting(false);
      setShowDeleteModal(false);
      console.error('Delete account error', error);

      if (error.code === 'auth/requires-recent-login') {
        showAlert(
          'Security Check',
          'For your security, please sign out and sign back in before deleting your account.',
        );
      } else {
        showAlert(
          'Error',
          error.message || 'Failed to delete account. Please try again.',
        );
      }
    }
  };

  const menuItems = [
    {
      id: 'edit',
      title: 'Edit Profile',
      icon: Edit,
      onPress: () => router.push('/(patient-tabs)/edit-profile'),
    },
    {
      id: 'family',
      title: 'Family Members',
      icon: Users,
      onPress: () => router.push('/(patient-tabs)/family-tree'),
    },
    {
      id: 'access-requests',
      title: 'Shared Access',
      icon: Shield,
      onPress: () => router.push('/(patient-tabs)/access-requests'),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      onPress: () => router.push('/settings'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      onPress: () => router.push('/notifications'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: Shield,
      onPress: () => router.push('/privacy'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      onPress: () => router.push('/help'),
    },
    {
      id: 'about',
      title: 'About',
      icon: Info,
      onPress: () => router.push('/about'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <ThemeToggle />
        </View>

        <View style={styles.profileSection}>
          <View style={[styles.profileAvatar, { overflow: 'hidden' }]}>
            {userData?.avatarUrl ? (
              <Image
                source={{ uri: userData.avatarUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <User size={40} color={Colors.primary} strokeWidth={1.5} />
            )}
          </View>
          <Text style={styles.profileName}>
            {userData?.firstName} {userData?.lastName}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <Text style={styles.profileEmail}>
            {userData?.patientId ||
              formatUserId(userData?.customUserId, userData?.role || '')}
          </Text>
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

        {accessibleAccounts.length > 0 && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account Switching</Text>
            <View style={styles.linkedAccountsCard}>
              <Text style={styles.linkedAccountsDescription}>
                {userData?.isChildAccount
                  ? "Switch back to your parent's account"
                  : "Switch between your account and your children's accounts"}
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
                      <View
                        style={[
                          styles.linkedAccountAvatar,
                          account.type === 'parent' &&
                            styles.parentAccountAvatar,
                        ]}
                      >
                        <Text style={styles.linkedAccountInitials}>
                          {account.firstName[0]}
                          {account.lastName[0]}
                        </Text>
                      </View>
                      <View style={styles.linkedAccountDetails}>
                        <Text style={styles.linkedAccountName}>
                          {account.firstName} {account.lastName}
                        </Text>
                        <Text
                          style={[
                            styles.linkedAccountType,
                            account.type === 'parent' &&
                              styles.parentAccountType,
                          ]}
                        >
                          {account.type === 'parent'
                            ? 'Parent Account'
                            : 'Child Account'}
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

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <item.icon size={20} color={colors.textSecondary} />
                <Text style={styles.menuItemTitle}>{item.title}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color={Colors.medical.red} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signOutButton, { marginTop: 12, opacity: 0.8 }]}
          onPress={() => setShowDeleteModal(true)}
        >
          <User size={20} color={Colors.medical.red} />
          <Text style={styles.signOutText}>Delete Account</Text>
        </TouchableOpacity>

        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            if (!isDeleting) setShowDeleteModal(false);
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 24,
                width: '100%',
                maxWidth: 340,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Shield size={32} color={Colors.medical.red} />
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: colors.text,
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                Delete Account?
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginBottom: 24,
                  lineHeight: 20,
                }}
              >
                This will permanently delete your account and all your data.
                This action cannot be undone.
              </Text>

              {isDeleting ? (
                <View style={{ padding: 20 }}>
                  <ActivityIndicator size="large" color={Colors.medical.red} />
                  <Text
                    style={{
                      marginTop: 10,
                      color: colors.textSecondary,
                      textAlign: 'center',
                    }}
                  >
                    Deleting account...
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: colors.surfaceSecondary,
                      alignItems: 'center',
                    }}
                    onPress={() => setShowDeleteModal(false)}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: colors.text,
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: Colors.medical.red,
                      alignItems: 'center',
                    }}
                    onPress={handleDeleteAccount}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: 'white',
                      }}
                    >
                      Yes, Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
      <AlertComponent />
    </SafeAreaView>
  );
}
