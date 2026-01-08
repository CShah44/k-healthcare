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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Save,
  Award,
  Building,
  Stethoscope,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useAuth } from '@/contexts/AuthContext';

export default function EditHealthcareProfileScreen() {
  const { userData: user, updateUserProfile, isLoading } = useAuth();
  const { colors } = useTheme();

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
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
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

    // Professional validation for doctors
    if (user?.role === 'doctor' && !formData.licenseNumber.trim()) {
      Alert.alert('Error', 'License number is required for doctors.');
      return;
    }

    try {
      setIsSaving(true);
      await updateUserProfile(formData);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const personalFields = [
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

  const professionalFields = [
    {
      icon: Award,
      label: 'License Number',
      field: 'licenseNumber',
      placeholder:
        user?.role === 'doctor'
          ? 'Enter your medical license number'
          : 'Enter your license number',
      required: user?.role === 'doctor',
    },
    {
      icon: Stethoscope,
      label: 'Department',
      field: 'department',
      placeholder: 'Enter your department/specialization',
      required: false,
    },
    {
      icon: Building,
      label: 'Hospital/Institution',
      field: 'hospital',
      placeholder: 'Enter your hospital or institution',
      required: false,
    },
  ];

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  return (
    <SafeAreaView
      style={[
        GlobalStyles.container,
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <LinearGradient
        colors={[
          colors.background,
          'rgba(59, 130, 246, 0.05)',
          'rgba(59, 130, 246, 0.02)',
          colors.background,
        ]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Edit Profile
          </Text>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Save size={20} color={colors.surface} />
            )}
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Personal Information Section */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Personal Information
          </Text>

          {personalFields.map((field, index) => (
            <View key={index} style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <field.icon size={18} color={Colors.primary} />
                <Text style={[styles.labelText, { color: colors.text }]}>
                  {field.label}
                  {field.required && <Text style={styles.required}> *</Text>}
                </Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  field.multiline && styles.multilineInput,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={formData[field.field as keyof typeof formData]}
                onChangeText={(value) => handleInputChange(field.field, value)}
                placeholder={field.placeholder}
                placeholderTextColor={colors.text + '80'}
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
              <Text style={[styles.labelText, { color: colors.text }]}>
                Gender
              </Text>
            </View>
            <View style={styles.genderContainer}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    { backgroundColor: colors.surface },
                    formData.gender === option && styles.genderOptionSelected,
                  ]}
                  onPress={() => handleInputChange('gender', option)}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      { color: colors.text },
                      formData.gender === option &&
                        styles.genderOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Professional Information Section */}
          <Text
            style={[
              styles.sectionTitle,
              styles.sectionTitleSpaced,
              { color: colors.text },
            ]}
          >
            Professional Information
          </Text>

          {professionalFields.map((field, index) => (
            <View key={index} style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <field.icon size={18} color={Colors.medical.orange} />
                <Text style={styles.labelText}>
                  {field.label}
                  {field.required && <Text style={styles.required}> *</Text>}
                </Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData[field.field as keyof typeof formData]}
                onChangeText={(value) => handleInputChange(field.field, value)}
                placeholder={field.placeholder}
                placeholderTextColor={colors.text}
              />
            </View>
          ))}
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButtonLarge,
              isSaving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Save size={20} color="#fff" />
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
    // backgroundColor handled inline
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  headerTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },

  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  saveButtonDisabled: {
    backgroundColor: Colors.light.textTertiary,
    shadowOpacity: 0,
  },

  form: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
    marginBottom: 20,
  },

  sectionTitleSpaced: {
    marginTop: 30,
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
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    marginLeft: 8,
    opacity: 0.8,
  },

  required: {
    color: Colors.medical.red,
  },

  input: {
    // backgroundColor and color handled inline
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    borderWidth: 1,
    borderColor: 'transparent', // Cleaner look, shadow provides depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, // Very subtle shadow
    shadowRadius: 5,
    elevation: 1,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },

  genderOptionSelected: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  genderOptionText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
  },

  genderOptionTextSelected: {
    color: '#fff',
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },

  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
  },

  saveButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
    color: '#fff',
  },
});
