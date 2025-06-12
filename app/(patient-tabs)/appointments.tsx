import React, { useState } from 'react';
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
import {
  Calendar,
  Clock,
  Plus,
  MapPin,
  Phone,
  Video,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AppointmentsScreen() {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>(
    'upcoming'
  );

  const upcomingAppointments = [
    {
      id: '1',
      doctor: 'Dr. Sarah Wilson',
      specialization: 'Cardiologist',
      date: '2024-10-25',
      time: '10:30 AM',
      type: 'Follow-up',
      location: 'Heart Center, Room 301',
      mode: 'in-person',
      status: 'confirmed',
      duration: 30,
      avatar:
        'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: Colors.medical.red,
    },
    {
      id: '2',
      doctor: 'Dr. Michael Chen',
      specialization: 'General Practitioner',
      date: '2024-11-02',
      time: '2:15 PM',
      type: 'Annual Check-up',
      location: 'Main Clinic, Room 105',
      mode: 'in-person',
      status: 'confirmed',
      duration: 45,
      avatar:
        'https://images.pexels.com/photos/612999/pexels-photo-612999.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: Colors.primary,
    },
    {
      id: '3',
      doctor: 'Dr. Emily Rodriguez',
      specialization: 'Dermatologist',
      date: '2024-11-08',
      time: '11:00 AM',
      type: 'Consultation',
      location: 'Virtual Meeting',
      mode: 'telemedicine',
      status: 'pending',
      duration: 30,
      avatar:
        'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: Colors.medical.orange,
    },
  ];

  const pastAppointments = [
    {
      id: '4',
      doctor: 'Dr. Jennifer Martinez',
      specialization: 'Radiologist',
      date: '2024-09-28',
      time: '9:00 AM',
      type: 'X-Ray Review',
      location: 'Imaging Center',
      mode: 'in-person',
      status: 'completed',
      duration: 20,
      avatar:
        'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: Colors.medical.green,
    },
    {
      id: '5',
      doctor: 'Dr. David Park',
      specialization: 'Lab Technician',
      date: '2024-09-15',
      time: '8:30 AM',
      type: 'Blood Work',
      location: 'Lab Services',
      mode: 'in-person',
      status: 'completed',
      duration: 15,
      avatar:
        'https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: Colors.medical.blue,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return (
          <CheckCircle size={16} color={Colors.medical.green} strokeWidth={2} />
        );
      case 'pending':
        return (
          <AlertCircle
            size={16}
            color={Colors.medical.orange}
            strokeWidth={2}
          />
        );
      default:
        return <Clock size={16} color={Colors.textSecondary} strokeWidth={2} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return Colors.medical.green;
      case 'pending':
        return Colors.medical.orange;
      default:
        return Colors.textSecondary;
    }
  };

  const currentAppointments =
    selectedTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Appointments</Text>
            <Text style={styles.headerSubtitle}>
              {currentAppointments.length} {selectedTab}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Search size={20} color={Colors.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'upcoming' && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab('upcoming')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'upcoming' && styles.tabTextActive,
              ]}
            >
              Upcoming
            </Text>
            <View
              style={[
                styles.tabCount,
                selectedTab === 'upcoming' && styles.tabCountActive,
              ]}
            >
              <Text
                style={[
                  styles.tabCountText,
                  selectedTab === 'upcoming' && styles.tabCountTextActive,
                ]}
              >
                {upcomingAppointments.length}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'past' && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab('past')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'past' && styles.tabTextActive,
              ]}
            >
              Past
            </Text>
            <View
              style={[
                styles.tabCount,
                selectedTab === 'past' && styles.tabCountActive,
              ]}
            >
              <Text
                style={[
                  styles.tabCountText,
                  selectedTab === 'past' && styles.tabCountTextActive,
                ]}
              >
                {pastAppointments.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Appointments List */}
        <ScrollView
          style={styles.appointmentsList}
          contentContainerStyle={styles.appointmentsContent}
          showsVerticalScrollIndicator={false}
        >
          {currentAppointments.length > 0 ? (
            currentAppointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={styles.appointmentCard}
                activeOpacity={0.7}
              >
                <View style={styles.appointmentCardContent}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.doctorSection}>
                      <Image
                        source={{ uri: appointment.avatar }}
                        style={[
                          styles.doctorAvatar,
                          { borderColor: `${appointment.color}40` },
                        ]}
                      />
                      <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>
                          {appointment.doctor}
                        </Text>
                        <Text style={styles.specialization}>
                          {appointment.specialization}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.statusContainer}>
                      {getStatusIcon(appointment.status)}
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
                  </View>

                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                      <Calendar
                        size={16}
                        color={Colors.textSecondary}
                        strokeWidth={2}
                      />
                      <Text style={styles.detailText}>
                        {new Date(appointment.date).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Clock
                        size={16}
                        color={Colors.textSecondary}
                        strokeWidth={2}
                      />
                      <Text style={styles.detailText}>
                        {appointment.time} • {appointment.duration} min
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      {appointment.mode === 'telemedicine' ? (
                        <Video
                          size={16}
                          color={Colors.textSecondary}
                          strokeWidth={2}
                        />
                      ) : (
                        <MapPin
                          size={16}
                          color={Colors.textSecondary}
                          strokeWidth={2}
                        />
                      )}
                      <Text style={styles.detailText}>
                        {appointment.location}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.appointmentFooter}>
                    <View
                      style={[
                        styles.appointmentType,
                        { backgroundColor: `${appointment.color}15` },
                      ]}
                    >
                      <Text
                        style={[styles.typeText, { color: appointment.color }]}
                      >
                        {appointment.type}
                      </Text>
                    </View>

                    {selectedTab === 'upcoming' && (
                      <View style={styles.appointmentActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          activeOpacity={0.7}
                        >
                          <Phone
                            size={16}
                            color={Colors.primary}
                            strokeWidth={2}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          activeOpacity={0.7}
                        >
                          <Calendar
                            size={16}
                            color={Colors.primary}
                            strokeWidth={2}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={Colors.textLight} strokeWidth={1} />
              <Text style={styles.emptyStateTitle}>
                No {selectedTab} appointments
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {selectedTab === 'upcoming'
                  ? 'Schedule your next appointment with a healthcare provider'
                  : 'Your appointment history will appear here'}
              </Text>
              {selectedTab === 'upcoming' && (
                <TouchableOpacity style={styles.bookButton} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[Colors.primary, '#1e40af']}
                    style={styles.bookButtonGradient}
                  >
                    <Plus size={16} color="#ffffff" strokeWidth={2} />
                    <Text style={styles.bookButtonText}>Book Appointment</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 24,
  },

  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },

  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },

  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },

  tabButtonActive: {
    backgroundColor: Colors.text,
  },

  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },

  tabTextActive: {
    color: '#ffffff',
  },

  tabCount: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },

  tabCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  tabCountText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },

  tabCountTextActive: {
    color: '#ffffff',
  },

  appointmentsList: {
    flex: 1,
  },

  appointmentsContent: {
    paddingHorizontal: 20,
  },

  appointmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },

  appointmentCardContent: {
    padding: 16,
  },

  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  doctorSection: {
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

  doctorInfo: {
    flex: 1,
  },

  doctorName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 2,
  },

  specialization: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },

  appointmentDetails: {
    marginBottom: 16,
    gap: 8,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },

  appointmentType: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  typeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },

  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },

  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  bookButton: {
    borderRadius: 12,
  },

  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },

  bookButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },

  bottomSpacing: {
    height: 100,
  },
});
