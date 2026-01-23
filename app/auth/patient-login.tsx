import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Eye, EyeOff } from 'lucide-react-native';
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
import { useCustomAlert } from '@/components/CustomAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { authStyles } from '@/styles/auth';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

export default function PatientLoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});
  const { showAlert, AlertComponent } = useCustomAlert();
  const { login, isLoading, forgotPassword, user, userData } = useAuth()!;
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

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

  const validateForm = () => {
    const newErrors: { identifier?: string; password?: string } = {};
    if (!identifier)
      newErrors.identifier = 'Username, email, or phone is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-redirect when user becomes authenticated
  useEffect(() => {
    if (user && userData && userData.role === 'patient' && isSubmitting) {
      // User is authenticated, navigate to patient tabs
      router.replace('/(patient-tabs)');
      // Keep loading visible for smooth transition
      setTimeout(() => {
        setIsNavigating(false);
        setIsSubmitting(false);
      }, 200);
    }
  }, [user, userData, isSubmitting, router]);

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setIsNavigating(true);
    try {
      await login(identifier, password, 'patient');
      // Don't navigate here - let useEffect handle it when auth state updates
      // This ensures smooth transition without flashing
    } catch (error: any) {
      setIsNavigating(false);
      setIsSubmitting(false);
      showAlert(
        'Login Failed',
        error.message || 'Invalid credentials. Please try again.',
      );
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

  const colors = Colors.light;

  // Show loading screen during login submission or navigation
  if (isLoading || isSubmitting || isNavigating) {
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
              Signing you in...
            </Text>
            <Text
              style={[
                authStyles.loadingSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              Please wait while we verify your credentials
            </Text>
            <View style={authStyles.progressContainer}>
              <View
                style={[
                  authStyles.progressBar,
                  { backgroundColor: colors.border },
                ]}
              >
                <LinearGradient
                  colors={Colors.gradients.primary}
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
            { backgroundColor: `${Colors.primary}06` },
          ]}
        />

        <AnimatedView style={[authStyles.header, headerStyle]}>
          <TouchableOpacity
            style={[
              authStyles.backButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => router.back()}
            disabled={isSubmitting}
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
            contentContainerStyle={authStyles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedView style={[authStyles.content, formStyle]}>
              <AnimatedView
                entering={FadeInDown.delay(100).springify()}
                style={authStyles.logoContainer}
              >
                <View
                  style={[
                    authStyles.iconWrapper,
                    {
                      backgroundColor: `${Colors.primary}15`,
                      borderColor: `${Colors.primary}30`,
                    },
                  ]}
                >
                  <Heart size={36} color={Colors.primary} strokeWidth={2.5} />
                </View>
                <AnimatedText
                  entering={FadeInDown.delay(200).springify()}
                  style={[authStyles.title, { color: colors.text }]}
                >
                  Welcome Back
                </AnimatedText>
                <AnimatedText
                  entering={FadeInDown.delay(300).springify()}
                  style={[authStyles.subtitle, { color: colors.textSecondary }]}
                >
                  Log in to access your medical records
                </AnimatedText>
              </AnimatedView>

              <AnimatedView
                entering={FadeInDown.delay(400).springify()}
                style={authStyles.formContainer}
              >
                <View style={authStyles.inputContainer}>
                  <Text style={[authStyles.inputLabel, { color: colors.text }]}>
                    Username / Email / Phone
                  </Text>
                  <View style={authStyles.inputWrapper}>
                    <Input
                      placeholder="Enter your username, email, or phone"
                      value={identifier}
                      onChangeText={setIdentifier}
                      autoCapitalize="none"
                      editable={!isSubmitting}
                      style={[
                        authStyles.input,
                        {
                          backgroundColor: colors.card,
                          borderColor: errors.identifier
                            ? Colors.light.error
                            : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                  </View>
                  {errors.identifier && (
                    <Text style={authStyles.errorText}>
                      {errors.identifier}
                    </Text>
                  )}
                </View>

                <View style={authStyles.inputContainer}>
                  <Text style={[authStyles.inputLabel, { color: colors.text }]}>
                    Password
                  </Text>
                  <View style={authStyles.inputWrapper}>
                    <Input
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      editable={!isSubmitting}
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
                  {errors.password && (
                    <Text style={authStyles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={authStyles.forgotPassword}
                  onPress={() => setShowForgot(true)}
                  disabled={isSubmitting}
                >
                  <Text style={authStyles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLogin}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                >
                  <LinearGradient
                    colors={Colors.gradients.primary}
                    style={[
                      authStyles.primaryButton,
                      isSubmitting && authStyles.buttonDisabled,
                    ]}
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size={24} color="white" />
                    ) : (
                      <Text style={authStyles.primaryButtonText}>Log In</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </AnimatedView>

              <AnimatedView
                entering={FadeInDown.delay(500).springify()}
                style={authStyles.footer}
              >
                <Text
                  style={[
                    authStyles.footerText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Don't have an account?{' '}
                  <Text
                    style={authStyles.linkText}
                    onPress={() => router.push('/auth/patient-signup')}
                  >
                    Sign Up
                  </Text>
                </Text>
              </AnimatedView>
            </AnimatedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      <AlertComponent />
      <Modal
        visible={showForgot}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForgot(false)}
      >
        <View style={authStyles.modalOverlay}>
          <AnimatedView
            entering={FadeInDown.springify()}
            style={[authStyles.modalContent, { backgroundColor: colors.card }]}
          >
            <Text style={[authStyles.modalTitle, { color: colors.text }]}>
              Reset Password
            </Text>
            <Text
              style={[
                authStyles.modalDescription,
                { color: colors.textSecondary },
              ]}
            >
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>
            <TextInput
              placeholder="Email address"
              placeholderTextColor={colors.textSecondary}
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[
                authStyles.resetInput,
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
              style={{ marginTop: 12 }}
              variant="secondary"
            />
          </AnimatedView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
