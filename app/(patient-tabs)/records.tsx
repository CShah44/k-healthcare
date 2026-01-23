import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import * as Sharing from 'expo-sharing';
import { createRecordsStyles } from '../../styles/records';
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
import { useTheme } from '@/contexts/ThemeContext';
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

// Predefined tags for medical records - using theme colors
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
  user: any
): Promise<string> {
  // Download encrypted file
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  // Convert encrypted binary to base64
  const encryptedBase64 = uint8ArrayToBase64(new Uint8Array(arrayBuffer));

  // Get encryption key
  const key = getUserEncryptionKey(user.uid);

  // Decrypt
  const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key);
  const decryptedBytes = decrypted.words.reduce(
    (arr: number[], word: number) => {
      arr.push(
        (word >> 24) & 0xff,
        (word >> 16) & 0xff,
        (word >> 8) & 0xff,
        word & 0xff
      );
      return arr;
    },
    []
  );
  const decryptedUint8 = new Uint8Array(decryptedBytes).slice(0, decrypted.sigBytes);
  if (Platform.OS === 'web') {
    const blob = new Blob([decryptedUint8], { type: record.fileType });
    if (decryptedUint8.length === 0) {
      throw new Error('Decryption failed or empty content');
    }
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  }
  else {
    const base64Data = uint8ArrayToBase64(decryptedUint8);
    const fileExtension = record.fileType.includes('pdf') ? 'pdf' : 'jpg';
    // Use documentDirectory as fallback if cacheDirectory is not available
    const cacheDir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '';
    // Sanitize filename to avoid path issues
    const sanitizedTitle = (record.title || 'record').replace(/[^a-zA-Z0-9]/g, '_');
    const path = `${cacheDir}${sanitizedTitle}.${fileExtension}`;

    await FileSystem.writeAsStringAsync(path, base64Data, {
      encoding: 'base64' as any,
    });

    return path; // returns file:// URI
  }
}

