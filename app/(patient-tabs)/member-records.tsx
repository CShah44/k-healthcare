import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  Linking,
  Platform,
  FlexAlignType,
  Dimensions,
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
  Search,
  Filter,
  Plus,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
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
import { createRecordsStyles } from '../../styles/records';
import {
  canEditRecord,
  updateMemberRecord,
  deleteMemberRecord,
  toggleEditTag,
  openFile,
  filterMemberRecords,
  getPermissionText,
  getPermissionColor,
} from './services/memberRecordHelpers';
import { WebView } from 'react-native-webview';
import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import { useCustomAlert } from '@/components/CustomAlert';

const { width } = Dimensions.get('window');

const { SUPABASE_URL, SUPABASE_ANON_KEY } = Constants.expoConfig?.extra ?? {};
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

const BUCKET = 'svastheya';

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
    color: Colors.medical.red,
    isCustom: false,
  },
];

// Helper to extract storage path from Supabase public URL
function getStoragePathFromUrl(url: string) {
  // Example: https://xyz.supabase.co/storage/v1/object/public/svastheya/uploads/uid/filename.pdf
  // Returns: uploads/uid/filename.pdf
  const match = url.match(/svastheya\/(.+)$/);
  return match ? match[1] : '';
}

// Helper to convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to convert Uint8Array to base64
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to get user encryption key (same as upload)
function getUserEncryptionKey(uid: string): string {
  return CryptoJS.SHA256(uid + '_svastheya_secret').toString();
}

// Helper to decrypt AES-encrypted files (PDFs and images)
async function decryptFileFromUrl(
  url: string,
  record: any,
  uid: string,
): Promise<string> {
  // Download encrypted file
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  // Convert encrypted binary to base64
  const encryptedBase64 = uint8ArrayToBase64(new Uint8Array(arrayBuffer));

  // Get encryption key
  const key = getUserEncryptionKey(uid);

  // Decrypt
  const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key);
  const decryptedBytes = decrypted.words.reduce(
    (arr: number[], word: number) => {
      arr.push(
        (word >> 24) & 0xff,
        (word >> 16) & 0xff,
        (word >> 8) & 0xff,
        word & 0xff,
      );
      return arr;
    },
    [],
  );
  const decryptedUint8 = new Uint8Array(decryptedBytes).slice(
    0,
    decrypted.sigBytes,
  );

  if (Platform.OS === 'web') {
    // Create a Blob and object URL for browser viewing
    const blob = new Blob([decryptedUint8], { type: record.fileType });
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } else if (record.fileType === 'application/pdf') {
    // On mobile, write PDF to a temp file and return file:// URI
    const base64 = uint8ArrayToBase64(decryptedUint8);
    const fileUri = `${FileSystem.cacheDirectory}svastheya_${Date.now()}.pdf`;
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return fileUri;
  } else {
    // For images, return data URI
    return `data:${record.fileType};base64,${uint8ArrayToBase64(
      decryptedUint8,
    )}`;
  }
}

async function openPdfFile(fileUri: string) {
  // For best experience on Android, install expo-intent-launcher and use it to open PDFs in external apps.
  // For now, use Linking.openURL for both platforms.
  await Linking.openURL(fileUri);
}

