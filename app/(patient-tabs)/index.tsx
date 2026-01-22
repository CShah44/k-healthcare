import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  FileText,
  Plus,
  Bell,
  Users,
  Shield,
  Heart,
  Lightbulb,
  Leaf,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { RecordsService, MedicalRecord } from '@/services/recordsService';
import {
  getGreeting,
  getRecordIcon,
  getStatusColor,
  formatDate,
} from './services/recordHelpers';
import { createHomeStyles } from '../../styles/home';
import { db } from '@/constants/firebase';
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

// Wellness tips that rotate based on time
const wellnessTips = [
  {
    icon: Heart,
    title: 'Stay Active',
    text: 'Just 30 minutes of walking daily can improve your heart health significantly.',
    color: '#EF4444',
    bgColor: '#FEF2F2',
  },
  {
    icon: Leaf,
    title: 'Mindful Breathing',
    text: 'Take 5 deep breaths when you feel stressed. It helps calm your nervous system.',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  {
    icon: Lightbulb,
    title: 'Stay Hydrated',
    text: 'Drink at least 8 glasses of water today. Your body will thank you!',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
];

export default function PatientHomeScreen() {
  const { user, userData, isLoading } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const styles = createHomeStyles(colors, isDarkMode);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [familyMembersCount, setFamilyMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingFamily, setLoadingFamily] = useState(true);

  // Get a tip based on the current hour
  const currentTip = wellnessTips[new Date().getHours() % wellnessTips.length];
  const TipIcon = currentTip.icon;

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(20);
  const statsOpacity = useSharedValue(0);
  const statsTranslateY = useSharedValue(20);
  const actionsOpacity = useSharedValue(0);
  const actionsTranslateY = useSharedValue(20);
  const tipsOpacity = useSharedValue(0);
  const tipsTranslateY = useSharedValue(20);
  
  // Skeleton animation
  const skeletonShimmer = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withSpring(0, { damping: 20, stiffness: 90 });

    statsOpacity.value = withDelay(150, withTiming(1, { duration: 600 }));
    statsTranslateY.value = withDelay(150, withSpring(0, { damping: 20, stiffness: 90 }));

    actionsOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    actionsTranslateY.value = withDelay(300, withSpring(0, { damping: 20, stiffness: 90 }));

    tipsOpacity.value = withDelay(450, withTiming(1, { duration: 600 }));
    tipsTranslateY.value = withDelay(450, withSpring(0, { damping: 20, stiffness: 90 }));
    
    // Skeleton shimmer animation
    skeletonShimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (user && userData) {
      loadData();
    }
  }, [user, userData]);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingRecords(true);
      setLoadingFamily(true);

      // Load medical records and count in parallel
      const [records, totalRecordsSnapshot] = await Promise.all([
        RecordsService.getRecentRecords(user!.uid, 5),
        getDocs(query(collection(db, 'patients', user!.uid, 'records')))
      ]);
      
      setMedicalRecords(records);
      setTotalRecords(totalRecordsSnapshot.size);
      setLoadingRecords(false);

      // Get family members count
      if (userData?.familyId) {
        const familyDoc = await getDoc(doc(db, 'families', userData.familyId));
        if (familyDoc.exists()) {
          const familyData = familyDoc.data();
          const membersCount = familyData.members
            ? familyData.members.length
            : 1;
          setFamilyMembersCount(membersCount);
        } else {
          setFamilyMembersCount(1);
        }
      } else {
        setFamilyMembersCount(1); // Just the user if no family
      }
      setLoadingFamily(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoadingRecords(false);
      setLoadingFamily(false);
    } finally {
      setLoading(false);
    }
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: statsTranslateY.value }],
  }));

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
    transform: [{ translateY: actionsTranslateY.value }],
  }));

  const tipsStyle = useAnimatedStyle(() => ({
    opacity: tipsOpacity.value,
    transform: [{ translateY: tipsTranslateY.value }],
  }));
  
  const skeletonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      skeletonShimmer.value,
      [0, 0.5, 1],
      [0.3, 0.6, 0.3]
    );
    return { opacity };
  });

  // Soft background colors based on theme - match Profile
  const backgroundColors: readonly [string, string] = isDarkMode
    ? [colors.background, colors.surface]
    : ['#FAF8F3', '#FAF8F3']; // Match Profile soft beige

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={backgroundColors}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Subtle Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        {/* Bottom Corner Illustration */}
        <Image
          source={require('@/assets/images/image copy.png')}
          style={styles.bottomIllustration}
          resizeMode="contain"
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View style={[styles.header, headerStyle]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                {getGreeting()} 👋
              </Text>
              <Text style={[styles.name, { color: colors.text }]}>
                {userData?.firstName || 'User'}
              </Text>
              {userData?.patientId && (
                <View style={styles.idContainer}>
                  <Text style={styles.idText}>
                    ID: {userData.patientId}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => router.push('/(patient-tabs)/access-requests')}
                activeOpacity={0.7}
              >
                <Shield size={18} color={colors.text} strokeWidth={1.8} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => router.push('/notifications')}
                activeOpacity={0.7}
              >
                <Bell size={18} color={colors.text} strokeWidth={1.8} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Stats Cards */}
          <Animated.View style={[styles.statsContainer, statsStyle]}>
            <TouchableOpacity
              style={[
                styles.statCard,
                !isDarkMode && styles.statCardAccent1,
              ]}
              onPress={() => router.push('/(patient-tabs)/records')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.statIcon,
                  styles.statIconAccent1,
                ]}
              >
                <FileText
                  size={18}
                  color="#009485"
                  strokeWidth={1.8}
                />
              </View>
              <View style={styles.statContent}>
                {loadingRecords ? (
                  <View style={styles.skeletonContainer}>
                    <Animated.View style={[styles.skeletonNumber, skeletonStyle]} />
                    <Animated.View style={[styles.skeletonLabel, skeletonStyle]} />
                  </View>
                ) : (
                  <>
                    <Text style={[styles.statNumber, { color: colors.text }]}>
                      {totalRecords}
                    </Text>
                    <Text
                      style={[styles.statLabel, { color: colors.textSecondary }]}
                    >
                      Records
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statCard,
                !isDarkMode && styles.statCardAccent2,
              ]}
              onPress={() => router.push('/(patient-tabs)/family')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.statIcon,
                  styles.statIconAccent2,
                ]}
              >
                <Users size={18} color="#6366F1" strokeWidth={1.8} />
              </View>
              <View style={styles.statContent}>
                {loadingFamily ? (
                  <View style={styles.skeletonContainer}>
                    <Animated.View style={[styles.skeletonNumber, skeletonStyle]} />
                    <Animated.View style={[styles.skeletonLabel, skeletonStyle]} />
                  </View>
                ) : (
                  <>
                    <Text style={[styles.statNumber, { color: colors.text }]}>
                      {familyMembersCount}
                    </Text>
                    <Text
                      style={[styles.statLabel, { color: colors.textSecondary }]}
                    >
                      Family
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Actions - No heading */}
          <Animated.View style={[styles.actionsContainer, actionsStyle]}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.actionButtonPrimary,
                ]}
                onPress={() => router.push('/(patient-tabs)/upload-record')}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconWrapper, styles.actionIconPrimary]}>
                  <Plus size={22} color="#FFFFFF" strokeWidth={2} />
                </View>
                <Text style={[styles.actionText, styles.actionTextPrimary]}>
                  Upload
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.actionButtonSecondary,
                ]}
                onPress={() => router.push('/(patient-tabs)/records')}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconWrapper, styles.actionIconSecondary]}>
                  <FileText size={20} color="#8B5CF6" strokeWidth={1.8} />
                </View>
                <Text style={[styles.actionText, { color: colors.text }]}>
                  Records
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Wellness Tip Card */}
          <Animated.View style={[styles.tipsContainer, tipsStyle]}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 10 }]}>
              Daily Tip
            </Text>
            <View style={[styles.tipCard, { backgroundColor: isDarkMode ? colors.card : currentTip.bgColor }]}>
              <View style={[styles.tipIconWrapper, { backgroundColor: `${currentTip.color}18` }]}>
                <TipIcon size={20} color={currentTip.color} strokeWidth={1.8} />
              </View>
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>
                  {currentTip.title}
                </Text>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  {currentTip.text}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Health Summary Card */}
          <Animated.View style={[styles.summaryContainer, tipsStyle]}>
            <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
              <View style={styles.summaryHeader}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  Your Health at a Glance
                </Text>
              </View>
              <View style={styles.summaryContent}>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                    {totalRecords} records stored securely
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryDot, { backgroundColor: '#6366F1' }]} />
                  <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                    {familyMembersCount} family member{familyMembersCount !== 1 ? 's' : ''} connected
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryDot, { backgroundColor: '#009485' }]} />
                  <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                    All data encrypted & protected
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
