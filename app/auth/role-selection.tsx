import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart,
  Users,
  ArrowRight,
  Shield,
  Sparkles,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Logo } from '@/components/ui/Logo';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const { width, height } = Dimensions.get('window');

export default function RoleSelectionScreen() {
  const { colors } = useTheme();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  const card1Scale = useSharedValue(0);
  const card2Scale = useSharedValue(0);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered animations
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

    card1Scale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 100 }));
    card2Scale.value = withDelay(500, withSpring(1, { damping: 12, stiffness: 100 }));

    footerOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
  }, []);

  const handleRoleSelection = (role: 'patient' | 'healthcare') => {
    router.push(`/auth/${role}-login`);
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const card1Style = useAnimatedStyle(() => ({
    transform: [{ scale: card1Scale.value }],
  }));

  const card2Style = useAnimatedStyle(() => ({
    transform: [{ scale: card2Scale.value }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.backgroundGradient}
      >
        {/* Header with Theme Toggle */}
        <View style={styles.header}>
          <Animated.View style={[styles.headerContent, headerStyle]}>
            <Logo size={60} animated={true} />
            <Text style={[styles.appName, { color: colors.text }]}>Svastheya</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Your Health, Our Priority
            </Text>
          </Animated.View>
          <ThemeToggle style={styles.themeToggle} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <Animated.View style={[styles.welcomeSection, headerStyle]}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>
              Welcome to Better Health
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              Choose your role to begin your personalized healthcare journey
            </Text>
          </Animated.View>

          {/* Role Selection Cards */}
          <View style={styles.roleContainer}>
            <Animated.View style={card1Style}>
              <AnimatedCard
                onPress={() => handleRoleSelection('patient')}
                style={styles.roleCard}
                delay={0}
              >
                <LinearGradient
                  colors={['rgba(0, 148, 133, 0.05)', 'rgba(0, 148, 133, 0.02)']}
                  style={styles.roleCardGradient}
                >
                  <View style={styles.roleHeader}>
                    <View style={styles.roleIconContainer}>
                      <LinearGradient
                        colors={['#009485', '#004d40']}
                        style={styles.roleIconGradient}
                      >
                        <Heart size={32} color="#FFFFFF" strokeWidth={2} />
                      </LinearGradient>
                    </View>
                    <View style={styles.roleArrow}>
                      <ArrowRight size={20} color={Colors.primary} strokeWidth={2} />
                    </View>
                  </View>

                  <View style={styles.roleContent}>
                    <Text style={[styles.roleTitle, { color: colors.text }]}>
                      I'm a Patient
                    </Text>
                    <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
                      Access medical records, track health metrics, and manage your complete health journey
                    </Text>

                    <View style={styles.roleFeatures}>
                      <View style={styles.featureItem}>
                        <View style={[styles.featureDot, { backgroundColor: Colors.primary }]} />
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                          Medical Records
                        </Text>
                      </View>
                      <View style={styles.featureItem}>
                        <View style={[styles.featureDot, { backgroundColor: Colors.primary }]} />
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                          Health Tracking
                        </Text>
                      </View>
                      <View style={styles.featureItem}>
                        <View style={[styles.featureDot, { backgroundColor: Colors.primary }]} />
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                          Family Tree
                        </Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </AnimatedCard>
            </Animated.View>

            <Animated.View style={card2Style}>
              <AnimatedCard
                onPress={() => handleRoleSelection('healthcare')}
                style={styles.roleCard}
                delay={200}
              >
                <LinearGradient
                  colors={['rgba(0, 148, 133, 0.05)', 'rgba(0, 148, 133, 0.02)']}
                  style={styles.roleCardGradient}
                >
                  <View style={styles.roleHeader}>
                    <View style={styles.roleIconContainer}>
                      <LinearGradient
                        colors={['#80cbc4', '#009485']}
                        style={styles.roleIconGradient}
                      >
                        <Users size={32} color="#FFFFFF" strokeWidth={2} />
                      </LinearGradient>
                    </View>
                    <View style={styles.roleArrow}>
                      <ArrowRight size={20} color={Colors.primary} strokeWidth={2} />
                    </View>
                  </View>

                  <View style={styles.roleContent}>
                    <Text style={[styles.roleTitle, { color: colors.text }]}>
                      I'm a Healthcare Professional
                    </Text>
                    <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
                      Manage patient records, lab results, and provide exceptional healthcare services
                    </Text>

                    <View style={styles.roleFeatures}>
                      <View style={styles.featureItem}>
                        <View style={[styles.featureDot, { backgroundColor: Colors.primary }]} />
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                          Patient Management
                        </Text>
                      </View>
                      <View style={styles.featureItem}>
                        <View style={[styles.featureDot, { backgroundColor: Colors.primary }]} />
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                          Lab Results
                        </Text>
                      </View>
                      <View style={styles.featureItem}>
                        <View style={[styles.featureDot, { backgroundColor: Colors.primary }]} />
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                          Digital Prescriptions
                        </Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </AnimatedCard>
            </Animated.View>
          </View>

          {/* Footer */}
          <Animated.View style={[styles.footer, footerStyle]}>
            <View style={[styles.securityBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Shield size={18} color={Colors.primary} strokeWidth={2} />
              <Text style={[styles.securityText, { color: Colors.primary }]}>
                HIPAA Compliant & Secure
              </Text>
            </View>
            <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
              Trusted by healthcare professionals and patients worldwide
            </Text>
          </Animated.View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  themeToggle: {
    marginTop: 10,
  },
  appName: {
    fontFamily: 'IvyMode-Regular',
    fontSize: 28,
    marginTop: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: 'Satoshi-Variable',
    fontSize: 14,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  welcomeTitle: {
    fontFamily: 'IvyMode-Regular',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontFamily: 'Satoshi-Variable',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  roleContainer: {
    paddingHorizontal: 20,
    gap: 24,
    marginBottom: 40,
  },
  roleCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  roleCardGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 148, 133, 0.1)',
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
      height: 4,
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
  },
  roleArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 148, 133, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 148, 133, 0.2)',
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontFamily: 'IvyMode-Regular',
    fontSize: 20,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  roleDescription: {
    fontFamily: 'Satoshi-Variable',
    fontSize: 14,
    lineHeight: 20,
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
    marginRight: 12,
  },
  featureText: {
    fontFamily: 'Satoshi-Variable',
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
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
    fontFamily: 'Satoshi-Variable',
    fontSize: 13,
    marginLeft: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerNote: {
    fontFamily: 'Satoshi-Variable',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});
