import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
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
  ChevronRight,
  FolderOpen,
  X,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/constants/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from 'firebase/firestore';

export default function HealthcareRecordsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const filters = [
    { id: 'all', label: 'All Records', icon: FileText },
    { id: 'consultation', label: 'Consultations', icon: User },
    { id: 'lab_result', label: 'Lab Results', icon: TestTube },
    { id: 'prescription', label: 'Prescriptions', icon: Pill },
    { id: 'imaging', label: 'Imaging', icon: Scan },
  ];

  // Real-time Firebase syncing for healthcare professionals
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Healthcare professionals can see records from all patients they have access to
    // This would typically be filtered by hospital/department in a real implementation
    const q = query(
      collection(db, 'medical_records'), // Global medical records collection
      where('assignedDoctor', '==', user.uid), // Records assigned to this doctor
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMedicalRecords(records);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to fetch records:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

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

  // Filter records based on search and type
  const filteredRecords = medicalRecords.filter((record) => {
    const matchesSearch = searchQuery === '' ||
      record.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || record.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={[GlobalStyles.container, styles.container]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Medical Records</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Loading...' : `${filteredRecords.length} records`}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerButton, showSearch && styles.headerButtonActive]}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Search size={20} color={showSearch ? Colors.primary : Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color={Colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search records, patients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textLight}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

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
          const count = isSelected && selectedFilter === 'all' 
            ? filteredRecords.length 
            : filteredRecords.filter(r => r.type === filter.id).length;

          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                isSelected && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <IconComponent
                size={16}
                color={isSelected ? Colors.surface : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterText,
                  isSelected && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
              {selectedFilter === 'all' && (
                <View style={[
                  styles.filterCount,
                  isSelected && styles.filterCountActive,
                ]}>
                  <Text style={[
                    styles.filterCountText,
                    isSelected && styles.filterCountTextActive,
                  ]}>
                    {filteredRecords.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading medical records...</Text>
        </View>
      ) : (
        /* Records List */
        <ScrollView
          style={styles.recordsList}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.recordsContainer}>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const IconComponent = getRecordIcon(record.type);

                return (
                  <TouchableOpacity key={record.id} style={styles.recordCard}>
                    <View style={styles.recordHeader}>
                      <View style={styles.recordIconContainer}>
                        <IconComponent size={20} color={Colors.primary} />
                      </View>
                      <View style={styles.recordInfo}>
                        <Text style={styles.recordTitle}>{record.title}</Text>
                        <Text style={styles.patientName}>
                          {record.patientName} • {record.patientId}
                        </Text>
                        <Text style={styles.recordDoctor}>{record.doctor || 'Unassigned'}</Text>
                      </View>
                      <View style={styles.recordBadges}>
                        {record.priority && (
                          <View
                            style={[
                              styles.priorityBadge,
                              { borderColor: getPriorityColor(record.priority) },
                            ]}
                          >
                            <Text
                              style={[
                                styles.priorityText,
                                { color: getPriorityColor(record.priority) },
                              ]}
                            >
                              {record.priority.toUpperCase()}
                            </Text>
                          </View>
                        )}
                        {record.status && (
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: getStatusBackground(record.status) },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                { color: getStatusColor(record.status) },
                              ]}
                            >
                              {record.status
                                .replace('_', ' ')
                                .charAt(0)
                                .toUpperCase() +
                                record.status.replace('_', ' ').slice(1)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {record.description && (
                      <Text style={styles.recordDescription}>
                        {record.description}
                      </Text>
                    )}

                    <View style={styles.recordFooter}>
                      <View style={styles.recordDate}>
                        <Calendar size={14} color={Colors.textSecondary} />
                        <Text style={styles.recordDateText}>
                          {record.createdAt?.toDate
                            ? record.createdAt.toDate().toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : record.createdAt?.seconds
                            ? new Date(record.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>View Details</Text>
                        <ChevronRight size={14} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              /* Empty State */
              <View style={styles.emptyState}>
                <FolderOpen size={64} color={Colors.textLight} strokeWidth={1} />
                <Text style={styles.emptyTitle}>
                  {searchQuery || selectedFilter !== 'all'
                    ? 'No matching records found'
                    : 'No medical records yet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery || selectedFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Medical records will appear here when patients upload documents or when you create new records'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
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

  headerLeft: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  headerButtonActive: {
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
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
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'Inter-Regular',
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

  filterCount: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },

  filterCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  filterCountText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },

  filterCountTextActive: {
    color: '#ffffff',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
    marginTop: 16,
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

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});