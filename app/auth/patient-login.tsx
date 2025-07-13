import React, { useState } from 'react';
import {
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { query, where, getDocs } from 'firebase/firestore';

import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
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
  const { login, isLoading, forgotPassword } = useAuth();
  const { colors } = useTheme();
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

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
      await login(identifier, password, 'patient');
      router.replace('/(patient-tabs)');
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
      <SafeAreaView style={[GlobalStyles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={[colors.background, colors.surface]}
          style={styles.loadingGradient}
        >
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Signing you in...
          </Text>
        </LinearGradient>
      </SafeAreaView>
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
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
              <LinearGradient
                colors={Colors.gradients.primary}
                style={styles.signInButton}
              >
                <Text style={styles.signInButtonText}>Log In</Text>
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

      {showForgot && (
        <View style={[styles.forgotModal, { backgroundColor: colors.card }]}>
          <Text style={[styles.forgotTitle, { color: colors.text }]}>
            Reset Password
          </Text>
          <Text
            style={[styles.forgotDescription, { color: colors.textSecondary }]}
          >
            Enter your email to reset password:
          </Text>
          <Input
            placeholder="Email address"
            value={resetEmail}
            onChangeText={setResetEmail}
            autoCapitalize="none"
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <Button title="Send Reset Email" onPress={handleForgotPassword} />
          {resetMessage ? (
            <Text
              style={[styles.resetMessage, { color: Colors.medical.green }]}
            >
              {resetMessage}
            </Text>
          ) : null}
          <Button
            title="Close"
            onPress={() => setShowForgot(false)}
            style={{ marginTop: 8 }}
          />
        </View>
      )}
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

  forgotModal: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 24,
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
  },

  resetMessage: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginTop: 8,
    textAlign: 'center',
  },
});
