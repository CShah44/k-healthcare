import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { Button } from '@/components/ui/Button';
import { TouchableOpacity } from 'react-native';

export default function RoleSelectionScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  
  const isPatient = role === 'patient';
  const title = isPatient ? 'Patient Portal' : 'Healthcare Professional Portal';
  const subtitle = isPatient 
    ? 'Access your medical records and manage your health'
    : 'Manage patient care and medical records';

  const handleLogin = () => {
    if (isPatient) {
      router.push('/auth/patient-login');
    } else {
      router.push('/auth/healthcare-login');
    }
  };

  const handleSignup = () => {
    if (isPatient) {
      router.push('/auth/patient-signup');
    } else {
      router.push('/auth/healthcare-signup');
    }
  };

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
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Sign In"
            onPress={handleLogin}
            style={styles.button}
          />
          
          <Button
            title="Create Account"
            onPress={handleSignup}
            variant="outline"
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
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
  
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  
  buttonContainer: {
    gap: 16,
    marginBottom: 40,
  },
  
  button: {
    minHeight: 56,
  },
  
  footer: {
    alignItems: 'center',
  },
  
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
  },
});