import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Search,
  Filter,
  Plus,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { createAppointmentsStyles } from './styles/appointments';

const { width } = Dimensions.get('window');

interface Appointment {
  id: string;
  title: string;
  doctor: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine' | 'specialist';
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Annual Checkup',
    doctor: 'Dr. Sarah Johnson',
    date: '2024-01-15',
    time: '10:00 AM',
    location: 'City Medical Center',
    status: 'upcoming',
    type: 'routine',
  },
  {
    id: '2',
    title: 'Cardiology Consultation',
    doctor: 'Dr. Michael Chen',
    date: '2024-01-18',
    time: '2:30 PM',
    location: 'Heart Institute',
    status: 'upcoming',
    type: 'specialist',
  },
  {
    id: '3',
    title: 'Follow-up Visit',
    doctor: 'Dr. Emily Davis',
    date: '2024-01-10',
    time: '11:15 AM',
    location: 'Family Clinic',
    status: 'completed',
    type: 'follow-up',
  },
];

const statusColors = {
  upcoming: Colors.medical.green,
  completed: Colors.primary,
  cancelled: Colors.medical.orange,
};

const typeColors = {
  consultation: Colors.medical.red,
  'follow-up': Colors.primary,
  emergency: Colors.medical.orange,
  routine: Colors.medical.green,
  specialist: Colors.medical.blue,
};

export default function AppointmentsScreen() {
  const { user, userData } = useAuth();
  const { colors } = useTheme();
  const styles = createAppointmentsStyles(colors);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || appointment.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || Colors.primary;
  };

  const getTypeColor = (type: string) => {
    return typeColors[type as keyof typeof typeColors] || Colors.primary;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.backgroundGradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: colors.text }]}>Appointments</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Manage your healthcare schedule
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: Colors.primary }]}
              onPress={() => router.push('/book-appointment')}
            >
              <Plus size={20} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Search size={20} color={colors.text} strokeWidth={2} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Search appointments..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Filter size={20} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterTabs}
            contentContainerStyle={styles.filterTabsContent}
          >
            {['all', 'upcoming', 'completed', 'cancelled'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: selectedFilter === filter ? Colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    {
                      color: selectedFilter === filter ? '#fff' : colors.textSecondary,
                    },
                  ]}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Appointments List */}
          <View style={styles.appointmentsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading appointments...
                </Text>
              </View>
            ) : filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <TouchableOpacity
                  key={appointment.id}
                  style={[styles.appointmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/appointment-details/${appointment.id}`)}
                >
                  <View style={styles.appointmentHeader}>
                    <View style={styles.appointmentLeft}>
                      <Text style={[styles.appointmentTitle, { color: colors.text }]}>
                        {appointment.title}
                      </Text>
                      <Text style={[styles.appointmentDoctor, { color: colors.textSecondary }]}>
                        {appointment.doctor}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(appointment.status)}15` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(appointment.status) },
                        ]}
                      >
                        {appointment.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                      <Calendar size={16} color={colors.textSecondary} strokeWidth={2} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {formatDate(appointment.date)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Clock size={16} color={colors.textSecondary} strokeWidth={2} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {appointment.time}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MapPin size={16} color={colors.textSecondary} strokeWidth={2} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {appointment.location}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.appointmentFooter}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: `${getTypeColor(appointment.type)}15` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeText,
                          { color: getTypeColor(appointment.type) },
                        ]}
                      >
                        {appointment.type}
                      </Text>
                    </View>
                    <ChevronRight size={16} color={colors.textSecondary} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Calendar size={48} color={colors.textSecondary} strokeWidth={1} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Appointments</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  {searchQuery || selectedFilter !== 'all'
                    ? 'No appointments match your search criteria'
                    : 'You have no upcoming appointments'}
                </Text>
                <TouchableOpacity
                  style={[styles.bookButton, { backgroundColor: Colors.primary }]}
                  onPress={() => router.push('/book-appointment')}
                >
                  <Text style={styles.bookButtonText}>Book Appointment</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}


