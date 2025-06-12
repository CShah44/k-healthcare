import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  Users,
  Sparkles,
  Shield,
  CheckCircle,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { Button } from '@/components/ui/Button';
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function RoleSelectionScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();

  const isPatient = role === 'patient';
  const title = isPatient ? 'Patient Portal' : 'Healthcare Professional Portal';
  const subtitle = isPatient
    ? 'Access your medical records and manage your health journey with ease'
    : 'Manage patient care and medical records with precision and efficiency';

  const features = isPatient
    ? [
        'View medical history & records',
        'Book & manage appointments',
        'Track health metrics',
        'Secure messaging with doctors',
        'Prescription management',
        'Lab results & reports',
      ]
    : [
        'Patient record management',
        'Digital prescription system',
        'Lab result integration',
        'Appointment scheduling',
        'Secure patient communication',
        'Analytics & reporting',
      ];

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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0', '#f1f5f9']}
        style={styles.backgroundGradient}
      >
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <View style={styles.iconWrapper}>
                <LinearGradient
                  colors={[Colors.primary, '#60a5fa']}
                  style={styles.iconGradient}
                >
                  {isPatient ? (
                    <Heart size={44} color="#ffffff" strokeWidth={2} />
                  ) : (
                    <Users size={44} color="#ffffff" strokeWidth={2} />
                  )}
                </LinearGradient>
                <Sparkles size={20} color="#fbbf24" style={styles.sparkle} />
              </View>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            {/* Features Section */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What you can do:</Text>
              <View style={styles.featuresList}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <CheckCircle
                      size={16}
                      color={Colors.primary}
                      strokeWidth={2}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
                <LinearGradient
                  colors={[Colors.primary, '#1e40af']}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSignup} activeOpacity={0.9}>
                <View style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Create Account</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Security Badge */}
            <View style={styles.securityContainer}>
              <View style={styles.securityBadge}>
                <Shield size={16} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.securityText}>End-to-End Encrypted</Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{' '}
                <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  decorativeCircle1: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },

  decorativeCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(251, 191, 36, 0.06)',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
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
    alignItems: 'center',
  },

  iconContainer: {
    marginBottom: 30,
  },

  iconWrapper: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },

  iconGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  sparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
  },

  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },

  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    lineHeight: 34,
    paddingHorizontal: 10,
  },

  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: 20,
  },

  featuresContainer: {
    width: '100%',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },

  featuresTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },

  featuresList: {
    gap: 12,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },

  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
    flex: 1,
  },

  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 30,
  },

  primaryButton: {
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

  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  secondaryButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    backgroundColor: 'rgb(255, 255, 255)',
    color: Colors.primary,
    letterSpacing: 0.5,
  },

  securityContainer: {
    marginBottom: 20,
  },

  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  securityText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 8,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.3,
  },

  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
  },

  footerLink: {
    color: Colors.primary,
    fontFamily: 'Inter-Medium',
  },
});
