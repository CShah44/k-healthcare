import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
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
  X,
  Mail,
  Phone,
  Briefcase,
  Building,
  Lock,
  Award,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInDown,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { nanoid } from 'nanoid';
import { MEDICAL_COUNCILS } from '../constants/medical-councils';
import { authStyles } from '@/styles/auth';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

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
  const colors = Colors.light;
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
  const [showCouncilModal, setShowCouncilModal] = useState(false);

  const authContext = useAuth();
  const { signup, isLoading } = authContext || {
    signup: null,
    isLoading: false,
  };

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(20);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    formOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(200, withSpring(0, { damping: 18, stiffness: 100 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

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
      const taskId = nanoid(16);
      const groupId = nanoid(16);

      const response = await fetch('http://localhost:3001/verify-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNo: doctorVerificationData.registrationNo,
          yearOfRegistration: doctorVerificationData.yearOfRegistration,
          councilName: doctorVerificationData.councilName,
          taskId,
          groupId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.verified === true) {
        setDoctorVerificationStatus('verified');
      } else {
        setDoctorVerificationStatus('failed');
        setVerificationError(
          result.message ||
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
    if (!validateForm()) {
      return;
    }

    if (formData.role === 'doctor' && doctorVerificationStatus !== 'verified') {
      Alert.alert('Verification Required', 'Please verify your doctor credentials before signing up.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    try {
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
        if (signup) {
          await signup(formData);
          router.replace('/(healthcare-tabs)');
        }
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

  if (isLoading || isSubmitting) {
    return (
      <View style={authStyles.fullscreenLoadingContainer}>
        <LinearGradient
          colors={[colors.background, colors.surface, colors.card]}
          style={authStyles.loadingGradient}
        >
          <View style={[authStyles.loadingDecorativeCircle1, { backgroundColor: `${Colors.primary}08` }]} />
          <View style={[authStyles.loadingDecorativeCircle2, { backgroundColor: `${Colors.medical.green}06` }]} />
          <View style={authStyles.loadingContent}>
            <View style={[authStyles.loadingIconWrapper, {
              backgroundColor: `${Colors.primary}15`,
              borderColor: `${Colors.primary}30`,
              shadowColor: colors.shadow,
            }]}>
              <Stethoscope size={48} color={Colors.primary} strokeWidth={2} />
            </View>
            <View style={authStyles.spinnerContainer}>
              <LoadingSpinner size={48} />
            </View>
            <Text style={[authStyles.loadingTitle, { color: colors.text }]}>
              Creating your professional account...
            </Text>
            <Text style={[authStyles.loadingSubtitle, { color: colors.textSecondary }]}>
              Please wait while we set up your profile
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <SafeAreaView style={[authStyles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={authStyles.backgroundGradient}
      >
        <View style={[authStyles.decorativeCircle, { backgroundColor: `${Colors.primary}04` }]} />

        <AnimatedView style={[authStyles.header, headerStyle]}>
          <TouchableOpacity
            style={[
              authStyles.backButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </AnimatedView>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={authStyles.keyboardAvoidingView}
        >
          <ScrollView
            style={authStyles.scrollView}
            contentContainerStyle={[authStyles.scrollContent, { paddingHorizontal: 24 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedView style={formStyle}>
              {/* Header Section */}
              <AnimatedView
                entering={FadeInDown.delay(100).springify()}
                style={[authStyles.logoContainer, { marginTop: 8, marginBottom: 40 }]}
              >
                <View
                  style={[
                    authStyles.iconWrapper,
                    {
                      backgroundColor: `${Colors.primary}12`,
                      borderColor: `${Colors.primary}25`,
                    },
                  ]}
                >
                  <Stethoscope size={32} color={Colors.primary} strokeWidth={2.5} />
                </View>
                <AnimatedText
                  entering={FadeInDown.delay(200).springify()}
                  style={[authStyles.title, { color: colors.text, fontSize: 32, marginBottom: 8 }]}
                >
                  Professional Registration
                </AnimatedText>
                <AnimatedText
                  entering={FadeInDown.delay(300).springify()}
                  style={[authStyles.subtitle, { color: colors.textSecondary, fontSize: 15, lineHeight: 22 }]}
                >
                  Join the Svastheya Healthcare Network
                </AnimatedText>
              </AnimatedView>

              <AnimatedView
                entering={FadeInDown.delay(400).springify()}
                style={authStyles.formContainer}
              >
                {/* Personal Details Section */}
                <View style={[authStyles.sectionHeader, { marginBottom: 24 }]}>
                  <View style={{ width: 3, height: 20, backgroundColor: Colors.primary, borderRadius: 2, marginRight: 12 }} />
                  <User size={18} color={Colors.primary} strokeWidth={2} />
                  <Text style={[authStyles.sectionTitle, { color: colors.text, fontSize: 20, marginLeft: 8 }]}>
                    Personal Details
                  </Text>
                </View>

                <View style={[authStyles.nameRow, { marginBottom: 24 }]}>
                  <View style={authStyles.nameInputContainer}>
                    <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                      First Name
                    </Text>
                    <Input
                      placeholder="First name"
                      value={formData.firstName}
                      onChangeText={(value) => updateFormData('firstName', value)}
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.firstName ? Colors.light.error : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    {errors.firstName && (
                      <Text style={[authStyles.errorText, { marginTop: 6 }]}>{errors.firstName}</Text>
                    )}
                  </View>
                  <View style={authStyles.nameInputContainer}>
                    <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                      Middle Name
                    </Text>
                    <Input
                      placeholder="Middle name"
                      value={formData.middleName}
                      onChangeText={(value) => updateFormData('middleName', value)}
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.middleName ? Colors.light.error : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    {errors.middleName && (
                      <Text style={[authStyles.errorText, { marginTop: 6 }]}>{errors.middleName}</Text>
                    )}
                  </View>
                  <View style={authStyles.nameInputContainer}>
                    <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                      Last Name
                    </Text>
                    <Input
                      placeholder="Last name"
                      value={formData.lastName}
                      onChangeText={(value) => updateFormData('lastName', value)}
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.lastName ? Colors.light.error : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    {errors.lastName && (
                      <Text style={[authStyles.errorText, { marginTop: 6 }]}>{errors.lastName}</Text>
                    )}
                  </View>
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 24 }]}>
                  <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                    Professional Email
                  </Text>
                  <View style={authStyles.inputWrapper}>
                    <Input
                      placeholder="Enter your work email"
                      value={formData.email}
                      onChangeText={(value) => updateFormData('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.email ? Colors.light.error : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    <Mail
                      size={18}
                      color={colors.textSecondary}
                      style={authStyles.inputIcon}
                    />
                  </View>
                  <Text style={[authStyles.passwordHint, { color: colors.textSecondary, marginTop: 6 }]}>
                    Use your professional or institutional email address
                  </Text>
                  {errors.email && (
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>{errors.email}</Text>
                  )}
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 24 }]}>
                  <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                    Phone Number
                  </Text>
                  <View style={authStyles.inputWrapper}>
                    <Input
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChangeText={(value) => updateFormData('phoneNumber', value)}
                      keyboardType="phone-pad"
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.phoneNumber ? Colors.light.error : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    <Phone
                      size={18}
                      color={colors.textSecondary}
                      style={authStyles.inputIcon}
                    />
                  </View>
                  {errors.phoneNumber && (
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>{errors.phoneNumber}</Text>
                  )}
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 24 }]}>
                  <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                    Gender
                  </Text>
                  <Input
                    placeholder="Gender (male, female, other)"
                    value={formData.gender}
                    onChangeText={(value) => updateFormData('gender', value)}
                    style={[
                      authStyles.input,
                      {
                        backgroundColor: colors.card,
                        borderColor: errors.gender ? Colors.light.error : colors.border,
                        color: colors.text,
                      },
                    ]}
                  />
                  {errors.gender && (
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>{errors.gender}</Text>
                  )}
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 32 }]}>
                  <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                    Address
                  </Text>
                  <Input
                    placeholder="Enter your address"
                    value={formData.address}
                    onChangeText={(value) => updateFormData('address', value)}
                    multiline
                    numberOfLines={2}
                    style={[
                      authStyles.input,
                      authStyles.multilineInput,
                      {
                        backgroundColor: colors.card,
                        borderColor: errors.address ? Colors.light.error : colors.border,
                        color: colors.text,
                      },
                    ]}
                  />
                  {errors.address && (
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>{errors.address}</Text>
                  )}
                </View>

                {/* Professional Details Section */}
                <View style={[authStyles.sectionHeader, { marginTop: 8, marginBottom: 24 }]}>
                  <View style={{ width: 3, height: 20, backgroundColor: Colors.primary, borderRadius: 2, marginRight: 12 }} />
                  <Briefcase size={18} color={Colors.primary} strokeWidth={2} />
                  <Text style={[authStyles.sectionTitle, { color: colors.text, fontSize: 20, marginLeft: 8 }]}>
                    Professional Details
                  </Text>
                </View>

                {/* Role Selection */}
                <View style={[authStyles.roleSelection, { marginBottom: 24 }]}>
                  <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 12 }]}>
                    Professional Role
                  </Text>
                  <View style={authStyles.roleButtons}>
                    <TouchableOpacity
                      style={[
                        authStyles.roleButton,
                        {
                          backgroundColor: colors.card,
                          borderColor: formData.role === 'doctor' ? Colors.primary : colors.border,
                        },
                        formData.role === 'doctor' && authStyles.roleButtonActive,
                      ]}
                      onPress={() => updateFormData('role', 'doctor')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          authStyles.roleButtonText,
                          {
                            color: formData.role === 'doctor' ? '#ffffff' : colors.text,
                          },
                        ]}
                      >
                        Doctor
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        authStyles.roleButton,
                        {
                          backgroundColor: colors.card,
                          borderColor: formData.role === 'lab_assistant' ? Colors.primary : colors.border,
                        },
                        formData.role === 'lab_assistant' && authStyles.roleButtonActive,
                      ]}
                      onPress={() => updateFormData('role', 'lab_assistant')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          authStyles.roleButtonText,
                          {
                            color: formData.role === 'lab_assistant' ? '#ffffff' : colors.text,
                          },
                        ]}
                      >
                        Lab Assistant
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 24 }]}>
                  <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                    License Number
                  </Text>
                  <View style={authStyles.inputWrapper}>
                    <Input
                      placeholder="Enter your license number"
                      value={formData.licenseNumber}
                      onChangeText={(value) => updateFormData('licenseNumber', value)}
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.licenseNumber ? Colors.light.error : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    <Award
                      size={18}
                      color={colors.textSecondary}
                      style={authStyles.inputIcon}
                    />
                  </View>
                  <Text style={[authStyles.passwordHint, { color: colors.textSecondary, marginTop: 6 }]}>
                    Your professional license or registration number
                  </Text>
                  {errors.licenseNumber && (
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>{errors.licenseNumber}</Text>
                  )}
                </View>

                {/* Doctor Verification Section */}
                {formData.role === 'doctor' && (
                  <View
                    style={[
                      authStyles.verificationSection,
                      {
                        backgroundColor: `${Colors.primary}08`,
                        borderColor: `${Colors.primary}20`,
                        marginBottom: 24,
                      },
                    ]}
                  >
                    <View style={authStyles.verificationHeader}>
                      <Shield size={20} color={Colors.primary} strokeWidth={2} />
                      <Text
                        style={[
                          authStyles.verificationTitle,
                          { color: Colors.primary },
                        ]}
                      >
                        Medical Council Verification
                      </Text>
                    </View>
                    <Text
                      style={[
                        authStyles.verificationSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      To ensure patient safety and maintain professional standards, we verify all doctor credentials through official medical council databases. This process typically takes 1-2 minutes.
                    </Text>

                    <View style={[authStyles.inputContainer, { marginBottom: 20 }]}>
                      <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                        Registration Number
                      </Text>
                      <Input
                        placeholder="Enter your medical registration number"
                        value={doctorVerificationData.registrationNo}
                        onChangeText={(value) =>
                          updateDoctorVerificationData('registrationNo', value)
                        }
                        style={[
                          authStyles.input,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            color: colors.text,
                          },
                        ]}
                      />
                    </View>

                    <View style={[authStyles.inputContainer, { marginBottom: 20 }]}>
                      <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                        Year of Registration
                      </Text>
                      <Input
                        placeholder="YYYY"
                        value={doctorVerificationData.yearOfRegistration}
                        onChangeText={(value) =>
                          updateDoctorVerificationData('yearOfRegistration', value)
                        }
                        keyboardType="numeric"
                        maxLength={4}
                        style={[
                          authStyles.input,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            color: colors.text,
                          },
                        ]}
                      />
                    </View>

                    <View style={[authStyles.inputContainer, { marginBottom: 20 }]}>
                      <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                        Medical Council Name
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowCouncilModal(true)}
                        style={[
                          authStyles.dropdownButton,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            authStyles.dropdownText,
                            {
                              color: doctorVerificationData.councilName
                                ? colors.text
                                : colors.textSecondary,
                            },
                          ]}
                        >
                          {doctorVerificationData.councilName ||
                            'Select Medical Council'}
                        </Text>
                        <Text style={[authStyles.dropdownArrow, { color: colors.textSecondary }]}>
                          ▼
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {verificationError && (
                      <Text style={[authStyles.errorText, { marginBottom: 16 }]}>{verificationError}</Text>
                    )}

                    {doctorVerificationStatus === 'verified' && (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: `${Colors.light.success}15`,
                        padding: 12,
                        borderRadius: 12,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: `${Colors.light.success}30`,
                      }}>
                        <CheckCircle size={20} color={Colors.light.success} />
                        <Text style={{
                          marginLeft: 10,
                          fontSize: 14,
                          fontFamily: 'Satoshi-Variable',
                          color: Colors.light.success,
                          fontWeight: '600',
                        }}>
                          Credentials verified successfully
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={verifyDoctorCredentials}
                      activeOpacity={0.8}
                      disabled={
                        isVerifyingDoctor ||
                        doctorVerificationStatus === 'verified'
                      }
                    >
                      <LinearGradient
                        colors={
                          doctorVerificationStatus === 'verified'
                            ? [Colors.light.success, Colors.light.success]
                            : isVerifyingDoctor
                              ? ['#9ca3af', '#6b7280']
                              : [Colors.primary, '#1e40af']
                        }
                        style={[
                          authStyles.verifyButton,
                          (isVerifyingDoctor || doctorVerificationStatus === 'verified') &&
                          authStyles.buttonDisabled,
                        ]}
                      >
                        <View style={authStyles.verifyButtonContent}>
                          {isVerifyingDoctor ? (
                            <LoadingSpinner size={20} color="#ffffff" />
                          ) : doctorVerificationStatus === 'verified' ? (
                            <CheckCircle size={20} color="#ffffff" />
                          ) : (
                            <Shield size={20} color="#ffffff" />
                          )}
                          <Text style={authStyles.verifyButtonText}>
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

                <View style={[authStyles.inputContainer, { marginBottom: 24 }]}>
                  <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                    Department / Specialty
                  </Text>
                  <View style={authStyles.inputWrapper}>
                    <Input
                      placeholder="e.g., Cardiology, Emergency, Laboratory"
                      value={formData.department}
                      onChangeText={(value) => updateFormData('department', value)}
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.department ? Colors.light.error : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    <Briefcase
                      size={18}
                      color={colors.textSecondary}
                      style={authStyles.inputIcon}
                    />
                  </View>
                  {errors.department && (
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>{errors.department}</Text>
                  )}
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 32 }]}>
                  <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                    Hospital / Clinic Name
                  </Text>
                  <View style={authStyles.inputWrapper}>
                    <Input
                      placeholder="Enter your workplace name"
                      value={formData.hospital}
                      onChangeText={(value) => updateFormData('hospital', value)}
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.hospital ? Colors.light.error : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    <Building
                      size={18}
                      color={colors.textSecondary}
                      style={authStyles.inputIcon}
                    />
                  </View>
                  {errors.hospital && (
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>{errors.hospital}</Text>
                  )}
                </View>

                {/* Security Section */}
                <View style={[authStyles.sectionHeader, { marginTop: 8, marginBottom: 24 }]}>
                  <View style={{ width: 3, height: 20, backgroundColor: Colors.primary, borderRadius: 2, marginRight: 12 }} />
                  <Lock size={18} color={Colors.primary} strokeWidth={2} />
                  <Text style={[authStyles.sectionTitle, { color: colors.text, fontSize: 20, marginLeft: 8 }]}>
                    Account Security
                  </Text>
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 24 }]}>
                  <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                    Password
                  </Text>
                  <View style={authStyles.inputWrapper}>
                    <Input
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChangeText={(value) => updateFormData('password', value)}
                      secureTextEntry={!showPassword}
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.password ? Colors.light.error : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    <TouchableOpacity
                      style={authStyles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={colors.textSecondary} />
                      ) : (
                        <Eye size={20} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={[authStyles.passwordHint, { color: colors.textSecondary, marginTop: 6 }]}>
                    Minimum 6 characters recommended for security
                  </Text>
                  {errors.password && (
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>{errors.password}</Text>
                  )}
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 32 }]}>
                  <Text style={[authStyles.inputLabel, { color: colors.text, marginBottom: 8 }]}>
                    Confirm Password
                  </Text>
                  <View style={authStyles.inputWrapper}>
                    <Input
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChangeText={(value) => updateFormData('confirmPassword', value)}
                      secureTextEntry={!showConfirmPassword}
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.confirmPassword ? Colors.light.error : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    <TouchableOpacity
                      style={authStyles.eyeIcon}
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
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>{errors.confirmPassword}</Text>
                  )}
                </View>

                {/* Primary CTA */}
                <TouchableOpacity
                  onPress={handleSignup}
                  activeOpacity={0.8}
                  disabled={isSubmitting || isLoading || otpLoading}
                >
                  <LinearGradient
                    colors={[Colors.primary, '#1e40af']}
                    style={[
                      authStyles.primaryButton,
                      (isSubmitting || isLoading || otpLoading) && authStyles.buttonDisabled,
                    ]}
                  >
                    {isSubmitting || isLoading || otpLoading ? (
                      <LoadingSpinner size={24} color="white" />
                    ) : (
                      <Text style={authStyles.primaryButtonText}>
                        Create Doctor Account
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </AnimatedView>

              {/* Footer */}
              <AnimatedView
                entering={FadeInDown.delay(500).springify()}
                style={[authStyles.footer, { marginTop: 24, marginBottom: 32 }]}
              >
                <Text style={[authStyles.footerText, { color: colors.textSecondary, fontSize: 15 }]}>
                  Already registered?{' '}
                  <Text
                    style={[authStyles.linkText, { fontSize: 15, fontWeight: '600' }]}
                    onPress={() => router.push('/auth/healthcare-login')}
                  >
                    Login
                  </Text>
                </Text>
              </AnimatedView>
            </AnimatedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Council Selection Modal */}
      <Modal
        visible={showCouncilModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCouncilModal(false)}
      >
        <View style={authStyles.councilModalOverlay}>
          <AnimatedView
            entering={FadeInDown.springify()}
            style={[
              authStyles.councilModalContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={authStyles.councilModalHeader}>
              <Text
                style={[
                  authStyles.councilModalTitle,
                  { color: colors.text },
                ]}
              >
                Select Medical Council
              </Text>
              <TouchableOpacity
                onPress={() => setShowCouncilModal(false)}
                style={authStyles.closeButton}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={authStyles.councilList}>
              {MEDICAL_COUNCILS.map((council, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    authStyles.councilItem,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    updateDoctorVerificationData('councilName', council);
                    setShowCouncilModal(false);
                  }}
                >
                  <Text
                    style={[
                      authStyles.councilItemText,
                      { color: colors.text },
                      doctorVerificationData.councilName === council && {
                        color: Colors.primary,
                        fontWeight: '600',
                      },
                    ]}
                  >
                    {council}
                  </Text>
                  {doctorVerificationData.councilName === council && (
                    <CheckCircle size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </AnimatedView>
        </View>
      </Modal>

      {/* OTP Modal */}
      <Modal
        visible={showOtpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View style={authStyles.modalOverlay}>
          <AnimatedView
            entering={FadeInDown.springify()}
            style={[authStyles.modalContent, { backgroundColor: colors.card }]}
          >
            <Text style={[authStyles.modalTitle, { color: colors.text }]}>
              Verify Your Email
            </Text>
            <Text style={[authStyles.modalDescription, { color: colors.textSecondary }]}>
              We've sent a verification code to {formData.email}. Please enter it below to complete your professional registration.
            </Text>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter 6-digit code"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              style={[
                authStyles.otpInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              maxLength={6}
            />
            {otpError ? (
              <Text style={authStyles.otpError}>{otpError}</Text>
            ) : null}
            <Button
              title={otpLoading ? 'Verifying...' : 'Verify & Continue'}
              onPress={handleVerifyOtp}
              disabled={otpLoading || otp.length !== 6}
            />
            <Button
              title="Cancel"
              onPress={() => setShowOtpModal(false)}
              style={{ marginTop: 12 }}
              variant="secondary"
            />
          </AnimatedView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
