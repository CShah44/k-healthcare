import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
  ActivityIndicator,
  Linking,
  TextInput,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Search,
  Download,
  Eye,
  Upload,
  TestTube2,
  Pill,
  FileImage,
  Plus,
  Tag,
  X,
  Filter,
  FolderOpen,
  Heart,
  Brain,
  Bone,
  Activity,
  Check,
  Edit3,
  Trash2,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/constants/firebase';


import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { router } from 'expo-router';
import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';
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
    color: Colors.error,
    isCustom: false,
  },
];

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
async function decryptFileFromUrl(url: string, record: any, user: any): Promise<string> {
  // Download encrypted file
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  // Convert encrypted binary to base64
  const encryptedBase64 = uint8ArrayToBase64(new Uint8Array(arrayBuffer));

  // Get encryption key
  const key = getUserEncryptionKey(user.uid);

  // Decrypt
  const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key);
  const decryptedBytes = decrypted.words.reduce((arr: number[], word: number) => {
    arr.push((word >> 24) & 0xff, (word >> 16) & 0xff, (word >> 8) & 0xff, word & 0xff);
    return arr;
  }, []);
  const decryptedUint8 = new Uint8Array(decryptedBytes).slice(0, decrypted.sigBytes);

  if (Platform.OS === 'web') {
    // Create a Blob and object URL for browser viewing
    const blob = new Blob([decryptedUint8], { type: record.fileType });
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } else {
    // Convert to base64 data URI for WebView (mobile)
    return `data:${record.fileType};base64,${uint8ArrayToBase64(decryptedUint8)}`;
  }
}


