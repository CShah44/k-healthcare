import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart,
  Users,
  Sparkles,
  Shield,
  ArrowRight,
  Star,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { userData: user, isLoading } = useAuth();

  // Animation values
  const logoScale = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const statsScale = useSharedValue(0.8);
  const statsOpacity = useSharedValue(0);

  useEffect(() => {
    if (user) {
      if (user.role === 'patient') {
        router.replace('/(patient-tabs)');
      } else {
        router.replace('/(healthcare-tabs)');
      }
    }
  }, [user]);

  useEffect(() => {
    // Animate logo entrance
    logoScale.value = withSpring(1, { damping: 15, stiffness: 150 });

    // Animate sparkles rotation
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 8000 }),
      -1,
      false
    );

    // Animate cards with stagger
    setTimeout(() => {
      cardScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      cardOpacity.value = withTiming(1, { duration: 800 });
    }, 300);

    // Animate stats
    setTimeout(() => {
      statsScale.value = withSpring(1, { damping: 10, stiffness: 80 });
      statsOpacity.value = withTiming(1, { duration: 600 });
    }, 600);
  }, []);

  const handleRoleSelection = (role: 'patient' | 'healthcare') => {
    router.push(`/auth/role-selection?role=${role}`);
  };

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statsScale.value }],
    opacity: statsOpacity.value,
  }));

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#f8fafc', '#e2e8f0', '#f1f5f9']}
          style={styles.backgroundGradient}
        >
          <View style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <View style={styles.logoWrapper}>
                <LinearGradient
                  colors={[Colors.primary, '#60a5fa']}
                  style={styles.logoGradient}
                >
                  <Heart size={40} color="#ffffff" strokeWidth={2.5} />
                </LinearGradient>
              </View>
              <Text style={styles.appName}>svastheya</Text>
              <Text style={styles.appNameSubtext}>स्वास्थ्य</Text>
              <ActivityIndicator
                size="large"
                color={Colors.primary}
                style={styles.loadingSpinner}
              />
              <Text style={styles.loadingText}>
                Loading your health journey...
              </Text>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0', '#f1f5f9']}
        style={styles.backgroundGradient}
      >
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
                <LinearGradient
                  colors={[Colors.primary, '#60a5fa']}
                  style={styles.logoGradient}
                >
                  <Heart size={40} color="#ffffff" strokeWidth={2.5} />
                </LinearGradient>
                <Animated.View
                  style={[styles.sparkleContainer, sparkleAnimatedStyle]}
                >
                  <Sparkles size={18} color="#fbbf24" style={styles.sparkle1} />
                  <Star size={14} color="#f59e0b" style={styles.sparkle2} />
                </Animated.View>
              </Animated.View>
              <Text style={styles.appName}>svastheya</Text>
              <Text style={styles.appNameSubtext}>स्वास्थ्य</Text>
              <View style={styles.taglineContainer}>
                <Text style={styles.tagline}>
                  Your comprehensive healthcare companion
                </Text>
                <Text style={styles.taglineSecondary}>
                  Trusted • Secure • Accessible
                </Text>
              </View>
            </View>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome to Better Health</Text>
            <Text style={styles.welcomeSubtitle}>
              Choose your role to begin your personalized healthcare journey
              with us
            </Text>

            {/* Stats Section */}
            <Animated.View style={[styles.statsContainer, statsAnimatedStyle]}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>10K+</Text>
                <Text style={styles.statLabel}>Patients</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>500+</Text>
                <Text style={styles.statLabel}>Doctors</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>Support</Text>
              </View>
            </Animated.View>
          </View>

          {/* Role Selection Cards */}
          <View style={styles.roleContainer}>
            <Animated.View style={cardAnimatedStyle}>
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => handleRoleSelection('patient')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.roleCardGradient}
                >
                  <View style={styles.roleHeader}>
                    <View style={styles.roleIconContainer}>
                      <LinearGradient
                        colors={[
                          'rgba(59, 130, 246, 0.1)',
                          'rgba(59, 130, 246, 0.05)',
                        ]}
                        style={styles.roleIconGradient}
                      >
                        <Heart
                          size={32}
                          color={Colors.primary}
                          strokeWidth={2}
                        />
                      </LinearGradient>
                    </View>
                    <View style={styles.roleArrow}>
                      <ArrowRight
                        size={20}
                        color={Colors.primary}
                        strokeWidth={2}
                      />
                    </View>
                  </View>

                  <View style={styles.roleContent}>
                    <Text style={styles.roleTitle}>I'm a Patient</Text>
                    <Text style={styles.roleDescription}>
                      Access medical records, track health metrics, and manage
                      your complete health journey with ease
                    </Text>

                    <View style={styles.roleFeatures}>
                      <View style={styles.featureItem}>
                        <View style={styles.featureDot} />
                        <Text style={styles.featureText}>Medical Records</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <View style={styles.featureDot} />
                        <Text style={styles.featureText}>Health Tracking</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <View style={styles.featureDot} />
                        <Text style={styles.featureText}>Family Tree</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={cardAnimatedStyle}>
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => handleRoleSelection('healthcare')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.roleCardGradient}
                >
                  <View style={styles.roleHeader}>
                    <View style={styles.roleIconContainer}>
                      <LinearGradient
                        colors={[
                          'rgba(59, 130, 246, 0.1)',
                          'rgba(59, 130, 246, 0.05)',
                        ]}
                        style={styles.roleIconGradient}
                      >
                        <Users
                          size={32}
                          color={Colors.primary}
                          strokeWidth={2}
                        />
                      </LinearGradient>
                    </View>
                    <View style={styles.roleArrow}>
                      <ArrowRight
                        size={20}
                        color={Colors.primary}
                        strokeWidth={2}
                      />
                    </View>
                  </View>

                  <View style={styles.roleContent}>
                    <Text style={styles.roleTitle}>
                      I'm a Healthcare Professional
                    </Text>
                    <Text style={styles.roleDescription}>
                      Manage patient records, lab results, and provide
                      exceptional healthcare services
                    </Text>

                    <View style={styles.roleFeatures}>
                      <View style={styles.featureItem}>
                        <View style={styles.featureDot} />
                        <Text style={styles.featureText}>
                          Patient Management
                        </Text>
                      </View>
                      <View style={styles.featureItem}>
                        <View style={styles.featureDot} />
                        <Text style={styles.featureText}>Lab Results</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <View style={styles.featureDot} />
                        <Text style={styles.featureText}>
                          Digital Prescriptions
                        </Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.securityBadge}>
              <Shield size={18} color={Colors.primary} strokeWidth={2} />
              <Text style={styles.securityText}>HIPAA Compliant & Secure</Text>
            </View>

            <Text style={styles.footerNote}>
              Trusted by healthcare professionals and patients worldwide
            </Text>
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
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
  },

  decorativeCircle2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
  },

  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.4,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
  },

  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    marginBottom: 30,
  },

  logoContainer: {
    alignItems: 'center',
  },

  logoWrapper: {
    position: 'relative',
    marginBottom: 20,
  },

  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },

  sparkleContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },

  sparkle1: {
    position: 'absolute',
    top: -5,
    right: -5,
  },

  sparkle2: {
    position: 'absolute',
    bottom: 5,
    left: -5,
  },

  appName: {
    fontSize: 30,
    fontFamily: 'DMSerif',
    color: Colors.text,
    marginBottom: 4,
    paddingBottom: 4,
    // letterSpacing: -0.8,
  },

  appNameSubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    opacity: 0.8,
    marginBottom: 16,
  },

  taglineContainer: {
    alignItems: 'center',
  },

  tagline: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    lineHeight: 26,
    marginBottom: 8,
  },

  taglineSecondary: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 1,
  },

  welcomeSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },

  welcomeTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },

  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: 10,
    marginBottom: 30,
  },

  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 30,
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

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    marginHorizontal: 20,
  },

  roleContainer: {
    paddingHorizontal: 20,
    gap: 24,
    marginBottom: 40,
  },

  roleCard: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },

  roleCardGradient: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.08)',
  },

  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  roleIconContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  roleIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },

  roleArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },

  roleContent: {
    flex: 1,
  },

  roleTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  roleDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },

  roleFeatures: {
    gap: 8,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },

  featureText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
  },

  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },

  securityText: {
    fontSize: 13,
    color: Colors.primary,
    marginLeft: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },

  footerNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    opacity: 0.8,
  },

  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  loadingContent: {
    alignItems: 'center',
  },

  loadingSpinner: {
    marginTop: 30,
    marginBottom: 20,
  },

  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});
