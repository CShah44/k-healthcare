import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
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
  Lock,
  Mail,
  Phone,
  Shield,
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
import { authStyles } from '@/styles/auth';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

export default function PatientSignupScreen() {
  const colors = Colors.light;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(20);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    formOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(
      200,
      withSpring(0, { damping: 18, stiffness: 100 }),
    );
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

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

    if (!formData.firstName.trim())
      newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.middleName.trim())
      newErrors.middleName = 'Middle name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (
      !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber.replace(/\s/g, ''))
    ) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (
      !/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/.test(
        formData.dateOfBirth,
      )
    ) {
      newErrors.dateOfBirth = 'Please use MM/DD/YYYY format';
    } else {
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

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please enter a complete address';
    }

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
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 5) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(
        4,
        8,
      )}`;
    } else if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else {
      return cleaned;
    }
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
        10,
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
        'Please fix the errors in the form and try again.',
      );
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    setOtpError('');
    try {
      // Use 10.0.2.2 for Android Emulator, localhost for iOS/Web
      const apiUrl =
        Platform.OS === 'android'
          ? 'http://10.0.2.2:3001/signup'
          : 'http://localhost:3001/signup';

      const response = await fetch(apiUrl, {
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
    setOtpError('');
    try {
      // Use 10.0.2.2 for Android Emulator, localhost for iOS/Web
      const apiUrl =
        Platform.OS === 'android'
          ? 'http://10.0.2.2:3001/verify-otp'
          : 'http://localhost:3001/verify-otp';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await response.json();
      if (data.success) {
        setShowOtpModal(false);
        setIsSubmitting(true);
        try {
          await signup({
            ...formData,
            role: 'patient',
          });

          setIsSubmitting(false); // Stop loading before showing alert

          Alert.alert(
            'Account Created Successfully! 🎉',
            'Welcome to Svastheya! Your account has been created and you are now signed in.',
            [
              {
                text: 'Get Started',
                onPress: () => router.replace('/(patient-tabs)'),
              },
            ],
          );
        } catch (error) {
          setIsSubmitting(false);
          Alert.alert(
            'Signup Failed',
            'Failed to create account. Please try again.',
          );
        }
      } else {
        setOtpError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  if (isLoading || isSubmitting) {
    return (
      <View style={authStyles.fullscreenLoadingContainer}>
        <LinearGradient
          colors={[colors.background, colors.surface, colors.card]}
          style={authStyles.loadingGradient}
        >
          <View
            style={[
              authStyles.loadingDecorativeCircle1,
              { backgroundColor: `${Colors.primary}08` },
            ]}
          />
          <View
            style={[
              authStyles.loadingDecorativeCircle2,
              { backgroundColor: `${Colors.medical.green}06` },
            ]}
          />
          <View
            style={[
              authStyles.loadingDecorativeCircle3,
              { backgroundColor: `${Colors.medical.blue}05` },
            ]}
          />
          <View style={authStyles.loadingContent}>
            <View
              style={[
                authStyles.loadingIconWrapper,
                {
                  backgroundColor: `${Colors.primary}15`,
                  borderColor: `${Colors.primary}30`,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <Heart size={48} color={Colors.primary} strokeWidth={2} />
            </View>
            <View style={authStyles.spinnerContainer}>
              <LoadingSpinner size={48} />
            </View>
            <Text style={[authStyles.loadingTitle, { color: colors.text }]}>
              Creating your account...
            </Text>
            <Text
              style={[
                authStyles.loadingSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              Please wait while we set up your profile
            </Text>
            <View style={authStyles.progressContainer}>
              <View
                style={[
                  authStyles.progressBar,
                  { backgroundColor: colors.border },
                ]}
              >
                <LinearGradient
                  colors={[
                    Colors.primary,
                    Colors.medical.green,
                    Colors.medical.blue,
                  ]}
                  style={authStyles.progressFill}
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
      style={[authStyles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={authStyles.backgroundGradient}
      >
        <View
          style={[
            authStyles.decorativeCircle,
            { backgroundColor: `${Colors.primary}04` },
          ]}
        />

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
            contentContainerStyle={[
              authStyles.scrollContent,
              { paddingHorizontal: 24 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedView style={formStyle}>
              {/* Header Section */}
              <AnimatedView
                entering={FadeInDown.delay(100).springify()}
                style={[
                  authStyles.logoContainer,
                  { marginTop: 8, marginBottom: 40 },
                ]}
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
                  <Heart size={32} color={Colors.primary} strokeWidth={2.5} />
                </View>
                <AnimatedText
                  entering={FadeInDown.delay(200).springify()}
                  style={[
                    authStyles.title,
                    { color: colors.text, fontSize: 32, marginBottom: 8 },
                  ]}
                >
                  Create Patient Account
                </AnimatedText>
                <AnimatedText
                  entering={FadeInDown.delay(300).springify()}
                  style={[
                    authStyles.subtitle,
                    {
                      color: colors.textSecondary,
                      fontSize: 15,
                      lineHeight: 22,
                    },
                  ]}
                >
                  Your health records, your control. Secure and private.
                </AnimatedText>
              </AnimatedView>

              <AnimatedView
                entering={FadeInDown.delay(400).springify()}
                style={authStyles.formContainer}
              >
                {/* Basic Information Section */}
                <View style={[authStyles.sectionHeader, { marginBottom: 24 }]}>
                  <View
                    style={{
                      width: 3,
                      height: 20,
                      backgroundColor: Colors.primary,
                      borderRadius: 2,
                      marginRight: 12,
                    }}
                  />
                  <User size={18} color={Colors.primary} strokeWidth={2} />
                  <Text
                    style={[
                      authStyles.sectionTitle,
                      { color: colors.text, fontSize: 20, marginLeft: 8 },
                    ]}
                  >
                    Basic Information
                  </Text>
                </View>

                <View style={[authStyles.nameRow, { marginBottom: 24 }]}>
                  <View style={authStyles.nameInputContainer}>
                    <Text
                      style={[
                        authStyles.inputLabel,
                        { color: colors.text, marginBottom: 8 },
                      ]}
                    >
                      First Name
                    </Text>
                    <Input
                      placeholder="First name"
                      value={formData.firstName}
                      onChangeText={(value) =>
                        updateFormData('firstName', value)
                      }
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.firstName
                            ? Colors.light.error
                            : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    {errors.firstName && (
                      <Text style={[authStyles.errorText, { marginTop: 6 }]}>
                        {errors.firstName}
                      </Text>
                    )}
                  </View>
                  <View style={authStyles.nameInputContainer}>
                    <Text
                      style={[
                        authStyles.inputLabel,
                        { color: colors.text, marginBottom: 8 },
                      ]}
                    >
                      Middle Name
                    </Text>
                    <Input
                      placeholder="Middle name"
                      value={formData.middleName}
                      onChangeText={(value) =>
                        updateFormData('middleName', value)
                      }
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.middleName
                            ? Colors.light.error
                            : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    {errors.middleName && (
                      <Text style={[authStyles.errorText, { marginTop: 6 }]}>
                        {errors.middleName}
                      </Text>
                    )}
                  </View>
                  <View style={authStyles.nameInputContainer}>
                    <Text
                      style={[
                        authStyles.inputLabel,
                        { color: colors.text, marginBottom: 8 },
                      ]}
                    >
                      Last Name
                    </Text>
                    <Input
                      placeholder="Last name"
                      value={formData.lastName}
                      onChangeText={(value) =>
                        updateFormData('lastName', value)
                      }
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.lastName
                            ? Colors.light.error
                            : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    {errors.lastName && (
                      <Text style={[authStyles.errorText, { marginTop: 6 }]}>
                        {errors.lastName}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 24 }]}>
                  <Text
                    style={[
                      authStyles.inputLabel,
                      { color: colors.text, marginBottom: 8 },
                    ]}
                  >
                    Date of Birth
                  </Text>
                  <View style={authStyles.inputWrapper}>
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
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.dateOfBirth
                            ? Colors.light.error
                            : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    <Calendar
                      size={18}
                      color={colors.textSecondary}
                      style={authStyles.inputIcon}
                    />
                  </View>
                  {errors.dateOfBirth && (
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>
                      {errors.dateOfBirth}
                    </Text>
                  )}
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 24 }]}>
                  <Text
                    style={[
                      authStyles.inputLabel,
                      { color: colors.text, marginBottom: 8 },
                    ]}
                  >
                    Gender
                  </Text>
                  <TouchableOpacity
                    style={[
                      authStyles.dropdownButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: errors.gender
                          ? Colors.light.error
                          : colors.border,
                      },
                    ]}
                    onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                  >
                    <Text
                      style={[
                        authStyles.dropdownText,
                        {
                          color: formData.gender
                            ? colors.text
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      {formData.gender
                        ? genderOptions.find(
                            (opt) => opt.value === formData.gender,
                          )?.label
                        : 'Select gender'}
                    </Text>
                    <Text
                      style={[
                        authStyles.dropdownArrow,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {showGenderDropdown ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>
                  {showGenderDropdown && (
                    <View
                      style={[
                        authStyles.dropdownMenu,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      {genderOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            authStyles.dropdownOption,
                            { borderBottomColor: colors.border },
                          ]}
                          onPress={() => {
                            updateFormData('gender', option.value);
                            setShowGenderDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              authStyles.dropdownOptionText,
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
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>
                      {errors.gender}
                    </Text>
                  )}
                </View>

                {/* Contact Information Section */}
                <View
                  style={[
                    authStyles.sectionHeader,
                    { marginTop: 32, marginBottom: 24 },
                  ]}
                >
                  <View
                    style={{
                      width: 3,
                      height: 20,
                      backgroundColor: Colors.primary,
                      borderRadius: 2,
                      marginRight: 12,
                    }}
                  />
                  <Mail size={18} color={Colors.primary} strokeWidth={2} />
                  <Text
                    style={[
                      authStyles.sectionTitle,
                      { color: colors.text, fontSize: 20, marginLeft: 8 },
                    ]}
                  >
                    Contact Information
                  </Text>
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 24 }]}>
                  <Text
                    style={[
                      authStyles.inputLabel,
                      { color: colors.text, marginBottom: 8 },
                    ]}
                  >
                    Email Address
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
                      authStyles.input,
                      {
                        backgroundColor: colors.card,
                        borderColor: errors.email
                          ? Colors.light.error
                          : colors.border,
                        color: colors.text,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      authStyles.passwordHint,
                      { color: colors.textSecondary, marginTop: 6 },
                    ]}
                  >
                    We'll use this to verify your account and send important
                    updates
                  </Text>
                  {errors.email && (
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>
                      {errors.email}
                    </Text>
                  )}
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 24 }]}>
                  <Text
                    style={[
                      authStyles.inputLabel,
                      { color: colors.text, marginBottom: 8 },
                    ]}
                  >
                    Phone Number
                  </Text>
                  <View style={authStyles.inputWrapper}>
                    <Input
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChangeText={(value) => {
                        const formatted = formatPhoneNumber(value);
                        updateFormData('phoneNumber', formatted);
                      }}
                      keyboardType="phone-pad"
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.phoneNumber
                            ? Colors.light.error
                            : colors.border,
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
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>
                      {errors.phoneNumber}
                    </Text>
                  )}
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 24 }]}>
                  <Text
                    style={[
                      authStyles.inputLabel,
                      { color: colors.text, marginBottom: 8 },
                    ]}
                  >
                    Address
                  </Text>
                  <View style={authStyles.inputWrapper}>
                    <Input
                      placeholder="Enter your complete address"
                      value={formData.address}
                      onChangeText={(value) => updateFormData('address', value)}
                      multiline
                      numberOfLines={2}
                      style={[
                        authStyles.input,
                        authStyles.multilineInput,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.address
                            ? Colors.light.error
                            : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    <MapPin
                      size={18}
                      color={colors.textSecondary}
                      style={[authStyles.inputIcon, { top: 16 }]}
                    />
                  </View>
                  {errors.address && (
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>
                      {errors.address}
                    </Text>
                  )}
                </View>

                {/* Security Section */}
                <View
                  style={[
                    authStyles.sectionHeader,
                    { marginTop: 32, marginBottom: 24 },
                  ]}
                >
                  <View
                    style={{
                      width: 3,
                      height: 20,
                      backgroundColor: Colors.primary,
                      borderRadius: 2,
                      marginRight: 12,
                    }}
                  />
                  <Lock size={18} color={Colors.primary} strokeWidth={2} />
                  <Text
                    style={[
                      authStyles.sectionTitle,
                      { color: colors.text, fontSize: 20, marginLeft: 8 },
                    ]}
                  >
                    Account Security
                  </Text>
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 24 }]}>
                  <Text
                    style={[
                      authStyles.inputLabel,
                      { color: colors.text, marginBottom: 8 },
                    ]}
                  >
                    Password
                  </Text>
                  <View style={authStyles.inputWrapper}>
                    <Input
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChangeText={(value) =>
                        updateFormData('password', value)
                      }
                      secureTextEntry={!showPassword}
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.password
                            ? Colors.light.error
                            : colors.border,
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
                  <Text
                    style={[
                      authStyles.passwordHint,
                      { color: colors.textSecondary, marginTop: 6 },
                    ]}
                  >
                    Must be at least 8 characters with uppercase, lowercase, and
                    number
                  </Text>
                  {errors.password && (
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>
                      {errors.password}
                    </Text>
                  )}
                </View>

                <View style={[authStyles.inputContainer, { marginBottom: 32 }]}>
                  <Text
                    style={[
                      authStyles.inputLabel,
                      { color: colors.text, marginBottom: 8 },
                    ]}
                  >
                    Confirm Password
                  </Text>
                  <View style={authStyles.inputWrapper}>
                    <Input
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChangeText={(value) =>
                        updateFormData('confirmPassword', value)
                      }
                      secureTextEntry={!showConfirmPassword}
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.confirmPassword
                            ? Colors.light.error
                            : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    <TouchableOpacity
                      style={authStyles.eyeIcon}
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
                    <Text style={[authStyles.errorText, { marginTop: 6 }]}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>

                {/* Data Privacy Notice */}
                <View
                  style={{
                    backgroundColor: `${Colors.primary}08`,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 32,
                    borderWidth: 1,
                    borderColor: `${Colors.primary}15`,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                    }}
                  >
                    <Shield
                      size={18}
                      color={Colors.primary}
                      strokeWidth={2}
                      style={{ marginRight: 10, marginTop: 2 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontFamily: 'Satoshi-Variable',
                          fontWeight: '600',
                          color: colors.text,
                          marginBottom: 6,
                        }}
                      >
                        Your Data, Your Control
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: 'Satoshi-Variable',
                          color: colors.textSecondary,
                          lineHeight: 20,
                        }}
                      >
                        You own and control all your medical records. We use
                        bank-level encryption to keep your information secure
                        and private.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Primary CTA */}
                <TouchableOpacity
                  onPress={handleSignup}
                  activeOpacity={0.8}
                  disabled={isLoading || otpLoading}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.medical.green]}
                    style={[
                      authStyles.primaryButton,
                      (isLoading || otpLoading) && authStyles.buttonDisabled,
                    ]}
                  >
                    {isLoading || otpLoading ? (
                      <LoadingSpinner size={24} color="white" />
                    ) : (
                      <Text style={authStyles.primaryButtonText}>
                        Create Patient Account
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
                <Text
                  style={[
                    authStyles.footerText,
                    { color: colors.textSecondary, fontSize: 15 },
                  ]}
                >
                  Already have an account?{' '}
                  <Text
                    style={[
                      authStyles.linkText,
                      { fontSize: 15, fontWeight: '600' },
                    ]}
                    onPress={() => router.push('/auth/patient-login')}
                  >
                    Login
                  </Text>
                </Text>
              </AnimatedView>
            </AnimatedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

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
            <Text
              style={[
                authStyles.modalDescription,
                { color: colors.textSecondary },
              ]}
            >
              We've sent a verification code to {formData.email}. Please enter
              it below to complete your registration.
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
