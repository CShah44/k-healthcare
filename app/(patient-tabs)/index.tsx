import React from 'react';
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
  Calendar,
  FileText,
  Clock,
  ChevronRight,
  TestTube2,
  Plus,
  Bell,
  Users, // Add this import
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PatientHomeScreen() {
  const { userData: user } = useAuth();

  const upcomingAppointments = [
    {
      id: '1',
      doctor: 'Dr. Sarah Wilson',
      date: 'Oct 25, 2024',
      time: '10:30 AM',
      department: 'Cardiology',
      avatar:
        'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: Colors.medical.red,
    },
    {
      id: '2',
      doctor: 'Dr. Michael Chen',
      date: 'Nov 2, 2024',
      time: '2:15 PM',
      department: 'General Medicine',
      avatar:
        'https://images.pexels.com/photos/612999/pexels-photo-612999.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: Colors.primary,
    },
  ];

  const recentRecords = [
    {
      id: '1',
      title: 'Blood Test Results - CBC',
      type: 'Lab Report',
      date: 'Oct 15, 2024',
      status: 'Normal',
      isNew: true,
      color: Colors.medical.green,
    },
    {
      id: '2',
      title: 'Chest X-Ray Report',
      type: 'Imaging',
      date: 'Oct 12, 2024',
      status: 'Reviewed',
      isNew: false,
      color: Colors.primary,
    },
    {
      id: '3',
      title: 'Blood Pressure Medication',
      type: 'Prescription',
      date: 'Oct 10, 2024',
      status: 'Active',
      isNew: false,
      color: Colors.medical.orange,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
          <View style={styles.header}>
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
          </View>

          {/* Quick Actions - Updated to include Family Tree */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(patient-tabs)/appointments')}
              activeOpacity={0.7}
            >
              <View style={styles.actionCardContent}>
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${Colors.primary}15` },
                  ]}
                >
                  <Calendar size={24} color={Colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.actionTitle}>Appointments</Text>
                <Text style={styles.actionSubtitle}>Book & manage visits</Text>
              </View>
            </TouchableOpacity>

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
          </View>

          {/* Additional Quick Actions Row */}
          <View style={styles.quickActions}>
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

            <View style={styles.actionCard}>
              <View style={styles.actionCardContent}>
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${Colors.medical.orange}15` },
                  ]}
                >
                  <Plus
                    size={24}
                    color={Colors.medical.orange}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.actionTitle}>More</Text>
                <Text style={styles.actionSubtitle}>Additional features</Text>
              </View>
            </View>
          </View>

          {/* Upcoming Appointments */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              <TouchableOpacity
                onPress={() => router.push('/(patient-tabs)/appointments')}
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

            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.slice(0, 2).map((appointment) => (
                <TouchableOpacity
                  key={appointment.id}
                  style={styles.appointmentCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.appointmentContent}>
                    <View style={styles.appointmentLeft}>
                      <Image
                        source={{ uri: appointment.avatar }}
                        style={[
                          styles.doctorAvatar,
                          { borderColor: `${appointment.color}40` },
                        ]}
                      />
                      <View style={styles.appointmentInfo}>
                        <Text style={styles.doctorName}>
                          {appointment.doctor}
                        </Text>
                        <Text style={styles.department}>
                          {appointment.department}
                        </Text>
                        <View style={styles.appointmentTime}>
                          <Clock
                            size={14}
                            color={Colors.textSecondary}
                            strokeWidth={2}
                          />
                          <Text style={styles.timeText}>
                            {appointment.date} • {appointment.time}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <ChevronRight
                      size={20}
                      color={Colors.textLight}
                      strokeWidth={2}
                    />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyAppointments}>
                <Calendar
                  size={40}
                  color={Colors.textLight}
                  strokeWidth={1.5}
                />
                <Text style={styles.emptyTitle}>No upcoming appointments</Text>
                <TouchableOpacity
                  style={styles.scheduleButton}
                  activeOpacity={0.8}
                >
                  <Plus size={16} color={Colors.primary} strokeWidth={2} />
                  <Text style={styles.scheduleButtonText}>
                    Schedule Appointment
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Recent Records */}
          <View style={styles.section}>
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

            {recentRecords.slice(0, 3).map((record) => (
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
                        { backgroundColor: `${record.color}15` },
                      ]}
                    >
                      <FileText
                        size={18}
                        color={record.color}
                        strokeWidth={2}
                      />
                    </View>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordTitle}>{record.title}</Text>
                      <Text style={styles.recordMeta}>
                        {record.type} • {record.date}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.recordStatus,
                      { backgroundColor: `${record.color}15` },
                    ]}
                  >
                    <Text
                      style={[styles.recordStatusText, { color: record.color }]}
                    >
                      {record.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

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
    color: Colors.text,
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

  appointmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },

  appointmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  appointmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
  },

  appointmentInfo: {
    flex: 1,
  },

  doctorName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 2,
  },

  department: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },

  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  timeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  emptyAppointments: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderStyle: 'dashed',
  },

  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },

  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },

  scheduleButtonText: {
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
});
