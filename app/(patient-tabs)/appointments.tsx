import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Plus, MapPin, Phone, Video, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { Button } from '@/components/ui/Button';

export default function AppointmentsScreen() {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');

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
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} color={Colors.medical.green} />;
      case 'pending':
        return <AlertCircle size={16} color={Colors.medical.orange} />;
      case 'cancelled':
        return <XCircle size={16} color={Colors.medical.red} />;
      case 'completed':
        return <CheckCircle size={16} color={Colors.medical.green} />;
      default:
        return <Clock size={16} color={Colors.textSecondary} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return Colors.medical.green;
      case 'pending':
        return Colors.medical.orange;
      case 'cancelled':
        return Colors.medical.red;
      default:
        return Colors.textSecondary;
    }
  };

  const currentAppointments = selectedTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <SafeAreaView style={[GlobalStyles.container, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointments</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Tab Selection */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'upcoming' && styles.tabButtonActive
          ]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'upcoming' && styles.tabTextActive
          ]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'past' && styles.tabButtonActive
          ]}
          onPress={() => setSelectedTab('past')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'past' && styles.tabTextActive
          ]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <ScrollView style={styles.appointmentsList} showsVerticalScrollIndicator={false}>
        <View style={styles.appointmentsContainer}>
          {currentAppointments.length > 0 ? (
            currentAppointments.map((appointment) => (
              <TouchableOpacity key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{appointment.doctor}</Text>
                    <Text style={styles.specialization}>{appointment.specialization}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(appointment.status)}
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(appointment.status) }
                    ]}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Clock size={16} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>
                      {appointment.time} ({appointment.duration} minutes)
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    {appointment.mode === 'telemedicine' ? (
                      <Video size={16} color={Colors.textSecondary} />
                    ) : (
                      <MapPin size={16} color={Colors.textSecondary} />
                    )}
                    <Text style={styles.detailText}>{appointment.location}</Text>
                  </View>
                </View>

                <View style={styles.appointmentType}>
                  <Text style={styles.typeText}>{appointment.type}</Text>
                </View>

                {selectedTab === 'upcoming' && (
                  <View style={styles.appointmentActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Phone size={16} color={Colors.primary} />
                      <Text style={styles.actionText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Calendar size={16} color={Colors.primary} />
                      <Text style={styles.actionText}>Reschedule</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={60} color={Colors.textLight} />
              <Text style={styles.emptyStateTitle}>
                No {selectedTab} appointments
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {selectedTab === 'upcoming' 
                  ? 'Schedule your next appointment with a healthcare provider'
                  : 'Your appointment history will appear here'
                }
              </Text>
              {selectedTab === 'upcoming' && (
                <Button
                  title="Book Appointment"
                  onPress={() => {}}
                  style={styles.bookButton}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },
  
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  
  tabButtonActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
  },
  
  tabTextActive: {
    color: Colors.text,
  },
  
  appointmentsList: {
    flex: 1,
  },
  
  appointmentsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  appointmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  doctorInfo: {
    flex: 1,
  },
  
  doctorName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },
  
  specialization: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  
  appointmentDetails: {
    marginBottom: 12,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  
  appointmentType: {
    backgroundColor: Colors.medical.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  
  typeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  
  appointmentActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.medical.lightBlue,
    borderRadius: 8,
    gap: 6,
  },
  
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    marginTop: 16,
  },
  
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  
  bookButton: {
    marginTop: 20,
    paddingHorizontal: 32,
  },
});