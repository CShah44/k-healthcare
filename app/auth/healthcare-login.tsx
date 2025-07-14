import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Stethoscope, Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');

export default function HealthcareLoginScreen() {
  const { colors, isDarkMode } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});
  const { login, isLoading, forgotPassword } = useAuth();
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [role, setRole] = useState<'doctor' | 'lab_assistant'>('doctor');

  const validateForm = () => {
    const newErrors: { identifier?: string; password?: string } = {};
    if (!identifier)
      newErrors.identifier = 'Username, email, or phone is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    try {
      await login(identifier, password, role);
      router.replace('/(healthcare-tabs)');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setResetMessage('Please enter your email.');
      return;
    }
    try {
      await forgotPassword(resetEmail);
      setResetMessage('Password reset email sent!');
    } catch (e) {
      setResetMessage('Failed to send reset email.');
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
              <Stethoscope size={48} color={Colors.primary} strokeWidth={2} />
            </View>

            {/* Loading Spinner */}
            <View style={styles.spinnerContainer}>
              <LoadingSpinner size={48} />
            </View>

            {/* Loading Text */}
            <Text style={[styles.loadingTitle, { color: colors.text }]}>
              Signing you in...
            </Text>
            <Text
              style={[styles.loadingSubtitle, { color: colors.textSecondary }]}
            >
              Please wait while we authenticate your credentials
            </Text>
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
            { backgroundColor: `${Colors.primary}05` },
          ]}
        />

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
              <Stethoscope size={32} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Healthcare Professional Portal
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Username / Email / Phone *
              </Text>
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Enter your username, email, or phone"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                    errors.identifier && styles.inputError,
                  ]}
                />
              </View>
              {errors.identifier && (
                <Text style={styles.errorText}>{errors.identifier}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Password *
              </Text>
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
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
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => setShowForgot(true)}
            >
              <Text
                style={[styles.forgotPasswordText, { color: Colors.primary }]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.8}
              style={styles.signInButtonContainer}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.medical.green]}
                style={styles.signInButton}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Need an account?{' '}
              <Text
                style={styles.signUpLink}
                onPress={() => router.push('/auth/healthcare-signup')}
              >
                Register
              </Text>
            </Text>
          </View>
        </View>

        {/* Forgot Password Modal */}
        <Modal
          visible={showForgot}
          transparent
          animationType="slide"
          onRequestClose={() => setShowForgot(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Reset Password
              </Text>
              <Text
                style={[
                  styles.modalDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Enter your email address and we'll send you a link to reset your
                password.
              </Text>
              <TextInput
                value={resetEmail}
                onChangeText={setResetEmail}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.resetInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
              />
              {resetMessage ? (
                <Text
                  style={[
                    styles.resetMessage,
                    {
                      color: resetMessage.includes('sent')
                        ? Colors.light.success
                        : Colors.light.error,
                    },
                  ]}
                >
                  {resetMessage}
                </Text>
              ) : null}
              <Button title="Send Reset Email" onPress={handleForgotPassword} />
              <Button
                title="Cancel"
                onPress={() => setShowForgot(false)}
                style={{ marginTop: 8 }}
                variant="secondary"
              />
            </View>
          </View>
        </Modal>
      </LinearGradient>
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
    lineHeight: 22,
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

  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },

  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
  },

  signInButtonContainer: {
    marginTop: 8,
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
    lineHeight: 20,
  },

  resetInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },

  resetMessage: {
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
    lineHeight: 24,
  },
});
