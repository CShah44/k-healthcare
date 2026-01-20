import React, { useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomAlert } from '@/components/CustomAlert';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PatientLoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});
  const { showAlert, AlertComponent } = useCustomAlert();
  const { login, isLoading, forgotPassword } = useAuth()!;
  const { colors } = useTheme();
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const validateForm = () => {
    const newErrors: { identifier?: string; password?: string } = {};
    if (!identifier)
      newErrors.identifier = 'Username, email, or phone is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await login(identifier, password, 'patient');
      router.replace('/(patient-tabs)');
    } catch (error: any) {
      showAlert('Login Failed', error.message || 'Invalid credentials. Please try again.');
      setIsSubmitting(false);
    } finally {
      // We don't set submitting to false on success because we're redirecting
      // and we want to keep the loader until unmount/redirect to prevent flash
      if (errors) setIsSubmitting(false); // Fallback safe
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      showAlert('Error', 'Please enter your email.');
      return;
    }
    try {
      await forgotPassword(resetEmail);
      showAlert('Success', 'Password reset email sent!');
      setShowForgot(false);
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to send reset email.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.fullscreenLoadingContainer}>
        <LinearGradient
          colors={[colors.background, colors.surface, colors.card]}
          style={styles.loadingGradient}
        >
          {/* Decorative Elements */}
          <View style={[styles.loadingDecorativeCircle1, { backgroundColor: `${Colors.primary}08` }]} />
          <View style={[styles.loadingDecorativeCircle2, { backgroundColor: `${Colors.medical.green}06` }]} />
          <View style={[styles.loadingDecorativeCircle3, { backgroundColor: `${Colors.medical.blue}05` }]} />

          {/* Main Loading Content */}
          <View style={styles.loadingContent}>
            {/* Logo/Icon */}
            <View style={[styles.loadingIconWrapper, {
              backgroundColor: `${Colors.primary}15`,
              borderColor: `${Colors.primary}30`,
              shadowColor: colors.shadow
            }]}>
              <Heart size={48} color={Colors.primary} strokeWidth={2} />
            </View>

            {/* Loading Spinner */}
            <View style={styles.spinnerContainer}>
              <LoadingSpinner size={48} />
            </View>

            {/* Loading Text */}
            <Text style={[styles.loadingTitle, { color: colors.text }]}>
              Signing you in...
            </Text>
            <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>
              Please wait while we verify your credentials
            </Text>

            {/* Loading Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <LinearGradient
                  colors={Colors.gradients.primary}
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
        {/* Decorative Elements */}
        <View
          style={[
            styles.decorativeCircle,
            { backgroundColor: `${Colors.primary}08` },
          ]}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => router.replace('/auth/role-selection')}
            disabled={isSubmitting}
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Content */}
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
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Log in to your Svastheya account
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Username / Email / Phone
              </Text>
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Enter your username, email, or phone"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  editable={!isSubmitting}
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
              {errors.identifier && (
                <Text style={styles.errorText}>{errors.identifier}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Password
              </Text>
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isSubmitting}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.text,
                    },
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
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => setShowForgot(true)}
              disabled={isSubmitting}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={Colors.gradients.primary}
                style={styles.signInButton}
              >
                {isSubmitting ? (
                  <LoadingSpinner size={24} color="white" />
                ) : (
                  <Text style={styles.signInButtonText}>Log In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
              <Text
                style={styles.signUpLink}
                onPress={() => router.push('/auth/patient-signup')}
              >
                Sign Up
              </Text>
            </Text>
          </View>
        </View>
      </LinearGradient>

      <AlertComponent />
      <Modal
        visible={showForgot}
        transparent
        animationType="slide"
        onRequestClose={() => setShowForgot(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.forgotTitle, { color: colors.text }]}>
              Reset Password
            </Text>
            <Text
              style={[styles.forgotDescription, { color: colors.textSecondary }]}
            >
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>
            <TextInput
              placeholder="Email address"
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[
                styles.input,
                styles.resetInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />
            <Button title="Send Reset Email" onPress={handleForgotPassword} />
            <Button
              title="Cancel"
              onPress={() => {
                setShowForgot(false);
                setResetEmail('');
              }}
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

  backgroundGradient: {
    flex: 1,
  },

  decorativeCircle: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
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

  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
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
  },

  formContainer: {
    marginBottom: 30,
  },

  inputContainer: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 8,
    fontWeight: '500',
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

  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },

  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
  },

  signInButton: {
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

  signInButtonText: {
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

  signUpLink: {
    color: Colors.primary,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },

  loadingText: {
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Satoshi-Variable',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modalContent: {
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  forgotTitle: {
    fontSize: 20,
    fontFamily: 'IvyMode-Regular',
    marginBottom: 8,
  },

  forgotDescription: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 16,
    lineHeight: 20,
  },

  resetInput: {
    marginBottom: 16,
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
