import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Search, Filter, Plus, Phone, Mail, Calendar, ChevronRight, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';

export default function PatientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Patients' },
    { id: 'critical', label: 'Critical' },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'stable', label: 'Stable' },
  ];

  const patients = [
    {
      id: '1',
      name: 'John Smith',
      age: 45,
      gender: 'Male',
      condition: 'Hypertension',
      lastVisit: '2024-10-20',
      nextAppointment: '2024-10-25',
      status: 'stable',
      phone: '+1 (555) 123-4567',
      email: 'john.smith@email.com',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      age: 32,
      gender: 'Female',
      condition: 'Diabetes Type 2',
      lastVisit: '2024-10-19',
      nextAppointment: '2024-10-28',
      status: 'monitoring',
      phone: '+1 (555) 234-5678',
      email: 'sarah.johnson@email.com',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '3',
      name: 'Michael Brown',
      age: 58,
      gender: 'Male',
      condition: 'Post-Surgery Recovery',
      lastVisit: '2024-10-18',
      nextAppointment: '2024-10-22',
      status: 'critical',
      phone: '+1 (555) 345-6789',
      email: 'michael.brown@email.com',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '4',
      name: 'Emma Wilson',
      age: 28,
      gender: 'Female',
      condition: 'Routine Check-up',
      lastVisit: '2024-10-15',
      nextAppointment: '2024-11-15',
      status: 'stable',
      phone: '+1 (555) 456-7890',
      email: 'emma.wilson@email.com',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: '5',
      name: 'David Chen',
      age: 41,
      gender: 'Male',
      condition: 'Cardiac Monitoring',
      lastVisit: '2024-10-17',
      nextAppointment: '2024-10-24',
      status: 'monitoring',
      phone: '+1 (555) 567-8901',
      email: 'david.chen@email.com',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return Colors.medical.green;
      case 'monitoring':
        return Colors.medical.orange;
      case 'critical':
        return Colors.medical.red;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'stable':
        return Colors.medical.lightGreen;
      case 'monitoring':
        return Colors.medical.lightOrange;
      case 'critical':
        return Colors.medical.lightRed;
      default:
        return Colors.surfaceSecondary;
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || patient.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={[GlobalStyles.container, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Patients</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Status Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.id && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Patients List */}
      <ScrollView style={styles.patientsList} showsVerticalScrollIndicator={false}>
        <View style={styles.patientsContainer}>
          {filteredPatients.map((patient) => (
            <TouchableOpacity key={patient.id} style={styles.patientCard}>
              <View style={styles.patientHeader}>
                <Image source={{ uri: patient.avatar }} style={styles.patientAvatar} />
                <View style={styles.patientInfo}>
                  <View style={styles.patientNameRow}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    {patient.status === 'critical' && (
                      <AlertTriangle size={16} color={Colors.medical.red} />
                    )}
                  </View>
                  <Text style={styles.patientDetails}>
                    {patient.age} years • {patient.gender}
                  </Text>
                  <Text style={styles.patientCondition}>{patient.condition}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusBackground(patient.status) }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(patient.status) }
                  ]}>
                    {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.patientDetails}>
                <View style={styles.detailRow}>
                  <Calendar size={14} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>
                    Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={14} color={Colors.primary} />
                  <Text style={styles.detailText}>
                    Next: {new Date(patient.nextAppointment).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.patientActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Phone size={16} color={Colors.primary} />
                  <Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Mail size={16} color={Colors.primary} />
                  <Text style={styles.actionText}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Records</Text>
                  <ChevronRight size={16} color={Colors.surface} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
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
  
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.medical.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  filtersContainer: {
    marginBottom: 20,
  },
  
  filtersContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  
  filterChip: {
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  
  filterTextActive: {
    color: Colors.surface,
  },
  
  patientsList: {
    flex: 1,
  },
  
  patientsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  patientCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  patientAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  
  patientInfo: {
    flex: 1,
  },
  
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  
  patientName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  
  patientDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  
  patientCondition: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Inter-Medium',
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  
  patientActions: {
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
  
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    gap: 6,
  },
  
  viewButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.surface,
  },
});