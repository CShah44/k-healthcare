import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  Users, // Add this import
  Pill,
  FileImage,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { RecordsService, MedicalRecord } from '@/services/recordsService';

const { width } = Dimensions.get('window');

export default function PatientHomeScreen() {
  const { userData: user, user: firebaseuser } = useAuth();

  // State for records
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const recordsOpacity = useSharedValue(0);
  const recordsTranslateY = useSharedValue(30);

  useEffect(() => {
    // Animate header
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

    // Animate cards with stagger
    setTimeout(() => {
      cardScale.value = withSpring(1, { damping: 12, stiffness: 80 });
      cardOpacity.value = withTiming(1, { duration: 600 });
    }, 200);

    // Animate records section
    setTimeout(() => {
      recordsOpacity.value = withTiming(1, { duration: 800 });
      recordsTranslateY.value = withSpring(0, { damping: 10, stiffness: 60 });
    }, 400);
  }, []);

  // Fetch recent records
  useEffect(() => {
    if (!firebaseuser?.uid) return;

    const fetchRecentRecords = async () => {
      try {
        setLoadingRecords(true);
        setRecordsError(null);
        const records = await RecordsService.getRecentRecords(
          firebaseuser.uid,
          5
        );
        setRecentRecords(records);
      } catch (error) {
        console.error('Error fetching recent records:', error);
        setRecordsError('Failed to load recent records');
      } finally {
        setLoadingRecords(false);
      }
    };

    fetchRecentRecords();
  }, [firebaseuser?.uid]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper function to get record icon and color
  const getRecordIcon = (type: string, source?: string) => {
    if (source === 'lab_uploaded') {
      return { icon: TestTube2, color: Colors.medical.green };
    }

    switch (type) {
      case 'prescriptions':
        return { icon: Pill, color: Colors.medical.orange };
      case 'uploaded':
        return { icon: FileImage, color: Colors.primary };
      case 'lab_reports':
        return { icon: TestTube2, color: Colors.medical.green };
      case 'imaging':
        return { icon: FileText, color: Colors.medical.blue };
      default:
        return { icon: FileText, color: Colors.textSecondary };
    }
  };

  // Helper function to get status color
  const getStatusColor = (status?: string) => {
    if (!status) return Colors.textSecondary;

    switch (status.toLowerCase()) {
      case 'normal':
      case 'reviewed':
        return Colors.medical.green;
      case 'high':
      case 'critical':
        return Colors.medical.red;
      case 'active':
        return Colors.medical.blue;
      case 'archived':
        return Colors.textLight;
      default:
        return Colors.textSecondary;
    }
  };

  // Helper function to format date
  const formatDate = (uploadedAt: any) => {
    if (!uploadedAt) return 'N/A';

    let date: Date;
    if (uploadedAt.toDate) {
      date = uploadedAt.toDate();
    } else if (uploadedAt.seconds) {
      date = new Date(uploadedAt.seconds * 1000);
    } else if (uploadedAt instanceof Date) {
      date = uploadedAt;
    } else {
      return 'N/A';
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const recordsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: recordsOpacity.value,
    transform: [{ translateY: recordsTranslateY.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.backgroundGradient}
      >
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.notificationButton}>
                <Bell size={20} color={Colors.text} strokeWidth={2} />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push('/(patient-tabs)/profile')}
              >
                <Image
                  source={{
                    uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
                  }}
                  style={styles.profileImage}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View style={[styles.quickActions, cardAnimatedStyle]}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(patient-tabs)/records')}
              activeOpacity={0.7}
            >
              <View style={styles.actionCardContent}>
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${Colors.medical.green}15` },
                  ]}
                >
                  <FileText
                    size={24}
                    color={Colors.medical.green}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.actionTitle}>Records</Text>
                <Text style={styles.actionSubtitle}>View medical files</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(patient-tabs)/family-tree')}
              activeOpacity={0.7}
            >
              <View style={styles.actionCardContent}>
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${Colors.medical.blue}15` },
                  ]}
                >
                  <Users
                    size={24}
                    color={Colors.medical.blue}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.actionTitle}>Family Tree</Text>
                <Text style={styles.actionSubtitle}>Connect with family</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={styles.actionCardContent}>
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${Colors.medical.blue}15` },
                  ]}
                >
                  <TestTube2
                    size={24}
                    color={Colors.medical.blue}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.actionTitle}>Lab Results</Text>
                <Text style={styles.actionSubtitle}>Latest test reports</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Insert Records/Prescriptions Button */}
          <Animated.View style={cardAnimatedStyle}>
            <TouchableOpacity
              style={styles.insertButton}
              activeOpacity={0.8}
              onPress={() => router.push('/(patient-tabs)/upload-record')}
            >
              <Plus size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.insertButtonText}>
                Insert Past Records & Prescriptions
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Recent Records */}
          <Animated.View style={[styles.section, recordsAnimatedStyle]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Records</Text>
              <TouchableOpacity
                onPress={() => router.push('/(patient-tabs)/records')}
                style={styles.sectionLink}
              >
                <Text style={styles.sectionLinkText}>View All</Text>
                <ChevronRight
                  size={16}
                  color={Colors.primary}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>

            {loadingRecords ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading records...</Text>
              </View>
            ) : recordsError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{recordsError}</Text>
              </View>
            ) : recentRecords.length > 0 ? (
              recentRecords.slice(0, 3).map((record) => {
                const { icon: IconComponent, color } = getRecordIcon(
                  record.type,
                  record.source
                );
                const statusColor = getStatusColor(record.status);
                const formattedDate = formatDate(record.uploadedAt);

                return (
                  <TouchableOpacity
                    key={record.id}
                    style={styles.recordCard}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recordContent}>
                      {record.isNew && <View style={styles.newBadge} />}
                      <View style={styles.recordLeft}>
                        <View
                          style={[
                            styles.recordIcon,
                            { backgroundColor: `${color}15` },
                          ]}
                        >
                          <IconComponent
                            size={18}
                            color={color}
                            strokeWidth={2}
                          />
                        </View>
                        <View style={styles.recordInfo}>
                          <Text style={styles.recordTitle}>{record.title}</Text>
                          <Text style={styles.recordMeta}>
                            {record.source === 'lab_uploaded'
                              ? record.lab
                              : record.doctor || 'Self-uploaded'}{' '}
                            • {formattedDate}
                          </Text>
                        </View>
                      </View>
                      {record.status && (
                        <View
                          style={[
                            styles.recordStatus,
                            { backgroundColor: `${statusColor}15` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.recordStatusText,
                              { color: statusColor },
                            ]}
                          >
                            {record.status}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyRecordsContainer}>
                <Text style={styles.emptyRecordsText}>No records found</Text>
                <Text style={styles.emptyRecordsSubtext}>
                  Upload your first medical record to get started
                </Text>
              </View>
            )}
          </Animated.View>

          <View style={styles.bottomSpacing} />
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

  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },

  decorativeCircle2: {
    position: 'absolute',
    bottom: 200,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
  },

  scrollContent: {
    paddingBottom: 100,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 32,
  },

  headerLeft: {
    flex: 1,
  },

  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  userName: {
    fontSize: 28,
    color: Colors.secondary,
    fontFamily: 'Inter-Bold',
    marginTop: 4,
    letterSpacing: -0.5,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    position: 'relative',
  },

  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },

  profileImage: {
    width: '100%',
    height: '100%',
  },

  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16, // Reduced margin for multiple rows
  },

  actionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },

  actionCardContent: {
    padding: 16,
    alignItems: 'center',
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  actionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },

  actionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
    marginTop: 16, // Added margin top for spacing
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    letterSpacing: -0.3,
  },

  sectionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  sectionLinkText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },

  recordCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    position: 'relative',
  },

  recordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },

  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  recordIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  recordInfo: {
    flex: 1,
  },

  recordTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 2,
    lineHeight: 20,
  },

  recordMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  recordStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  recordStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },

  bottomSpacing: {
    height: 20,
  },

  insertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  // Loading and error states
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },

  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  errorText: {
    fontSize: 14,
    color: Colors.error,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },

  emptyRecordsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  emptyRecordsText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  emptyRecordsSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});
