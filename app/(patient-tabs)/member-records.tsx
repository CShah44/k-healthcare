import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  FileText,
  TestTube2,
  Pill,
  FileImage,
  Eye,
  Download,
  Edit3,
  Trash2,
  Tag,
  Heart,
  Brain,
  Bone,
  Activity,
  X,
  Check,
  AlertCircle,
  Crown,
  Users,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { FamilyService } from '@/services/familyService';
import { db } from '@/constants/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

// Predefined tags for medical records
const PREDEFINED_TAGS = [
  {
    id: 'cardiology',
    label: 'Cardiology',
    icon: Heart,
    color: Colors.medical.red,
    isCustom: false,
  },
  {
    id: 'neurology',
    label: 'Neurology',
    icon: Brain,
    color: Colors.medical.blue,
    isCustom: false,
  },
  {
    id: 'orthopedics',
    label: 'Orthopedics',
    icon: Bone,
    color: Colors.medical.orange,
    isCustom: false,
  },
  {
    id: 'general',
    label: 'General',
    icon: Activity,
    color: Colors.medical.green,
    isCustom: false,
  },
  {
    id: 'lab_reports',
    label: 'Lab Reports',
    icon: TestTube2,
    color: Colors.medical.purple,
    isCustom: false,
  },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: Pill,
    color: Colors.medical.yellow,
    isCustom: false,
  },
  {
    id: 'imaging',
    label: 'Imaging',
    icon: FileText,
    color: Colors.primary,
    isCustom: false,
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: Activity,
    color: Colors.error,
    isCustom: false,
  },
];

