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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Save,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useAuth } from '@/contexts/AuthContext';

export default function EditPatientProfileScreen() {
  const { userData: user, updateUserProfile, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    middleName: user?.middleName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || '',
    gender: user?.gender || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required.');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    try {
      setIsSaving(true);
      await updateUserProfile(formData);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formFields = [
    {
      icon: User,
      label: 'First Name',
      field: 'firstName',
      placeholder: 'Enter your first name',
      required: true,
    },
    {
      icon: User,
      label: 'Middle Name',
      field: 'middleName',
      placeholder: 'Enter your middle name (optional)',
      required: false,
    },
    {
      icon: User,
      label: 'Last Name',
      field: 'lastName',
      placeholder: 'Enter your last name',
      required: true,
    },
    {
      icon: Mail,
      label: 'Email',
      field: 'email',
      placeholder: 'Enter your email',
      required: true,
      keyboardType: 'email-address' as const,
    },
    {
      icon: Phone,
      label: 'Phone Number',
      field: 'phoneNumber',
      placeholder: 'Enter your phone number',
      required: false,
      keyboardType: 'phone-pad' as const,
    },
    {
      icon: Calendar,
      label: 'Date of Birth',
      field: 'dateOfBirth',
      placeholder: 'YYYY-MM-DD',
      required: false,
    },
    {
      icon: MapPin,
      label: 'Address',
      field: 'address',
      placeholder: 'Enter your address',
      required: false,
      multiline: true,
    },
  ];

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  return (
    <SafeAreaView style={[GlobalStyles.container, styles.container]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.surface} />
            ) : (
              <Save size={20} color={Colors.surface} />
            )}
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {formFields.map((field, index) => (
            <View key={index} style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <field.icon size={18} color={Colors.primary} />
                <Text style={styles.labelText}>
                  {field.label}
                  {field.required && <Text style={styles.required}> *</Text>}
                </Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  field.multiline && styles.multilineInput,
                ]}
                value={formData[field.field as keyof typeof formData]}
                onChangeText={(value) => handleInputChange(field.field, value)}
                placeholder={field.placeholder}
                placeholderTextColor={Colors.textLight}
                keyboardType={field.keyboardType || 'default'}
                multiline={field.multiline}
                numberOfLines={field.multiline ? 3 : 1}
              />
            </View>
          ))}

          {/* Gender Selection */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <User size={18} color={Colors.primary} />
              <Text style={styles.labelText}>Gender</Text>
            </View>
            <View style={styles.genderContainer}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    formData.gender === option && styles.genderOptionSelected,
                  ]}
                  onPress={() => handleInputChange('gender', option)}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      formData.gender === option && styles.genderOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButtonLarge, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.surface} />
            ) : (
              <>
                <Save size={20} color={Colors.surface} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },

  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonDisabled: {
    backgroundColor: Colors.textLight,
  },

  form: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 20,
  },

  inputGroup: {
    marginBottom: 20,
  },

  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  labelText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginLeft: 8,
  },

  required: {
    color: Colors.error,
  },

  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },

  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  genderOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  genderOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },

  genderOptionTextSelected: {
    color: Colors.surface,
    fontFamily: 'Inter-SemiBold',
  },

  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  saveButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },

  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.surface,
  },
});