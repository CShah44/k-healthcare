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
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '@/constants/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = Constants.expoConfig?.extra ?? {};
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

const BUCKET = 'svastheya';
const { width: screenWidth } = Dimensions.get('window');

export default function UploadRecordScreen() {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
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
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
      }
      setUploading(false);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        setSelectedFile(null);
      }
    } catch (e) {
      setUploading(false);
      Alert.alert('Error', 'Could not open camera or pick image.');
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
        return;
      }

      setUploading(false);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        setSelectedFile(null);
      }
    } catch (e) {
      setUploading(false);
      Alert.alert('Error', 'Could not open camera.');
    }
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
        console.error('Upload error:', error); // Add this
        throw error;
      }

      if (error) throw error;
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);
      const publicUrl = publicUrlData.publicUrl;
      // Add record to Firestore under 'my uploads'
      await addDoc(collection(db, 'patients', user.uid, 'records'), {
        title: fileName,
        fileUrl: publicUrl,
        fileType,
        uploadedAt: serverTimestamp(),
        source: 'user_uploaded',
        type: fileType === 'application/pdf' ? 'uploaded' : 'prescriptions',
        status: 'active',
      });
      setUploading(false);
      Alert.alert('Success', 'Record uploaded to My Uploads!');
      router.replace('/(patient-tabs)/records');
    } catch (e) {
      setUploading(false);
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
                <Text style={styles.loadingText}>Uploading your document...</Text>
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
                            <FileText size={24} color="#ffffff" strokeWidth={2} />
                          </View>
                          <Text style={styles.uploadOptionText}>Upload PDF</Text>
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
                          <Text style={styles.uploadOptionText}>Take Photo</Text>
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
                            <ImageIcon size={24} color="#ffffff" strokeWidth={2} />
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
                    <Text style={styles.sectionTitle}>Preview & Upload</Text>
                    <View style={styles.previewCard}>
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
                            <Text style={styles.previewTitle}>PDF Document</Text>
                            <Text style={styles.previewText} numberOfLines={2}>
                              {selectedFile.name}
                            </Text>
                            <Text style={styles.fileSizeText}>
                              {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
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
                            <Text style={styles.previewTitle}>Image Selected</Text>
                            <Text style={styles.previewText}>
                              Ready to upload
                            </Text>
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
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                )}

                {/* Tips Section */}
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsTitle}>💡 Tips for better uploads</Text>
                  <View style={styles.tipsList}>
                    <Text style={styles.tipItem}>• Ensure documents are clear and readable</Text>
                    <Text style={styles.tipItem}>• PDF files are preferred for text documents</Text>
                    <Text style={styles.tipItem}>• Images should be well-lit and in focus</Text>
                    <Text style={styles.tipItem}>• File size should be under 10MB</Text>
                  </View>
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>
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
});
