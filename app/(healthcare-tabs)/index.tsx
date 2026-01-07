import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Activity,
  Users,
  User,
  FileText,
  Calendar,
  TriangleAlert as AlertTriangle,
  TrendingUp,
  Clock,
  Plus,
  ChevronRight,
  Bell,
  Stethoscope,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function HealthcareDashboardScreen() {
  const { userData: user } = useAuth();
  const { colors } = useTheme();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const dashboardStats = [
    {
      icon: Users,
      label: 'Total Patients',
      value: '0',
      change: '0',
      color: Colors.medical.blue,
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
      icon: Calendar,
      label: "Today's Appointments",
      value: '0',
      change: '0',
      color: Colors.medical.green,
      bgColor: 'rgba(34, 197, 94, 0.1)',
    },
    {
      icon: FileText,
      label: 'Pending Reports',
      value: '0',
      change: '0',
      color: Colors.medical.orange,
      bgColor: 'rgba(249, 115, 22, 0.1)',
    },
    {
      icon: AlertTriangle,
      label: 'Critical Cases',
      value: '0',
      change: '0',
      color: Colors.medical.red,
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
  ];

  const recentPatients: any[] = [];

  const todayAppointments: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
      case 'confirmed':
        return Colors.medical.green;
      case 'monitoring':
      case 'pending':
        return Colors.medical.orange;
      case 'critical':
        return Colors.medical.red;
      case 'in-progress':
        return Colors.medical.blue;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'stable':
      case 'confirmed':
        return 'rgba(34, 197, 94, 0.1)';
      case 'monitoring':
      case 'pending':
        return 'rgba(249, 115, 22, 0.1)';
      case 'critical':
        return 'rgba(239, 68, 68, 0.1)';
      case 'in-progress':
        return 'rgba(59, 130, 246, 0.1)';
      default:
        return colors.surfaceSecondary;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={[
          colors.background,
          'rgba(59, 130, 246, 0.05)',
          'rgba(59, 130, 246, 0.02)',
          colors.background,
        ]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Good morning,
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              Dr. {user?.firstName || 'Doctor'} {user?.lastName}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
            >
              <Bell size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton}>
              <View style={{ width: '100%', height: '100%', backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Dashboard Stats */}
        <View style={styles.statsContainer}>
          {dashboardStats.map((stat, index) => (
            <Animated.View
              entering={FadeInDown.delay(index * 100).springify()}
              key={index}
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <View
                style={[styles.statIcon, { backgroundColor: stat.bgColor }]}
              >
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </Text>
              <View style={styles.statChange}>
                <TrendingUp
                  size={12}
                  color={
                    stat.change.startsWith('+')
                      ? Colors.medical.green
                      : Colors.medical.red
                  }
                />
                <Text
                  style={[
                    styles.statChangeText,
                    {
                      color: stat.change.startsWith('+')
                        ? Colors.medical.green
                        : Colors.medical.red,
                    },
                  ]}
                >
                  {stat.change}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() =>
                router.push('/(healthcare-tabs)/create-prescription')
              }
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
                ]}
              >
                <FileText size={24} color={Colors.medical.blue} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                Prescription
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
                ]}
              >
                <Plus size={24} color={Colors.medical.green} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                Add Patient
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: 'rgba(249, 115, 22, 0.1)' },
                ]}
              >
                <Calendar size={24} color={Colors.medical.orange} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
                ]}
              >
                <Activity size={24} color={Colors.medical.purple} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                Lab Results
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Today's Appointments */}
        <Animated.View
          entering={FadeInDown.delay(500).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Today's Appointments
            </Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {todayAppointments.length > 0 ? (
            todayAppointments.map((appointment, index) => (
              <TouchableOpacity
                key={appointment.id}
                style={[
                  styles.appointmentCard,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View style={styles.appointmentTime}>
                  <Clock size={16} color={colors.textSecondary} />
                  <Text
                    style={[styles.timeText, { color: colors.textSecondary }]}
                  >
                    {appointment.time}
                  </Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={[styles.patientName, { color: colors.text }]}>
                    {appointment.patient}
                  </Text>
                  <Text
                    style={[
                      styles.appointmentType,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {appointment.type}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusBackground(appointment.status) },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(appointment.status) },
                    ]}
                  >
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.appointmentCard, { backgroundColor: colors.surface, justifyContent: 'center', padding: 24 }]}>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', fontFamily: 'Satoshi-Variable' }}>
                No appointments for today
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Recent Patients */}
        <Animated.View
          entering={FadeInDown.delay(600).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Patients
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(healthcare-tabs)/patients')}
            >
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentPatients.length > 0 ? (
            recentPatients.map((patient) => (
              <TouchableOpacity
                key={patient.id}
                style={[styles.patientCard, { backgroundColor: colors.surface }]}
              >
                <Image
                  source={{ uri: patient.avatar }}
                  style={styles.patientAvatar}
                />
                <View style={styles.patientInfo}>
                  <Text style={[styles.patientName, { color: colors.text }]}>
                    {patient.name}
                  </Text>
                  <Text
                    style={[
                      styles.patientDetails,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Age {patient.age} • {patient.condition}
                  </Text>
                  <Text
                    style={[styles.lastVisit, { color: colors.textSecondary }]}
                  >
                    Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusBackground(patient.status) },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(patient.status) },
                    ]}
                  >
                    {patient.status.charAt(0).toUpperCase() +
                      patient.status.slice(1)}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.patientCard, { backgroundColor: colors.surface, justifyContent: 'center', padding: 24 }]}>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', fontFamily: 'Satoshi-Variable' }}>
                No recent patients
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 8,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statChangeText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
  sectionLink: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    textAlign: 'center',
  },
  appointmentCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    minWidth: 80,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    marginLeft: 6,
  },
  appointmentInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    marginBottom: 2,
  },
  appointmentType: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
  },
  patientCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientDetails: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 2,
  },
  lastVisit: {
    fontSize: 12,
    fontFamily: 'Satoshi-Variable',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
});
