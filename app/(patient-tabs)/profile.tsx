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
  AlertCircle,
  Stethoscope,
  Calendar,
  Pill,
  Syringe,
  FileText,
  Info as InfoIcon,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { createProfileStyles } from '../../styles/profile';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useCustomAlert } from '@/components/CustomAlert';
import { deletePatientAccount } from './services/accountDeletion';
import { Modal } from 'react-native';
import { calculateAge } from './services/profileHelpers';
import { RecordsService } from '@/services/recordsService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/constants/firebase';

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
  const { colors, isDarkMode } = useTheme();
  const styles = createProfileStyles(colors, isDarkMode);
  const [loading, setLoading] = useState(false);
  const [accessibleAccounts, setAccessibleAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const { showAlert, AlertComponent } = useCustomAlert();
  const [recordCounts, setRecordCounts] = useState({
    allergies: 0,
    diagnoses: 0,
    visits: 0,
    prescriptions: 0,
    vaccinations: 0,
    documents: 0,
  });

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

  // Format date of birth to MM/DD/YYYY
  const formatDateOfBirth = (dob: string | undefined) => {
    if (!dob) return '';
    try {
      // Handle different date formats (MM/DD/YYYY or ISO string)
      let date: Date;
      if (dob.includes('/')) {
        // Already in MM/DD/YYYY format
        const parts = dob.split('/');
        if (parts.length === 3) {
          date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        } else {
          date = new Date(dob);
        }
      } else {
        date = new Date(dob);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dob; // Return original if invalid
      }
      
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch {
      return dob;
    }
  };

  // Get age from date of birth
  const getAge = () => {
    if (!userData?.dateOfBirth) return null;
    try {
      const age = calculateAge(userData.dateOfBirth);
      // Return age if it's a valid number (0 or positive)
      if (typeof age === 'number' && age >= 0) {
        return age;
      }
      return null;
    } catch (error) {
      console.error('Error calculating age:', error, 'Date:', userData.dateOfBirth);
      return null;
    }
  };

  // Format patient ID for display (e.g., 1EG4-TE5-MK72)
  const formatPatientId = () => {
    const id = userData?.patientId || formatUserId(userData?.customUserId, userData?.role || '');
    // Format to match reference style if it's a long ID
    if (id.length > 8) {
      // Try to format as XXX-XXX-XXXX if possible
      const cleaned = id.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      if (cleaned.length >= 8) {
        return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
      }
    }
    return id;
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

  useEffect(() => {
    const fetchRecordCounts = async () => {
      if (!user?.uid) return;
      
      try {
        const recordsRef = collection(db, 'patients', user.uid, 'records');
        const snapshot = await getDocs(recordsRef);
        const records = snapshot.docs.map(doc => doc.data());
        
        const counts = {
          allergies: records.filter(r => r.tags?.includes('allergy') || r.type === 'allergy').length,
          diagnoses: records.filter(r => r.diagnosis || r.tags?.includes('diagnosis') || r.type === 'diagnosis').length,
          visits: records.filter(r => r.type === 'consultation' || r.type === 'visit').length,
          prescriptions: records.filter(r => r.type === 'prescription' || r.type === 'prescriptions').length,
          vaccinations: records.filter(r => r.type === 'vaccination' || r.tags?.includes('vaccination')).length,
          documents: records.filter(r => r.fileUrl || r.fileType).length,
        };
        
        setRecordCounts(counts);
      } catch (error) {
        console.error('Error fetching record counts:', error);
      }
    };

    fetchRecordCounts();
  }, [user?.uid]);

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

  const clinicalProfileItems = [
    {
      id: 'allergies',
      title: 'Allergies',
      icon: AlertCircle,
      iconColor: '#EAB308',
      iconBg: '#FEF9C3',
      count: recordCounts.allergies,
      onPress: () => router.push('/(patient-tabs)/records'),
    },
    {
      id: 'diagnoses',
      title: 'Past diagnoses',
      icon: Stethoscope,
      iconColor: '#EC4899',
      iconBg: '#FCE7F3',
      count: recordCounts.diagnoses,
      onPress: () => router.push('/(patient-tabs)/records'),
    },
    {
      id: 'visits',
      title: 'Visits history',
      icon: Calendar,
      iconColor: '#10B981',
      iconBg: '#D1FAE5',
      count: null,
      onPress: () => router.push('/(patient-tabs)/records'),
    },
    {
      id: 'prescriptions',
      title: 'Prescriptions & examinations',
      icon: Pill,
      iconColor: '#EAB308',
      iconBg: '#FEF9C3',
      count: recordCounts.prescriptions,
      onPress: () => router.push('/(patient-tabs)/records'),
    },
    {
      id: 'vaccinations',
      title: 'Vaccination',
      icon: Syringe,
      iconColor: '#10B981',
      iconBg: '#D1FAE5',
      count: null,
      onPress: () => router.push('/(patient-tabs)/records'),
    },
    {
      id: 'documents',
      title: 'Medical documents',
      icon: FileText,
      iconColor: '#3B82F6',
      iconBg: '#DBEAFE',
      count: null,
      onPress: () => router.push('/(patient-tabs)/records'),
    },
  ];

  const settingsItems = [
    {
      id: 'profile',
      title: 'My profile',
      icon: User,
      iconColor: '#EC4899',
      iconBg: '#FCE7F3',
      onPress: () => router.push('/(patient-tabs)/edit-profile'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
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
              onPress={() => router.push('/(patient-tabs)/edit-profile')}
              activeOpacity={0.7}
            >
              <Edit size={14} color="#EC4899" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {userData?.firstName || ''} {userData?.lastName || ''}
            </Text>
            
            <View style={styles.demographicsRow}>
              {userData?.gender && (
                <>
                  <View style={styles.demographicItem}>
                    <Text style={styles.demographicLabel}>GENDER</Text>
                    <Text style={styles.demographicValue}>
                      {userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1)}
                    </Text>
                  </View>
                  {(() => {
                    const age = getAge();
                    return age !== null && age !== undefined ? (
                      <>
                        <View style={styles.demographicDivider} />
                        <View style={styles.demographicItem}>
                          <Text style={styles.demographicLabel}>AGE</Text>
                          <Text style={styles.demographicValue}>{age}</Text>
                        </View>
                      </>
                    ) : null;
                  })()}
                  {userData?.dateOfBirth && (
                    <>
                      <View style={styles.demographicDivider} />
                      <View style={styles.demographicItem}>
                        <Text style={styles.demographicLabel}>BIRTHDAY</Text>
                        <Text style={styles.demographicValue}>
                          {formatDateOfBirth(userData.dateOfBirth)}
                        </Text>
                      </View>
                    </>
                  )}
                </>
              )}
            </View>

            <View style={styles.patientIdContainer}>
              <View style={styles.patientIdLeft}>
                <Text style={styles.patientIdText}>{formatPatientId()}</Text>
                <InfoIcon size={14} color="#047857" strokeWidth={2} />
              </View>
            </View>
          </View>
        </View>

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

        {/* Clinical Profile Section */}
        <View style={styles.clinicalProfileSection}>
          <Text style={styles.sectionTitle}>Clinical profile</Text>
          <View style={styles.clinicalProfileCard}>
            {clinicalProfileItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.clinicalProfileItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.clinicalProfileIcon, { backgroundColor: item.iconBg }]}>
                  <item.icon size={20} color={item.iconColor} strokeWidth={2} />
                </View>
                <Text style={styles.clinicalProfileItemText}>{item.title}</Text>
                {item.count !== null && item.count > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{item.count}</Text>
                  </View>
                )}
                <ChevronRight size={18} color={colors.textSecondary} style={styles.chevron} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            {settingsItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.settingsItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.settingsIcon, { backgroundColor: item.iconBg }]}>
                  <item.icon size={20} color={item.iconColor} strokeWidth={2} />
                </View>
                <Text style={styles.settingsItemText}>{item.title}</Text>
                <ChevronRight size={18} color={colors.textSecondary} style={styles.chevron} />
              </TouchableOpacity>
            ))}
          </View>
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
