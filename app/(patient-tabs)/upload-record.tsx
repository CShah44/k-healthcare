import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Plus,
  FileText,
  Camera,
  Image as ImageIcon,
  Upload,
  ArrowLeft,
  Tag,
  Heart,
  Brain,
  Bone,
  Activity,
  TestTube2,
  Pill,
  X,
  Check,
  ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '@/constants/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';
import { createUploadRecordStyles } from '../../styles/upload-record';
import {
  PREDEFINED_TAGS,
  getUserEncryptionKey,
  base64ToUint8Array,
  uploadFile,
  addCustomTag,
  toggleTag,
} from './services/uploadHelpers';

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decryptEncryptedPDF(base64Encrypted: string, uid: string): Uint8Array {
  const key = getUserEncryptionKey(uid);
  const decrypted = CryptoJS.AES.decrypt(base64Encrypted, key);
  const typedArray = new Uint8Array(decrypted.sigBytes);
  for (let i = 0; i < decrypted.sigBytes; i++) {
    typedArray[i] = (decrypted.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return typedArray;
}

const { SUPABASE_URL, SUPABASE_ANON_KEY } = Constants.expoConfig?.extra ?? {};
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

const BUCKET = 'svastheya';
const { width: screenWidth } = Dimensions.get('window');

// Helper to extract storage path from Supabase public URL
function getStoragePathFromUrl(url: string) {
  // Example: https://xyz.supabase.co/storage/v1/object/public/svastheya/uploads/uid/filename.pdf
  // Returns: uploads/uid/filename.pdf
  const match = url.match(/svastheya\/(.+)$/);
  return match ? match[1] : '';
}

export const previewEncryptedPDF = async (
  storagePath: string,
  userUid: string,
) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(storagePath);

    if (error || !data) {
      Alert.alert('Error', 'Failed to download encrypted file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (!base64) return;

      const decryptedBytes = decryptEncryptedPDF(base64, userUid ?? '');
      const decryptedBlob = new Blob([decryptedBytes], {
        type: 'application/pdf',
      });

      const objectUrl = URL.createObjectURL(decryptedBlob);
      router.push({
        pathname: '/pdf-viewer',
        params: { url: objectUrl },
      });
    };
    reader.readAsDataURL(data);
  } catch (e) {
    console.error('Decrypt/preview error:', e);
    Alert.alert('Error', 'Could not preview file.');
  }
};

export default function UploadRecordScreen() {
  const { colors, isDarkMode } = useTheme();
  const styles = createUploadRecordStyles(colors, isDarkMode);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [recordTitle, setRecordTitle] = useState('');
  const [showCustomTagModal, setShowCustomTagModal] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [loadingTags, setLoadingTags] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const { user } = useAuth();

  // Subtle animation values
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Very subtle fade in
    contentOpacity.value = withTiming(1, { duration: 400 });
  }, []);

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
      await setDoc(
        doc(db, 'userTags', user.uid),
        {
          customTags: tags,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error('Error saving custom tags:', error);
      throw error;
    }
  };

  // Subtle animated style
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const openDocumentPicker = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });
      setUploading(false);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setSelectedImage(null);
        // Auto-set title from filename
        setRecordTitle(result.assets[0].name.replace(/\.[^/.]+$/, ''));
      }
    } catch (e) {
      setUploading(false);
      Alert.alert('Error', 'Could not pick document.');
    }
  };

  const openImagePicker = async () => {
    try {
      setUploading(true);
      let result;
      if (Platform.OS === 'web') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
      }
      setUploading(false);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        setSelectedFile(null);
        // Auto-set title for image
        setRecordTitle(`Medical Image - ${new Date().toLocaleDateString()}`);
      }
    } catch (e) {
      setUploading(false);
      Alert.alert('Error', 'Could not open gallery.');
    }
  };

  const openCamera = async () => {
    try {
      setUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (Platform.OS === 'web') {
        Alert.alert('Camera not supported on web');
        setUploading(false);
        return;
      }

      setUploading(false);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        setSelectedFile(null);
        // Auto-set title for camera image
        setRecordTitle(`Medical Photo - ${new Date().toLocaleDateString()}`);
      }
    } catch (e) {
      setUploading(false);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const addCustomTag = async () => {
    const trimmedTag = newTagInput.trim().toLowerCase();
    if (!trimmedTag) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    // Check if tag already exists (in predefined or custom tags)
    const allExistingTags = [
      ...PREDEFINED_TAGS.map((t) => t.id),
      ...customTags,
    ];
    if (allExistingTags.includes(trimmedTag)) {
      Alert.alert('Error', 'This tag already exists');
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
      Alert.alert(
        'Success',
        `Tag "${trimmedTag}" has been added and selected!`,
      );
    } catch (error) {
      console.error('Error adding custom tag:', error);
      Alert.alert('Error', 'Failed to save custom tag. Please try again.');

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
      Alert.alert('Error', 'Failed to remove custom tag. Please try again.');

      // Revert local changes on error
      setCustomTags((prev) => [...prev, tagId]);
    }
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

  const handleUpload = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please log in again.');
      setUploading(false);
      return;
    }
    if (!selectedFile && !selectedImage) {
      Alert.alert('Error', 'Please select a file or photo to upload.');
      return;
    }
    if (!recordTitle.trim()) {
      Alert.alert('Error', 'Please enter a title for your record.');
      return;
    }

    setUploading(true);
    try {
      let fileUri = '';
      let fileName = '';
      let fileType = '';
      let uploadBlob: Blob | undefined;
      if (selectedFile) {
        fileUri = selectedFile.uri;
        fileName = selectedFile.name;
        fileType = selectedFile.mimeType || 'application/pdf';

        const response = await fetch(fileUri);
        const arrayBuffer = await response.arrayBuffer();

        // Encrypt PDFs and images
        if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
          const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
          const encryptionKey = getUserEncryptionKey(user.uid);

          const encrypted = CryptoJS.AES.encrypt(
            wordArray,
            encryptionKey,
          ).toString();
          const encryptedBytes = base64ToUint8Array(encrypted);

          uploadBlob = new Blob([encryptedBytes], {
            type: 'application/octet-stream',
          });
        } else {
          uploadBlob = await response.blob();
        }
      } else if (selectedImage) {
        fileUri = selectedImage.uri;
        fileName = selectedImage.fileName || `photo_${Date.now()}.jpg`;
        fileType = selectedImage.type || 'image/jpeg';

        const response = await fetch(fileUri);
        const arrayBuffer = await response.arrayBuffer();

        // Encrypt images
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
        const encryptionKey = getUserEncryptionKey(user.uid);

        const encrypted = CryptoJS.AES.encrypt(
          wordArray,
          encryptionKey,
        ).toString();
        const encryptedBytes = base64ToUint8Array(encrypted);

        uploadBlob = new Blob([encryptedBytes], {
          type: 'application/octet-stream',
        });
      }

      if (!uploadBlob) {
        throw new Error('Failed to prepare file for upload.');
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(`uploads/${user.uid}/${Date.now()}_${fileName}`, uploadBlob, {
          upsert: false,
          contentType: fileType,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);
      const publicUrl = publicUrlData.publicUrl;

      // Determine record type based on file type and tags
      let recordType = 'uploaded';
      if (fileType === 'application/pdf') {
        recordType = 'uploaded';
      } else if (selectedTags.includes('prescriptions')) {
        recordType = 'prescriptions';
      } else if (selectedTags.includes('lab_reports')) {
        recordType = 'lab_reports';
      } else {
        recordType = 'uploaded';
      }

      // Add record to Firestore
      await addDoc(collection(db, 'patients', user.uid, 'records'), {
        title: recordTitle.trim(),
        fileUrl: publicUrl,
        fileType,
        fileSize: selectedFile?.size
          ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
          : 'Unknown',
        uploadedAt: serverTimestamp(),
        source: 'user_uploaded',
        type: recordType,
        status: 'active',
        tags: selectedTags,
        doctor: 'Self-uploaded',
        encryption: {
          method: 'AES',
          keyHash: getUserEncryptionKey(user.uid),
          enabled:
            fileType === 'application/pdf' || fileType.startsWith('image/'),
        },
      });

      setUploading(false);

      // Show success message and redirect
      Alert.alert('Success', 'Record uploaded successfully!', [
        {
          text: 'View Records',
          onPress: () => router.replace('/(patient-tabs)/records'),
        },
      ]);

      // Auto redirect after 2 seconds if user doesn't click
      setTimeout(() => {
        router.replace('/(patient-tabs)/records');
      }, 2000);
    } catch (e) {
      setUploading(false);
      console.error('Upload error:', e);
      Alert.alert('Error', 'Failed to upload record. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={
          isDarkMode
            ? [colors.surface, colors.surfaceSecondary]
            : ['#FAF8F3', '#FAF8F3']
        }
        style={styles.backgroundGradient}
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Upload Record</Text>
            <Text style={styles.headerSubtitle}>
              Securely add your medical documents
            </Text>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            {uploading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>
                  Uploading your document...
                </Text>
              </View>
            ) : (
              <>
                {/* Upload Options */}
                <View style={styles.uploadOptionsContainer}>
                  <Text style={styles.sectionTitle}>Choose Upload Method</Text>

                  <View style={styles.optionsGrid}>
                    <TouchableOpacity
                      style={styles.uploadOption}
                      onPress={openDocumentPicker}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.uploadOptionIcon,
                          { backgroundColor: '#DBEAFE' },
                        ]}
                      >
                        <FileText size={24} color="#3B82F6" strokeWidth={2} />
                      </View>
                      <View style={styles.uploadOptionContent}>
                        <Text style={styles.uploadOptionText}>Upload PDF</Text>
                        <Text style={styles.uploadOptionSubtext}>
                          Select documents from your device
                        </Text>
                      </View>
                      <View style={styles.uploadOptionArrow}>
                        <ChevronRight size={18} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.uploadOption}
                      onPress={openCamera}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.uploadOptionIcon,
                          { backgroundColor: '#D1FAE5' },
                        ]}
                      >
                        <Camera size={24} color="#10B981" strokeWidth={2} />
                      </View>
                      <View style={styles.uploadOptionContent}>
                        <Text style={styles.uploadOptionText}>Take Photo</Text>
                        <Text style={styles.uploadOptionSubtext}>
                          Capture with your camera
                        </Text>
                      </View>
                      <View style={styles.uploadOptionArrow}>
                        <ChevronRight size={18} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.uploadOption}
                      onPress={openImagePicker}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.uploadOptionIcon,
                          { backgroundColor: '#EDE9FE' },
                        ]}
                      >
                        <ImageIcon size={24} color="#8B5CF6" strokeWidth={2} />
                      </View>
                      <View style={styles.uploadOptionContent}>
                        <Text style={styles.uploadOptionText}>
                          Choose from Gallery
                        </Text>
                        <Text style={styles.uploadOptionSubtext}>
                          Select existing photos
                        </Text>
                      </View>
                      <View style={styles.uploadOptionArrow}>
                        <ChevronRight size={18} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Modern Preview Section */}
                {(selectedFile || selectedImage) && (
                  <Animated.View
                    style={styles.previewContainer}
                    entering={FadeIn.duration(300)}
                  >
                    <Text style={styles.sectionTitle}>Document Details</Text>
                    <View style={styles.previewCard}>
                      {/* File Preview */}
                      {selectedFile && (
                        <View style={styles.filePreview}>
                          <View style={styles.fileIconContainer}>
                            <FileText
                              size={32}
                              color={Colors.primary}
                              strokeWidth={1.5}
                            />
                          </View>
                          <View style={styles.fileInfo}>
                            <Text style={styles.previewTitle}>
                              PDF Document
                            </Text>
                            <Text style={styles.previewText} numberOfLines={2}>
                              {selectedFile.name}
                            </Text>
                            <Text style={styles.fileSizeText}>
                              {selectedFile.size
                                ? `${(selectedFile.size / 1024 / 1024).toFixed(
                                    2,
                                  )} MB`
                                : 'Size unknown'}
                            </Text>
                            {/* Preview PDF Button */}
                            {selectedFile &&
                              selectedFile.uri &&
                              typeof (selectedFile as any).publicUrl ===
                                'string' && (
                                <TouchableOpacity
                                  style={styles.openPdfButton}
                                  onPress={async () => {
                                    const publicUrl = (selectedFile as any)
                                      .publicUrl;
                                    if (!publicUrl) {
                                      Alert.alert(
                                        'Preview not available until uploaded.',
                                      );
                                      return;
                                    }
                                    const storagePath =
                                      getStoragePathFromUrl(publicUrl);
                                    if (!storagePath) {
                                      Alert.alert('Error', 'Invalid file URL.');
                                      return;
                                    }
                                    await previewEncryptedPDF(
                                      storagePath,
                                      user?.uid ?? '',
                                    );
                                  }}
                                >
                                  <Text style={styles.openPdfText}>
                                    Preview PDF
                                  </Text>
                                </TouchableOpacity>
                              )}
                          </View>
                        </View>
                      )}

                      {selectedImage && (
                        <View style={styles.imagePreview}>
                          <Image
                            source={{ uri: selectedImage.uri }}
                            style={styles.previewImage}
                            resizeMode="cover"
                          />
                          <View style={styles.imageInfo}>
                            <Text style={styles.previewTitle}>
                              Image Selected
                            </Text>
                            <Text style={styles.previewText}>
                              Ready to upload
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Title Input */}
                      <View style={styles.titleSection}>
                        <Text style={styles.titleLabel}>Record Title *</Text>
                        <TextInput
                          style={styles.titleInput}
                          value={recordTitle}
                          onChangeText={setRecordTitle}
                          placeholder="Enter a descriptive title for your record"
                          placeholderTextColor={colors.textSecondary}
                          autoCapitalize="words"
                        />
                      </View>

                      {/* Tag Selection */}
                      <View style={styles.tagSection}>
                        <View style={styles.tagHeader}>
                          <View style={styles.tagHeaderText}>
                            <Text style={styles.tagLabel}>
                              Categories (Optional)
                            </Text>
                            <Text style={styles.tagDescription}>
                              Select categories to help organize your records
                            </Text>
                          </View>
                        </View>
                        <View style={styles.tagGrid}>
                          <TouchableOpacity
                            style={styles.addCustomTagButton}
                            onPress={() => setShowCustomTagModal(true)}
                            activeOpacity={0.7}
                          >
                            <Plus
                              size={16}
                              color={Colors.primary}
                              strokeWidth={2.5}
                            />
                            <Text style={styles.addCustomTagText}>
                              Add Custom
                            </Text>
                          </TouchableOpacity>
                          {getAllAvailableTags().map((tag) => (
                            <TouchableOpacity
                              key={tag.id}
                              style={[
                                styles.tagOption,
                                selectedTags.includes(tag.id) && [
                                  styles.tagOptionSelected,
                                  {
                                    backgroundColor: isDarkMode
                                      ? `${tag.color}25`
                                      : `${tag.color}15`,
                                    borderColor: tag.color,
                                  },
                                ],
                              ]}
                              onPress={() => toggleTag(tag.id)}
                              activeOpacity={0.7}
                            >
                              <tag.icon
                                size={16}
                                color={
                                  selectedTags.includes(tag.id)
                                    ? tag.color
                                    : colors.textSecondary
                                }
                                strokeWidth={2}
                              />
                              <Text
                                style={[
                                  styles.tagOptionText,
                                  selectedTags.includes(tag.id) && {
                                    color: tag.color,
                                  },
                                ]}
                              >
                                {tag.label}
                              </Text>
                              {tag.isCustom && (
                                <TouchableOpacity
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    removeCustomTag(tag.id);
                                  }}
                                  style={styles.removeCustomTagButton}
                                  activeOpacity={0.7}
                                >
                                  <X
                                    size={14}
                                    color={colors.textSecondary}
                                    strokeWidth={2.5}
                                  />
                                </TouchableOpacity>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Selected Tags Display */}
                      {selectedTags.length > 0 && (
                        <View style={styles.selectedTagsSection}>
                          <Text style={styles.selectedTagsLabel}>
                            Selected Categories:
                          </Text>
                          <View style={styles.selectedTagsList}>
                            {selectedTags.map((tagId) => {
                              const allTags = getAllAvailableTags();
                              const tag = allTags.find((t) => t.id === tagId);
                              if (!tag) return null;
                              return (
                                <View
                                  key={tagId}
                                  style={[
                                    styles.selectedTag,
                                    { backgroundColor: `${tag.color}15` },
                                  ]}
                                >
                                  <tag.icon
                                    size={12}
                                    color={tag.color}
                                    strokeWidth={2}
                                  />
                                  <Text
                                    style={[
                                      styles.selectedTagText,
                                      { color: tag.color },
                                    ]}
                                  >
                                    {tag.label}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() => toggleTag(tagId)}
                                    activeOpacity={0.7}
                                  >
                                    <X
                                      size={14}
                                      color={tag.color}
                                      strokeWidth={2.5}
                                    />
                                  </TouchableOpacity>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.uploadConfirmButton}
                        onPress={handleUpload}
                        activeOpacity={0.8}
                      >
                        <View style={styles.confirmButtonGradient}>
                          <Upload size={20} color="#ffffff" strokeWidth={2} />
                          <Text style={styles.uploadConfirmText}>
                            Upload Document
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                          setSelectedFile(null);
                          setSelectedImage(null);
                          setSelectedTags([]);
                          setRecordTitle('');
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                )}

                {/* Tips Section */}
                {!(selectedFile || selectedImage) && (
                  <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>
                      💡 Tips for better uploads
                    </Text>
                    <View style={styles.tipsList}>
                      <Text style={styles.tipItem}>
                        • Ensure documents are clear and readable
                      </Text>
                      <Text style={styles.tipItem}>
                        • PDF files are preferred for text documents
                      </Text>
                      <Text style={styles.tipItem}>
                        • Images should be well-lit and in focus
                      </Text>
                      <Text style={styles.tipItem}>
                        • Use descriptive titles and relevant categories
                      </Text>
                      <Text style={styles.tipItem}>
                        • File size should be under 10MB
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </Animated.View>
        </ScrollView>

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
                <TouchableOpacity
                  onPress={() => setShowCustomTagModal(false)}
                  activeOpacity={0.7}
                >
                  <X size={24} color={colors.text} strokeWidth={2.5} />
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
                  placeholderTextColor={colors.textSecondary}
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
                  activeOpacity={0.7}
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
                  activeOpacity={0.8}
                >
                  {addingTag ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Check size={18} color="white" strokeWidth={2.5} />
                  )}
                  <Text style={styles.addCustomTagConfirmText}>
                    {addingTag ? 'Adding...' : 'Add Tag'}
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
