import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Users, Plus, FileText, ChevronRight, User } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  collection,
  query,
  where,
  limit,
  orderBy,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/constants/firebase';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HealthcareDashboardScreen() {
  const { user, userData } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [patientCount, setPatientCount] = useState(0);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  // Real-time data fetching
  useEffect(() => {
    if (!user?.uid) return;

    // 1. Real-time Patient Count & Active Patients
    const q = query(
      collection(db, 'doctorAccess'),
      where('doctorId', '==', user.uid),
      where('active', '==', true),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      setPatientCount(snapshot.size);

      // For recent patients, we'll take the first 5 from this realtime snapshot
      // Ideally we would order by a timestamp, but 'doctorAccess' might not have a 'lastVisit'.
      // We can use 'createdAt' or just picked the first few.
      const activeDocs = snapshot.docs.slice(0, 5);

      const fetchedPatients = await Promise.all(
        activeDocs.map(async (doc) => {
          const data = doc.data();
          // Fetch user details for each (one-time fetch per update is okay for small list)
          // To make main list realtime, we rely on the access list triggered updates.
          try {
            const userQ = query(
              collection(db, 'users'),
              where('uid', '==', data.patientUid),
            );
            const userSnap = await getDocs(userQ);
            if (!userSnap.empty) {
              const uData = userSnap.docs[0].data();
              return {
                id: data.patientUid,
                name: `${uData.firstName} ${uData.lastName}`,
                avatar: uData.avatarUrl,
                patientId: uData.patientId || uData.customUserId,
              };
            }
          } catch (e) {
            console.error('Error fetching patient details', e);
          }
          return null;
        }),
      );

      setRecentPatients(fetchedPatients.filter((p) => p !== null));
    });

    return () => unsubscribe();
  }, [user]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  // Teal color for patients as requested
  const TEAL_COLOR = '#2DD4BF';

  // Background gradient colors
  const backgroundColors: readonly [string, string] = isDarkMode
    ? [colors.background, colors.surface]
    : ['#FAF8F3', '#FAF8F3'];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={backgroundColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.midContainer}>
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                Good morning,
              </Text>
              {/* Fixed: Use firstName instead of displayName */}
              <Text style={[styles.userName, { color: colors.text }]}>
                Dr. {userData?.firstName || 'Doctor'}
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.welcomeSection, headerStyle]}>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              You have {patientCount} active patients under your care today.
            </Text>
          </Animated.View>

          {/* Main Widgets Grid */}
          <View style={styles.widgetsGrid}>
            {/* Patients Widget - Teal */}
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={[
                styles.widgetCard,
                styles.mainWidget,
                { backgroundColor: TEAL_COLOR },
              ]}
            >
              <View style={styles.widgetHeader}>
                <View style={styles.iconContainer}>
                  <Users size={24} color="#134E4A" />
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/(healthcare-tabs)/patients')}
                >
                  <ChevronRight size={24} color="#134E4A" />
                </TouchableOpacity>
              </View>
              <View>
                <Text style={[styles.widgetValue, { color: '#0F766E' }]}>
                  {patientCount}
                </Text>
                <Text style={[styles.widgetLabel, { color: '#115E59' }]}>
                  Total Patients
                </Text>
              </View>
            </Animated.View>

            {/* Create Prescription Shortcut */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={[
                styles.widgetCard,
                styles.actionWidget,
                { backgroundColor: '#F472B6' },
              ]}
            >
              <TouchableOpacity
                style={styles.actionButtonContent}
                onPress={() =>
                  router.push('/(healthcare-tabs)/create-prescription')
                }
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: 'rgba(255,255,255,0.3)' },
                  ]}
                >
                  <FileText size={24} color="#831843" />
                </View>
                <Text
                  style={[
                    styles.widgetLabel,
                    { color: '#831843', marginTop: 12, fontWeight: '700' },
                  ]}
                >
                  New Prescription
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Recent Patients Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Patients
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(healthcare-tabs)/patients')}
            >
              <Text
                style={{
                  color: Colors.primary,
                  fontFamily: 'Satoshi-Variable',
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.patientsList}>
            {recentPatients.length > 0 ? (
              recentPatients.map((patient, index) => (
                <Animated.View
                  entering={FadeInDown.delay(300 + index * 50).springify()}
                  key={patient.id}
                  style={[
                    styles.patientCard,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.patientContent}
                    onPress={() =>
                      router.push({
                        pathname: '/(healthcare-tabs)/records',
                        params: {
                          patientUid: patient.id,
                          patientName: patient.name,
                        },
                      })
                    }
                  >
                    {patient.avatar ? (
                      <Image
                        source={{ uri: patient.avatar }}
                        style={styles.patientAvatar}
                      />
                    ) : (
                      <View
                        style={[
                          styles.patientAvatarPlaceholder,
                          { backgroundColor: colors.surfaceSecondary },
                        ]}
                      >
                        <User size={20} color={colors.textSecondary} />
                      </View>
                    )}
                    <View style={styles.patientInfo}>
                      <Text
                        style={[styles.patientName, { color: colors.text }]}
                      >
                        {patient.name}
                      </Text>
                      <Text
                        style={[
                          styles.patientId,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {patient.patientId}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.arrowButton,
                        { backgroundColor: colors.surfaceSecondary },
                      ]}
                    >
                      <ChevronRight size={16} color={colors.text} />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))
            ) : (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontFamily: 'Satoshi-Variable',
                  textAlign: 'center',
                  marginTop: 20,
                }}
              >
                No active patients found.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 100,
  },
  midContainer: {
    width: '100%',
    maxWidth: 1000,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },
  userName: {
    fontSize: 28,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },
  welcomeSection: {
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    lineHeight: 24,
  },
  widgetsGrid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  widgetCard: {
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  mainWidget: {
    flex: 1,
    minWidth: '100%',
    minHeight: 160,
  },
  actionWidget: {
    flex: 1,
    minHeight: 140,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetValue: {
    fontSize: 42,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '800',
    lineHeight: 48,
  },
  widgetLabel: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
  actionButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Satoshi-Variable',
  },
  patientsList: {
    gap: 12,
  },
  patientCard: {
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  patientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  patientAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Satoshi-Variable',
    marginBottom: 2,
  },
  patientId: {
    fontSize: 12,
    fontFamily: 'Satoshi-Variable',
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
