import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Calendar,
  FileText,
  Clock,
  ChevronRight,
  TestTube2,
  Plus,
  Bell,
  Users,
  Pill,
  FileImage,
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

const { width } = Dimensions.get('window');

export default function PatientHomeScreen() {
  const { user, userData } = useAuth();
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [familyMembersCount, setFamilyMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate header entrance
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

    // Animate cards with stagger
    setTimeout(() => {
      cardScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      cardOpacity.value = withTiming(1, { duration: 600 });
    }, 300);
  }, []);

  useEffect(() => {
    if (user && userData) {
      loadData();
    }
  }, [user, userData]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load medical records
      const records = await RecordsService.getRecentRecords(user!.uid, 5);
      setMedicalRecords(records);

      // Get total records count
      const totalRecordsQuery = query(
        collection(db, 'patients', user!.uid, 'records')
      );
      const totalRecordsSnapshot = await getDocs(totalRecordsQuery);
      setTotalRecords(totalRecordsSnapshot.size);

      // Get family members count
      if (userData?.familyId) {
        const familyDoc = await getDoc(doc(db, 'families', userData.familyId));
        if (familyDoc.exists()) {
          const familyData = familyDoc.data();
          const membersCount = familyData.members
            ? familyData.members.length
            : 1;
          setFamilyMembersCount(membersCount);
        }
      } else {
        setFamilyMembersCount(1); // Just the user if no family
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const recentRecords = medicalRecords.slice(0, 3);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.backgroundGradient}
      >
        {/* Decorative Elements */}
        <View
          style={[
            styles.decorativeCircle1,
            { backgroundColor: 'rgba(0, 148, 133, 0.05)' },
          ]}
        />
        <View
          style={[
            styles.decorativeCircle2,
            { backgroundColor: 'rgba(34, 197, 94, 0.06)' },
          ]}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                {getGreeting()}
              </Text>
              <Text style={[styles.name, { color: colors.text }]}>
                {userData?.firstName || 'User'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.notificationButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => router.push('/notifications')}
            >
              <Bell size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Stats */}
          <Animated.View style={[styles.statsContainer, cardStyle]}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: `${Colors.medical.blue}15` },
                ]}
              >
                <FileText
                  size={20}
                  color={Colors.medical.blue}
                  strokeWidth={2}
                />
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {totalRecords}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Total Records
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: `${Colors.medical.blue}15` },
                ]}
              >
                <Users size={20} color={Colors.medical.blue} strokeWidth={2} />
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {familyMembersCount}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Family Members
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View style={[styles.actionsContainer, cardStyle]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Actions
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => router.push('/(patient-tabs)/upload-record')}
              >
                <Plus size={24} color={Colors.primary} strokeWidth={2} />
                <Text style={[styles.actionText, { color: colors.text }]}>
                  Upload Record
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => router.push('/(patient-tabs)/records')}
              >
                <FileText size={24} color={Colors.primary} strokeWidth={2} />
                <Text style={[styles.actionText, { color: colors.text }]}>
                  View Records
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Recent Records */}
          <Animated.View style={[styles.recordsContainer, cardStyle]}>
            <View style={styles.recordsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Records
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(patient-tabs)/records')}
              >
                <Text style={[styles.viewAllText, { color: Colors.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text
                  style={[styles.loadingText, { color: colors.textSecondary }]}
                >
                  Loading records...
                </Text>
              </View>
            ) : recentRecords.length > 0 ? (
              <View style={styles.recordsList}>
                {recentRecords.map((record, index) => {
                  const { icon: IconComponent, color } = getRecordIcon(
                    record.type,
                    record.source
                  );
                  return (
                    <TouchableOpacity
                      key={record.id}
                      style={[
                        styles.recordCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() =>
                        router.push(`/(patient-tabs)/records?id=${record.id}`)
                      }
                    >
                      <View
                        style={[
                          styles.recordIcon,
                          { backgroundColor: `${color}15` },
                        ]}
                      >
                        <IconComponent
                          size={20}
                          color={color}
                          strokeWidth={2}
                        />
                      </View>
                      <View style={styles.recordInfo}>
                        <Text
                          style={[styles.recordTitle, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {record.title}
                        </Text>
                        <Text
                          style={[
                            styles.recordDate,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {formatDate(record.uploadedAt)}
                        </Text>
                      </View>
                      <ChevronRight
                        size={16}
                        color={colors.textSecondary}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <FileText
                  size={48}
                  color={colors.textSecondary}
                  strokeWidth={1}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No Records Yet
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Upload your first medical record to get started
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
