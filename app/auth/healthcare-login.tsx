import React, { useState } from 'react';
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
import { ArrowLeft, Stethoscope, Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');

export default function HealthcareLoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const { login, isLoading, forgotPassword } = useAuth();
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [role, setRole] = useState<'doctor' | 'lab_assistant'>('doctor');

  const validateForm = () => {
    const newErrors: { identifier?: string; password?: string } = {};
    if (!identifier) newErrors.identifier = 'Username, email, or phone is required';
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
      <SafeAreaView style={[GlobalStyles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={['#f8fafc', '#e2e8f0']}
          style={styles.loadingGradient}
        >
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Signing you in...</Text>
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
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={Colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.iconWrapper}>
              <Stethoscope size={32} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Healthcare Professional Portal</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username / Email / Phone</Text>
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Enter your username, email, or phone"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
              {errors.identifier && (
                <Text style={styles.errorText}>{errors.identifier}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
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

            <TouchableOpacity style={styles.forgotPassword} onPress={() => setShowForgot(true)}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
              <LinearGradient
                colors={[Colors.primary, '#1e40af']}
                style={styles.signInButton}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
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

        {showForgot && (
          <View style={{ marginVertical: 16 }}>
            <Text style={{ marginBottom: 8 }}>Enter your email to reset password:</Text>
            <Input
              placeholder="Email address"
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
              style={styles.input}
            />
            <Button title="Send Reset Email" onPress={handleForgotPassword} />
            {resetMessage ? <Text style={{ color: 'green', marginTop: 8 }}>{resetMessage}</Text> : null}
            <Button title="Close" onPress={() => setShowForgot(false)} style={{ marginTop: 8 }} />
          </View>
        )}
      </LinearGradient>
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

  decorativeCircle: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
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
  },

  formContainer: {
    marginBottom: 30,
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

  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },

  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
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

  signUpLink: {
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
