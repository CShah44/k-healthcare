import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  FileText, 
  Filter, 
  Search,
  Calendar,
  User,
  Activity,
  Pill,
  TestTube,
  Scan
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';

export default function MedicalRecordsScreen() {
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
      type: 'lab_result',
      title: 'Complete Blood Count (CBC)',
      date: '2024-10-15',
      doctor: 'Dr. Sarah Wilson',
      status: 'normal',
      description: 'All values within normal range',
      attachments: 1,
    },
    {
      id: '2',
      type: 'consultation',
      title: 'Annual Physical Examination',
      date: '2024-10-10',
      doctor: 'Dr. Michael Chen',
      status: 'completed',
      description: 'Routine annual checkup with vital signs assessment',
      attachments: 2,
    },
    {
      id: '3',
      type: 'prescription',
      title: 'Hypertension Medication',
      date: '2024-10-05',
      doctor: 'Dr. Sarah Wilson',
      status: 'active',
      description: 'Lisinopril 10mg daily for blood pressure management',
      attachments: 0,
    },
    {
      id: '4',
      type: 'imaging',
      title: 'Chest X-Ray',
      date: '2024-09-28',
      doctor: 'Dr. Jennifer Martinez',
      status: 'normal',
      description: 'Clear lungs, no abnormalities detected',
      attachments: 3,
    },
    {
      id: '5',
      type: 'lab_result',
      title: 'Lipid Panel',
      date: '2024-09-20',
      doctor: 'Dr. Michael Chen',
      status: 'high',
      description: 'Cholesterol levels slightly elevated',
      attachments: 1,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'completed':
      case 'active':
        return Colors.medical.green;
      case 'high':
      case 'critical':
        return Colors.medical.red;
      case 'pending':
        return Colors.medical.orange;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'normal':
      case 'completed':
      case 'active':
        return Colors.medical.lightGreen;
      case 'high':
      case 'critical':
        return Colors.medical.lightRed;
      case 'pending':
        return Colors.medical.lightOrange;
      default:
        return Colors.surfaceSecondary;
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

  const filteredRecords = selectedFilter === 'all' 
    ? medicalRecords 
    : medicalRecords.filter(record => record.type === selectedFilter);

  return (
    <SafeAreaView style={[GlobalStyles.container, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical Records</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Search size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
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
                    <Text style={styles.recordDoctor}>{record.doctor}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusBackground(record.status) }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(record.status) }
                    ]}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Text>
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
                  {record.attachments > 0 && (
                    <View style={styles.attachmentCount}>
                      <FileText size={14} color={Colors.textSecondary} />
                      <Text style={styles.attachmentText}>
                        {record.attachments} file{record.attachments > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
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
  
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
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
  
  recordDoctor: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
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
  
  attachmentCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  attachmentText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
});