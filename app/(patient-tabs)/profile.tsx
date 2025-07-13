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
import { createProfileStyles } from './styles/profile';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useCustomAlert } from '@/components/CustomAlert';

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
    showAlert(
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
            try {
              await logout();
              router.replace('/auth/patient-login');
            } catch (error) {
              showAlert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
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
          <Image
            source={{
              uri: 'https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=450,height=450,dpr=2/tour_img/5c4a943ab6f1618a0279e6bab5fafa4298c1e0d13760fdf7d1ddfaec2fb5e24e.jpg',
            }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>
            {userData?.firstName} {userData?.lastName}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
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

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <LogOut size={20} color={Colors.medical.red} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <AlertComponent />
    </SafeAreaView>
  );
}