export default function MemberRecordsScreen() {
  const { memberId, firstName, lastName } = useLocalSearchParams<{
    memberId: string;
    firstName?: string;
    lastName?: string;
  }>();
  const { user, userData } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const styles = createRecordsStyles(colors, isDarkMode);
  const { showAlert, AlertComponent } = useCustomAlert();

  const [memberData, setMemberData] = useState<any>(
    firstName || lastName ? { firstName, lastName, id: memberId } : null,
  );
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
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  // Add state for previewing
  const [pdfPreviewUri, setPdfPreviewUri] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [showCustomTagModal, setShowCustomTagModal] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [addingTag, setAddingTag] = useState(false);

  // Animation values - subtle animations
  const headerOpacity = useSharedValue(1);
  const headerTranslateY = useSharedValue(0);

  useEffect(() => {
    // Subtle entrance animations
    if (Platform.OS === 'web') {
      headerOpacity.value = withTiming(1, { duration: 400 });
      headerTranslateY.value = withSpring(0, { damping: 20, stiffness: 100 });
    }
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
          showAlert('Error', 'Member not found');
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
          showAlert('Error', 'You can only view records of family members');
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
        showAlert('Error', 'Failed to load member information');
        router.back();
      }
    };

    loadMemberData();
  }, [user, userData, memberId]);

  // Load user's custom tags on component mount
  useEffect(() => {
    if (user) {
      loadUserCustomTags();
    }
  }, [user]);

  const loadUserCustomTags = async () => {
    if (!user) return;

    try {
      setLoadingTags(true);
      const userTagsDoc = await getDoc(doc(db, 'userTags', user.uid));
      if (userTagsDoc.exists()) {
        const data = userTagsDoc.data();
        setCustomTags(data.customTags || []);
      }
    } catch (error) {
      console.error('Error loading custom tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  const saveUserCustomTags = async (tags: string[]) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'userTags', user.uid), {
        customTags: tags,
        updatedAt: new Date(),
      });
    } catch (error) {
      // If doc doesn't exist, create it
      try {
        await updateDoc(doc(db, 'userTags', user.uid), {
          customTags: tags,
          updatedAt: new Date(),
        });
      } catch (e) {
        // Fallback or better handling if needed
      }
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const getAllAvailableTags = () => {
    return [
      ...PREDEFINED_TAGS,
      ...customTags.map((tag) => ({
        id: tag,
        label: tag.charAt(0).toUpperCase() + tag.slice(1),
        icon: Tag,
        color: Colors.primary,
        isCustom: true,
      })),
    ];
  };

  const addCustomTag = async () => {
    const trimmedTag = newTagInput.trim().toLowerCase();
    if (!trimmedTag) {
      showAlert('Error', 'Please enter a tag name');
      return;
    }

    const allExistingTags = [
      ...PREDEFINED_TAGS.map((t) => t.id),
      ...customTags,
    ];
    if (allExistingTags.includes(trimmedTag)) {
      showAlert('Error', 'This tag already exists');
      return;
    }

    try {
      setAddingTag(true);
      const newCustomTags = [...customTags, trimmedTag];
      setCustomTags(newCustomTags);
      setSelectedTags((prev) => [...prev, trimmedTag]);
      await saveUserCustomTags(newCustomTags);
      setNewTagInput('');
      setShowCustomTagModal(false);
    } catch (error) {
      console.error('Error adding custom tag:', error);
      showAlert('Error', 'Failed to save custom tag');
      setCustomTags((prev) => prev.filter((tag) => tag !== trimmedTag));
      setSelectedTags((prev) => prev.filter((tag) => tag !== trimmedTag));
    } finally {
      setAddingTag(false);
    }
  };

  const removeCustomTag = async (tagId: string) => {
    try {
      const newCustomTags = customTags.filter((id) => id !== tagId);
      setCustomTags(newCustomTags);
      setSelectedTags((prev) => prev.filter((id) => id !== tagId));
      await saveUserCustomTags(newCustomTags);
    } catch (error) {
      console.error('Error removing custom tag:', error);
      showAlert('Error', 'Failed to remove custom tag');
      setCustomTags((prev) => [...prev, tagId]);
    }
  };

  // Real-time records listener
  useEffect(() => {
    if (!memberId) return;

    const q = query(
      collection(db, 'patients', memberId, 'records'),
      orderBy('uploadedAt', 'desc'),
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
      },
    );

    return () => unsubscribe();
  }, [memberId]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  // Use theme-aware colors
  const medicalColors = Colors.medical;
  const textLight = colors.textTertiary;
  const primary = Colors.primary;

  const getRecordIcon = (type: string, source: string) => {
    if (source === 'lab_uploaded') {
      return { icon: TestTube2, color: medicalColors.green };
    }
    switch (type) {
      case 'prescriptions':
        return { icon: Pill, color: medicalColors.orange };
      case 'uploaded':
        return { icon: FileImage, color: primary };
      case 'lab_reports':
        return { icon: TestTube2, color: medicalColors.green };
      default:
        return { icon: FileText, color: colors.textSecondary };
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

  // Restore missing handler functions that use the extracted services
  const handleEditRecord = (record: any) => {
    if (!canEditRecord(record, userData, memberId!, familyData)) {
      showAlert(
        'Permission Denied',
        "You can only edit your own records. Only the family owner can edit other family members' records.",
      );
      return;
    }

    setSelectedRecord(record);
    setEditTitle(record.title || '');
    setEditTags(record.tags || []);
    setShowEditModal(true);
  };

  const handleUpdateRecord = async () => {
    if (!selectedRecord || !memberId) return;

    try {
      setUpdating(true);
      await updateMemberRecord(
        memberId,
        selectedRecord.id,
        editTitle,
        editTags,
      );
      setShowEditModal(false);
      setSelectedRecord(null);
      showAlert('Success', 'Record updated successfully');
    } catch (error) {
      console.error('Error updating record:', error);
      showAlert('Error', 'Failed to update record');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRecord = (record: any) => {
    if (!canEditRecord(record, userData, memberId!, familyData)) {
      showAlert(
        'Permission Denied',
        "You can only delete your own records. Only the family owner can delete other family members' records.",
      );
      return;
    }

    showAlert(
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
              if (memberId) {
                await deleteMemberRecord(memberId, record.id);
                showAlert('Success', 'Record deleted successfully');
              }
            } catch (error) {
              console.error('Error deleting record:', error);
              showAlert('Error', 'Failed to delete record');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleToggleEditTag = (tagId: string) => {
    setEditTags((prev: string[]) =>
      prev.includes(tagId)
        ? prev.filter((id: string) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const filters = [
    { id: 'all', label: 'All', count: records.length },
    {
      id: 'uploaded',
      label: 'Uploads',
      count: records.filter(
        (r) => r.type === 'uploaded' || r.source === 'user_uploaded',
      ).length,
    },
    {
      id: 'lab_reports',
      label: 'Lab Reports',
      count: records.filter(
        (r) =>
          r.type === 'lab_reports' ||
          r.source === 'lab_uploaded' ||
          r.tags?.includes('lab_reports'),
      ).length,
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      count: records.filter(
        (r) =>
          r.type === 'prescriptions' ||
          r.type === 'prescription' ||
          r.tags?.includes('prescriptions') ||
          r.tags?.includes('prescription'),
      ).length,
    },
  ];

  const filteredRecords = filterMemberRecords(
    records,
    searchQuery,
    selectedTags,
    selectedFilter,
    PREDEFINED_TAGS.map((t) => t.id),
  );

  // Update permission text and color to use extracted services
  const permissionText = getPermissionText(userData, memberId!, familyData);
  const permissionColor = getPermissionColor(userData, memberId!, familyData);

  // Mobile-specific styles
  const mobileStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
      minHeight: '100%',
    },
    recordsList: {
      flex: 1,
      minHeight: 400,
    },
    recordsContent: {
      paddingHorizontal: 20,
      flexGrow: 1,
      paddingBottom: 120,
    },
    recordCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative' as const,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      minHeight: 120,
    },
  };

  if (loading && !memberData) {
    return (
      <SafeAreaView
        style={
          Platform.OS === 'ios' || Platform.OS === 'android'
            ? mobileStyles.container
            : styles.container
        }
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading member records...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={
        Platform.OS === 'ios' || Platform.OS === 'android'
          ? mobileStyles.container
          : styles.container
      }
    >
      <LinearGradient
        colors={
          isDarkMode
            ? [colors.surface, colors.surfaceSecondary]
            : ['#FAF8F3', '#FAF8F3']
        }
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            Platform.OS === 'web' ? headerAnimatedStyle : {},
          ]}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/family-tree')}
            >
              <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
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
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.headerButton,
                showSearch && styles.headerButtonActive,
              ]}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Search
                size={20}
                color={showSearch ? Colors.primary : colors.text}
                strokeWidth={2}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.headerButton,
                selectedTags.length > 0 && styles.headerButtonActive,
              ]}
              onPress={() => setShowTagModal(true)}
            >
              <Filter
                size={20}
                color={selectedTags.length > 0 ? Colors.primary : colors.text}
                strokeWidth={2}
              />
              {selectedTags.length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {selectedTags.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Filter Tabs */}
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.id && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.id && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
                <View
                  style={[
                    styles.filterCount,
                    selectedFilter === filter.id && styles.filterCountActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      selectedFilter === filter.id &&
                        styles.filterCountTextActive,
                    ]}
                  >
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <Animated.View
            style={styles.searchContainer}
            entering={
              Platform.OS === 'web' ? FadeInDown.springify() : undefined
            }
          >
            <View style={styles.searchInputContainer}>
              <Search size={18} color={colors.textSecondary} strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search records, doctors, labs..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.textTertiary}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={18} color={colors.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <View style={styles.selectedTagsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.selectedTagsList}>
                {selectedTags.map((tagId) => {
                  const tagInfo = getTagInfo(tagId);
                  return (
                    <TouchableOpacity
                      key={tagId}
                      style={[
                        styles.selectedTag,
                        { backgroundColor: `${tagInfo.color}20` },
                      ]}
                      onPress={() =>
                        setSelectedTags((prev) =>
                          prev.filter((id) => id !== tagId),
                        )
                      }
                    >
                      <tagInfo.icon
                        size={14}
                        color={tagInfo.color}
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.selectedTagText,
                          { color: tagInfo.color },
                        ]}
                      >
                        {tagInfo.label}
                      </Text>
                      <X size={12} color={tagInfo.color} strokeWidth={2} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Records List */}
        <ScrollView
          style={
            Platform.OS === 'ios' || Platform.OS === 'android'
              ? mobileStyles.recordsList
              : styles.recordsList
          }
          contentContainerStyle={
            Platform.OS === 'ios' || Platform.OS === 'android'
              ? mobileStyles.recordsContent
              : styles.recordsContent
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record, index) => {
              const { icon: IconComponent, color } = getRecordIcon(
                record.type,
                record.source,
              );
              const canEdit = canEditRecord(
                record,
                userData,
                memberId!,
                familyData,
              );
              const statusColor =
                record.status === 'normal'
                  ? Colors.medical.green
                  : record.status === 'abnormal'
                    ? Colors.medical.red
                    : record.status === 'pending'
                      ? Colors.medical.blue
                      : colors.textSecondary;
              return (
                <View key={record.id} style={{ marginBottom: 16 }}>
                  <TouchableOpacity
                    style={
                      Platform.OS === 'ios' || Platform.OS === 'android'
                        ? mobileStyles.recordCard
                        : [
                            styles.recordCard,
                            {
                              backgroundColor: colors.card,
                              borderColor: colors.border,
                            },
                          ]
                    }
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
                            <View style={styles.recordMetaRow}>
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
                                        record.uploadedAt.seconds * 1000,
                                      ).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                      })
                                    : 'N/A'}
                              </Text>
                            </View>
                            {/* Tags Row */}
                            {record.tags && record.tags.length > 0 && (
                              <View style={styles.tagsRow}>
                                {record.tags
                                  .slice(0, 3)
                                  .map((tagId: string) => {
                                    const tagInfo = getTagInfo(tagId);
                                    return (
                                      <View
                                        key={tagId}
                                        style={[
                                          styles.recordTag,
                                          { backgroundColor: colors.surface },
                                        ]}
                                      >
                                        <Text
                                          style={[
                                            styles.recordTagText,
                                            { color: colors.textSecondary },
                                          ]}
                                        >
                                          {tagInfo.label}
                                        </Text>
                                      </View>
                                    );
                                  })}
                                {record.tags.length > 3 && (
                                  <Text
                                    style={[
                                      styles.moreTagsText,
                                      { color: colors.textSecondary },
                                    ]}
                                  >
                                    +{record.tags.length - 3} more
                                  </Text>
                                )}
                              </View>
                            )}
                          </View>
                        </View>
                        {/* Action Icons */}
                        <View style={styles.recordActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={async () => {
                              setSelectedRecord(record);
                              setPdfPreviewUri(null);
                              setShowPdfPreview(true);
                              try {
                                const decryptedUri = await decryptFileFromUrl(
                                  record.fileUrl,
                                  record,
                                  memberId, // use memberId as uid
                                );
                                setPdfPreviewUri(decryptedUri);
                              } catch (e) {
                                showAlert(
                                  'Error',
                                  'Failed to decrypt and open file.',
                                );
                                setShowPdfPreview(false);
                              }
                            }}
                          >
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
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <FileText
                size={64}
                color={colors.textSecondary}
                strokeWidth={1}
              />
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
                      <X size={24} color={colors.text} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalSubtitle}>
                    Uploaded:{' '}
                    {selectedRecord.uploadedAt?.toDate
                      ? selectedRecord.uploadedAt.toDate().toLocaleString()
                      : selectedRecord.uploadedAt?.seconds
                        ? new Date(
                            selectedRecord.uploadedAt.seconds * 1000,
                          ).toLocaleString()
                        : 'N/A'}
                  </Text>

                  {selectedRecord.fileType?.startsWith('image') ||
                  selectedRecord.fileType === 'application/pdf' ? (
                    <TouchableOpacity
                      style={styles.openPdfButton}
                      onPress={async () => {
                        setPdfPreviewUri(null);
                        setShowPdfPreview(true);
                        try {
                          const decryptedUri = await decryptFileFromUrl(
                            selectedRecord.fileUrl,
                            selectedRecord,
                            memberId, // use memberId as uid
                          );
                          setPdfPreviewUri(decryptedUri);
                        } catch (e) {
                          showAlert(
                            'Error',
                            'Failed to decrypt and open file.',
                          );
                          setShowPdfPreview(false);
                        }
                      }}
                    >
                      <Text style={styles.openPdfText}>
                        {selectedRecord.fileType?.startsWith('image')
                          ? 'View Image'
                          : 'Open PDF'}
                      </Text>
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

        {/* PDF/Image Preview Modal */}
        <Modal
          visible={showPdfPreview}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowPdfPreview(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <TouchableOpacity
              style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}
              onPress={() => setShowPdfPreview(false)}
            >
              <Text style={{ color: '#fff', fontSize: 18 }}>Close</Text>
            </TouchableOpacity>

            {pdfPreviewUri ? (
              Platform.OS === 'web' ? (
                <View style={{ flex: 1, marginTop: 60 }}>
                  {selectedRecord?.fileType?.startsWith('image') ? (
                    <img
                      src={pdfPreviewUri}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 12,
                      }}
                      alt="Image Preview"
                    />
                  ) : selectedRecord?.fileType === 'application/pdf' ? (
                    <iframe
                      src={pdfPreviewUri}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 12,
                      }}
                      title="PDF Preview"
                    />
                  ) : (
                    <div
                      style={{
                        color: '#fff',
                        textAlign: 'center',
                        marginTop: 40,
                      }}
                    >
                      File type not supported for preview.
                    </div>
                  )}
                </View>
              ) : selectedRecord?.fileType?.startsWith('image') ? (
                <Image
                  source={{ uri: pdfPreviewUri }}
                  style={{
                    width: '100%',
                    height: 300,
                    borderRadius: 12,
                    marginTop: 60,
                  }}
                  resizeMode="contain"
                />
              ) : selectedRecord?.fileType === 'application/pdf' ? (
                // Show loading indicator while useEffect opens the PDF
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={{ color: '#fff', marginTop: 16 }}>
                    Opening PDF in system viewer...
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', marginTop: 16 }}>
                    File type not supported for preview.
                  </Text>
                </View>
              )
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: '#fff', marginTop: 16 }}>
                  Decrypting file...
                </Text>
              </View>
            )}
          </SafeAreaView>
        </Modal>

        {/* Tag Filter Modal */}
        <Modal
          visible={showTagModal}
          animationType="slide"
          transparent
          onRequestClose={() => {
            setShowTagModal(false);
            setTagSearchQuery('');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.tagModalContent}>
              <View style={styles.tagModalHeader}>
                <View style={styles.tagModalHeaderTitle}>
                  <Text style={styles.modalTitle}>Filter by Tags</Text>
                  {selectedTags.length > 0 && (
                    <View style={styles.selectedTagsCountBadge}>
                      <Text style={styles.selectedTagsCountText}>
                        {selectedTags.length}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.tagModalHeaderActions}>
                  <TouchableOpacity
                    style={styles.addCustomTagHeaderButton}
                    onPress={() => {
                      setShowTagModal(false);
                      setShowCustomTagModal(true);
                    }}
                  >
                    <Plus size={18} color={primary} strokeWidth={2.5} />
                    <Text style={styles.addCustomTagHeaderText}>Add Tag</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowTagModal(false);
                      setTagSearchQuery('');
                    }}
                    style={styles.closeModalButton}
                  >
                    <X size={22} color={colors.text} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tag Search Bar */}
              <View style={styles.tagSearchContainer}>
                <View style={styles.tagSearchInputContainer}>
                  <Search
                    size={18}
                    color={colors.textSecondary}
                    strokeWidth={2}
                  />
                  <TextInput
                    style={styles.tagSearchInput}
                    placeholder="Search tags..."
                    placeholderTextColor={colors.textTertiary}
                    value={tagSearchQuery}
                    onChangeText={setTagSearchQuery}
                  />
                  {tagSearchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setTagSearchQuery('')}
                      style={styles.clearSearchButton}
                    >
                      <X
                        size={16}
                        color={colors.textSecondary}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.tagsList}
                showsVerticalScrollIndicator={false}
              >
                {loadingTags ? (
                  <View style={styles.loadingTagsContainer}>
                    <ActivityIndicator size="small" color={primary} />
                    <Text style={styles.loadingTagsText}>
                      Loading your tags...
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Medical Tags Section */}
                    {getAllAvailableTags()
                      .filter((tag: any) => !tag.isCustom)
                      .filter(
                        (tag: any) =>
                          tagSearchQuery === '' ||
                          tag.label
                            .toLowerCase()
                            .includes(tagSearchQuery.toLowerCase()),
                      ).length > 0 && (
                      <View style={styles.tagSection}>
                        <Text style={styles.tagSectionTitle}>
                          Medical Categories
                        </Text>
                        <View style={styles.tagGrid}>
                          {getAllAvailableTags()
                            .filter((tag: any) => !tag.isCustom)
                            .filter(
                              (tag: any) =>
                                tagSearchQuery === '' ||
                                tag.label
                                  .toLowerCase()
                                  .includes(tagSearchQuery.toLowerCase()),
                            )
                            .map((tag: any) => {
                              const isSelected = selectedTags.includes(tag.id);
                              const tagCount = records.filter((r: any) =>
                                r.tags?.includes(tag.id),
                              ).length;
                              return (
                                <Animated.View
                                  key={tag.id}
                                  entering={FadeInDown.delay(50).springify()}
                                >
                                  <TouchableOpacity
                                    style={[
                                      styles.tagChip,
                                      isSelected && {
                                        backgroundColor: `${tag.color}15`,
                                        borderColor: tag.color,
                                        borderWidth: 2,
                                      },
                                    ]}
                                    onPress={() => toggleTag(tag.id)}
                                    activeOpacity={0.7}
                                  >
                                    <tag.icon
                                      size={16}
                                      color={
                                        isSelected
                                          ? tag.color
                                          : colors.textSecondary
                                      }
                                      strokeWidth={2.5}
                                    />
                                    <Text
                                      style={[
                                        styles.tagChipText,
                                        isSelected && {
                                          color: tag.color,
                                          fontWeight: '600',
                                        },
                                      ]}
                                    >
                                      {tag.label}
                                    </Text>
                                    {tagCount > 0 && (
                                      <View
                                        style={[
                                          styles.tagCountBadge,
                                          isSelected && {
                                            backgroundColor: tag.color,
                                          },
                                        ]}
                                      >
                                        <Text
                                          style={[
                                            styles.tagCountText,
                                            isSelected && { color: '#ffffff' },
                                          ]}
                                        >
                                          {tagCount}
                                        </Text>
                                      </View>
                                    )}
                                    {isSelected && (
                                      <View
                                        style={[
                                          styles.tagSelectedIndicator,
                                          { backgroundColor: tag.color },
                                        ]}
                                      >
                                        <Check
                                          size={12}
                                          color="#ffffff"
                                          strokeWidth={3}
                                        />
                                      </View>
                                    )}
                                  </TouchableOpacity>
                                </Animated.View>
                              );
                            })}
                        </View>
                      </View>
                    )}

                    {/* Custom Tags Section */}
                    {getAllAvailableTags()
                      .filter((tag: any) => tag.isCustom)
                      .filter(
                        (tag: any) =>
                          tagSearchQuery === '' ||
                          tag.label
                            .toLowerCase()
                            .includes(tagSearchQuery.toLowerCase()),
                      ).length > 0 && (
                      <View style={styles.tagSection}>
                        <View style={styles.tagSectionHeader}>
                          <Text style={styles.tagSectionTitle}>
                            Custom Tags
                          </Text>
                        </View>
                        <View style={styles.tagGrid}>
                          {getAllAvailableTags()
                            .filter((tag: any) => tag.isCustom)
                            .filter(
                              (tag: any) =>
                                tagSearchQuery === '' ||
                                tag.label
                                  .toLowerCase()
                                  .includes(tagSearchQuery.toLowerCase()),
                            )
                            .map((tag: any) => {
                              const isSelected = selectedTags.includes(tag.id);
                              const tagCount = records.filter((r: any) =>
                                r.tags?.includes(tag.id),
                              ).length;
                              return (
                                <Animated.View
                                  key={tag.id}
                                  entering={FadeInDown.delay(50).springify()}
                                >
                                  <TouchableOpacity
                                    style={[
                                      styles.tagChip,
                                      isSelected && {
                                        backgroundColor: `${primary}15`,
                                        borderColor: primary,
                                        borderWidth: 2,
                                      },
                                    ]}
                                    onPress={() => toggleTag(tag.id)}
                                    activeOpacity={0.7}
                                  >
                                    <Tag
                                      size={16}
                                      color={
                                        isSelected
                                          ? primary
                                          : colors.textSecondary
                                      }
                                      strokeWidth={2.5}
                                    />
                                    <Text
                                      style={[
                                        styles.tagChipText,
                                        isSelected && {
                                          color: primary,
                                          fontWeight: '600',
                                        },
                                      ]}
                                    >
                                      {tag.label}
                                    </Text>
                                    {tagCount > 0 && (
                                      <View
                                        style={[
                                          styles.tagCountBadge,
                                          isSelected && {
                                            backgroundColor: primary,
                                          },
                                        ]}
                                      >
                                        <Text
                                          style={[
                                            styles.tagCountText,
                                            isSelected && { color: '#ffffff' },
                                          ]}
                                        >
                                          {tagCount}
                                        </Text>
                                      </View>
                                    )}
                                    <TouchableOpacity
                                      style={styles.removeCustomTagButton}
                                      onPress={(e) => {
                                        e.stopPropagation();
                                        removeCustomTag(tag.id);
                                      }}
                                    >
                                      <X
                                        size={14}
                                        color={colors.textSecondary}
                                      />
                                    </TouchableOpacity>
                                  </TouchableOpacity>
                                </Animated.View>
                              );
                            })}
                        </View>
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Custom Tag Input Modal */}
        <Modal
          visible={showCustomTagModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowCustomTagModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { padding: 24 }]}>
              <Text style={styles.modalTitle}>Add Custom Tag</Text>
              <TextInput
                style={[styles.textInput, { marginTop: 16 }]}
                placeholder="Enter tag name..."
                value={newTagInput}
                onChangeText={setNewTagInput}
                autoFocus
              />
              <View style={[styles.editModalActions, { marginTop: 24 }]}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowCustomTagModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.updateButton, addingTag && { opacity: 0.7 }]}
                  onPress={addCustomTag}
                  disabled={addingTag}
                >
                  {addingTag ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.updateButtonText}>Add Tag</Text>
                  )}
                </TouchableOpacity>
              </View>
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
                  <X size={24} color={colors.text} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.editForm}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Enter record title"
                  placeholderTextColor={colors.textSecondary}
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
                      onPress={() => handleToggleEditTag(tag.id)}
                    >
                      <tag.icon
                        size={16}
                        color={
                          editTags.includes(tag.id)
                            ? tag.color
                            : colors.textSecondary
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
      <AlertComponent />
    </SafeAreaView>
  );
}
