import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Stethoscope,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
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

interface UserData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  gender: string;
  licenseNumber: string;
  role: 'patient' | 'doctor' | 'lab_assistant';
  department: string;
  hospital: string;
}

interface DoctorVerificationData {
  registrationNo: string;
  yearOfRegistration: string;
  councilName: string;
}

interface SignupData extends UserData {
  password: string;
  confirmPassword: string;
}

export default function HealthcareSignupScreen() {
  const { colors, isDarkMode } = useTheme();

  const [formData, setFormData] = useState<SignupData>({
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
    licenseNumber: '',
    role: 'doctor' as 'doctor' | 'lab_assistant',
    department: '',
    hospital: '',
  });

  const [doctorVerificationData, setDoctorVerificationData] =
    useState<DoctorVerificationData>({
      registrationNo: '',
      yearOfRegistration: '',
      councilName: '',
    });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isVerifyingDoctor, setIsVerifyingDoctor] = useState(false);
  const [doctorVerificationStatus, setDoctorVerificationStatus] = useState<
    'pending' | 'verified' | 'failed' | null
  >(null);
  const [verificationError, setVerificationError] = useState('');

  // Get auth context with fallback
  const authContext = useAuth();
  const { signup, isLoading } = authContext || {
    signup: null,
    isLoading: false,
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const updateDoctorVerificationData = (
    field: keyof DoctorVerificationData,
    value: string
  ) => {
    setDoctorVerificationData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const verifyDoctorCredentials = async () => {
    if (formData.role !== 'doctor') return;

    if (
      !doctorVerificationData.registrationNo.trim() ||
      !doctorVerificationData.yearOfRegistration.trim() ||
      !doctorVerificationData.councilName.trim()
    ) {
      setVerificationError('Please fill all doctor verification fields');
      return;
    }

    setIsVerifyingDoctor(true);
    setVerificationError('');
    setDoctorVerificationStatus('pending');

    try {
      const myHeaders = new Headers();
      myHeaders.append('api-key', 'YOUR_IDFY_API_KEY'); // Replace with actual API key
      myHeaders.append('Content-Type', 'application/json');

      //  TODO FIX THIS TASK ID AND GROUP ID
      const raw = JSON.stringify({
        task_id: '74f4c926-250c-43ca-9c53-453e87ceacd1',
        group_id: '8e16424a-58fc-4ba4-ab20-5bc8e7c3c41e',
        data: {
          registration_no: doctorVerificationData.registrationNo,
          year_of_registration: doctorVerificationData.yearOfRegistration,
          council_name: doctorVerificationData.councilName,
        },
      });

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch(
        'https://eve.idfy.com/v3/tasks/async/verify_with_source/ncvt_iti',
        requestOptions
      );
      const result = await response.text();

      console.log('Doctor verification result:', result);

      // Parse the result and update status accordingly
      const parsedResult = JSON.parse(result);
      if (
        parsedResult.status === 'completed' &&
        parsedResult.result?.verified === true
      ) {
        setDoctorVerificationStatus('verified');
      } else {
        setDoctorVerificationStatus('failed');
        setVerificationError(
          'Doctor credentials could not be verified. Please check your details.'
        );
      }
    } catch (error) {
      console.error('Doctor verification error:', error);
      setDoctorVerificationStatus('failed');
      setVerificationError(
        'Verification service is currently unavailable. Please try again later.'
      );
    } finally {
      setIsVerifyingDoctor(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.middleName.trim())
      newErrors.middleName = 'Middle name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.gender.trim()) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.hospital.trim()) {
      newErrors.hospital = 'Hospital/Clinic name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    console.log('Sign up button pressed'); // Debug log

    // Prevent multiple submissions
    if (isSubmitting || isLoading) {
      console.log('Already submitting or loading');
      return;
    }

    if (!validateForm()) {
      console.log('Form validation failed', errors);
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
        setIsSubmitting(true);
        // Proceed with actual signup
        await signup(formData);
        router.replace('/(healthcare-tabs)');
      } else {
        setOtpError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
      setIsSubmitting(false);
    }
  };

  // Create theme-aware styles
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    backgroundGradient: {
      flex: 1,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    iconWrapper: {
      width: 64,
      height: 64,
      backgroundColor: `${Colors.primary}15`,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: `${Colors.primary}30`,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      textAlign: 'center',
    },
    inputLabel: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
    },
    roleButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    roleButtonText: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
    },
    verificationSection: {
      backgroundColor: `${Colors.primary}08`,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: `${Colors.primary}20`,
    },
    verificationSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      marginBottom: 20,
      lineHeight: 20,
    },
    footerText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 16,
      fontFamily: 'Satoshi-Variable',
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[GlobalStyles.container, styles.container]}>
        <LinearGradient
          colors={
            isDarkMode
              ? [colors.background, colors.surface]
              : [colors.surface, colors.surfaceSecondary]
          }
          style={styles.loadingGradient}
        >
          <LoadingSpinner size={32} />
          <Text style={themedStyles.loadingText}>
            Creating your professional account...
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container}>
      <LinearGradient
        colors={
          isDarkMode
            ? [colors.background, colors.surface]
            : [colors.surface, colors.surfaceSecondary]
        }
        style={themedStyles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={themedStyles.backButton}
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
              <View style={themedStyles.iconWrapper}>
                <Stethoscope size={32} color={Colors.primary} strokeWidth={2} />
              </View>
              <Text style={themedStyles.title}>Professional Registration</Text>
              <Text style={themedStyles.subtitle}>
                Join Svastheya Healthcare Network
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.nameRow}>
                <View style={styles.nameInputContainer}>
                  <Text style={themedStyles.inputLabel}>First Name</Text>
                  <Input
                    placeholder="First name"
                    value={formData.firstName}
                    onChangeText={(value) => updateFormData('firstName', value)}
                    style={themedStyles.input}
                  />
                  {errors.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                </View>
                <View style={styles.nameInputContainer}>
                  <Text style={themedStyles.inputLabel}>Middle Name</Text>
                  <Input
                    placeholder="Middle name"
                    value={formData.middleName}
                    onChangeText={(value) =>
                      updateFormData('middleName', value)
                    }
                    style={themedStyles.input}
                  />
                  {errors.middleName && (
                    <Text style={styles.errorText}>{errors.middleName}</Text>
                  )}
                </View>
                <View style={styles.nameInputContainer}>
                  <Text style={themedStyles.inputLabel}>Last Name</Text>
                  <Input
                    placeholder="Last name"
                    value={formData.lastName}
                    onChangeText={(value) => updateFormData('lastName', value)}
                    style={themedStyles.input}
                  />
                  {errors.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={themedStyles.inputLabel}>Professional Email</Text>
                <Input
                  placeholder="Enter your work email"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={themedStyles.input}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={themedStyles.inputLabel}>Phone Number</Text>
                <Input
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChangeText={(value) => updateFormData('phoneNumber', value)}
                  keyboardType="phone-pad"
                  style={themedStyles.input}
                />
                {errors.phoneNumber && (
                  <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                )}
              </View>

              <View style={styles.roleSelection}>
                <Text style={themedStyles.inputLabel}>Professional Role</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[
                      themedStyles.roleButton,
                      formData.role === 'doctor' && styles.roleButtonActive,
                    ]}
                    onPress={() => updateFormData('role', 'doctor')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        themedStyles.roleButtonText,
                        formData.role === 'doctor' &&
                          styles.roleButtonTextActive,
                      ]}
                    >
                      Doctor
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      themedStyles.roleButton,
                      formData.role === 'lab_assistant' &&
                        styles.roleButtonActive,
                    ]}
                    onPress={() => updateFormData('role', 'lab_assistant')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        themedStyles.roleButtonText,
                        formData.role === 'lab_assistant' &&
                          styles.roleButtonTextActive,
                      ]}
                    >
                      Lab Assistant
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={themedStyles.inputLabel}>License Number</Text>
                <Input
                  placeholder="Enter your license number"
                  value={formData.licenseNumber}
                  onChangeText={(value) =>
                    updateFormData('licenseNumber', value)
                  }
                  style={themedStyles.input}
                />
                {errors.licenseNumber && (
                  <Text style={styles.errorText}>{errors.licenseNumber}</Text>
                )}
              </View>

              {/* Doctor Verification Section */}
              {formData.role === 'doctor' && (
                <View
                  style={[
                    styles.verificationSection,
                    {
                      backgroundColor: isDarkMode
                        ? `${Colors.primary}12`
                        : `${Colors.primary}08`,
                      borderColor: isDarkMode
                        ? `${Colors.primary}30`
                        : `${Colors.primary}20`,
                    },
                  ]}
                >
                  <View style={styles.verificationHeader}>
                    <Shield size={20} color={Colors.primary} />
                    <Text
                      style={[
                        styles.verificationTitle,
                        { color: Colors.primary },
                      ]}
                    >
                      Doctor Verification
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.verificationSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Please provide your medical council registration details for
                    verification
                  </Text>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Registration Number *
                    </Text>
                    <Input
                      placeholder="Enter your medical registration number"
                      value={doctorVerificationData.registrationNo}
                      onChangeText={(value) =>
                        updateDoctorVerificationData('registrationNo', value)
                      }
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Year of Registration *
                    </Text>
                    <Input
                      placeholder="YYYY"
                      value={doctorVerificationData.yearOfRegistration}
                      onChangeText={(value) =>
                        updateDoctorVerificationData(
                          'yearOfRegistration',
                          value
                        )
                      }
                      keyboardType="numeric"
                      maxLength={4}
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Medical Council Name *
                    </Text>
                    <Input
                      placeholder="e.g., Bombay Medical Council"
                      value={doctorVerificationData.councilName}
                      onChangeText={(value) =>
                        updateDoctorVerificationData('councilName', value)
                      }
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                  </View>

                  {verificationError && (
                    <Text style={styles.errorText}>{verificationError}</Text>
                  )}

                  <TouchableOpacity
                    onPress={verifyDoctorCredentials}
                    activeOpacity={0.8}
                    style={[
                      styles.verifyButton,
                      isVerifyingDoctor && styles.buttonDisabled,
                      doctorVerificationStatus === 'verified' && [
                        styles.verifiedButton,
                        { backgroundColor: Colors.light.success },
                      ],
                    ]}
                    disabled={
                      isVerifyingDoctor ||
                      doctorVerificationStatus === 'verified'
                    }
                  >
                    <LinearGradient
                      colors={
                        doctorVerificationStatus === 'verified'
                          ? ([Colors.light.success, Colors.light.success] as [
                              string,
                              string
                            ])
                          : isVerifyingDoctor
                          ? (['#9ca3af', '#6b7280'] as [string, string])
                          : (Colors.gradients.primary as [string, string])
                      }
                      style={styles.verifyButtonGradient}
                    >
                      <View style={styles.verifyButtonContent}>
                        {isVerifyingDoctor ? (
                          <LoadingSpinner size={20} color="#ffffff" />
                        ) : doctorVerificationStatus === 'verified' ? (
                          <CheckCircle size={20} color="#ffffff" />
                        ) : (
                          <Shield size={20} color="#ffffff" />
                        )}
                        <Text style={styles.verifyButtonText}>
                          {isVerifyingDoctor
                            ? 'Verifying...'
                            : doctorVerificationStatus === 'verified'
                            ? 'Verified'
                            : 'Verify Credentials'}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={themedStyles.inputLabel}>Department</Text>
                <Input
                  placeholder="e.g., Cardiology, Emergency, Laboratory"
                  value={formData.department}
                  onChangeText={(value) => updateFormData('department', value)}
                  style={themedStyles.input}
                />
                {errors.department && (
                  <Text style={styles.errorText}>{errors.department}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={themedStyles.inputLabel}>Hospital/Clinic</Text>
                <Input
                  placeholder="Enter your workplace name"
                  value={formData.hospital}
                  onChangeText={(value) => updateFormData('hospital', value)}
                  style={themedStyles.input}
                />
                {errors.hospital && (
                  <Text style={styles.errorText}>{errors.hospital}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={themedStyles.inputLabel}>Address</Text>
                <Input
                  placeholder="Enter your address"
                  value={formData.address}
                  onChangeText={(value) => updateFormData('address', value)}
                  style={themedStyles.input}
                />
                {errors.address && (
                  <Text style={styles.errorText}>{errors.address}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={themedStyles.inputLabel}>Gender</Text>
                <Input
                  placeholder="Gender (male, female, other)"
                  value={formData.gender}
                  onChangeText={(value) => updateFormData('gender', value)}
                  style={themedStyles.input}
                />
                {errors.gender && (
                  <Text style={styles.errorText}>{errors.gender}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={themedStyles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Input
                    placeholder="Create a password"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    secureTextEntry={!showPassword}
                    style={themedStyles.input}
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
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={themedStyles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Input
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChangeText={(value) =>
                      updateFormData('confirmPassword', value)
                    }
                    secureTextEntry={!showConfirmPassword}
                    style={themedStyles.input}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
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
                style={[
                  styles.signUpButtonContainer,
                  (isSubmitting || isLoading) && styles.buttonDisabled,
                ]}
                disabled={isSubmitting || isLoading}
              >
                <LinearGradient
                  colors={
                    isSubmitting || isLoading
                      ? ['#9ca3af', '#6b7280']
                      : [Colors.primary, '#1e40af']
                  }
                  style={styles.signUpButton}
                >
                  <Text style={styles.signUpButtonText}>
                    {isSubmitting
                      ? 'Creating Account...'
                      : 'Create Professional Account'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={themedStyles.footerText}>
                Already registered?{' '}
                <Text
                  style={styles.signInLink}
                  onPress={() => router.push('/auth/healthcare-login')}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
      <Modal
        visible={showOtpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              padding: 24,
              borderRadius: 12,
              width: '80%',
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}
            >
              Enter OTP
            </Text>
            <Text style={{ marginBottom: 8 }}>
              An OTP has been sent to your email. Please enter it below to
              verify your email address.
            </Text>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                padding: 8,
                marginBottom: 12,
              }}
              maxLength={6}
            />
            {otpError ? (
              <Text style={{ color: 'red', marginBottom: 8 }}>{otpError}</Text>
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

  roleSelection: {
    marginBottom: 20,
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  backgroundGradient: {
    flex: 1,
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

  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },

  errorText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: 4,
    fontFamily: 'Satoshi-Variable',
  },

  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  roleButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  roleButtonText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
  },

  roleButtonTextActive: {
    color: '#ffffff',
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
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

  // Verification Section Styles
  verificationSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },

  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  verificationTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    marginLeft: 8,
  },

  verificationSubtitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 20,
    lineHeight: 20,
  },

  verifyButton: {
    borderRadius: 12,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  verifyButtonGradient: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  verifiedButton: {
    backgroundColor: Colors.light.success,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  verifyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
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

  // Enhanced Loading Screen Styles
  fullscreenLoadingContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },

  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    transform: [{ scale: 1.5 }],
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