export default function MedicalRecordsScreen() {

  const { colors, isDarkMode } = useTheme();
  const styles = createRecordsStyles(colors, isDarkMode);
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
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [addingTag, setAddingTag] = useState(false);

  // Edit and Delete states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  // Add state for PDF preview
  const [pdfPreviewUri, setPdfPreviewUri] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  useEffect(() => {
    if (
      Platform.OS === 'web' &&
      showPdfPreview &&
      pdfPreviewUri &&
      selectedRecord?.fileType === 'application/pdf'
    ) {
      const newWindow = window.open(pdfPreviewUri, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('Popup blocked! Please allow popups for this site.');
      }
      setShowPdfPreview(false);
    }
  }, [showPdfPreview, pdfPreviewUri, selectedRecord]);


  const { user } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();

  // Animation values - subtle animations for both web and mobile
  const headerOpacity = useSharedValue(1);
  const headerTranslateY = useSharedValue(0);
  const filterOpacity = useSharedValue(1);
  const filterTranslateX = useSharedValue(0);
  // Tab animation - animate when filter changes
  const tabScale = useSharedValue(1);

  useEffect(() => {
    // Subtle entrance animations - very gentle
    if (Platform.OS === 'web') {
      headerOpacity.value = withTiming(1, { duration: 400 });
      headerTranslateY.value = withSpring(0, { damping: 20, stiffness: 100 });

      // Subtle filter animation
      setTimeout(() => {
        filterOpacity.value = withTiming(1, { duration: 300 });
        filterTranslateX.value = withSpring(0, { damping: 18, stiffness: 90 });
      }, 100);
    }
  }, []);

  // Animate tab selection - subtle bounce
  useEffect(() => {
    tabScale.value = 0.96;
    tabScale.value = withSpring(1, { damping: 18, stiffness: 200 });
  }, [selectedFilter]);

  const tabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tabScale.value }],
  }));

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

  // Sync selectedRecord with latest data from medicalRecords (for real-time updates)
  useEffect(() => {
    if (selectedRecord && previewModalVisible) {
      const updatedRecord = medicalRecords.find((r) => r.id === selectedRecord.id);
      if (updatedRecord) {
        setSelectedRecord(updatedRecord);
      }
    }
  }, [medicalRecords, previewModalVisible]);

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

  // Helper function to check if a record is a prescription
  const isPrescription = (record: any): boolean => {
    return (
      record.type === 'prescriptions' ||
      record.type === 'prescription' ||
      record.tags?.includes('prescriptions') ||
      record.tags?.includes('prescription')
    );
  };

  // Helper function to check if a record matches a filter by tags
  const matchesFilterByTags = (record: any, filterId: string): boolean => {
    if (filterId === 'all') return true;
    if (filterId === 'prescriptions') return isPrescription(record);
    if (filterId === 'lab_reports') {
      return (
        record.type === 'lab_reports' ||
        record.source === 'lab_uploaded' ||
        record.tags?.includes('lab_reports')
      );
    }
    if (filterId === 'uploaded') {
      return record.type === 'uploaded' || record.source === 'user_uploaded';
    }
    // Check if any of the record's tags match predefined tag IDs
    const predefinedTagIds = PREDEFINED_TAGS.map((tag) => tag.id);
    return (
      record.tags?.some((tag: string) =>
        predefinedTagIds.includes(tag) && tag === filterId
      ) || false
    );
  };

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

    // Type filter - check type, source, and tags
    const matchesType =
      selectedFilter === 'all' ||
      record.type === selectedFilter ||
      matchesFilterByTags(record, selectedFilter);

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
      count: filteredRecords.filter((r) =>
        r.type === 'uploaded' || r.source === 'user_uploaded'
      ).length,
    },
    {
      id: 'lab_reports',
      label: 'Lab Reports',
      count: filteredRecords.filter((r) =>
        r.type === 'lab_reports' ||
        r.source === 'lab_uploaded' ||
        r.tags?.includes('lab_reports')
      ).length,
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      count: filteredRecords.filter((r) => isPrescription(r)).length,
    },
  ];

  // Use theme-aware colors
  const medicalColors = Colors.medical;
  const textLight = colors.textTertiary;
  const primary = Colors.primary;

  const getRecordIcon = (type: string, source: string) => {
    if (source === 'lab_uploaded') {
      return { icon: TestTube2, color: '#10B981', bgColor: '#D1FAE5' }; // Pastel green
    }
    switch (type) {
      case 'prescriptions':
        return { icon: Pill, color: '#EAB308', bgColor: '#FEF9C3' }; // Pastel yellow
      case 'uploaded':
        return { icon: FileImage, color: '#3B82F6', bgColor: '#DBEAFE' }; // Pastel blue
      case 'lab_reports':
        return { icon: TestTube2, color: '#10B981', bgColor: '#D1FAE5' }; // Pastel green
      default:
        return { icon: FileText, color: '#3B82F6', bgColor: '#DBEAFE' }; // Pastel blue
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'reviewed':
        return medicalColors.green;
      case 'high':
      case 'critical':
        return medicalColors.red;
      case 'active':
        return medicalColors.blue;
      case 'archived':
        return textLight;
      default:
        return colors.textSecondary;
    }
  };

  const getTagInfo = (tagId: string) => {
    const predefinedTag = PREDEFINED_TAGS.find((tag) => tag.id === tagId);
    return (
      predefinedTag || {
        id: tagId,
        label: tagId.charAt(0).toUpperCase() + tagId.slice(1),
        icon: Tag,
        color: primary,
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
        color: primary,
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

      // Optimistic update - update UI immediately
      setMedicalRecords((prev: any[]) =>
        prev.map((r) =>
          r.id === recordId ? { ...r, tags: updatedTags } : r
        )
      );

      // Update selectedRecord if it's the same record
      if (selectedRecord?.id === recordId) {
        setSelectedRecord((prev: any) => ({
          ...prev,
          tags: updatedTags,
        }));
      }

      await updateDoc(doc(db, 'patients', user!.uid, 'records', recordId), {
        tags: updatedTags,
      });
    } catch (error) {
      console.error('Error adding tag:', error);
      // Revert optimistic update on error
      const record = medicalRecords.find((r) => r.id === recordId);
      if (record) {
        setMedicalRecords((prev: any[]) =>
          prev.map((r) =>
            r.id === recordId ? { ...r, tags: record.tags || [] } : r
          )
        );
        if (selectedRecord?.id === recordId) {
          setSelectedRecord((prev: any) => ({
            ...prev,
            tags: record.tags || [],
          }));
        }
      }
      showAlert('Error', 'Failed to add tag to record');
    }
  };

  const removeTagFromRecord = async (recordId: string, tagId: string) => {
    try {
      const record = medicalRecords.find((r) => r.id === recordId);
      if (!record) return;

      const currentTags = record.tags || [];
      const updatedTags = currentTags.filter((tag: string) => tag !== tagId);

      // Optimistic update - update UI immediately
      setMedicalRecords((prev: any[]) =>
        prev.map((r) =>
          r.id === recordId ? { ...r, tags: updatedTags } : r
        )
      );

      // Update selectedRecord if it's the same record
      if (selectedRecord?.id === recordId) {
        setSelectedRecord((prev: any) => ({
          ...prev,
          tags: updatedTags,
        }));
      }

      await updateDoc(doc(db, 'patients', user!.uid, 'records', recordId), {
        tags: updatedTags,
      });
    } catch (error) {
      console.error('Error removing tag:', error);
      // Revert optimistic update on error
      const record = medicalRecords.find((r) => r.id === recordId);
      if (record) {
        setMedicalRecords((prev: any[]) =>
          prev.map((r) =>
            r.id === recordId ? { ...r, tags: record.tags || [] } : r
          )
        );
        if (selectedRecord?.id === recordId) {
          setSelectedRecord((prev: any) => ({
            ...prev,
            tags: record.tags || [],
          }));
        }
      }
      showAlert('Error', 'Failed to remove tag from record');
    }
  };

  // Edit and Delete functions
  const canEditRecord = (record: any): boolean => {
    // Users can only edit/delete their own uploaded records
    return record.source === 'user_uploaded';
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
              setDeletingRecordId(record.id);

              // Extract file path from Supabase URL
              const fileUrl = record.fileUrl;
              if (fileUrl && fileUrl.includes('supabase.co')) {
                try {
                  // Parse the Supabase URL to extract bucket and file path
                  // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
                  const url = new URL(fileUrl);
                  const pathParts = url.pathname.split('/');

                  // Find the bucket name (after 'public')
                  const publicIndex = pathParts.findIndex(
                    (part) => part === 'public'
                  );
                  if (
                    publicIndex !== -1 &&
                    publicIndex + 1 < pathParts.length
                  ) {
                    const bucket = pathParts.slice(publicIndex + 1)[0]; // Should be 'svastheya'
                    const filePath = pathParts.slice(publicIndex + 2).join('/'); // Everything after bucket name

                    console.log('🗑️ Deleting from Supabase:', {
                      bucket,
                      filePath,
                    });

                    // Delete from Supabase Storage
                    const { error: storageError } = await supabase.storage
                      .from(bucket)
                      .remove([filePath]);

                    if (storageError) {
                      console.error(
                        'Error deleting from storage:',
                        storageError
                      );
                      // Continue with Firestore deletion even if storage deletion fails
                    } else {
                      console.log(
                        '✅ Successfully deleted from Supabase storage'
                      );
                    }
                  }
                } catch (urlError) {
                  console.error('Error parsing Supabase URL:', urlError);
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
              setDeletingRecordId(null);
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

  return (
    <SafeAreaView style={Platform.OS === 'ios' || Platform.OS === 'android' ? mobileStyles.container : styles.container}>
      <LinearGradient
        colors={isDarkMode ? [colors.surface, colors.surfaceSecondary] : ['#FAF8F3', '#FAF8F3']}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <Animated.View style={[styles.header, Platform.OS === 'web' ? headerAnimatedStyle : {}]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Medical Records</Text>

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
                color={showSearch ? primary : colors.text}
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
                color={selectedTags.length > 0 ? primary : colors.text}
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
            entering={Platform.OS === 'web' ? FadeInDown.springify() : undefined}
          >
            <View style={styles.searchInputContainer}>
              <Search size={18} color={colors.textSecondary} strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search records, doctors, labs..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={textLight}
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
        <Animated.View style={[styles.filtersContainer, Platform.OS === 'web' ? filterAnimatedStyle : {}]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => {
              const isSelected = selectedFilter === filter.id;

              return (
                <Animated.View
                  key={filter.id}
                  style={isSelected ? tabAnimatedStyle : {}}
                >
                  <TouchableOpacity
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
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primary} />
            <Text style={styles.loadingText}>Loading your records...</Text>
          </View>
        ) : (
          /* Records List */
          <ScrollView
            style={Platform.OS === 'ios' || Platform.OS === 'android' ? mobileStyles.recordsList : styles.recordsList}
            contentContainerStyle={Platform.OS === 'ios' || Platform.OS === 'android' ? mobileStyles.recordsContent : styles.recordsContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredRecords.length > 0 ? (
              (() => {
                // Group records by Month Year
                const groups: { title: string; data: any[] }[] = [];

                filteredRecords.forEach((record) => {
                  const date = record.uploadedAt?.toDate
                    ? record.uploadedAt.toDate()
                    : record.uploadedAt?.seconds
                      ? new Date(record.uploadedAt.seconds * 1000)
                      : new Date();

                  const monthYear = date.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  });

                  let group = groups.find(g => g.title === monthYear);
                  if (!group) {
                    group = { title: monthYear, data: [] };
                    groups.push(group);
                  }
                  group.data.push(record);
                });

                return groups.map((group) => (
                  <View key={group.title} style={{ marginBottom: 12 }}>
                    <Text style={styles.sectionHeader}>{group.title}</Text>
                    {group.data.map((record: any, index: number) => {
                      const { icon: IconComponent, color, bgColor } = getRecordIcon(
                        record.type,
                        record.source
                      );
                      const canEdit = canEditRecord(record);

                      return (
                        <Animated.View
                          key={`${record.id}-${selectedFilter}`}
                          style={{ marginBottom: 8 }}
                          entering={FadeInDown.springify().damping(15)}
                        >
                          <TouchableOpacity
                            style={Platform.OS === 'ios' || Platform.OS === 'android' ? mobileStyles.recordCard : styles.recordCard}
                            activeOpacity={0.7}
                            onPress={() => {
                              setSelectedRecord(record);
                              setPreviewModalVisible(true);
                            }}
                          >
                            <View style={styles.recordCardContent}>
                              <View style={styles.recordMain}>
                                {/* Left: Icon and Content */}
                                <View style={styles.recordLeft}>
                                  <View
                                    style={[
                                      styles.recordIcon,
                                      { backgroundColor: bgColor || `${color}15` },
                                    ]}
                                  >
                                    <IconComponent
                                      size={18}
                                      color={color}
                                      strokeWidth={2}
                                    />
                                  </View>
                                  <View style={styles.recordInfo}>
                                    <Text
                                      style={styles.recordTitle}
                                      numberOfLines={1}
                                    >
                                      {record.title}
                                    </Text>

                                    {/* Metadata Row */}
                                    <View style={styles.recordMetaRow}>
                                      <Text style={styles.recordSource}>
                                        {record.source === 'lab_uploaded'
                                          ? record.lab || 'Lab'
                                          : isPrescription(record)
                                            ? record.doctor || record.doctorName || 'Prescription'
                                            : record.doctor || record.doctorName || 'Self-uploaded'}
                                      </Text>
                                      <View style={styles.metaDot} />
                                      <Text style={styles.recordDate}>
                                        {record.uploadedAt?.toDate
                                          ? record.uploadedAt
                                            .toDate()
                                            .toLocaleDateString('en-US', {
                                              day: 'numeric',
                                              month: 'short',
                                            })
                                          : record.uploadedAt?.seconds
                                            ? new Date(
                                              record.uploadedAt.seconds * 1000
                                            ).toLocaleDateString('en-US', {
                                              day: 'numeric',
                                              month: 'short',
                                            })
                                            : 'N/A'}
                                      </Text>
                                    </View>

                                    {/* Category Badge and Tags - keep minimal */}
                                    {record.tags && record.tags.length > 0 && (
                                      <View style={styles.recordDetailsRow}>
                                        {record.tags
                                          .filter((tagId: string) => {
                                            const predefinedTag = PREDEFINED_TAGS.find((t) => t.id === tagId);
                                            return predefinedTag &&
                                              !['prescriptions', 'prescription', 'lab_reports'].includes(tagId);
                                          })
                                          .slice(0, 2)
                                          .map((tagId: string) => {
                                            const tagInfo = getTagInfo(tagId);
                                            return (
                                              <View
                                                key={tagId}
                                                style={[
                                                  styles.recordTag,
                                                  { borderColor: `${tagInfo.color}30`, backgroundColor: 'transparent', borderWidth: 1, paddingVertical: 2, paddingHorizontal: 6 },
                                                ]}
                                              >
                                                <Text
                                                  style={[
                                                    styles.recordTagText,
                                                    { color: tagInfo.color, fontSize: 9 },
                                                  ]}
                                                >
                                                  {tagInfo.label}
                                                </Text>
                                              </View>
                                            );
                                          })}
                                      </View>
                                    )}
                                  </View>
                                </View>

                                {/* Right: Actions */}
                                <View style={styles.recordActions}>
                                  <TouchableOpacity
                                    style={styles.actionButton}
                                    activeOpacity={0.7}
                                    onPress={async (e) => {
                                      e.stopPropagation();
                                      if (record.fileUrl) {
                                        if (Platform.OS === 'web') {
                                          window.open(record.fileUrl, '_blank');
                                        } else {
                                          try {
                                            const uri = await decryptFileFromUrl(record.fileUrl, record, user);
                                            // Share the file
                                            if (await Sharing.isAvailableAsync()) {
                                              await Sharing.shareAsync(uri);
                                            } else {
                                              showAlert('Error', 'Sharing is not available on this device');
                                            }
                                          } catch (error) {
                                            console.error('Download error:', error);
                                            showAlert('Error', 'Failed to download file');
                                          }
                                        }
                                      }
                                    }}
                                  >
                                    <Download
                                      size={16}
                                      color={isDarkMode ? colors.textSecondary : '#9CA3AF'}
                                      strokeWidth={2}
                                    />
                                  </TouchableOpacity>
                                  {canEdit && (
                                    <TouchableOpacity
                                      style={styles.actionButton}
                                      activeOpacity={0.7}
                                      onPress={(e) => {
                                        e.stopPropagation();
                                        handleDeleteRecord(record);
                                      }}
                                      disabled={deletingRecordId === record.id}
                                    >
                                      {deletingRecordId === record.id ? (
                                        <ActivityIndicator
                                          size="small"
                                          color={medicalColors.red}
                                        />
                                      ) : (
                                        <Trash2
                                          size={16}
                                          color={isDarkMode ? medicalColors.red : '#DC2626'}
                                          strokeWidth={2}
                                        />
                                      )}
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        </Animated.View>
                      );
                    })}
                  </View>
                ));
              })()
            ) : (
              /* Empty State */
              <View style={styles.emptyState}>
                <FolderOpen size={64} color={textLight} strokeWidth={1} />
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
                    <Upload size={16} color={primary} strokeWidth={2} />
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

              {/* Search Bar */}
              <View style={styles.tagSearchContainer}>
                <View style={styles.tagSearchInputContainer}>
                  <Search size={18} color={colors.textSecondary} strokeWidth={2} />
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
                      <X size={16} color={colors.textSecondary} strokeWidth={2} />
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
                      .filter((tag) => !tag.isCustom)
                      .filter((tag) =>
                        tagSearchQuery === '' ||
                        tag.label.toLowerCase().includes(tagSearchQuery.toLowerCase())
                      ).length > 0 && (
                        <View style={styles.tagSection}>
                          <Text style={styles.tagSectionTitle}>Medical Categories</Text>
                          <View style={styles.tagGrid}>
                            {getAllAvailableTags()
                              .filter((tag) => !tag.isCustom)
                              .filter((tag) =>
                                tagSearchQuery === '' ||
                                tag.label.toLowerCase().includes(tagSearchQuery.toLowerCase())
                              )
                              .map((tag) => {
                                const isSelected = selectedTags.includes(tag.id);
                                const tagCount = medicalRecords.filter((r) =>
                                  r.tags?.includes(tag.id)
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
                                        color={isSelected ? tag.color : colors.textSecondary}
                                        strokeWidth={2.5}
                                      />
                                      <Text
                                        style={[
                                          styles.tagChipText,
                                          isSelected && { color: tag.color, fontWeight: '600' },
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
                                          <Check size={12} color="#ffffff" strokeWidth={3} />
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
                      .filter((tag) => tag.isCustom)
                      .filter((tag) =>
                        tagSearchQuery === '' ||
                        tag.label.toLowerCase().includes(tagSearchQuery.toLowerCase())
                      ).length > 0 && (
                        <View style={styles.tagSection}>
                          <View style={styles.tagSectionHeader}>
                            <Text style={styles.tagSectionTitle}>Custom Tags</Text>
                          </View>
                          <View style={styles.tagGrid}>
                            {getAllAvailableTags()
                              .filter((tag) => tag.isCustom)
                              .filter((tag) =>
                                tagSearchQuery === '' ||
                                tag.label.toLowerCase().includes(tagSearchQuery.toLowerCase())
                              )
                              .map((tag) => {
                                const isSelected = selectedTags.includes(tag.id);
                                const tagCount = medicalRecords.filter((r) =>
                                  r.tags?.includes(tag.id)
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
                                      <tag.icon
                                        size={16}
                                        color={isSelected ? primary : colors.textSecondary}
                                        strokeWidth={2.5}
                                      />
                                      <Text
                                        style={[
                                          styles.tagChipText,
                                          isSelected && { color: primary, fontWeight: '600' },
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
                                      {isSelected && (
                                        <View
                                          style={[
                                            styles.tagSelectedIndicator,
                                            { backgroundColor: primary },
                                          ]}
                                        >
                                          <Check size={12} color="#ffffff" strokeWidth={3} />
                                        </View>
                                      )}
                                      <TouchableOpacity
                                        onPress={(e) => {
                                          e.stopPropagation();
                                          removeCustomTag(tag.id);
                                        }}
                                        style={styles.removeCustomTagButton}
                                      >
                                        <X size={12} color={colors.textTertiary} strokeWidth={2.5} />
                                      </TouchableOpacity>
                                    </TouchableOpacity>
                                  </Animated.View>
                                );
                              })}
                          </View>
                        </View>
                      )}

                    {/* No Results */}
                    {getAllAvailableTags().filter((tag) =>
                      tagSearchQuery === '' ||
                      tag.label.toLowerCase().includes(tagSearchQuery.toLowerCase())
                    ).length === 0 && (
                        <View style={styles.noTagsFound}>
                          <Tag size={48} color={colors.textTertiary} strokeWidth={1} />
                          <Text style={styles.noTagsFoundText}>No tags found</Text>
                          <Text style={styles.noTagsFoundSubtext}>
                            Try a different search term
                          </Text>
                        </View>
                      )}
                  </>
                )}
              </ScrollView>

              <View style={styles.tagModalActions}>
                {selectedTags.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearTagsButton}
                    onPress={() => setSelectedTags([])}
                  >
                    <Text style={styles.clearTagsText}>Clear All</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.applyTagsButton,
                    selectedTags.length === 0 && {
                      backgroundColor: colors.textTertiary,
                      shadowOpacity: 0,
                      elevation: 0,
                    },
                  ]}
                  onPress={() => {
                    setShowTagModal(false);
                    setTagSearchQuery('');
                  }}
                  disabled={selectedTags.length === 0}
                >
                  <Text style={styles.applyTagsText}>
                    {selectedTags.length > 0
                      ? `Apply ${selectedTags.length} Filter${selectedTags.length > 1 ? 's' : ''}`
                      : 'Apply Filters'}
                  </Text>
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
                  <X size={24} color={colors.text} strokeWidth={2} />
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
                  placeholderTextColor={textLight}
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
                    <Text style={styles.previewModalTitle}>
                      {selectedRecord.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setPreviewModalVisible(false)}
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
                          const decryptedUri = await decryptFileFromUrl(
                            selectedRecord.fileUrl,
                            selectedRecord,
                            user
                          );
                          setPdfPreviewUri(decryptedUri);
                        } catch (e) {
                          showAlert(
                            'Error',
                            'Failed to decrypt and open image.'
                          );
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
                        try {
                          const decryptedUri = await decryptFileFromUrl(
                            selectedRecord.fileUrl,
                            selectedRecord,
                            user
                          );

                          if (Platform.OS === 'android') {
                            // Android WebView cannot display PDFs directly - use system viewer
                            if (await Sharing.isAvailableAsync()) {
                              await Sharing.shareAsync(decryptedUri, {
                                mimeType: 'application/pdf',
                                dialogTitle: selectedRecord.title || 'Open PDF'
                              });
                            } else {
                              showAlert('Error', 'PDF Viewer not available');
                            }
                          } else {
                            // iOS and Web
                            setPdfPreviewUri(decryptedUri);
                            setShowPdfPreview(true);
                          }
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
              selectedRecord?.fileType?.startsWith('image') ? (
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
                Platform.OS === 'web' ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', marginTop: 16 }}>
                      Opening PDF in new tab...
                    </Text>
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
                  placeholderTextColor={textLight}
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
                          editTags.includes(tag.id) ? tag.color : textLight
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