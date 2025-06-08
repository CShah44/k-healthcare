import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Stethoscope } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

export default function HealthcareLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email, password, 'doctor');
      router.replace('/(healthcare-tabs)');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[GlobalStyles.container, GlobalStyles.centeredContainer]}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Signing you in...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[GlobalStyles.container, styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Stethoscope size={32} color={Colors.primary} />
          <Text style={styles.title}>Healthcare Professional</Text>
          <Text style={styles.subtitle}>Sign in to K Healthcare</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Professional Email"
            placeholder="Enter your work email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            required
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            required
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            style={styles.signInButton}
          />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  
  form: {
    marginBottom: 30,
  },
  
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
  },
  
  signInButton: {
    minHeight: 56,
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