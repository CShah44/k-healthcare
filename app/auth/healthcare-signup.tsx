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
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Stethoscope, Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
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

interface SignupData extends UserData {
  password: string;
  confirmPassword: string;
}

export default function HealthcareSignupScreen() {
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  
  // Get auth context with fallback
  const authContext = useAuth();
  const { signup, isLoading } = authContext || { signup: null, isLoading: false };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.middleName.trim()) newErrors.middleName = 'Middle name is required';

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

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[GlobalStyles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={['#f8fafc', '#e2e8f0']}
          style={styles.loadingGradient}
        >
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>
            Creating your professional account...
          </Text>
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
                <Stethoscope size={32} color={Colors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.title}>Professional Registration</Text>
              <Text style={styles.subtitle}>
                Join Svastheya Healthcare Network
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.nameRow}>
                <View style={styles.nameInputContainer}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <Input
                    placeholder="First name"
                    value={formData.firstName}
                    onChangeText={(value) => updateFormData('firstName', value)}
                    style={styles.input}
                  />
                  {errors.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                </View>
                <View style={styles.nameInputContainer}>
                  <Text style={styles.inputLabel}>Middle Name</Text>
                  <Input
                    placeholder="Middle name"
                    value={formData.middleName}
                    onChangeText={(value) => updateFormData('middleName', value)}
                    style={styles.input}
                  />
                  {errors.middleName && (
                    <Text style={styles.errorText}>{errors.middleName}</Text>
                  )}
                </View>
                <View style={styles.nameInputContainer}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <Input
                    placeholder="Last name"
                    value={formData.lastName}
                    onChangeText={(value) => updateFormData('lastName', value)}
                    style={styles.input}
                  />
                  {errors.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Professional Email</Text>
                <Input
                  placeholder="Enter your work email"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <Input
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChangeText={(value) => updateFormData('phoneNumber', value)}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
                {errors.phoneNumber && (
                  <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                )}
              </View>

              <View style={styles.roleSelection}>
                <Text style={styles.inputLabel}>Professional Role</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      formData.role === 'doctor' && styles.roleButtonActive,
                    ]}
                    onPress={() => updateFormData('role', 'doctor')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        formData.role === 'doctor' &&
                          styles.roleButtonTextActive,
                      ]}
                    >
                      Doctor
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      formData.role === 'lab_assistant' &&
                        styles.roleButtonActive,
                    ]}
                    onPress={() => updateFormData('role', 'lab_assistant')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
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
                <Text style={styles.inputLabel}>License Number</Text>
                <Input
                  placeholder="Enter your license number"
                  value={formData.licenseNumber}
                  onChangeText={(value) =>
                    updateFormData('licenseNumber', value)
                  }
                  style={styles.input}
                />
                {errors.licenseNumber && (
                  <Text style={styles.errorText}>{errors.licenseNumber}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Department</Text>
                <Input
                  placeholder="e.g., Cardiology, Emergency, Laboratory"
                  value={formData.department}
                  onChangeText={(value) => updateFormData('department', value)}
                  style={styles.input}
                />
                {errors.department && (
                  <Text style={styles.errorText}>{errors.department}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Hospital/Clinic</Text>
                <Input
                  placeholder="Enter your workplace name"
                  value={formData.hospital}
                  onChangeText={(value) => updateFormData('hospital', value)}
                  style={styles.input}
                />
                {errors.hospital && (
                  <Text style={styles.errorText}>{errors.hospital}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Address</Text>
                <Input
                  placeholder="Enter your address"
                  value={formData.address}
                  onChangeText={(value) => updateFormData('address', value)}
                  style={styles.input}
                />
                {errors.address && (
                  <Text style={styles.errorText}>{errors.address}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Gender</Text>
                <Input
                  placeholder="Gender (male, female, other)"
                  value={formData.gender}
                  onChangeText={(value) => updateFormData('gender', value)}
                  style={styles.input}
                />
                {errors.gender && (
                  <Text style={styles.errorText}>{errors.gender}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Input
                    placeholder="Create a password"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    secureTextEntry={!showPassword}
                    style={styles.input}
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
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Input
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChangeText={(value) =>
                      updateFormData('confirmPassword', value)
                    }
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
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
                style={[
                  styles.signUpButtonContainer,
                  (isSubmitting || isLoading) && styles.buttonDisabled
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
                    {isSubmitting ? 'Creating Account...' : 'Create Professional Account'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
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
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },

  formContainer: {
    marginBottom: 30,
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

  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },

  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },

  roleSelection: {
    marginBottom: 20,
  },

  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  roleButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.2)',
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
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },

  roleButtonTextActive: {
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },

  signUpButtonContainer: {
    marginTop: 8,
  },

  buttonDisabled: {
    opacity: 0.7,
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
});