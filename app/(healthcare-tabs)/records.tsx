import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  FileText, 
  Search, 
  Filter,
  Plus,
  Calendar,
  User,
  TestTube,
  Pill,
  Scan,
  Activity,
  ChevronRight
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';

export default function HealthcareRecordsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Records', icon: FileText },
    { id: 'consultation', label: 'Consultations', icon: User },
    { id: 'lab_result', label: 'Lab Results', icon: TestTube },
    { id: 'prescription', label: 'Prescriptions', icon: Pill },
    { id: 'imaging', label: 'Imaging', icon: Scan },
  ];

  const medicalRecords = [
    {
      id: '1',
      patientName: 'John Smith',
      patientId: 'P001',
      type: 'lab_result',
      title: 'Complete Blood Count (CBC)',
      date: '2024-10-20',
      status: 'completed',
      priority: 'normal',
      description: 'Routine blood work - all values within normal range',
      doctor: 'Dr. Sarah Wilson',
    },
    {
      id: '2',
      patientName: 'Sarah Johnson',
      patientId: 'P002',
      type: 'consultation',
      title: 'Diabetes Follow-up',
      date: '2024-10-19',
      status: 'completed',
      priority: 'high',
      description: 'Blood sugar monitoring and medication adjustment',
      doctor: 'Dr. Michael Chen',
    },
    {
      id: '3',
      patientName: 'Michael Brown',
      patientId: 'P003',
      type: 'imaging',
      title: 'Post-Surgery X-Ray',
      date: '2024-10-18',
      status: 'pending_review',
      priority: 'urgent',
      description: 'Follow-up imaging after surgical procedure',
      doctor: 'Dr. Jennifer Martinez',
    },
    {
      id: '4',
      patientName: 'Emma Wilson',
      patientId: 'P004',
      type: 'prescription',
      title: 'Antibiotic Prescription',
      date: '2024-10-17',
      status: 'active',
      priority: 'normal',
      description: 'Amoxicillin 500mg for respiratory infection',
      doctor: 'Dr. David Park',
    },
    {
      id: '5',
      patientName: 'David Chen',
      patientId: 'P005',
      type: 'lab_result',
      title: 'Cardiac Enzyme Panel',
      date: '2024-10-16',
      status: 'completed',
      priority: 'high',
      description: 'Elevated troponin levels - requires immediate attention',
      doctor: 'Dr. Sarah Wilson',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return Colors.medical.green;
      case 'pending_review':
        return Colors.medical.orange;
      case 'urgent':
        return Colors.medical.red;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return Colors.medical.lightGreen;
      case 'pending_review':
        return Colors.medical.lightOrange;
      case 'urgent':
        return Colors.medical.lightRed;
      default:
        return Colors.surfaceSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return Colors.medical.red;
      case 'high':
        return Colors.medical.orange;
      case 'normal':
        return Colors.medical.green;
      default:
        return Colors.textSecondary;
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return User;
      case 'lab_result':
        return TestTube;
      case 'prescription':
        return Pill;
      case 'imaging':
        return Scan;
      default:
        return FileText;
    }
  };

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || record.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={[GlobalStyles.container, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical Records</Text>
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
            placeholder="Search records, patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Type Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => {
          const IconComponent = filter.icon;
          const isSelected = selectedFilter === filter.id;
          
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                isSelected && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <IconComponent 
                size={16} 
                color={isSelected ? Colors.surface : Colors.textSecondary} 
              />
              <Text style={[
                styles.filterText,
                isSelected && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Records List */}
      <ScrollView style={styles.recordsList} showsVerticalScrollIndicator={false}>
        <View style={styles.recordsContainer}>
          {filteredRecords.map((record) => {
            const IconComponent = getRecordIcon(record.type);
            
            return (
              <TouchableOpacity key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordIconContainer}>
                    <IconComponent size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    <Text style={styles.patientName}>{record.patientName} • {record.patientId}</Text>
                    <Text style={styles.recordDoctor}>{record.doctor}</Text>
                  </View>
                  <View style={styles.recordBadges}>
                    <View style={[
                      styles.priorityBadge,
                      { borderColor: getPriorityColor(record.priority) }
                    ]}>
                      <Text style={[
                        styles.priorityText,
                        { color: getPriorityColor(record.priority) }
                      ]}>
                        {record.priority.toUpperCase()}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusBackground(record.status) }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(record.status) }
                      ]}>
                        {record.status.replace('_', ' ').charAt(0).toUpperCase() + record.status.replace('_', ' ').slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <Text style={styles.recordDescription}>{record.description}</Text>
                
                <View style={styles.recordFooter}>
                  <View style={styles.recordDate}>
                    <Calendar size={14} color={Colors.textSecondary} />
                    <Text style={styles.recordDateText}>
                      {new Date(record.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Details</Text>
                    <ChevronRight size={14} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
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
  
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  
  filterButtonActive: {
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
  
  recordsList: {
    flex: 1,
  },
  
  recordsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  recordCard: {
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
  
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  recordIconContainer: {
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
  
  patientName: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  
  recordDoctor: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
  },
  
  recordBadges: {
    alignItems: 'flex-end',
    gap: 6,
  },
  
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  
  recordDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  recordDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  recordDateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
  
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  viewButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
});