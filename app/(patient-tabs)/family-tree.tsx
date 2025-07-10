import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Users,
  Plus,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  X,
  Check,
  UserMinus,
  AlertCircle,
  Heart,
  Crown,
  UserX,
  Baby,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { FamilyService } from '@/services/familyService';
import {
  Family,
  FamilyMember,
  FamilyInvitation,
  FamilyRelation,
  FAMILY_RELATIONS,
} from '@/types/family';
import { LinearGradient } from 'expo-linear-gradient';
import { onSnapshot, doc, collection, query, where } from 'firebase/firestore';
import { db } from '@/constants/firebase';
import { useCustomAlert } from '@/components/CustomAlert';

export default function FamilyTreeScreen() {
  const { user, userData, refreshUserData, createChildAccount } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { showAlert, AlertComponent } = useCustomAlert();

  // Modal states
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showCreateChild, setShowCreateChild] = useState(false);

  // Form states
  const [familyName, setFamilyName] = useState('');
  const [memberIdentifier, setMemberIdentifier] = useState('');
  const [selectedRelation, setSelectedRelation] =
    useState<FamilyRelation>('sibling');
  const [submitting, setSubmitting] = useState(false);

  // Child account form states
  const [childFormData, setChildFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    gender: '',
    email: '',
    password: '',
  });
  const [childRelation, setChildRelation] = useState<FamilyRelation>('child');
  const [showChildGenderDropdown, setShowChildGenderDropdown] = useState(false);

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  // Real-time listeners
  useEffect(() => {
    if (!user || !userData) return;

    let familyUnsubscribe: (() => void) | null = null;
    let invitationsUnsubscribe: (() => void) | null = null;

    const setupListeners = async () => {
      try {
        setLoading(true);

        // Listen to family changes if user has a family
        if (userData.familyId) {
          console.log('Setting up family listener for:', userData.familyId);
          familyUnsubscribe = onSnapshot(
            doc(db, 'families', userData.familyId),
            (doc) => {
              if (doc.exists()) {
                const familyData = { id: doc.id, ...doc.data() } as Family;
                console.log('Family data updated:', familyData);
                setFamily(familyData);
              } else {
                console.log('Family document no longer exists');
                setFamily(null);
              }
            },
            (error) => {
              console.error('Error listening to family changes:', error);
            }
          );
        } else {
          setFamily(null);
        }

        // Listen to invitation changes
        console.log('Setting up invitations listener for user:', user.uid);
        const invitationsQuery = query(
          collection(db, 'family_invitations'),
          where('invitedUserId', '==', user.uid),
          where('status', '==', 'pending')
        );

        invitationsUnsubscribe = onSnapshot(
          invitationsQuery,
          (snapshot) => {
            const userInvitations = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as FamilyInvitation[];
            console.log('Invitations updated:', userInvitations);
            setInvitations(userInvitations);
          },
          (error) => {
            console.error('Error listening to invitation changes:', error);
          }
        );
      } catch (error) {
        console.error('Error setting up listeners:', error);
        Alert.alert('Error', 'Failed to load family data');
      } finally {
        setLoading(false);
      }
    };

    setupListeners();

    // Cleanup listeners on unmount
    return () => {
      if (familyUnsubscribe) {
        console.log('Cleaning up family listener');
        familyUnsubscribe();
      }
      if (invitationsUnsubscribe) {
        console.log('Cleaning up invitations listener');
        invitationsUnsubscribe();
      }
    };
  }, [user, userData?.familyId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Update child form data
  const updateChildFormData = (field: string, value: string) => {
    setChildFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Format date of birth for child form
  const formatChildDateOfBirth = (text: string) => {
    const cleaned = text.replace(/\D/g, '');

    if (cleaned.length >= 5) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(
        4,
        8
      )}`;
    } else if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else {
      return cleaned;
    }
  };

  // Format phone number for child form
  const formatChildPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');

    if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
        10
      )}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return cleaned;
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Error', 'Please enter a family name');
      return;
    }

    if (!user || !userData) return;

    try {
      setSubmitting(true);
      const familyId = await FamilyService.createFamily(
        user.uid,
        `${userData.firstName} ${userData.lastName}`,
        userData.email,
        familyName.trim()
      );

      await refreshUserData();
      setShowCreateFamily(false);
      setFamilyName('');

      Alert.alert('Success', 'Family created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInviteMember = async () => {
    if (!memberIdentifier.trim()) {
      Alert.alert('Error', 'Please enter user email, phone, or ID');
      return;
    }

    if (!family || !userData) return;

    try {
      setSubmitting(true);
      await FamilyService.inviteFamilyMember(
        family.id,
        family.name,
        user!.uid,
        `${userData.firstName} ${userData.lastName}`,
        memberIdentifier.trim(),
        selectedRelation
      );

      setShowInviteMember(false);
      setMemberIdentifier('');
      setSelectedRelation('sibling');

      Alert.alert('Success', 'Invitation sent successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateChildAccount = async () => {
    // Validate form
    if (!childFormData.firstName.trim() || !childFormData.lastName.trim()) {
      Alert.alert('Error', 'Please enter first and last name');
      return;
    }

    if (!childFormData.email.trim()) {
      Alert.alert('Error', 'Please enter email address');
      return;
    }

    if (!childFormData.password.trim()) {
      Alert.alert('Error', 'Please enter password');
      return;
    }

    if (childFormData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (!childFormData.dateOfBirth.trim()) {
      Alert.alert('Error', 'Please enter date of birth');
      return;
    }

    // Check if the child is actually under 16
    const age = calculateAge(childFormData.dateOfBirth);
    if (age >= 16) {
      Alert.alert(
        'Age Restriction',
        'Child accounts are only for children under 16 years old. Children 16 and older must create their own accounts and can be invited to join the family.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowCreateChild(false);
              setShowInviteMember(true);
            },
          },
        ]
      );
      return;
    }

    if (!family || !userData) return;

    try {
      setSubmitting(true);

      // Create child account through Firebase authentication
      const childUserId = await createChildAccount(
        {
          firstName: childFormData.firstName,
          middleName: childFormData.middleName,
          lastName: childFormData.lastName,
          email: childFormData.email,
          password: childFormData.password,
          phoneNumber: childFormData.phoneNumber,
          dateOfBirth: childFormData.dateOfBirth,
          address: childFormData.address,
          gender: childFormData.gender,
          role: 'patient',
          familyId: family.id,
        },
        user!.uid
      );

      // Add child to family
      await FamilyService.addChildToFamily(
        family.id,
        childUserId,
        {
          firstName: childFormData.firstName,
          lastName: childFormData.lastName,
          email: childFormData.email,
        },
        childRelation,
        user!.uid
      );

      setShowCreateChild(false);
      // Reset form
      setChildFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        phoneNumber: '',
        dateOfBirth: '',
        address: '',
        gender: '',
        email: '',
        password: '',
      });
      setChildRelation('child');

      Alert.alert('Success', 'Child account created and added to family!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    if (!user || !userData) return;

    try {
      setSubmitting(true);
      await FamilyService.acceptFamilyInvitation(
        invitationId,
        user.uid,
        `${userData.firstName} ${userData.lastName}`,
        userData.email
      );

      await refreshUserData();
      Alert.alert('Success', 'You have joined the family!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setShowInvitations(false);
      setSubmitting(false);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      setSubmitting(true);
      await FamilyService.declineFamilyInvitation(invitationId);
      Alert.alert('Success', 'Invitation declined');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setShowInvitations(false);
      setSubmitting(false);
    }
  };

  const handleKickMember = (member: FamilyMember) => {
    if (!family || family.createdBy !== user?.uid) {
      showAlert('Error', 'Only the family owner can remove members');
      return;
    }

    showAlert(
      'Remove Family Member',
      `Are you sure you want to remove ${member.firstName} ${member.lastName} from the family? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              await FamilyService.kickFamilyMember(
                family.id,
                member.userId,
                user!.uid
              );
              showAlert('Success', 'Family member removed successfully');
            } catch (error: any) {
              showAlert('Error', error.message);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleLeaveFamily = () => {
    if (!family || !user) {
      return;
    }

    showAlert(
      'Leave Family',
      'Are you sure you want to leave this family? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              await FamilyService.leaveFamily(family.id, user.uid);
              await refreshUserData();
              showAlert('Success', 'You have left the family');
            } catch (error: any) {
              showAlert('Error', error.message);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const getRelationIcon = (relation: FamilyRelation) => {
    switch (relation) {
      case 'spouse':
        return <Heart size={16} color={Colors.medical.red} />;
      case 'parent':
        return <Crown size={16} color={Colors.medical.orange} />;
      case 'child':
        return <Users size={16} color={Colors.medical.blue} />;
      default:
        return <Users size={16} color={Colors.primary} />;
    }
  };

  const getRelationColor = (relation: FamilyRelation) => {
    switch (relation) {
      case 'spouse':
        return Colors.medical.red;
      case 'parent':
        return Colors.medical.orange;
      case 'child':
        return Colors.medical.blue;
      case 'sibling':
        return Colors.medical.green;
      default:
        return Colors.primary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading family data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.backgroundGradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Family Tree</Text>
              <Text style={styles.subtitle}>
                {family
                  ? `${family.name} Family`
                  : 'Manage your family connections'}
              </Text>
            </View>
            {invitations.length > 0 && (
              <TouchableOpacity
                style={styles.invitationBadge}
                onPress={() => setShowInvitations(true)}
              >
                <Mail size={20} color={Colors.primary} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{invitations.length}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* No Family State */}
          {!family && (
            <View style={styles.noFamilyContainer}>
              <View style={styles.noFamilyIcon}>
                <Users size={48} color={Colors.textLight} strokeWidth={1.5} />
              </View>
              <Text style={styles.noFamilyTitle}>No Family Yet</Text>
              <Text style={styles.noFamilyDescription}>
                Create a family to connect with your loved ones and share
                medical information securely.
              </Text>
              <TouchableOpacity
                style={styles.createFamilyButton}
                onPress={() => setShowCreateFamily(true)}
                activeOpacity={0.8}
              >
                <Plus size={20} color="white" strokeWidth={2} />
                <Text style={styles.createFamilyButtonText}>Create Family</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Family Members */}
          {family && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Family Members</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.addChildButton}
                      onPress={() => setShowCreateChild(true)}
                      activeOpacity={0.7}
                    >
                      <Baby size={16} color={Colors.primary} strokeWidth={2} />
                      <Text style={styles.addChildButtonText}>Add Child</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.inviteButton}
                      onPress={() => setShowInviteMember(true)}
                      activeOpacity={0.7}
                    >
                      <UserPlus
                        size={16}
                        color={Colors.primary}
                        strokeWidth={2}
                      />
                      <Text style={styles.inviteButtonText}>Invite</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {family.members.map((member) => (
                  <View key={member.userId} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberInitials}>
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </Text>
                      </View>
                      <View style={styles.memberDetails}>
                        <View style={styles.memberNameRow}>
                          <Text style={styles.memberName}>
                            {member.firstName} {member.lastName}
                          </Text>
                          {member.userId === family.createdBy && (
                            <Crown size={14} color={Colors.medical.orange} />
                          )}
                          {member.userId === user?.uid && (
                            <Text style={styles.youLabel}>(You)</Text>
                          )}
                        </View>
                        <View style={styles.memberMeta}>
                          <View style={styles.relationTag}>
                            {getRelationIcon(member.relation)}
                            <Text
                              style={[
                                styles.relationText,
                                { color: getRelationColor(member.relation) },
                              ]}
                            >
                              {FAMILY_RELATIONS.find(
                                (r) => r.value === member.relation
                              )?.label || member.relation}
                            </Text>
                          </View>
                          <Text style={styles.memberEmail}>{member.email}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.memberActions}>
                      <TouchableOpacity
                        style={styles.viewRecordsButton}
                        onPress={() => {
                          // Navigate to member's records
                          router.push(
                            `/(patient-tabs)/member-records?memberId=${member.userId}`
                          );
                        }}
                        activeOpacity={0.7}
                      >
                        <ChevronRight size={16} color={Colors.textSecondary} />
                      </TouchableOpacity>
                      {/* Only show kick button if current user is family owner and it's not themselves */}
                      {member.userId !== user?.uid &&
                        family.createdBy === user?.uid && (
                          <TouchableOpacity
                            style={styles.kickButton}
                            onPress={() => handleKickMember(member)}
                            activeOpacity={0.7}
                          >
                            <UserX size={16} color={Colors.medical.red} />
                          </TouchableOpacity>
                        )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Family Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Family Settings</Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleLeaveFamily}
                  activeOpacity={0.7}
                >
                  <AlertCircle size={20} color={Colors.medical.red} />
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: Colors.medical.red },
                    ]}
                  >
                    Leave Family
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>

        {/* Create Family Modal */}
        <Modal
          visible={showCreateFamily}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Family</Text>
              <TouchableOpacity
                onPress={() => setShowCreateFamily(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Family Name</Text>
              <TextInput
                style={styles.textInput}
                value={familyName}
                onChangeText={setFamilyName}
                placeholder="Enter family name (e.g., Smith Family)"
                placeholderTextColor={Colors.textLight}
              />
              <TouchableOpacity
                style={[styles.submitButton, { opacity: submitting ? 0.7 : 1 }]}
                onPress={handleCreateFamily}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Plus size={20} color="white" />
                    <Text style={styles.submitButtonText}>Create Family</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Invite Member Modal */}
        <Modal
          visible={showInviteMember}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Family Member</Text>
              <TouchableOpacity
                onPress={() => setShowInviteMember(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <View style={styles.ageNoticeCard}>
                <Text style={styles.ageNoticeTitle}>📋 Age Requirement</Text>
                <Text style={styles.ageNoticeText}>
                  Only people 16 years and older can create their own accounts.
                  For children under 16, use the "Add Child" button instead.
                </Text>
              </View>

              <Text style={styles.inputLabel}>User Email, Phone, or ID</Text>
              <TextInput
                style={styles.textInput}
                value={memberIdentifier}
                onChangeText={setMemberIdentifier}
                placeholder="Enter email, phone, or user ID"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Relationship</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.relationSelector}
              >
                {FAMILY_RELATIONS.map((relation) => (
                  <TouchableOpacity
                    key={relation.value}
                    style={[
                      styles.relationOption,
                      selectedRelation === relation.value &&
                        styles.relationOptionSelected,
                    ]}
                    onPress={() => setSelectedRelation(relation.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.relationOptionText,
                        selectedRelation === relation.value &&
                          styles.relationOptionTextSelected,
                      ]}
                    >
                      {relation.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.submitButton, { opacity: submitting ? 0.7 : 1 }]}
                onPress={handleInviteMember}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <UserPlus size={20} color="white" />
                    <Text style={styles.submitButtonText}>Send Invitation</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Invitations Modal */}
        <Modal
          visible={showInvitations}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Family Invitations</Text>
              <TouchableOpacity
                onPress={() => setShowInvitations(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {invitations.map((invitation) => (
                <View key={invitation.id} style={styles.invitationCard}>
                  <View style={styles.invitationInfo}>
                    <Text style={styles.invitationTitle}>
                      {invitation.familyName}
                    </Text>
                    <Text style={styles.invitationDescription}>
                      {invitation.invitedByName} invited you to join as{' '}
                      <Text style={styles.relationHighlight}>
                        {
                          FAMILY_RELATIONS.find(
                            (r) => r.value === invitation.relation
                          )?.label
                        }
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.invitationActions}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptInvitation(invitation.id)}
                      disabled={submitting}
                      activeOpacity={0.7}
                    >
                      <Check size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() => handleDeclineInvitation(invitation.id)}
                      disabled={submitting}
                      activeOpacity={0.7}
                    >
                      <X size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Create Child Account Modal */}
        <Modal
          visible={showCreateChild}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Child (Under 16)</Text>
              <TouchableOpacity
                onPress={() => setShowCreateChild(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.childModalDescription}>
                👶 Create a full account for a child under 16 years old. This
                will create an account with email and password that you can
                manage. You'll be able to switch between profiles. Children 16+
                must create their own accounts.
              </Text>

              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={styles.textInput}
                value={childFormData.firstName}
                onChangeText={(value) =>
                  updateChildFormData('firstName', value)
                }
                placeholder="Enter first name"
                placeholderTextColor={Colors.textLight}
              />

              <Text style={styles.inputLabel}>Middle Name</Text>
              <TextInput
                style={styles.textInput}
                value={childFormData.middleName}
                onChangeText={(value) =>
                  updateChildFormData('middleName', value)
                }
                placeholder="Enter middle name (optional)"
                placeholderTextColor={Colors.textLight}
              />

              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput
                style={styles.textInput}
                value={childFormData.lastName}
                onChangeText={(value) => updateChildFormData('lastName', value)}
                placeholder="Enter last name"
                placeholderTextColor={Colors.textLight}
              />

              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.textInput}
                value={childFormData.email}
                onChangeText={(value) => updateChildFormData('email', value)}
                placeholder="Enter email address"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Password *</Text>
              <TextInput
                style={styles.textInput}
                value={childFormData.password}
                onChangeText={(value) => updateChildFormData('password', value)}
                placeholder="Enter password (min 6 characters)"
                placeholderTextColor={Colors.textLight}
                secureTextEntry
              />

              <Text style={styles.inputLabel}>Date of Birth *</Text>
              <TextInput
                style={styles.textInput}
                value={childFormData.dateOfBirth}
                onChangeText={(value) => {
                  const formatted = formatChildDateOfBirth(value);
                  updateChildFormData('dateOfBirth', formatted);
                }}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
                maxLength={10}
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={childFormData.phoneNumber}
                onChangeText={(value) => {
                  const formatted = formatChildPhoneNumber(value);
                  updateChildFormData('phoneNumber', formatted);
                }}
                placeholder="Enter phone number (optional)"
                placeholderTextColor={Colors.textLight}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={childFormData.address}
                onChangeText={(value) => updateChildFormData('address', value)}
                placeholder="Enter address (optional)"
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={2}
              />

              <Text style={styles.inputLabel}>Gender</Text>
              <TouchableOpacity
                style={[styles.dropdownButton]}
                onPress={() => setShowChildGenderDropdown(!showChildGenderDropdown)}
              >
                <Text style={[styles.dropdownText, !childFormData.gender && styles.placeholderText]}>
                  {childFormData.gender ? genderOptions.find(opt => opt.value === childFormData.gender)?.label : 'Select gender'}
                </Text>
                <Text style={styles.dropdownArrow}>{showChildGenderDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showChildGenderDropdown && (
                <View style={styles.dropdownMenu}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.dropdownOption}
                      onPress={() => {
                        updateChildFormData('gender', option.value);
                        setShowChildGenderDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.inputLabel}>Relationship</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.relationSelector}
              >
                {FAMILY_RELATIONS.filter(
                  (r) =>
                    r.value === 'child' ||
                    r.value === 'grandchild' ||
                    r.value === 'sibling'
                ).map((relation) => (
                  <TouchableOpacity
                    key={relation.value}
                    style={[
                      styles.relationOption,
                      childRelation === relation.value &&
                        styles.relationOptionSelected,
                    ]}
                    onPress={() => setChildRelation(relation.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.relationOptionText,
                        childRelation === relation.value &&
                          styles.relationOptionTextSelected,
                      ]}
                    >
                      {relation.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.submitButton, { opacity: submitting ? 0.7 : 1 }]}
                onPress={handleCreateChildAccount}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Baby size={20} color="white" />
                    <Text style={styles.submitButtonText}>
                      Add Child Account
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        <AlertComponent />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  backgroundGradient: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },

  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  scrollContent: {
    paddingBottom: 100,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 32,
  },

  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },

  invitationBadge: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },

  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    fontSize: 10,
    color: 'white',
    fontFamily: 'Inter-Bold',
  },

  noFamilyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderStyle: 'dashed',
  },

  noFamilyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  noFamilyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 8,
  },

  noFamilyDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },

  createFamilyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },

  createFamilyButtonText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Inter-SemiBold',
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    letterSpacing: -0.3,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },

  addChildButtonText: {
    fontSize: 14,
    color: Colors.medical.green,
    fontFamily: 'Inter-SemiBold',
  },

  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },

  inviteButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },

  memberCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  memberInitials: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Inter-Bold',
  },

  memberDetails: {
    flex: 1,
  },

  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },

  memberName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },

  youLabel: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
  },

  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  relationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  relationText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },

  memberEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  viewRecordsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  kickButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: 12,
  },

  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },

  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalContent: {
    flex: 1,
    padding: 20,
  },

  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },

  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },

  relationSelector: {
    marginBottom: 24,
  },

  relationOption: {
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  relationOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  relationOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },

  relationOptionTextSelected: {
    color: 'white',
  },

  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 24,
  },

  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Inter-SemiBold',
  },

  // Age Notice Card
  ageNoticeCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },

  ageNoticeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 8,
  },

  ageNoticeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },

  // Invitation Card Styles
  invitationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  invitationInfo: {
    flex: 1,
    marginRight: 12,
  },

  invitationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },

  invitationDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },

  relationHighlight: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },

  invitationActions: {
    flexDirection: 'row',
    gap: 8,
  },

  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.medical.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  declineButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.medical.red,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Child Modal Styles
  childModalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.medical.green,
  },

  multilineInput: {
    height: 64,
    textAlignVertical: 'top',
  },

  // Dropdown Styles
  dropdownButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  dropdownText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },

  placeholderText: {
    color: Colors.textLight,
  },

  dropdownArrow: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  dropdownMenu: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    marginTop: -12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },

  dropdownOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },
});
