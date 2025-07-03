import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  withSpring,
  withDelay,
  FadeInDown,
  FadeInUp,
  BounceIn,
  SlideInRight,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/Colors';
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
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '@/constants/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = Constants.expoConfig?.extra ?? {};
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

const BUCKET = 'svastheya';
const { width: screenWidth } = Dimensions.get('window');

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

export default function UploadRecordScreen() {
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

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-30);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);

  useEffect(() => {
    // Animate header
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

    // Animate content with delay
    setTimeout(() => {
      contentOpacity.value = withTiming(1, { duration: 600 });
      contentTranslateY.value = withSpring(0, { damping: 12, stiffness: 80 });
    }, 200);
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
      await setDoc(doc(db, 'userTags', user.uid), {
        customTags: tags,
        updatedAt: serverTimestamp(),
      }, { merge: true });
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

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
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
        : [...prev, tagId]
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
      Alert.alert('Success', `Tag "${trimmedTag}" has been added and selected!`);
    } catch (error) {
      console.error('Error adding custom tag:', error);
      Alert.alert('Error', 'Failed to save custom tag. Please try again.');
      
      // Revert local changes on error
      setCustomTags((prev) => prev.filter(tag => tag !== trimmedTag));
      setSelectedTags((prev) => prev.filter(tag => tag !== trimmedTag));
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

  const handleUpload = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please log in again.');
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
      if (selectedFile) {
        fileUri = selectedFile.uri;
        fileName = selectedFile.name;
        fileType = selectedFile.mimeType || 'application/pdf';
      } else if (selectedImage) {
        fileUri = selectedImage.uri;
        fileName = selectedImage.fileName || `photo_${Date.now()}.jpg`;
        fileType = selectedImage.type || 'image/jpeg';
      }

      // Upload to Supabase Storage
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(`uploads/${user.uid}/${Date.now()}_${fileName}`, blob, {
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
        colors={['#f8fafc', '#e2e8f0', '#f1f5f9']}
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
            <Text style={styles.headerTitle}>Upload Record</Text>
            <Text style={styles.headerSubtitle}>
              Add your medical documents
            </Text>
          </View>
        </Animated.View>

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
                    <Animated.View entering={FadeInDown.delay(300).springify()}>
                      <TouchableOpacity
                        style={[styles.uploadOption, styles.pdfOption]}
                        onPress={openDocumentPicker}
                      >
                        <LinearGradient
                          colors={['#3b82f6', '#1d4ed8']}
                          style={styles.uploadOptionGradient}
                        >
                          <View style={styles.iconContainer}>
                            <FileText
                              size={24}
                              color="#ffffff"
                              strokeWidth={2}
                            />
                          </View>
                          <Text style={styles.uploadOptionText}>
                            Upload PDF
                          </Text>
                          <Text style={styles.uploadOptionSubtext}>
                            Select documents
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).springify()}>
                      <TouchableOpacity
                        style={[styles.uploadOption, styles.cameraOption]}
                        onPress={openCamera}
                      >
                        <LinearGradient
                          colors={['#10b981', '#059669']}
                          style={styles.uploadOptionGradient}
                        >
                          <View style={styles.iconContainer}>
                            <Camera size={24} color="#ffffff" strokeWidth={2} />
                          </View>
                          <Text style={styles.uploadOptionText}>
                            Take Photo
                          </Text>
                          <Text style={styles.uploadOptionSubtext}>
                            Use camera
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(500).springify()}>
                      <TouchableOpacity
                        style={[styles.uploadOption, styles.galleryOption]}
                        onPress={openImagePicker}
                      >
                        <LinearGradient
                          colors={['#8b5cf6', '#7c3aed']}
                          style={styles.uploadOptionGradient}
                        >
                          <View style={styles.iconContainer}>
                            <ImageIcon
                              size={24}
                              color="#ffffff"
                              strokeWidth={2}
                            />
                          </View>
                          <Text style={styles.uploadOptionText}>Gallery</Text>
                          <Text style={styles.uploadOptionSubtext}>
                            Choose photos
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </View>

                {/* Preview Section */}
                {(selectedFile || selectedImage) && (
                  <Animated.View
                    style={styles.previewContainer}
                    entering={BounceIn.delay(200)}
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
                                    2
                                  )} MB`
                                : 'Size unknown'}
                            </Text>
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
                          placeholderTextColor={Colors.textLight}
                        />
                      </View>

                      {/* Tag Selection */}
                      <View style={styles.tagSection}>
                        <View style={styles.tagHeader}>
                          <View>
                            <Text style={styles.tagLabel}>
                              Categories (Optional)
                            </Text>
                            <Text style={styles.tagDescription}>
                              Select categories to help organize your records
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.addCustomTagButton}
                            onPress={() => setShowCustomTagModal(true)}
                          >
                            <Plus
                              size={16}
                              color={Colors.primary}
                              strokeWidth={2}
                            />
                            <Text style={styles.addCustomTagText}>
                              Add Custom
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.tagGrid}>
                          {getAllAvailableTags().map((tag) => (
                            <TouchableOpacity
                              key={tag.id}
                              style={[
                                styles.tagOption,
                                selectedTags.includes(tag.id) && [
                                  styles.tagOptionSelected,
                                  {
                                    backgroundColor: `${tag.color}20`,
                                    borderColor: tag.color,
                                  },
                                ],
                              ]}
                              onPress={() => toggleTag(tag.id)}
                            >
                              <tag.icon
                                size={16}
                                color={
                                  selectedTags.includes(tag.id)
                                    ? tag.color
                                    : Colors.textSecondary
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
                                >
                                  <X
                                    size={12}
                                    color={Colors.textLight}
                                    strokeWidth={2}
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
                                  >
                                    <X
                                      size={12}
                                      color={tag.color}
                                      strokeWidth={2}
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
                      >
                        <LinearGradient
                          colors={['#10b981', '#059669']}
                          style={styles.confirmButtonGradient}
                        >
                          <Upload size={18} color="#ffffff" strokeWidth={2} />
                          <Text style={styles.uploadConfirmText}>
                            Upload Document
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                          setSelectedFile(null);
                          setSelectedImage(null);
                          setSelectedTags([]);
                          setRecordTitle('');
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                )}

                {/* Tips Section */}
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
    fontSize: 24,
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

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  content: {
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },

  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    marginTop: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  uploadOptionsContainer: {
    marginBottom: 24,
  },

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  uploadOption: {
    width: (screenWidth - 56) / 3,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  uploadOptionGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },

  iconContainer: {
    marginBottom: 8,
  },

  uploadOptionText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
    textAlign: 'center',
  },

  uploadOptionSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },

  pdfOption: {},
  cameraOption: {},
  galleryOption: {},

  previewContainer: {
    marginBottom: 24,
  },

  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },

  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  fileIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  fileInfo: {
    flex: 1,
  },

  imagePreview: {
    alignItems: 'center',
    marginBottom: 20,
  },

  imageInfo: {
    alignItems: 'center',
    marginTop: 12,
  },

  previewTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 4,
  },

  previewText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },

  fileSizeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },

  previewImage: {
    width: 120,
    height: 160,
    borderRadius: 12,
  },

  titleSection: {
    marginBottom: 20,
  },

  titleLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 8,
  },

  titleInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  tagSection: {
    marginBottom: 20,
  },

  tagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  tagLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },

  tagDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  addCustomTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: 16,
    gap: 4,
  },

  addCustomTagText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },

  removeCustomTagButton: {
    marginLeft: 4,
    padding: 2,
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

  selectedTagsSection: {
    marginBottom: 20,
  },

  selectedTagsLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 8,
  },

  selectedTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  selectedTagText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },

  uploadConfirmButton: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },

  uploadConfirmText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter-Bold',
  },

  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },

  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },

  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 12,
  },

  tipsList: {
    gap: 8,
  },

  tipItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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

  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
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
});
