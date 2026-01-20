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
import {
  ArrowLeft,
  Heart,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  User,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { colors } = useTheme();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.firstName.trim())
      newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.middleName.trim())
      newErrors.middleName = 'Middle name is required';

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
      newErrors.password =
        'Password must contain uppercase, lowercase, and number';
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
    } else if (
      !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber.replace(/\s/g, ''))
    ) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    // Date of birth validation
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (
      !/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/.test(
        formData.dateOfBirth
      )
    ) {
      newErrors.dateOfBirth = 'Please use MM/DD/YYYY format';
    } else {
      // Check if user is at least 16 years old
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 16) {
        newErrors.dateOfBirth =
          'You must be at least 16 years old to create an account';
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
    } else if (
      !['male', 'female', 'other'].includes(formData.gender.toLowerCase())
    ) {
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
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(
        4,
        8
      )}`;
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
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
        10
      )}`;
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
        setIsSubmitting(true);
        try {
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
        } catch (error) {
          // If signup fails, stop loading.
          setIsSubmitting(false);
          Alert.alert('Signup Failed', 'Failed to create account. Please try again.');
        }
      } else {
        setOtpError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
      // We don't set isSubmitting(false) here on success because we want to keep the loader
      // But if there was an error in catch block it is set to false.
      // Ideally we should track success state.
      // But since we redirect on success, it's fine.
    }
  };

  if (isLoading || isSubmitting) {
    return (
      <View style={styles.fullscreenLoadingContainer}>
        <LinearGradient
          colors={[colors.background, colors.surface, colors.card]}
          style={styles.loadingGradient}
        >
          {/* Decorative Elements */}
          <View
            style={[
              styles.loadingDecorativeCircle1,
              { backgroundColor: `${Colors.primary}08` },
            ]}
          />
          <View
            style={[
              styles.loadingDecorativeCircle2,
              { backgroundColor: `${Colors.medical.green}06` },
            ]}
          />
          <View
            style={[
              styles.loadingDecorativeCircle3,
              { backgroundColor: `${Colors.medical.blue}05` },
            ]}
          />

          {/* Main Loading Content */}
          <View style={styles.loadingContent}>
            {/* Logo/Icon */}
            <View
              style={[
                styles.loadingIconWrapper,
                {
                  backgroundColor: `${Colors.primary}15`,
                  borderColor: `${Colors.primary}30`,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <Heart size={48} color={Colors.primary} strokeWidth={2} />
            </View>

            {/* Loading Spinner */}
            <View style={styles.spinnerContainer}>
              <LoadingSpinner size={48} />
            </View>

            {/* Loading Text */}
            <Text style={[styles.loadingTitle, { color: colors.text }]}>
              Creating your account...
            </Text>
            <Text
              style={[styles.loadingSubtitle, { color: colors.textSecondary }]}
            >
              Please wait while we set up your profile
            </Text>

            {/* Loading Progress Indicator */}
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, { backgroundColor: colors.border }]}
              >
                <LinearGradient
                  colors={[
                    Colors.primary,
                    Colors.medical.green,
                    Colors.medical.blue,
                  ]}
                  style={styles.progressFill}
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.backgroundGradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[
                styles.backButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.logoContainer}>
                <View
                  style={[
                    styles.iconWrapper,
                    {
                      backgroundColor: `${Colors.primary}15`,
                      borderColor: `${Colors.primary}30`,
                    },
                  ]}
                >
                  <Heart size={32} color={Colors.primary} strokeWidth={2} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Create Account
                </Text>
                <Text
                  style={[styles.subtitle, { color: colors.textSecondary }]}
                >
                  Join Svastheya today and take control of your health
                </Text>
              </View>

              <View style={styles.formContainer}>
                {/* Name Section */}
                <View style={styles.sectionHeader}>
                  <User size={16} color={Colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Personal Information
                  </Text>
                </View>

                <View style={styles.nameRow}>
                  <View style={styles.nameInputContainer}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      First Name *
                    </Text>
                    <Input
                      placeholder="First name"
                      value={formData.firstName}
                      onChangeText={(value) =>
                        updateFormData('firstName', value)
                      }
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                        errors.firstName && styles.inputError,
                      ]}
                    />
                    {errors.firstName && (
                      <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}
                  </View>
                  <View style={styles.nameInputContainer}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Middle Name *
                    </Text>
                    <Input
                      placeholder="Middle name"
                      value={formData.middleName}
                      onChangeText={(value) =>
                        updateFormData('middleName', value)
                      }
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                        errors.middleName && styles.inputError,
                      ]}
                    />
                    {errors.middleName && (
                      <Text style={styles.errorText}>{errors.middleName}</Text>
                    )}
                  </View>
                  <View style={styles.nameInputContainer}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Last Name *
                    </Text>
                    <Input
                      placeholder="Last name"
                      value={formData.lastName}
                      onChangeText={(value) =>
                        updateFormData('lastName', value)
                      }
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                        errors.lastName && styles.inputError,
                      ]}
                    />
                    {errors.lastName && (
                      <Text style={styles.errorText}>{errors.lastName}</Text>
                    )}
                  </View>
                </View>

                {/* Contact Information */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Email Address *
                  </Text>
                  <Input
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(value) =>
                      updateFormData('email', value.toLowerCase())
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                      errors.email && styles.inputError,
                    ]}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Phone Number *
                  </Text>
                  <Input
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChangeText={(value) => {
                      const formatted = formatPhoneNumber(value);
                      updateFormData('phoneNumber', formatted);
                    }}
                    keyboardType="phone-pad"
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                      errors.phoneNumber && styles.inputError,
                    ]}
                  />
                  {errors.phoneNumber && (
                    <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                  )}
                </View>

                {/* Personal Details */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Date of Birth *
                  </Text>
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
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                        errors.dateOfBirth && styles.inputError,
                      ]}
                    />
                    <Calendar
                      size={16}
                      color={colors.textSecondary}
                      style={styles.inputIcon}
                    />
                  </View>
                  {errors.dateOfBirth && (
                    <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Address *
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Input
                      placeholder="Enter your complete address"
                      value={formData.address}
                      onChangeText={(value) => updateFormData('address', value)}
                      multiline
                      numberOfLines={2}
                      style={[
                        styles.input,
                        styles.multilineInput,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                        errors.address && styles.inputError,
                      ]}
                    />
                    <MapPin
                      size={16}
                      color={colors.textSecondary}
                      style={styles.inputIcon}
                    />
                  </View>
                  {errors.address && (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Gender *
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                      errors.gender && styles.inputError,
                    ]}
                    onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        { color: colors.text },
                        !formData.gender && { color: colors.textSecondary },
                      ]}
                    >
                      {formData.gender
                        ? genderOptions.find(
                          (opt) => opt.value === formData.gender
                        )?.label
                        : 'Select gender'}
                    </Text>
                    <Text
                      style={[
                        styles.dropdownArrow,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {showGenderDropdown ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>
                  {showGenderDropdown && (
                    <View
                      style={[
                        styles.dropdownMenu,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      {genderOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={styles.dropdownOption}
                          onPress={() => {
                            updateFormData('gender', option.value);
                            setShowGenderDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              { color: colors.text },
                            ]}
                          >
                            {option.label}
                          </Text>
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
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Security
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Password *
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Input
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChangeText={(value) =>
                        updateFormData('password', value)
                      }
                      secureTextEntry={!showPassword}
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                        errors.password && styles.inputError,
                      ]}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={colors.textSecondary} />
                      ) : (
                        <Eye size={20} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={[
                      styles.passwordHint,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Password must be at least 8 characters with uppercase,
                    lowercase, and number
                  </Text>
                  {errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Confirm Password *
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Input
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChangeText={(value) =>
                        updateFormData('confirmPassword', value)
                      }
                      secureTextEntry={!showConfirmPassword}
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                        errors.confirmPassword && styles.inputError,
                      ]}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color={colors.textSecondary} />
                      ) : (
                        <Eye size={20} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleSignup}
                  activeOpacity={0.8}
                  style={styles.signUpButtonContainer}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={
                      [
                        Colors.primary,
                        Colors.medical.green,
                        Colors.medical.blue,
                      ] as [string, string, string]
                    }
                    style={[
                      styles.signUpButton,
                      isLoading && styles.disabledButton,
                    ]}
                  >
                    <Text style={styles.signUpButtonText}>
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text
                  style={[styles.footerText, { color: colors.textSecondary }]}
                >
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
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Enter OTP
            </Text>
            <Text
              style={[styles.modalDescription, { color: colors.textSecondary }]}
            >
              An OTP has been sent to your email. Please enter it below to
              verify your email address.
            </Text>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP"
              keyboardType="numeric"
              style={[
                styles.otpInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              maxLength={6}
            />
            {otpError ? (
              <Text style={[styles.otpError, { color: Colors.light.error }]}>
                {otpError}
              </Text>
            ) : null}
            <Button
              title={otpLoading ? 'Verifying...' : 'Verify OTP'}
              onPress={handleVerifyOtp}
              disabled={otpLoading || otp.length !== 6}
            />
            <Button
              title="Cancel"
              onPress={() => setShowOtpModal(false)}
              style={{ marginTop: 8 }}
              variant="secondary"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },

  title: {
    fontSize: 32,
    fontFamily: 'IvyMode-Regular',
    marginBottom: 8,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
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
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
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
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
    marginBottom: 8,
  },

  inputWrapper: {
    position: 'relative',
  },

  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },

  inputError: {
    borderColor: Colors.light.error,
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
    marginTop: 4,
    fontFamily: 'Satoshi-Variable',
    fontStyle: 'italic',
  },

  errorText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: 4,
    fontFamily: 'Satoshi-Variable',
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
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  footer: {
    alignItems: 'center',
  },

  footerText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
  },

  signInLink: {
    color: Colors.primary,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },

  loadingText: {
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Satoshi-Variable',
  },

  loadingSubtext: {
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'Satoshi-Variable',
    opacity: 0.7,
  },

  // Dropdown Styles
  dropdownButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dropdownText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },

  dropdownArrow: {
    fontSize: 12,
  },

  dropdownMenu: {
    borderWidth: 1,
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
    fontFamily: 'Satoshi-Variable',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  modalContent: {
    padding: 24,
    borderRadius: 16,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 20,
    fontFamily: 'IvyMode-Regular',
    marginBottom: 8,
  },

  modalDescription: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 16,
  },

  otpInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    textAlign: 'center',
  },

  otpError: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 8,
    textAlign: 'center',
  },

  // New Loading Screen Styles
  fullscreenLoadingContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },

  loadingDecorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },

  loadingDecorativeCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
  },

  loadingDecorativeCircle3: {
    position: 'absolute',
    top: '40%',
    right: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
  },

  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  loadingIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  spinnerContainer: {
    marginBottom: 32,
    transform: [{ scale: 1.5 }], // scale should be a number
  },

  loadingTitle: {
    fontSize: 28,
    fontFamily: 'IvyMode-Regular',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  loadingSubtitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },

  progressContainer: {
    width: '100%',
    maxWidth: 280,
    marginTop: 20,
  },

  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    width: '70%',
    borderRadius: 2,
  },
});
