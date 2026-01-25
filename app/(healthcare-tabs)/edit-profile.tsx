import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Award,
  Calendar,
  MapPin,
  Save,
  Building,
  Stethoscope,
  Camera,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfileAsset } from '@/app/(patient-tabs)/services/uploadHelpers';
import { Image } from 'react-native';

const { width } = Dimensions.get('window');

export default function EditHealthcareProfileScreen() {
  const {
    userData: user,
    user: authUser,
    updateUserProfile,
    isLoading,
  } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    middleName: user?.middleName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || '',
    gender: user?.gender || '',
    licenseNumber: user?.licenseNumber || '',
    department: user?.department || '',
    hospital: user?.hospital || '',
    letterheadUrl: user?.letterheadUrl || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required.');
      return;
    }

    try {
      setIsSaving(true);
      // Remove undefined/null values
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v != null),
      );
      await updateUserProfile(cleanData);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickAvatar = async () => {
    // Pick image logic
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && authUser?.uid) {
        setIsSaving(true);
        const publicUrl = await uploadProfileAsset(
          result.assets[0].uri,
          `avatar_${Date.now()}.jpg`,
          authUser.uid,
          'avatars',
        );
        setFormData((prev) => ({ ...prev, avatarUrl: publicUrl }));
        setIsSaving(false);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to upload image');
      setIsSaving(false);
    }
  };

  const handlePickLetterhead = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 1], // Wide aspect for letterhead
        quality: 0.8,
      });
      if (!result.canceled && authUser?.uid) {
        setIsSaving(true);
        const publicUrl = await uploadProfileAsset(
          result.assets[0].uri,
          `letterhead_${Date.now()}.jpg`,
          authUser.uid,
          'letterheads',
        );
        setFormData((prev) => ({ ...prev, letterheadUrl: publicUrl }));
        setIsSaving(false);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to upload letterhead');
      setIsSaving(false);
    }
  };

  const personalFields = [
    {
      icon: User,
      label: 'First Name',
      field: 'firstName',
      placeholder: 'Ex. John',
    },
    {
      icon: User,
      label: 'Last Name',
      field: 'lastName',
      placeholder: 'Ex. Doe',
    },
    {
      icon: Phone,
      label: 'Phone',
      field: 'phoneNumber',
      placeholder: '+1 234 567 890',
    },
    {
      icon: Mail,
      label: 'Email',
      field: 'email',
      placeholder: 'john@example.com',
      keyboardType: 'email-address',
    },
  ];

  const professionalFields = [
    {
      icon: Award,
      label: 'License Number',
      field: 'licenseNumber',
      placeholder: 'Medical License #',
    },
    {
      icon: Stethoscope,
      label: 'Department/Specialty',
      field: 'department',
      placeholder: 'Cardiology',
    },
    {
      icon: Building,
      label: 'Hospital',
      field: 'hospital',
      placeholder: 'General Hospital',
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Edit Profile
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={handlePickAvatar}
            style={styles.avatarWrapper}
          >
            {formData.avatarUrl ? (
              <Image
                source={{ uri: formData.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                <User size={40} color={colors.textSecondary} />
              </View>
            )}
            <View
              style={[styles.cameraBadge, { backgroundColor: Colors.primary }]}
            >
              <Camera size={14} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Personal Information
          </Text>
          {personalFields.map((item, idx) => (
            <View key={idx} style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={(formData as any)[item.field]}
                onChangeText={(t) => handleInputChange(item.field, t)}
                placeholder={item.placeholder}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Professional Details
          </Text>
          {professionalFields.map((item, idx) => (
            <View key={idx} style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={(formData as any)[item.field]}
                onChangeText={(t) => handleInputChange(item.field, t)}
                placeholder={item.placeholder}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          ))}
        </View>

        {/* Letterhead Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Prescription Header
          </Text>
          <TouchableOpacity
            onPress={handlePickLetterhead}
            style={[
              styles.letterheadButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {formData.letterheadUrl ? (
              <Image
                source={{ uri: formData.letterheadUrl }}
                style={styles.letterheadPreview}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.letterheadPlaceholder}>
                <Building size={24} color={colors.textSecondary} />
                <Text
                  style={[
                    styles.letterheadText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Upload Letterhead Entry
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveButton, { opacity: isSaving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },
  content: {
    paddingBottom: 100,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },
  letterheadButton: {
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  letterheadPreview: {
    width: '100%',
    height: '100%',
  },
  letterheadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  letterheadText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Satoshi-Variable',
  },
});
