import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/Colors';
import { Plus } from 'lucide-react-native';
import { db } from '@/constants/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = Constants.expoConfig?.extra ?? {};
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);


const BUCKET = 'svastheya';

export default function UploadRecordScreen() {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const { user } = useAuth();

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
        Alert.alert("Camera not supported on web");
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
      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insert Past Record/Prescription</Text>
      </View>
      <View style={styles.content}>
        {uploading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <>
            <TouchableOpacity style={styles.uploadOption} onPress={openDocumentPicker}>
              <Text style={styles.uploadOptionText}>Upload PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadOption} onPress={openCamera}>
              <Text style={styles.uploadOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadOption} onPress={openImagePicker}>
              <Text style={styles.uploadOptionText}>Upload Photo (Gallery)</Text>
            </TouchableOpacity>
            {(selectedFile || selectedImage) && (
              <View style={styles.previewContainer}>
                {selectedFile && (
                  <Text style={styles.previewText}>Selected PDF: {selectedFile.name}</Text>
                )}
                {selectedImage && (
                  <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                )}
                <TouchableOpacity style={styles.uploadConfirmButton} onPress={handleUpload}>
                  <Text style={styles.uploadConfirmText}>Upload</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  uploadOption: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  uploadOptionText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
  },
  previewContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10,
  },
  previewImage: {
    width: 140,
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  uploadConfirmButton: {
    backgroundColor: Colors.medical.green,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
  },
  uploadConfirmText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
  },
  cancelButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.error,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
}); 