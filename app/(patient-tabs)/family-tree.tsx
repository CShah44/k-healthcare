import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Users,
  Plus,
  UserPlus,
  Mail,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Heart,
  Crown,
  UserX,
  Baby,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { FamilyService } from '@/services/familyService';
import {
  Family,
  FamilyMember,
  FamilyInvitation,
  FamilyRelation,
  FAMILY_RELATIONS,
} from '@/types/family';
import { onSnapshot, doc, collection, query, where, getDoc } from 'firebase/firestore';
import { db } from '@/constants/firebase';
import { useCustomAlert } from '@/components/CustomAlert';
import { createFamilyTreeStyles } from '../../styles/family-tree';
import {
  createFamily,
  inviteMember,
  createChildAccount,
  acceptInvitation,
  declineInvitation,
  removeMember,
  getMemberInitials,
  getRelationColor,
  validateChildForm,
} from './services/familyHelpers';

export default function FamilyTreeScreen() {
  const {
    user,
    userData,
    refreshUserData,
    createChildAccount: createChildAccountAuth,
  } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const styles = createFamilyTreeStyles(colors, isDarkMode);

  const [family, setFamily] = useState<Family | null>(null);
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [memberAvatars, setMemberAvatars] = useState<Record<string, string | null>>({});
  const [loadingMembers, setLoadingMembers] = useState(true);
  
  // Skeleton animation
  const skeletonShimmer = useSharedValue(0);

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

  useEffect(() => {
    if (!user || !userData) return;

    let familyUnsubscribe: (() => void) | null = null;
    let invitationsUnsubscribe: (() => void) | null = null;

    const setupListeners = async () => {
      try {
        setLoading(true);

        if (userData.familyId) {
          setLoadingMembers(true);
          familyUnsubscribe = onSnapshot(
            doc(db, 'families', userData.familyId),
            async (familyDoc) => {
              if (familyDoc.exists()) {
                const familyData = { id: familyDoc.id, ...familyDoc.data() } as Family;
                setFamily(familyData);
                
                // Fetch avatars for all members
                const avatarPromises = familyData.members.map(async (member) => {
                  try {
                    const userDoc = await getDoc(doc(db, 'users', member.userId));
                    if (userDoc.exists()) {
                      const memberUserData = userDoc.data() as any;
                      return { userId: member.userId, avatarUrl: memberUserData.avatarUrl || null };
                    }
                    return { userId: member.userId, avatarUrl: null };
                  } catch (error) {
                    console.error(`Error fetching avatar for ${member.userId}:`, error);
                    return { userId: member.userId, avatarUrl: null };
                  }
                });
                
                const avatarResults = await Promise.all(avatarPromises);
                const avatarMap: Record<string, string | null> = {};
                avatarResults.forEach(({ userId, avatarUrl }) => {
                  avatarMap[userId] = avatarUrl;
                });
                setMemberAvatars(avatarMap);
                setLoadingMembers(false);
              } else {
                setFamily(null);
                setMemberAvatars({});
                setLoadingMembers(false);
              }
            }
          );
        } else {
          setFamily(null);
          setMemberAvatars({});
          setLoadingMembers(false);
        }

        const invitationsQuery = query(
          collection(db, 'family_invitations'),
          where('invitedUserId', '==', user.uid),
          where('status', '==', 'pending')
        );

        invitationsUnsubscribe = onSnapshot(invitationsQuery, (snapshot) => {
          const userInvitations = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as FamilyInvitation[];
          setInvitations(userInvitations);
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to load family data');
      } finally {
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      if (familyUnsubscribe) familyUnsubscribe();
      if (invitationsUnsubscribe) invitationsUnsubscribe();
    };
  }, [user, userData?.familyId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Error', 'Please enter a family name');
      return;
    }

    if (!user || !userData) return;

    try {
      setSubmitting(true);
      await createFamily(familyName.trim(), user, userData);

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
      await inviteMember(
        memberIdentifier.trim(),
        selectedRelation,
        family,
        userData
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
    const validationError = validateChildForm(childFormData);
    if (validationError) {
      Alert.alert('Error', validationError);
      return;
    }

    if (!family || !userData) return;

    try {
      setSubmitting(true);
      await createChildAccount(
        childFormData,
        childRelation,
        family,
        user,
        createChildAccountAuth
      );

      setShowCreateChild(false);
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
      await acceptInvitation(invitationId, user, userData);

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
      await declineInvitation(invitationId);
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
              await removeMember(family.id, member.userId, user!.uid);
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

  // Skeleton animation
  useEffect(() => {
    skeletonShimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const skeletonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      skeletonShimmer.value,
      [0, 0.5, 1],
      [0.3, 0.6, 0.3]
    );
    return { opacity };
  });

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ backgroundColor: isDarkMode ? colors.background : '#FAF8F3' }}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Your Family</Text>
            {family && (
              <View style={styles.familyNameContainer}>
                <Text style={styles.familyName}>{family.name}</Text>
              </View>
            )}
            {!family && (
              <Text style={styles.subtitle}>
                Manage your family connections
              </Text>
            )}
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

        {!family && (
          <View style={styles.noFamilyContainer}>
            <View style={styles.noFamilyIcon}>
              <Users size={48} color={Colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.noFamilyTitle}>No Family Yet</Text>
            <Text style={styles.noFamilyDescription}>
              Create a family to connect with your loved ones and share medical
              information securely.
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

              {loadingMembers ? (
                // Skeleton loading for members
                [1, 2, 3].map((index) => (
                  <Animated.View
                    key={`skeleton-${index}`}
                    style={[styles.memberCard, styles.skeletonCard]}
                  >
                    <Animated.View
                      style={[styles.memberAvatar, styles.skeletonAvatar, skeletonStyle]}
                    />
                    <View style={styles.memberInfo}>
                      <Animated.View
                        style={[styles.skeletonName, skeletonStyle]}
                      />
                      <Animated.View
                        style={[styles.skeletonRelation, skeletonStyle]}
                      />
                    </View>
                    <Animated.View
                      style={[styles.skeletonAction, skeletonStyle]}
                    />
                  </Animated.View>
                ))
              ) : (
                family.members.map((member) => (
                  <TouchableOpacity
                    key={member.userId}
                    style={styles.memberCard}
                    onPress={() =>
                      router.push(
                        `/(patient-tabs)/member-records?memberId=${member.userId}`
                      )
                    }
                  >
                    <View style={styles.memberAvatar}>
                      {memberAvatars[member.userId] ? (
                        <Image
                          source={{ uri: memberAvatars[member.userId]! }}
                          style={styles.memberAvatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.memberInitials}>
                          {getMemberInitials(member)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.memberInfo}>
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
                      </View>
                    </View>
                    <View style={styles.memberActions}>
                      <TouchableOpacity
                        style={styles.viewRecordsButton}
                        onPress={() => {
                          router.push(
                            `/(patient-tabs)/member-records?memberId=${member.userId}`
                          );
                        }}
                        activeOpacity={0.7}
                      >
                        <ChevronRight size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
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
                  </TouchableOpacity>
                ))
              )}
            </View>

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

      {/* Modals */}
      <Modal
        visible={showCreateFamily}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateFamily(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Family</Text>
            <TouchableOpacity
              onPress={() => setShowCreateFamily(false)}
              style={styles.closeButton}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Family Name</Text>
            <TextInput
              style={styles.textInput}
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="e.g., The Smiths"
              placeholderTextColor={colors.textSecondary}
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

      <Modal
        visible={showInviteMember}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInviteMember(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invite Member</Text>
            <TouchableOpacity
              onPress={() => setShowInviteMember(false)}
              style={styles.closeButton}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.ageNoticeCard}>
              <Text style={styles.ageNoticeTitle}>Age Requirement</Text>
              <Text style={styles.ageNoticeText}>
                Only people 16 and older can create their own accounts. For
                children under 16, please use the "Add Child" option.
              </Text>
            </View>

            <Text style={styles.inputLabel}>User Email, Phone, or ID</Text>
            <TextInput
              style={styles.textInput}
              value={memberIdentifier}
              onChangeText={setMemberIdentifier}
              placeholder="Enter their email, phone, or user ID"
              placeholderTextColor={colors.textSecondary}
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

      <Modal
        visible={showInvitations}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInvitations(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Family Invitations</Text>
            <TouchableOpacity
              onPress={() => setShowInvitations(false)}
              style={styles.closeButton}
            >
              <X size={24} color={colors.text} />
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
                  >
                    <Check size={18} color="white" strokeWidth={2.5} />
                    <Text style={{ color: 'white', fontSize: 15, fontFamily: 'Satoshi-Variable', fontWeight: '600', marginLeft: 6 }}>
                      Accept
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => handleDeclineInvitation(invitation.id)}
                    disabled={submitting}
                  >
                    <X size={18} color={isDarkMode ? colors.text : '#6B7280'} strokeWidth={2.5} />
                    <Text style={{ color: isDarkMode ? colors.text : '#6B7280', fontSize: 15, fontFamily: 'Satoshi-Variable', fontWeight: '600', marginLeft: 6 }}>
                      Decline
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showCreateChild}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateChild(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Child (Under 16)</Text>
            <TouchableOpacity
              onPress={() => setShowCreateChild(false)}
              style={styles.closeButton}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.childModalDescription}>
              Create a managed account for a child under 16. They will be able
              to log in with the email and password you create. Children 16+
              must create their own accounts.
            </Text>

            <Text style={styles.inputLabel}>First Name *</Text>
            <TextInput
              style={styles.textInput}
              value={childFormData.firstName}
              onChangeText={(value) =>
                setChildFormData((p) => ({ ...p, firstName: value }))
              }
              placeholder="Enter first name"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Last Name *</Text>
            <TextInput
              style={styles.textInput}
              value={childFormData.lastName}
              onChangeText={(value) =>
                setChildFormData((p) => ({ ...p, lastName: value }))
              }
              placeholder="Enter last name"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={styles.textInput}
              value={childFormData.email}
              onChangeText={(value) =>
                setChildFormData((p) => ({ ...p, email: value }))
              }
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Password *</Text>
            <TextInput
              style={styles.textInput}
              value={childFormData.password}
              onChangeText={(value) =>
                setChildFormData((p) => ({ ...p, password: value }))
              }
              placeholder="Enter password (min 6 characters)"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Date of Birth *</Text>
            <TextInput
              style={styles.textInput}
              value={childFormData.dateOfBirth}
              onChangeText={(value) => {
                setChildFormData((p) => ({ ...p, dateOfBirth: value }));
              }}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={styles.inputLabel}>Gender</Text>
            <TouchableOpacity
              style={[styles.dropdownButton]}
              onPress={() =>
                setShowChildGenderDropdown(!showChildGenderDropdown)
              }
            >
              <Text
                style={[
                  styles.dropdownText,
                  !childFormData.gender && styles.placeholderText,
                ]}
              >
                {childFormData.gender
                  ? genderOptions.find(
                      (opt) => opt.value === childFormData.gender
                    )?.label
                  : 'Select gender'}
              </Text>
              <Text style={styles.dropdownArrow}>
                {showChildGenderDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {showChildGenderDropdown && (
              <View style={styles.dropdownMenu}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setChildFormData((p) => ({ ...p, gender: option.value }));
                      setShowChildGenderDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

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
                  <Text style={styles.submitButtonText}>Add Child Account</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <AlertComponent />
    </SafeAreaView>
  );
}
