import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Eye, EyeOff, Calendar, MapPin, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PatientSignupScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    gender: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup, isLoading } = useAuth();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.middleName.trim()) newErrors.middleName = 'Middle name is required';

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    // Date of birth validation
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (!/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Please use MM/DD/YYYY format';
    } else {
      // Check if user is at least 16 years old
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 16) {
        newErrors.dateOfBirth = 'You must be at least 16 years old to create an account';
      }
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please enter a complete address';
    }

    // Gender validation
    if (!formData.gender.trim()) {
      newErrors.gender = 'Gender is required';
    } else if (!['male', 'female', 'other'].includes(formData.gender.toLowerCase())) {
      newErrors.gender = 'Please enter male, female, or other';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateOfBirth = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Format as MM/DD/YYYY
    if (cleaned.length >= 5) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    } else if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else {
      return cleaned;
    }
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return cleaned;
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Please Check Your Information',
        'Please fix the errors in the form and try again.'
      );
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      // Send OTP to email
      const response = await fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
        setShowOtpModal(true);
      } else {
        setOtpError('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setOtpError('');
    try {
      const response = await fetch('http://localhost:3001/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await response.json();
      if (data.success) {
        setShowOtpModal(false);
        // Proceed with actual signup
        await signup({
          ...formData,
          role: 'patient',
        });
        Alert.alert(
          'Account Created Successfully! 🎉',
          'Welcome to Svastheya! Your account has been created and you are now signed in.',
          [
            {
              text: 'Get Started',
              onPress: () => router.replace('/(patient-tabs)'),
            },
          ]
        );
      } else {
        setOtpError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[GlobalStyles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={['#f8fafc', '#e2e8f0']}
          style={styles.loadingGradient}
        >
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Creating your account...</Text>
          <Text style={styles.loadingSubtext}>Please wait while we set up your profile</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.backgroundGradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color={Colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.logoContainer}>
                <View style={styles.iconWrapper}>
                  <Heart size={32} color={Colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join Svastheya today and take control of your health</Text>
              </View>

              <View style={styles.formContainer}>
                {/* Name Section */}
                <View style={styles.sectionHeader}>
                  <User size={16} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                </View>

                <View style={styles.nameRow}>
                  <View style={styles.nameInputContainer}>
                    <Text style={styles.inputLabel}>First Name *</Text>
                    <Input
                      placeholder="First name"
                      value={formData.firstName}
                      onChangeText={(value) => updateFormData('firstName', value)}
                      style={[styles.input, errors.firstName && styles.inputError]}
                    />
                    {errors.firstName && (
                      <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}
                  </View>
                  <View style={styles.nameInputContainer}>
                    <Text style={styles.inputLabel}>Middle Name *</Text>
                    <Input
                      placeholder="Middle name"
                      value={formData.middleName}
                      onChangeText={(value) => updateFormData('middleName', value)}
                      style={[styles.input, errors.middleName && styles.inputError]}
                    />
                    {errors.middleName && (
                      <Text style={styles.errorText}>{errors.middleName}</Text>
                    )}
                  </View>
                  <View style={styles.nameInputContainer}>
                    <Text style={styles.inputLabel}>Last Name *</Text>
                    <Input
                      placeholder="Last name"
                      value={formData.lastName}
                      onChangeText={(value) => updateFormData('lastName', value)}
                      style={[styles.input, errors.lastName && styles.inputError]}
                    />
                    {errors.lastName && (
                      <Text style={styles.errorText}>{errors.lastName}</Text>
                    )}
                  </View>
                </View>

                {/* Contact Information */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address *</Text>
                  <Input
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value.toLowerCase())}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[styles.input, errors.email && styles.inputError]}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number *</Text>
                  <Input
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChangeText={(value) => {
                      const formatted = formatPhoneNumber(value);
                      updateFormData('phoneNumber', formatted);
                    }}
                    keyboardType="phone-pad"
                    style={[styles.input, errors.phoneNumber && styles.inputError]}
                  />
                  {errors.phoneNumber && (
                    <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                  )}
                </View>

                {/* Personal Details */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Date of Birth *</Text>
                  <View style={styles.inputWrapper}>
                    <Input
                      placeholder="MM/DD/YYYY"
                      value={formData.dateOfBirth}
                      onChangeText={(value) => {
                        const formatted = formatDateOfBirth(value);
                        updateFormData('dateOfBirth', formatted);
                      }}
                      keyboardType="numeric"
                      maxLength={10}
                      style={[styles.input, errors.dateOfBirth && styles.inputError]}
                    />
                    <Calendar 
                      size={16} 
                      color={Colors.textSecondary} 
                      style={styles.inputIcon}
                    />
                  </View>
                  {errors.dateOfBirth && (
                    <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Address *</Text>
                  <View style={styles.inputWrapper}>
                    <Input
                      placeholder="Enter your complete address"
                      value={formData.address}
                      onChangeText={(value) => updateFormData('address', value)}
                      multiline
                      numberOfLines={2}
                      style={[styles.input, styles.multilineInput, errors.address && styles.inputError]}
                    />
                    <MapPin 
                      size={16} 
                      color={Colors.textSecondary} 
                      style={styles.inputIcon}
                    />
                  </View>
                  {errors.address && (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Gender *</Text>
                  <TouchableOpacity
                    style={[styles.dropdownButton, errors.gender && styles.inputError]}
                    onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                  >
                    <Text style={[styles.dropdownText, !formData.gender && styles.placeholderText]}>
                      {formData.gender ? genderOptions.find(opt => opt.value === formData.gender)?.label : 'Select gender'}
                    </Text>
                    <Text style={styles.dropdownArrow}>{showGenderDropdown ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {showGenderDropdown && (
                    <View style={styles.dropdownMenu}>
                      {genderOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={styles.dropdownOption}
                          onPress={() => {
                            updateFormData('gender', option.value);
                            setShowGenderDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownOptionText}>{option.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {errors.gender && (
                    <Text style={styles.errorText}>{errors.gender}</Text>
                  )}
                </View>

                {/* Password Section */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Security</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password *</Text>
                  <View style={styles.inputWrapper}>
                    <Input
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChangeText={(value) => updateFormData('password', value)}
                      secureTextEntry={!showPassword}
                      style={[styles.input, errors.password && styles.inputError]}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={Colors.textSecondary} />
                      ) : (
                        <Eye size={20} color={Colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.passwordHint}>
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </Text>
                  {errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password *</Text>
                  <View style={styles.inputWrapper}>
                    <Input
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChangeText={(value) => updateFormData('confirmPassword', value)}
                      secureTextEntry={!showConfirmPassword}
                      style={[styles.input, errors.confirmPassword && styles.inputError]}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color={Colors.textSecondary} />
                      ) : (
                        <Eye size={20} color={Colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleSignup}
                  activeOpacity={0.8}
                  style={styles.signUpButtonContainer}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[Colors.primary, '#1e40af']}
                    style={[styles.signUpButton, isLoading && styles.disabledButton]}
                  >
                    <Text style={styles.signUpButtonText}>
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Already have an account?{' '}
                  <Text
                    style={styles.signInLink}
                    onPress={() => router.push('/auth/patient-login')}
                  >
                    Sign In
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
      <Modal
        visible={showOtpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 12, width: '80%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Enter OTP</Text>
            <Text style={{ marginBottom: 8 }}>An OTP has been sent to your email. Please enter it below to verify your email address.</Text>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP"
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 }}
              maxLength={6}
            />
            {otpError ? <Text style={{ color: 'red', marginBottom: 8 }}>{otpError}</Text> : null}
            <Button title={otpLoading ? 'Verifying...' : 'Verify OTP'} onPress={handleVerifyOtp} disabled={otpLoading || otp.length !== 6} />
            <Button title="Cancel" onPress={() => setShowOtpModal(false)} style={{ marginTop: 8 }} variant="secondary" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  backgroundGradient: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },

  iconWrapper: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },

  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
  },

  formContainer: {
    marginBottom: 30,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginLeft: 8,
  },

  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  nameInputContainer: {
    flex: 1,
  },

  inputContainer: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
    marginBottom: 8,
  },

  inputWrapper: {
    position: 'relative',
  },

  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },

  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },

  multilineInput: {
    height: 64,
    textAlignVertical: 'top',
  },

  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 20,
  },

  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },

  passwordHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },

  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },

  signUpButtonContainer: {
    marginTop: 8,
  },

  signUpButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  disabledButton: {
    opacity: 0.7,
  },

  signUpButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  footer: {
    alignItems: 'center',
  },

  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  signInLink: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },

  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    fontFamily: 'Inter-Regular',
  },

  loadingSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    opacity: 0.7,
  },

  // Dropdown Styles
  dropdownButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dropdownText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },

  placeholderText: {
    color: Colors.textLight,
  },

  dropdownArrow: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  dropdownMenu: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },

  dropdownOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
  },
});