export default function MedicalRecordsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCustomTagModal, setShowCustomTagModal] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [addingTag, setAddingTag] = useState(false);

  // Edit and Delete states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Add state for PDF preview
  const [pdfPreviewUri, setPdfPreviewUri] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const { user } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const filterOpacity = useSharedValue(0);
  const filterTranslateX = useSharedValue(-30);

  useEffect(() => {
    // Animate header entrance
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

    // Animate filters with delay
    setTimeout(() => {
      filterOpacity.value = withTiming(1, { duration: 600 });
      filterTranslateX.value = withSpring(0, { damping: 12, stiffness: 80 });
    }, 200);
  }, []);

  // Real-time Firebase syncing
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = query(
      collection(db, 'patients', user.uid, 'records'),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMedicalRecords(records);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to fetch records:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Real-time user's custom tags syncing
  useEffect(() => {
    if (!user) return;

    setLoadingTags(true);

    const unsubscribeUserTags = onSnapshot(
      doc(db, 'userTags', user.uid),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setCustomTags(data.customTags || []);
        } else {
          setCustomTags([]);
        }
        setLoadingTags(false);
      },
      (error) => {
        console.error('Error listening to custom tags:', error);
        setLoadingTags(false);
      }
    );

    return () => unsubscribeUserTags();
  }, [user]);

  const saveUserCustomTags = async (tags: string[]) => {
    if (!user) return;

    try {
      await setDoc(
        doc(db, 'userTags', user.uid),
        {
          customTags: tags,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving custom tags:', error);
      throw error;
    }
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const filterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: filterOpacity.value,
    transform: [{ translateX: filterTranslateX.value }],
  }));

  // Filter records based on search, tags, and type
  const filteredRecords = medicalRecords.filter((record) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      record.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.lab?.toLowerCase().includes(searchQuery.toLowerCase());

    // Tag filter
    const matchesTags =
      selectedTags.length === 0 ||
      (record.tags &&
        record.tags.some((tag: string) => selectedTags.includes(tag)));

    // Type filter
    const matchesType =
      selectedFilter === 'all' || record.type === selectedFilter;

    return matchesSearch && matchesTags && matchesType;
  });

  // Get unique tags from records and combine with custom tags
  const availableTags = Array.from(
    new Set(
      medicalRecords
        .flatMap((record) => record.tags || [])
        .concat(PREDEFINED_TAGS.map((tag) => tag.id))
        .concat(customTags)
    )
  );

  const filters = [
    { id: 'all', label: 'All', count: filteredRecords.length },
    {
      id: 'uploaded',
      label: 'My Uploads',
      count: filteredRecords.filter((r) => r.type === 'uploaded').length,
    },
    {
      id: 'lab_reports',
      label: 'Lab Reports',
      count: filteredRecords.filter((r) => r.type === 'lab_reports').length,
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      count: filteredRecords.filter((r) => r.type === 'prescriptions').length,
    },
  ];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'reviewed':
        return Colors.medical.green;
      case 'high':
      case 'critical':
        return Colors.medical.red;
      case 'active':
        return Colors.medical.blue;
      case 'archived':
        return Colors.textLight;
      default:
        return Colors.textSecondary;
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

    // Check if tag already exists (in predefined or custom tags)
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

      // Add to custom tags and select it
      const newCustomTags = [...customTags, trimmedTag];
      setCustomTags(newCustomTags);
      setSelectedTags((prev) => [...prev, trimmedTag]);

      // Save to database
      await saveUserCustomTags(newCustomTags);

      setNewTagInput('');
      setShowCustomTagModal(false);

      // Show success feedback
      showAlert(
        'Success',
        `Tag "${trimmedTag}" has been added and is now available for filtering!`
      );
    } catch (error) {
      console.error('Error adding custom tag:', error);
      showAlert('Error', 'Failed to save custom tag. Please try again.');

      // Revert local changes on error
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

      // Save to database
      await saveUserCustomTags(newCustomTags);
    } catch (error) {
      console.error('Error removing custom tag:', error);
      showAlert('Error', 'Failed to remove custom tag. Please try again.');

      // Revert local changes on error
      setCustomTags((prev) => [...prev, tagId]);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const addTagToRecord = async (recordId: string, tagId: string) => {
    try {
      const record = medicalRecords.find((r) => r.id === recordId);
      if (!record) return;

      const currentTags = record.tags || [];
      if (currentTags.includes(tagId)) return;

      const updatedTags = [...currentTags, tagId];

      await updateDoc(doc(db, 'patients', user!.uid, 'records', recordId), {
        tags: updatedTags,
      });
    } catch (error) {
      console.error('Error adding tag:', error);
      showAlert('Error', 'Failed to add tag to record');
    }
  };

  const removeTagFromRecord = async (recordId: string, tagId: string) => {
    try {
      const record = medicalRecords.find((r) => r.id === recordId);
      if (!record) return;

      const currentTags = record.tags || [];
      const updatedTags = currentTags.filter((tag: string) => tag !== tagId);

      await updateDoc(doc(db, 'patients', user!.uid, 'records', recordId), {
        tags: updatedTags,
      });
    } catch (error) {
      console.error('Error removing tag:', error);
      showAlert('Error', 'Failed to remove tag from record');
    }
  };

  // Edit and Delete functions
  const canEditRecord = (record: any): boolean => {
    // Users can edit/delete their own records
    // Also allow editing of self-uploaded records
    return record.type === 'uploaded' || record.source !== 'lab_uploaded';
  };

  const handleEditRecord = (record: any) => {
    if (!canEditRecord(record)) {
      showAlert(
        'Permission Denied',
        'You can only edit your own uploaded records.'
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
      showAlert('Error', 'Please enter a valid title');
      return;
    }

    try {
      setUpdating(true);

      await updateDoc(
        doc(db, 'patients', user!.uid, 'records', selectedRecord.id),
        {
          title: editTitle.trim(),
          tags: editTags,
          updatedAt: new Date(),
        }
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
    console.log('🗑️ Delete clicked for record:', record);
    
    if (!canEditRecord(record)) {
      showAlert(
        'Permission Denied',
        'You can only delete your own uploaded records.'
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
              
              // Extract file path from Supabase URL
              const fileUrl = record.fileUrl;
              if (fileUrl && fileUrl.includes('supabase.co')) {
                try {
                  // Parse the Supabase URL to extract bucket and file path
                  // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
                  const url = new URL(fileUrl);
                  const pathParts = url.pathname.split('/');
                  
                  // Find the bucket name (after 'public')
                  const publicIndex = pathParts.findIndex(part => part === 'public');
                  if (publicIndex !== -1 && publicIndex + 1 < pathParts.length) {
                    const bucket = pathParts[publicIndex + 1]; // Should be 'svastheya'
                    const filePath = pathParts.slice(publicIndex + 2).join('/'); // Everything after bucket name
                    
                    console.log('🗑️ Deleting from Supabase:', { bucket, filePath });
                    
                    // Delete from Supabase Storage
                    const { error: storageError } = await supabase
                      .storage
                      .from(bucket)
                      .remove([filePath]);
                      
                    if (storageError) {
                      console.error('Error deleting from storage:', storageError);
                      // Continue with Firestore deletion even if storage deletion fails
                    } else {
                      console.log('✅ Successfully deleted from Supabase storage');
                    }
                  } else {
                    console.error('Could not parse Supabase URL structure:', fileUrl);
                  }
                } catch (urlError) {
                  console.error('Error parsing Supabase URL:', urlError);
                  // Continue with Firestore deletion even if URL parsing fails
                }
              }
              
              // Delete from Firestore
              await deleteDoc(
                doc(db, 'patients', user!.uid, 'records', record.id)
              );
              
              showAlert('Success', 'Record deleted successfully');
            } catch (error) {
              console.error('Error deleting record:', error);
              showAlert('Error', 'Failed to delete record');
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Medical Records</Text>
            <Text style={styles.headerSubtitle}>
              {loading ? 'Loading...' : `${filteredRecords.length} documents`}
            </Text>
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
                color={showSearch ? Colors.primary : Colors.text}
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
                color={selectedTags.length > 0 ? Colors.primary : Colors.text}
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
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => router.push('/(patient-tabs)/upload-record')}
            >
              <Plus size={20} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Search Bar */}
        {showSearch && (
          <Animated.View
            style={styles.searchContainer}
            entering={FadeInDown.springify()}
          >
            <View style={styles.searchInputContainer}>
              <Search size={18} color={Colors.textSecondary} strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search records, doctors, labs..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.textLight}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={18} color={Colors.textSecondary} strokeWidth={2} />
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
                      onPress={() => toggleTag(tagId)}
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

        {/* Filter Tabs */}
        <Animated.View style={[styles.filtersContainer, filterAnimatedStyle]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => {
              const isSelected = selectedFilter === filter.id;

              return (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterTab,
                    isSelected && styles.filterTabActive,
                  ]}
                  onPress={() => setSelectedFilter(filter.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isSelected && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                  <View
                    style={[
                      styles.filterCount,
                      isSelected && styles.filterCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        isSelected && styles.filterCountTextActive,
                      ]}
                    >
                      {filter.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading your records...</Text>
          </View>
        ) : (
          /* Records List */
          <ScrollView
            style={styles.recordsList}
            contentContainerStyle={styles.recordsContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => {
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
                        setPreviewModalVisible(true);
                      }}
                    >
                      <View style={styles.recordCardContent}>
                        {record.isNew && <View style={styles.newBadge} />}

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
                              <Text
                                style={styles.recordTitle}
                                numberOfLines={2}
                              >
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

                              <View style={styles.recordDetails}>
                                <Text style={styles.fileInfo}>
                                  {record.fileType} •{' '}
                                  {record.fileSize || 'Unknown size'}
                                </Text>
                                {record.source === 'lab_uploaded' && (
                                  <View style={styles.labBadge}>
                                    <Text style={styles.labBadgeText}>
                                      Lab Report
                                    </Text>
                                  </View>
                                )}
                              </View>
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
                            <TouchableOpacity style={styles.actionButton}>
                              <Download
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

                        {record.status && record.status !== 'archived' && (
                          <View style={styles.recordFooter}>
                            <View
                              style={[
                                styles.statusIndicator,
                                {
                                  backgroundColor: `${getStatusColor(
                                    record.status
                                  )}20`,
                                },
                              ]}
                            >
                              <View
                                style={[
                                  styles.statusDot,
                                  {
                                    backgroundColor: getStatusColor(
                                      record.status
                                    ),
                                  },
                                ]}
                              />
                              <Text
                                style={[
                                  styles.statusText,
                                  { color: getStatusColor(record.status) },
                                ]}
                              >
                                {record.status.charAt(0).toUpperCase() +
                                  record.status.slice(1)}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })
            ) : (
              /* Empty State */
              <View style={styles.emptyState}>
                <FolderOpen
                  size={64}
                  color={Colors.textLight}
                  strokeWidth={1}
                />
                <Text style={styles.emptyTitle}>
                  {searchQuery || selectedTags.length > 0
                    ? 'No matching records found'
                    : 'No medical records yet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery || selectedTags.length > 0
                    ? 'Try adjusting your search or filters'
                    : 'Upload your medical documents to get started'}
                </Text>
                {!searchQuery && selectedTags.length === 0 && (
                  <TouchableOpacity
                    style={styles.uploadEmptyButton}
                    onPress={() => router.push('/(patient-tabs)/upload-record')}
                  >
                    <Upload size={16} color={Colors.primary} strokeWidth={2} />
                    <Text style={styles.uploadEmptyText}>Upload Document</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.bottomSpacing} />
          </ScrollView>
        )}

        {/* Tag Filter Modal */}
        <Modal
          visible={showTagModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowTagModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.tagModalContent}>
              <View style={styles.tagModalHeader}>
                <Text style={styles.modalTitle}>Filter by Tags</Text>
                <View style={styles.tagModalHeaderActions}>
                  <TouchableOpacity
                    style={styles.addCustomTagHeaderButton}
                    onPress={() => {
                      setShowTagModal(false);
                      setShowCustomTagModal(true);
                    }}
                  >
                    <Plus size={16} color={Colors.primary} strokeWidth={2} />
                    <Text style={styles.addCustomTagHeaderText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowTagModal(false)}>
                    <X size={24} color={Colors.text} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.tagsList}>
                {loadingTags ? (
                  <View style={styles.loadingTagsContainer}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.loadingTagsText}>
                      Loading your tags...
                    </Text>
                  </View>
                ) : (
                  getAllAvailableTags().map((tag) => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagOption,
                        selectedTags.includes(tag.id) &&
                          styles.tagOptionSelected,
                      ]}
                      onPress={() => toggleTag(tag.id)}
                    >
                      <View style={styles.tagOptionLeft}>
                        <tag.icon size={18} color={tag.color} strokeWidth={2} />
                        <Text style={styles.tagOptionText}>{tag.label}</Text>
                        {tag.isCustom && (
                          <View style={styles.customTagBadge}>
                            <Text style={styles.customTagBadgeText}>
                              Custom
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.tagOptionRight}>
                        {selectedTags.includes(tag.id) && (
                          <View
                            style={[
                              styles.tagCheckmark,
                              { backgroundColor: tag.color },
                            ]}
                          >
                            <Text style={styles.tagCheckmarkText}>✓</Text>
                          </View>
                        )}
                        {tag.isCustom && (
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              removeCustomTag(tag.id);
                            }}
                            style={styles.removeTagButton}
                          >
                            <X
                              size={14}
                              color={Colors.textLight}
                              strokeWidth={2}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

              <View style={styles.tagModalActions}>
                <TouchableOpacity
                  style={styles.clearTagsButton}
                  onPress={() => setSelectedTags([])}
                >
                  <Text style={styles.clearTagsText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyTagsButton}
                  onPress={() => setShowTagModal(false)}
                >
                  <Text style={styles.applyTagsText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Custom Tag Modal */}
        <Modal
          visible={showCustomTagModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCustomTagModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.customTagModalContent}>
              <View style={styles.customTagModalHeader}>
                <Text style={styles.modalTitle}>Add Custom Tag</Text>
                <TouchableOpacity onPress={() => setShowCustomTagModal(false)}>
                  <X size={24} color={Colors.text} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                Create a custom category to better organize your medical records
              </Text>

              <View style={styles.customTagInputContainer}>
                <TextInput
                  style={styles.customTagInput}
                  value={newTagInput}
                  onChangeText={setNewTagInput}
                  placeholder="Enter tag name (e.g., Dermatology, Dental)"
                  placeholderTextColor={Colors.textLight}
                  autoFocus
                  maxLength={20}
                />
              </View>

              <View style={styles.customTagModalActions}>
                <TouchableOpacity
                  style={styles.cancelCustomTagButton}
                  onPress={() => {
                    setNewTagInput('');
                    setShowCustomTagModal(false);
                  }}
                >
                  <Text style={styles.cancelCustomTagText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.addCustomTagConfirmButton,
                    (!newTagInput.trim() || addingTag) &&
                      styles.addCustomTagConfirmButtonDisabled,
                  ]}
                  onPress={addCustomTag}
                  disabled={!newTagInput.trim() || addingTag}
                >
                  {addingTag ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Check size={16} color="white" strokeWidth={2} />
                  )}
                  <Text style={styles.addCustomTagConfirmText}>
                    {addingTag ? 'Adding...' : 'Add Tag'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Preview Modal */}
        <Modal
          visible={previewModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setPreviewModalVisible(false)}
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
                      onPress={() => setPreviewModalVisible(false)}
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

                  {/* Tag Management */}
                  <View style={styles.tagManagement}>
                    <Text style={styles.tagManagementTitle}>Tags:</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View style={styles.tagManagementList}>
                        {getAllAvailableTags().map((tag) => {
                          const isSelected = selectedRecord.tags?.includes(
                            tag.id
                          );
                          return (
                            <TouchableOpacity
                              key={tag.id}
                              style={[
                                styles.tagManagementItem,
                                isSelected && {
                                  backgroundColor: `${tag.color}20`,
                                },
                              ]}
                              onPress={() => {
                                if (isSelected) {
                                  removeTagFromRecord(
                                    selectedRecord.id,
                                    tag.id
                                  );
                                } else {
                                  addTagToRecord(selectedRecord.id, tag.id);
                                }
                              }}
                            >
                              <tag.icon
                                size={14}
                                color={tag.color}
                                strokeWidth={2}
                              />
                              <Text
                                style={[
                                  styles.tagManagementText,
                                  isSelected && { color: tag.color },
                                ]}
                              >
                                {tag.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>

                  {selectedRecord.fileType?.startsWith('image') ? (
                    <TouchableOpacity
                      style={styles.openPdfButton}
                      onPress={async () => {
                        setPdfPreviewUri(null);
                        setShowPdfPreview(true);
                        try {
                          const decryptedUri = await decryptFileFromUrl(selectedRecord.fileUrl, selectedRecord, user);
                          setPdfPreviewUri(decryptedUri);
                        } catch (e) {
                          showAlert('Error', 'Failed to decrypt and open image.');
                          setShowPdfPreview(false);
                        }
                      }}
                    >
                      <Text style={styles.openPdfText}>View Image</Text>
                    </TouchableOpacity>
                  ) : selectedRecord.fileType === 'application/pdf' ? (
                    <TouchableOpacity
                      style={styles.openPdfButton}
                      onPress={async () => {
                        setPdfPreviewUri(null);
                        setShowPdfPreview(true);
                        try {
                          const decryptedUri = await decryptFileFromUrl(selectedRecord.fileUrl, selectedRecord, user);
                          setPdfPreviewUri(decryptedUri);
                        } catch (e) {
                          showAlert('Error', 'Failed to decrypt and open PDF.');
                          setShowPdfPreview(false);
                        }
                      }}
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

        {/* PDF Preview Modal */}
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
              style={{ flex: 1, width: '100%', height: '100%', objectFit: 'contain' }}
              alt="Image Preview"
            />
          ) : (
            <iframe
              src={pdfPreviewUri}
              style={{ flex: 1, width: '100%', height: '100%' }}
              title="PDF Preview"
            />
          )}
        </View>
      ) : (
        <WebView
          source={{ uri: pdfPreviewUri }}
          style={{ flex: 1, marginTop: 60 }}
          useWebKit
          originWhitelist={['*']}
          javaScriptEnabled
          scalesPageToFit
        />
      )
    ) : (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 16 }}>Decrypting file...</Text>
      </View>
    )}
  </SafeAreaView>
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 16,
  },

  headerLeft: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },

  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    position: 'relative',
  },

  headerButtonActive: {
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
  },

  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterBadgeText: {
    fontSize: 10,
    color: 'white',
    fontFamily: 'Inter-Bold',
  },

  uploadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },

  selectedTagsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  selectedTagsList: {
    flexDirection: 'row',
    gap: 8,
  },

  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },

  selectedTagText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },

  filtersContainer: {
    marginBottom: 20,
  },

  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },

  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    gap: 8,
  },

  filterTabActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },

  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },

  filterTextActive: {
    color: '#ffffff',
  },

  filterCount: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },

  filterCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  filterCountText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },

  filterCountTextActive: {
    color: '#ffffff',
  },

  recordsList: {
    flex: 1,
  },

  recordsContent: {
    paddingHorizontal: 20,
  },

  recordCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    position: 'relative',
  },

  recordCardContent: {
    padding: 16,
  },

  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  recordMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    marginBottom: 6,
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

  recordDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  fileInfo: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
  },

  labBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  labBadgeText: {
    fontSize: 10,
    color: Colors.medical.green,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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

  recordFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },

  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
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
    marginBottom: 24,
  },

  uploadEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },

  uploadEmptyText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },

  bottomSpacing: {
    height: 100,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    marginTop: 16,
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

  tagManagement: {
    marginBottom: 20,
  },

  tagManagementTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 8,
  },

  tagManagementList: {
    flexDirection: 'row',
    gap: 8,
  },

  tagManagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 4,
  },

  tagManagementText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
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

  tagModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '70%',
  },

  tagModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  tagModalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  addCustomTagHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: 12,
    gap: 4,
  },

  addCustomTagHeaderText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },

  tagsList: {
    maxHeight: 300,
  },

  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },

  tagOptionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },

  tagOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  tagOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  tagOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },

  customTagBadge: {
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },

  customTagBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
    textTransform: 'uppercase',
  },

  removeTagButton: {
    padding: 4,
  },

  tagCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tagCheckmarkText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },

  tagModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },

  clearTagsButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textLight,
    alignItems: 'center',
  },

  clearTagsText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  applyTagsButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },

  applyTagsText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  customTagModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },

  customTagModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
    lineHeight: 20,
  },

  customTagInputContainer: {
    marginBottom: 24,
  },

  customTagInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  customTagModalActions: {
    flexDirection: 'row',
    gap: 12,
  },

  cancelCustomTagButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textLight,
    alignItems: 'center',
  },

  cancelCustomTagText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  addCustomTagConfirmButton: {
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

  addCustomTagConfirmButtonDisabled: {
    backgroundColor: Colors.textLight,
  },

  addCustomTagConfirmText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  loadingTagsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  loadingTagsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },

  // Edit Modal Styles
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
