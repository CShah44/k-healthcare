import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Activity,
  Users,
  FileText,
  Calendar,
  TriangleAlert as AlertTriangle,
  TrendingUp,
  Clock,
  CircleCheck as CheckCircle,
  Plus,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useAuth } from '@/contexts/AuthContext';

export default function HealthcareDashboardScreen() {
  const { userData: user } = useAuth();

  const dashboardStats = [
    {
      icon: Users,
      label: 'Total Patients',
      value: '247',
      change: '+12',
      color: Colors.medical.blue,
    },
    {
      icon: Calendar,
      label: "Today's Appointments",
      value: '18',
      change: '+3',
      color: Colors.medical.green,
    },
    {
      icon: FileText,
      label: 'Pending Reports',
      value: '8',
      change: '-2',
      color: Colors.medical.orange,
    },
    {
      icon: AlertTriangle,
      label: 'Critical Cases',
      value: '3',
      change: '0',
      color: Colors.medical.red,
    },
  ];

  const recentPatients = [
    {
      id: '1',
      name: 'John Smith',
      age: 45,
      condition: 'Hypertension',
      lastVisit: '2024-10-20',
      status: 'stable',
      avatar:
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      age: 32,
      condition: 'Diabetes Type 2',
      lastVisit: '2024-10-19',
      status: 'monitoring',
      avatar:
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '3',
      name: 'Michael Brown',
      age: 58,
      condition: 'Post-Surgery',
      lastVisit: '2024-10-18',
      status: 'critical',
      avatar:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
  ];

  const todayAppointments = [
    {
      id: '1',
      patient: 'Emma Wilson',
      time: '09:00 AM',
      type: 'Consultation',
      status: 'confirmed',
    },
    {
      id: '2',
      patient: 'David Chen',
      time: '10:30 AM',
      type: 'Follow-up',
      status: 'in-progress',
    },
    {
      id: '3',
      patient: 'Lisa Rodriguez',
      time: '02:15 PM',
      type: 'Lab Review',
      status: 'pending',
    },
  ];

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
        return Colors.textSecondary;
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'stable':
      case 'confirmed':
        return Colors.medical.lightGreen;
      case 'monitoring':
      case 'pending':
        return Colors.medical.lightOrange;
      case 'critical':
        return Colors.medical.lightRed;
      case 'in-progress':
        return Colors.medical.lightBlue;
      default:
        return Colors.surfaceSecondary;
    }
  };

  return (
    <SafeAreaView style={[GlobalStyles.container, styles.container]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>
              Dr. {user?.firstName} {user?.lastName}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Dashboard Stats */}
        <View style={styles.statsContainer}>
          {dashboardStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: `${stat.color}20` },
                ]}
              >
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
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
            </View>
          ))}
        </View>

        {/* Today's Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Appointments</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {todayAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
            >
              <View style={styles.appointmentTime}>
                <Clock size={16} color={Colors.textSecondary} />
                <Text style={styles.timeText}>{appointment.time}</Text>
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.patientName}>{appointment.patient}</Text>
                <Text style={styles.appointmentType}>{appointment.type}</Text>
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
          ))}
        </View>

        {/* Recent Patients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Patients</Text>
            <TouchableOpacity
              onPress={() => router.push('/(healthcare-tabs)/patients')}
            >
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentPatients.map((patient) => (
            <TouchableOpacity key={patient.id} style={styles.patientCard}>
              <Image
                source={{ uri: patient.avatar }}
                style={styles.patientAvatar}
              />
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientDetails}>
                  Age {patient.age} • {patient.condition}
                </Text>
                <Text style={styles.lastVisit}>
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
              <ChevronRight size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Plus size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Add Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <FileText size={24} color={Colors.primary} />
              <Text style={styles.actionText}>New Record</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Calendar size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Activity size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Lab Results</Text>
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
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 12,
  },

  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },

  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statChangeText: {
    fontSize: 12,
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
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    minWidth: 80,
  },

  timeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },

  appointmentInfo: {
    flex: 1,
  },

  patientName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: 2,
  },

  appointmentType: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  patientCard: {
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
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },

  lastVisit: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },

  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  actionButton: {
    flex: 1,
    minWidth: '47%',
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