export default function MemberRecordsScreen() {
  const { memberId } = useLocalSearchParams<{ memberId: string }>();
  const { user, userData } = useAuth();

  const [memberData, setMemberData] = useState<any>(null);
  const [familyData, setFamilyData] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  // Load member data and verify family relationship
  useEffect(() => {
    if (!user || !userData || !memberId) return;

    const loadMemberData = async () => {
      try {
        setLoading(true);

        // Get member's user data
        const memberDoc = await getDoc(doc(db, 'users', memberId));
        if (!memberDoc.exists()) {
          Alert.alert('Error', 'Member not found');
          router.back();
          return;
        }

        const memberInfo = { id: memberDoc.id, ...memberDoc.data() };
        setMemberData(memberInfo);

        // Verify family relationship
        if (
          !userData.familyId ||
          !('familyId' in memberInfo) ||
          memberInfo.familyId !== userData.familyId
        ) {
          Alert.alert('Error', 'You can only view records of family members');
          router.back();
          return;
        }

        // Get family data to check permissions
        const familyDoc = await getDoc(doc(db, 'families', userData.familyId));
        if (familyDoc.exists()) {
          setFamilyData(familyDoc.data());
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading member data:', error);
        Alert.alert('Error', 'Failed to load member information');
        router.back();
      }
    };

    loadMemberData();
  }, [user, userData, memberId]);

  // Real-time records listener
  useEffect(() => {
    if (!memberId) return;

    const q = query(
      collection(db, 'patients', memberId, 'records'),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const memberRecords = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecords(memberRecords);
      },
      (error) => {
        console.error('Failed to fetch member records:', error);
      }
    );

    return () => unsubscribe();
  }, [memberId]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const getRecordIcon = (type: string, source: string) => {
    if (source === 'lab_uploaded') {
      return { icon: TestTube2, color: Colors.medical.green };
    }

    switch (type) {
      case 'prescriptions':
        return { icon: Pill, color: Colors.medical.orange };
      case 'uploaded':
        return { icon: FileImage, color: Colors.primary };
      case 'lab_reports':
        return { icon: TestTube2, color: Colors.medical.green };
      default:
        return { icon: FileText, color: Colors.textSecondary };
    }
  };

  const getTagInfo = (tagId: string) => {
    const predefinedTag = PREDEFINED_TAGS.find((tag) => tag.id === tagId);
    return (
      predefinedTag || {
        id: tagId,
        label: tagId.charAt(0).toUpperCase() + tagId.slice(1),
        icon: Tag,
        color: Colors.primary,
        isCustom: true,
      }
    );
  };

  const canEditRecord = (record: any): boolean => {
    if (!familyData || !userData) return false;

    // Family creator can edit/delete any record
    if (familyData.createdBy === user?.uid) return true;

    // Users can edit/delete their own records
    return memberId === user?.uid;
  };

  const handleEditRecord = (record: any) => {
    if (!canEditRecord(record)) {
      Alert.alert(
        'Permission Denied',
        'You can only edit your own records or if you are the family creator.'
      );
      return;
    }

    setSelectedRecord(record);
    setEditTitle(record.title || '');
    setEditTags(record.tags || []);
    setShowEditModal(true);
  };

  const handleUpdateRecord = async () => {
    if (!selectedRecord || !editTitle.trim()) {
      Alert.alert('Error', 'Please enter a valid title');
      return;
    }

    try {
      setUpdating(true);

      await updateDoc(
        doc(db, 'patients', memberId!, 'records', selectedRecord.id),
        {
          title: editTitle.trim(),
          tags: editTags,
          updatedAt: new Date(),
        }
      );

      setShowEditModal(false);
      setSelectedRecord(null);
      Alert.alert('Success', 'Record updated successfully');
    } catch (error) {
      console.error('Error updating record:', error);
      Alert.alert('Error', 'Failed to update record');
    } finally {
      setUpdating(false);
    }
  };

  // TODO FIX THIS
  const handleDeleteRecord = (record: any) => {
    if (!canEditRecord(record)) {
      Alert.alert(
        'Permission Denied',
        'You can only delete your own records or if you are the family creator.'
      );
      return;
    }

    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteDoc(
                doc(db, 'patients', memberId!, 'records', record.id)
              );
              Alert.alert('Success', 'Record deleted successfully');
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'Failed to delete record');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const toggleEditTag = (tagId: string) => {
    setEditTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading member records...</Text>
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
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={Colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {memberData?.firstName} {memberData?.lastName}'s Records
            </Text>
            <View style={styles.headerMeta}>
              <Text style={styles.headerSubtitle}>
                {records.length} medical records
              </Text>
              {familyData?.createdBy === user?.uid &&
                memberId !== user?.uid && (
                  <View style={styles.permissionBadge}>
                    <Crown size={12} color={Colors.medical.orange} />
                    <Text style={styles.permissionText}>Full Access</Text>
                  </View>
                )}
              {memberId === user?.uid && (
                <View style={styles.ownRecordsBadge}>
                  <Users size={12} color={Colors.primary} />
                  <Text style={styles.ownRecordsText}>Your Records</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Records List */}
        <ScrollView
          style={styles.recordsList}
          contentContainerStyle={styles.recordsContent}
          showsVerticalScrollIndicator={false}
        >
          {records.length > 0 ? (
            records.map((record, index) => {
              const { icon: IconComponent, color } = getRecordIcon(
                record.type,
                record.source
              );
              const canEdit = canEditRecord(record);

              return (
                <Animated.View
                  key={record.id}
                  entering={FadeInDown.delay(index * 100).springify()}
                >
                  <TouchableOpacity
                    style={styles.recordCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedRecord(record);
                      setShowPreviewModal(true);
                    }}
                  >
                    <View style={styles.recordCardContent}>
                      <View style={styles.recordMain}>
                        <View style={styles.recordLeft}>
                          <View
                            style={[
                              styles.recordIcon,
                              { backgroundColor: `${color}15` },
                            ]}
                          >
                            <IconComponent
                              size={20}
                              color={color}
                              strokeWidth={2}
                            />
                          </View>
                          <View style={styles.recordInfo}>
                            <Text style={styles.recordTitle} numberOfLines={2}>
                              {record.title}
                            </Text>
                            <View style={styles.recordMeta}>
                              <Text style={styles.recordSource}>
                                {record.source === 'lab_uploaded'
                                  ? record.lab
                                  : record.doctor || 'Self-uploaded'}
                              </Text>
                              <View style={styles.metaDot} />
                              <Text style={styles.recordDate}>
                                {record.uploadedAt?.toDate
                                  ? record.uploadedAt
                                      .toDate()
                                      .toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                      })
                                  : record.uploadedAt?.seconds
                                  ? new Date(
                                      record.uploadedAt.seconds * 1000
                                    ).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : 'N/A'}
                              </Text>
                            </View>

                            {/* Tags */}
                            {record.tags && record.tags.length > 0 && (
                              <View style={styles.recordTags}>
                                {record.tags
                                  .slice(0, 2)
                                  .map((tagId: string) => {
                                    const tagInfo = getTagInfo(tagId);
                                    return (
                                      <View
                                        key={tagId}
                                        style={[
                                          styles.recordTag,
                                          {
                                            backgroundColor: `${tagInfo.color}15`,
                                          },
                                        ]}
                                      >
                                        <tagInfo.icon
                                          size={10}
                                          color={tagInfo.color}
                                          strokeWidth={2}
                                        />
                                        <Text
                                          style={[
                                            styles.recordTagText,
                                            { color: tagInfo.color },
                                          ]}
                                        >
                                          {tagInfo.label}
                                        </Text>
                                      </View>
                                    );
                                  })}
                                {record.tags.length > 2 && (
                                  <Text style={styles.moreTagsText}>
                                    +{record.tags.length - 2}
                                  </Text>
                                )}
                              </View>
                            )}
                          </View>
                        </View>

                        <View style={styles.recordActions}>
                          <TouchableOpacity style={styles.actionButton}>
                            <Eye
                              size={16}
                              color={Colors.primary}
                              strokeWidth={2}
                            />
                          </TouchableOpacity>
                          {canEdit && (
                            <>
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleEditRecord(record)}
                              >
                                <Edit3
                                  size={16}
                                  color={Colors.medical.blue}
                                  strokeWidth={2}
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleDeleteRecord(record)}
                              >
                                <Trash2
                                  size={16}
                                  color={Colors.medical.red}
                                  strokeWidth={2}
                                />
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <FileText size={64} color={Colors.textLight} strokeWidth={1} />
              <Text style={styles.emptyTitle}>No Records Found</Text>
              <Text style={styles.emptySubtitle}>
                {memberData?.firstName} hasn't uploaded any medical records yet.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Preview Modal */}
        <Modal
          visible={showPreviewModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowPreviewModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedRecord && (
                <>
                  <View style={styles.previewHeader}>
                    <Text style={styles.modalTitle}>
                      {selectedRecord.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowPreviewModal(false)}
                    >
                      <X size={24} color={Colors.text} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalSubtitle}>
                    Uploaded:{' '}
                    {selectedRecord.uploadedAt?.toDate
                      ? selectedRecord.uploadedAt.toDate().toLocaleString()
                      : selectedRecord.uploadedAt?.seconds
                      ? new Date(
                          selectedRecord.uploadedAt.seconds * 1000
                        ).toLocaleString()
                      : 'N/A'}
                  </Text>

                  {selectedRecord.fileType?.startsWith('image') ? (
                    <Image
                      source={{ uri: selectedRecord.fileUrl }}
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                  ) : selectedRecord.fileType === 'application/pdf' ? (
                    <TouchableOpacity
                      style={styles.openPdfButton}
                      onPress={() => Linking.openURL(selectedRecord.fileUrl)}
                    >
                      <Text style={styles.openPdfText}>Open PDF</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.unsupportedText}>
                      File type not supported for preview.
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Edit Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.editModalContent}>
              <View style={styles.editModalHeader}>
                <Text style={styles.modalTitle}>Edit Record</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <X size={24} color={Colors.text} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.editForm}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Enter record title"
                  placeholderTextColor={Colors.textLight}
                />

                <Text style={styles.inputLabel}>Tags</Text>
                <View style={styles.tagGrid}>
                  {PREDEFINED_TAGS.map((tag) => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagOption,
                        editTags.includes(tag.id) && [
                          styles.tagOptionSelected,
                          {
                            backgroundColor: `${tag.color}20`,
                            borderColor: tag.color,
                          },
                        ],
                      ]}
                      onPress={() => toggleEditTag(tag.id)}
                    >
                      <tag.icon
                        size={16}
                        color={
                          editTags.includes(tag.id)
                            ? tag.color
                            : Colors.textSecondary
                        }
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.tagOptionText,
                          editTags.includes(tag.id) && { color: tag.color },
                        ]}
                      >
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.editModalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.updateButton,
                    updating && styles.updateButtonDisabled,
                  ]}
                  onPress={handleUpdateRecord}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Check size={16} color="white" strokeWidth={2} />
                  )}
                  <Text style={styles.updateButtonText}>
                    {updating ? 'Updating...' : 'Update'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },

  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  permissionText: {
    fontSize: 11,
    color: Colors.medical.orange,
    fontFamily: 'Inter-SemiBold',
  },

  ownRecordsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  ownRecordsText: {
    fontSize: 11,
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },

  recordsList: {
    flex: 1,
  },

  recordsContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  recordCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },

  recordCardContent: {
    padding: 16,
  },

  recordMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  recordLeft: {
    flexDirection: 'row',
    flex: 1,
  },

  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  recordInfo: {
    flex: 1,
  },

  recordTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },

  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  recordSource: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textLight,
    marginHorizontal: 8,
  },

  recordDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  recordTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  recordTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },

  recordTagText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },

  moreTagsText: {
    fontSize: 10,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
  },

  recordActions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },

  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    flex: 1,
    marginRight: 16,
  },

  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },

  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginVertical: 16,
  },

  openPdfButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },

  openPdfText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  unsupportedText: {
    textAlign: 'center',
    marginVertical: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  editModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },

  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  editForm: {
    marginBottom: 24,
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

  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 6,
  },

  tagOptionSelected: {
    borderWidth: 2,
  },

  tagOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },

  editModalActions: {
    flexDirection: 'row',
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textLight,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  updateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    gap: 6,
  },

  updateButtonDisabled: {
    backgroundColor: Colors.textLight,
  },

  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
