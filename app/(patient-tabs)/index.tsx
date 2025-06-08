import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Heart, FileText, Calendar, Activity, CircleAlert as AlertCircle, Clock, Pill, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useAuth } from '@/contexts/AuthContext';

export default function PatientHomeScreen() {
  const { user } = useAuth();

  const quickStats = [
    { icon: Activity, label: 'Health Score', value: '92%', color: Colors.medical.green },
    { icon: Pill, label: 'Medications', value: '3', color: Colors.medical.blue },
    { icon: Calendar, label: 'Next Appt', value: 'Oct 25', color: Colors.medical.orange },
  ];

  const recentRecords = [
    {
      id: '1',
      type: 'Lab Result',
      title: 'Blood Work Panel',
      date: 'Oct 15, 2024',
      status: 'Normal',
      doctor: 'Dr. Sarah Wilson',
    },
    {
      id: '2',
      type: 'Consultation',
      title: 'Annual Check-up',
      date: 'Oct 10, 2024',
      status: 'Completed',
      doctor: 'Dr. Michael Chen',
    },
  ];

  const upcomingAppointments = [
    {
      id: '1',
      type: 'Follow-up',
      doctor: 'Dr. Sarah Wilson',
      date: 'Oct 25, 2024',
      time: '10:30 AM',
      department: 'Cardiology',
    },
  ];

  return (
    <SafeAreaView style={[GlobalStyles.container, styles.container]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          {quickStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Health Alert */}
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <AlertCircle size={20} color={Colors.medical.orange} />
            <Text style={styles.alertTitle}>Health Reminder</Text>
          </View>
          <Text style={styles.alertMessage}>
            Don't forget to take your blood pressure medication at 2:00 PM today.
          </Text>
          <TouchableOpacity style={styles.alertButton}>
            <Text style={styles.alertButtonText}>Mark as Taken</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity onPress={() => router.push('/(patient-tabs)/appointments')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <TouchableOpacity key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentDoctor}>{appointment.doctor}</Text>
                  <Text style={styles.appointmentDepartment}>{appointment.department}</Text>
                  <View style={styles.appointmentDateTime}>
                    <Clock size={14} color={Colors.textSecondary} />
                    <Text style={styles.appointmentTime}>
                      {appointment.date} at {appointment.time}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.textLight} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={40} color={Colors.textLight} />
              <Text style={styles.emptyStateTitle}>No upcoming appointments</Text>
              <Text style={styles.emptyStateSubtitle}>Schedule a visit with your doctor</Text>
            </View>
          )}
        </View>

        {/* Recent Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Medical Records</Text>
            <TouchableOpacity onPress={() => router.push('/(patient-tabs)/records')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentRecords.map((record) => (
            <TouchableOpacity key={record.id} style={styles.recordCard}>
              <View style={styles.recordIcon}>
                <FileText size={18} color={Colors.primary} />
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordType}>{record.type} • {record.doctor}</Text>
                <Text style={styles.recordDate}>{record.date}</Text>
              </View>
              <View style={[styles.statusBadge, styles.statusNormal]}>
                <Text style={styles.statusText}>{record.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Calendar size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Book Appointment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <FileText size={24} color={Colors.primary} />
              <Text style={styles.actionText}>View Lab Results</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 10,
    marginBottom: 20,
  },
  
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  
  userName: {
    fontSize: 24,
    color: Colors.text,
    fontFamily: 'Inter-Bold',
    marginTop: 2,
  },
  
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  
  profileImage: {
    width: '100%',
    height: '100%',
  },
  
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },
  
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  
  alertCard: {
    backgroundColor: Colors.medical.lightOrange,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.medical.orange,
  },
  
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginLeft: 8,
  },
  
  alertMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    lineHeight: 20,
  },
  
  alertButton: {
    backgroundColor: Colors.medical.orange,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  
  alertButtonText: {
    fontSize: 14,
    color: Colors.surface,
    fontFamily: 'Inter-SemiBold',
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
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  
  sectionLink: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  
  appointmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  appointmentInfo: {
    flex: 1,
  },
  
  appointmentDoctor: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },
  
  appointmentDepartment: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 6,
  },
  
  appointmentDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  appointmentTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
  
  recordCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  recordIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.medical.lightBlue,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  recordInfo: {
    flex: 1,
  },
  
  recordTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },
  
  recordType: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  
  recordDate: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  
  statusNormal: {
    backgroundColor: Colors.medical.lightGreen,
  },
  
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.medical.green,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  emptyStateTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    marginTop: 12,
  },
  
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  actionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
});