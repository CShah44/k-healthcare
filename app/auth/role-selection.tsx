import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart,
  Users,
  ArrowRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Logo } from '@/components/ui/Logo';

export default function RoleSelectionScreen() {
  // Use light mode colors by default
  const colors = Colors.light;

  // Subtle animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(20);
  const card1Opacity = useSharedValue(0);
  const card1TranslateY = useSharedValue(15);
  const card2Opacity = useSharedValue(0);
  const card2TranslateY = useSharedValue(15);

  useEffect(() => {
    // Subtle staggered animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withSpring(0, { damping: 20, stiffness: 90 });

    card1Opacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    card1TranslateY.value = withDelay(200, withSpring(0, { damping: 18, stiffness: 100 }));

    card2Opacity.value = withDelay(350, withTiming(1, { duration: 500 }));
    card2TranslateY.value = withDelay(350, withSpring(0, { damping: 18, stiffness: 100 }));
  }, []);

  const handleRoleSelection = (role: 'patient' | 'healthcare') => {
    router.push(`/auth/${role}-login`);
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const card1Style = useAnimatedStyle(() => ({
    opacity: card1Opacity.value,
    transform: [{ translateY: card1TranslateY.value }],
  }));

  const card2Style = useAnimatedStyle(() => ({
    opacity: card2Opacity.value,
    transform: [{ translateY: card2TranslateY.value }],
  }));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Branding Section - Large and Prominent */}
        <Animated.View style={[styles.brandingSection, headerStyle]}>
          <Logo size={80} animated={false} />
          <Text style={[styles.appName, { color: colors.text }]}>
            Svastheya
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Secure Medical Records, Seamless Care
          </Text>
        </Animated.View>

        {/* Role Selection Cards - Smaller and Minimal */}
        <View style={styles.roleContainer}>
          <Animated.View style={card1Style}>
            <View
              style={[
                styles.roleCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleRoleSelection('patient')}
                style={styles.roleCardTouchable}
                activeOpacity={0.7}
              >
                <View style={styles.roleCardContent}>
                  <View style={[styles.roleIconWrapper, { backgroundColor: 'rgba(0, 148, 133, 0.1)' }]}>
                    <Heart size={24} color={Colors.primary} strokeWidth={2} />
                  </View>
                  <View style={styles.roleTextContainer}>
                    <Text style={[styles.roleTitle, { color: colors.text }]}>
                      Patient
                    </Text>
                    <Text style={[styles.roleSubtitle, { color: colors.textSecondary }]}>
                      Access your records
                    </Text>
                  </View>
                  <ArrowRight size={20} color={colors.textSecondary} strokeWidth={2} />
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View style={card2Style}>
            <View
              style={[
                styles.roleCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleRoleSelection('healthcare')}
                style={styles.roleCardTouchable}
                activeOpacity={0.7}
              >
                <View style={styles.roleCardContent}>
                  <View style={[styles.roleIconWrapper, { backgroundColor: 'rgba(0, 148, 133, 0.1)' }]}>
                    <Users size={24} color={Colors.primary} strokeWidth={2} />
                  </View>
                  <View style={styles.roleTextContainer}>
                    <Text style={[styles.roleTitle, { color: colors.text }]}>
                      Healthcare
                    </Text>
                    <Text style={[styles.roleSubtitle, { color: colors.textSecondary }]}>
                      Manage records
                    </Text>
                  </View>
                  <ArrowRight size={20} color={colors.textSecondary} strokeWidth={2} />
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 80,
    paddingBottom: 40,
  },
  brandingSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 64,
  },
  appName: {
    fontFamily: 'IvyMode-Regular',
    fontSize: 42,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  tagline: {
    fontFamily: 'Satoshi-Variable',
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  roleContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  roleCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roleCardTouchable: {
    width: '100%',
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  roleIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontFamily: 'IvyMode-Regular',
    fontSize: 18,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  roleSubtitle: {
    fontFamily: 'Satoshi-Variable',
    fontSize: 13,
  },
});
