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
  KeyboardAvoidingView,
  Platform,

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
import { useTheme } from '@/contexts/ThemeContext';
import { createEditProfileStyles } from '../../styles/edit-profile';
import { useCustomAlert } from '@/components/CustomAlert';

export default function EditPatientProfileScreen() {
  const { userData: user, updateUserProfile, isLoading } = useAuth();
  const { colors } = useTheme();
  const styles = createEditProfileStyles(colors);
  
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
  const { showAlert, AlertComponent } = useCustomAlert();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showAlert('Error', 'First name and last name are required.');
      return;
    }

    if (!formData.email.trim()) {
      showAlert('Error', 'Email is required.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showAlert('Error', 'Please enter a valid email address.');
      return;
    }

    try {
      setIsSaving(true);
      await updateUserProfile(formData);
      showAlert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      showAlert('Error', error.message);
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
    <SafeAreaView style={[GlobalStyles.container, styles.container, { flex: 1 }]}>  
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <View style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              {/* Remove header save button */}
              <View style={{ width: 40 }} />
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
                    placeholderTextColor={colors.textSecondary}
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
            <TouchableOpacity
            style={[styles.saveButtonLarge, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <>
                <Save size={20} color={colors.surface} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
          </ScrollView>
        </View>
        {/* Fixed Save Button at Bottom, always visible, not absolute */}
        <SafeAreaView style={[styles.fixedButtonContainer, { position: 'relative', width: '100%' }]}> 
          
        </SafeAreaView>
      </KeyboardAvoidingView>
       <AlertComponent/>
    </SafeAreaView>
  );
}