import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Stethoscope } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

export default function HealthcareSignupScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    licenseNumber: '',
    role: 'doctor' as 'doctor' | 'lab_assistant',
    department: '',
    hospital: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup, isLoading } = useAuth();

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    
    if (!formData.email) {
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

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.licenseNumber) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.hospital) {
      newErrors.hospital = 'Hospital/Clinic name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      await signup(formData);
      router.replace('/(healthcare-tabs)');
    } catch (error) {
      Alert.alert('Registration Failed', 'Failed to create account. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[GlobalStyles.container, GlobalStyles.centeredContainer]}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Creating your professional account...</Text>
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Stethoscope size={32} color={Colors.primary} />
            <Text style={styles.title}>Healthcare Professional</Text>
            <Text style={styles.subtitle}>Register for K Healthcare</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <Input
                label="First Name"
                placeholder="First name"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                error={errors.firstName}
                style={styles.nameInput}
                required
              />
              <Input
                label="Last Name"
                placeholder="Last name"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                error={errors.lastName}
                style={styles.nameInput}
                required
              />
            </View>

            <Input
              label="Professional Email"
              placeholder="Enter your work email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
            />

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChangeText={(value) => updateFormData('phoneNumber', value)}
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              required
            />

            <View style={styles.roleSelection}>
              <Text style={styles.roleLabel}>Professional Role *</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'doctor' && styles.roleButtonActive
                  ]}
                  onPress={() => updateFormData('role', 'doctor')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'doctor' && styles.roleButtonTextActive
                  ]}>
                    Doctor
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'lab_assistant' && styles.roleButtonActive
                  ]}
                  onPress={() => updateFormData('role', 'lab_assistant')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'lab_assistant' && styles.roleButtonTextActive
                  ]}>
                    Lab Assistant
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Input
              label="License Number"
              placeholder="Enter your license number"
              value={formData.licenseNumber}
              onChangeText={(value) => updateFormData('licenseNumber', value)}
              error={errors.licenseNumber}
              required
            />

            <Input
              label="Department"
              placeholder="e.g., Cardiology, Emergency, Laboratory"
              value={formData.department}
              onChangeText={(value) => updateFormData('department', value)}
              error={errors.department}
              required
            />

            <Input
              label="Hospital/Clinic"
              placeholder="Enter your workplace name"
              value={formData.hospital}
              onChangeText={(value) => updateFormData('hospital', value)}
              error={errors.hospital}
              required
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              error={errors.password}
              required
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry
              error={errors.confirmPassword}
              required
            />

            <Button
              title="Create Professional Account"
              onPress={handleSignup}
              style={styles.signUpButton}
            />
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
  
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  
  nameInput: {
    flex: 1,
  },
  
  roleSelection: {
    marginBottom: 16,
  },
  
  roleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
    fontFamily: 'Inter-Medium',
  },
  
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  
  roleButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  
  roleButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  
  roleButtonTextActive: {
    color: Colors.surface,
  },
  
  signUpButton: {
    minHeight: 56,
    marginTop: 8,
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