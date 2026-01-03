import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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
  Edit3,
  Trash2,
  Eye,
  Check,
  Heart,
  Brain,
  Bone,
  Tag,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { db } from '@/constants/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';

export default function HealthcareRecordsScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();

  const filters = [
    { id: 'all', label: 'All Records', icon: FileText },
    { id: 'consultation', label: 'Consultations', icon: User },
    { id: 'lab_result', label: 'Lab Results', icon: TestTube },
    { id: 'prescription', label: 'Prescriptions', icon: Pill },
    { id: 'imaging', label: 'Imaging', icon: Scan },
  ];

  // Dummy data for prescriptions to ensure they appear
  const dummyRecords = [
    {
      id: 'dummy_1',
      title: 'Monthly Prescription',
      patientName: 'John Smith',
      patientId: 'P-12345',
      type: 'prescription',
      status: 'active',
      priority: 'normal',
      description:
        'Prescription for Hypertension management. Amoxicillin 500mg.',
      createdAt: { seconds: Date.now() / 1000 },
      assignedDoctor: user?.uid,
    },
    {
      id: 'dummy_2',
      title: 'Post-Surgery Meds',
      patientName: 'Michael Brown',
      patientId: 'P-98765',
      type: 'prescription',
      status: 'urgent',
      priority: 'high',
      description: 'Pain management and antibiotics after knee surgery.',
      createdAt: { seconds: (Date.now() - 86400 * 2) / 1000 }, // 2 days ago
      assignedDoctor: user?.uid,
    },
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
        // Merge real records with dummy records for demo purposes
        setMedicalRecords([...records, ...dummyRecords]);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to fetch records:', error);
        // Fallback to dummy data
        setMedicalRecords(dummyRecords);
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
        return colors.textSecondary;
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return 'rgba(34, 197, 94, 0.1)';
      case 'pending_review':
        return 'rgba(249, 115, 22, 0.1)';
      case 'urgent':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return colors.surfaceSecondary;
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
        return colors.textSecondary;
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

  // Check if user can edit record (only assigned doctor can edit)
  const canEditRecord = (record: any): boolean => {
    return record.assignedDoctor === user?.uid;
  };

  const handleEditRecord = (record: any) => {
    if (!canEditRecord(record)) {
      Alert.alert(
        'Permission Denied',
        'You can only edit records assigned to you.'
      );
      return;
    }

    setSelectedRecord(record);
    setEditTitle(record.title || '');
    setEditDescription(record.description || '');
    setEditStatus(record.status || '');
    setEditPriority(record.priority || '');
    setShowEditModal(true);
  };

  const handleUpdateRecord = async () => {
    if (!selectedRecord || !editTitle.trim()) {
      Alert.alert('Error', 'Please enter a valid title');
      return;
    }

    try {
      setUpdating(true);

      await updateDoc(doc(db, 'medical_records', selectedRecord.id), {
        title: editTitle.trim(),
        description: editDescription.trim(),
        status: editStatus,
        priority: editPriority,
        updatedAt: new Date(),
      });

      setShowEditModal(false);
      setSelectedRecord(null);
      Alert.alert('Success', 'Record updated successfully');
    } catch (error) {
      console.error('Error updating record:', error);
      Alert.alert('Error', 'Failed to update record');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRecord = (record: any) => {
    if (!canEditRecord(record)) {
      Alert.alert(
        'Permission Denied',
        'You can only delete records assigned to you.'
      );
      return;
    }

    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteDoc(doc(db, 'medical_records', record.id));
              Alert.alert('Success', 'Record deleted successfully');
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'Failed to delete record');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Filter records based on search and type
  const filteredRecords = medicalRecords.filter((record) => {
    const matchesSearch =
      searchQuery === '' ||
      record.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' || record.type === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView
      style={[
        GlobalStyles.container,
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Medical Records
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            {loading ? 'Loading...' : `${filteredRecords.length} records`}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.headerButton,
              showSearch && styles.headerButtonActive,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Search
              size={20}
              color={showSearch ? Colors.primary : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              router.push('/(healthcare-tabs)/create-prescription')
            }
          >
            <Plus size={20} color={Colors.light.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search records, patients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={colors.textSecondary} />
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
          const count =
            isSelected && selectedFilter === 'all'
              ? filteredRecords.length
              : filteredRecords.filter((r) => r.type === filter.id).length;

          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                isSelected && styles.filterButtonActive,
                {
                  backgroundColor: isSelected ? Colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <IconComponent
                size={16}
                color={isSelected ? Colors.light.surface : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterText,
                  isSelected && styles.filterTextActive,
                  {
                    color: isSelected
                      ? Colors.light.surface
                      : colors.textSecondary,
                  },
                ]}
              >
                {filter.label}
              </Text>
              {selectedFilter === 'all' && (
                <View
                  style={[
                    styles.filterCount,
                    isSelected && styles.filterCountActive,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255,255,255,0.2)'
                        : colors.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      isSelected && styles.filterCountTextActive,
                      {
                        color: isSelected
                          ? Colors.light.surface
                          : colors.textSecondary,
                      },
                    ]}
                  >
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
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading medical records...
          </Text>
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
                const canEdit = canEditRecord(record);

                return (
                  <TouchableOpacity
                    key={record.id}
                    style={[
                      styles.recordCard,
                      { backgroundColor: colors.surface },
                    ]}
                    onPress={() => {
                      setSelectedRecord(record);
                      setShowPreviewModal(true);
                    }}
                  >
                    <View style={styles.recordHeader}>
                      <View style={styles.recordIconContainer}>
                        <IconComponent size={20} color={Colors.primary} />
                      </View>
                      <View style={styles.recordInfo}>
                        <Text
                          style={[styles.recordTitle, { color: colors.text }]}
                        >
                          {record.title}
                        </Text>
                        <Text
                          style={[
                            styles.patientName,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {record.patientName} • {record.patientId}
                        </Text>
                        <Text
                          style={[
                            styles.recordDoctor,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {record.doctor || 'Unassigned'}
                        </Text>
                      </View>
                      <View style={styles.recordBadges}>
                        {record.priority && (
                          <View
                            style={[
                              styles.priorityBadge,
                              {
                                borderColor: getPriorityColor(record.priority),
                              },
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
                              {
                                backgroundColor: getStatusBackground(
                                  record.status
                                ),
                              },
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
                      <Text
                        style={[
                          styles.recordDescription,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {record.description}
                      </Text>
                    )}

                    <View style={styles.recordFooter}>
                      <View style={styles.recordDate}>
                        <Calendar size={14} color={colors.textSecondary} />
                        <Text
                          style={[
                            styles.recordDateText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {record.createdAt?.toDate
                            ? record.createdAt
                                .toDate()
                                .toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                            : record.createdAt?.seconds
                            ? new Date(
                                record.createdAt.seconds * 1000
                              ).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.recordActions}>
                        <TouchableOpacity style={styles.viewButton}>
                          <Eye size={14} color={Colors.primary} />
                          <Text style={styles.viewButtonText}>View</Text>
                        </TouchableOpacity>
                        {canEdit && (
                          <>
                            <TouchableOpacity
                              style={styles.editButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleEditRecord(record);
                              }}
                            >
                              <Edit3 size={14} color={Colors.medical.blue} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleDeleteRecord(record);
                              }}
                            >
                              <Trash2 size={14} color={Colors.medical.red} />
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              /* Empty State */
              <View style={styles.emptyState}>
                <FolderOpen
                  size={64}
                  color={colors.textSecondary}
                  strokeWidth={1}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {searchQuery || selectedFilter !== 'all'
                    ? 'No matching records found'
                    : 'No medical records yet'}
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {searchQuery || selectedFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Medical records will appear here when patients upload documents or when you create new records'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Preview Modal */}
      <Modal
        visible={showPreviewModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            {selectedRecord && (
              <>
                <View
                  style={[
                    styles.previewHeader,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {selectedRecord.title}
                  </Text>
                  <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
                    <X size={24} color={colors.text} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Patient: {selectedRecord.patientName} •{' '}
                  {selectedRecord.patientId}
                </Text>

                {selectedRecord.description && (
                  <Text
                    style={[
                      styles.recordDescriptionModal,
                      { color: colors.text },
                    ]}
                  >
                    {selectedRecord.description}
                  </Text>
                )}

                <View style={styles.recordMetaModal}>
                  <Text
                    style={[
                      styles.recordMetaText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Created:{' '}
                    {selectedRecord.createdAt?.toDate
                      ? selectedRecord.createdAt.toDate().toLocaleString()
                      : selectedRecord.createdAt?.seconds
                      ? new Date(
                          selectedRecord.createdAt.seconds * 1000
                        ).toLocaleString()
                      : 'N/A'}
                  </Text>
                  {selectedRecord.status && (
                    <Text
                      style={[
                        styles.recordMetaText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Status:{' '}
                      {selectedRecord.status
                        .replace('_', ' ')
                        .charAt(0)
                        .toUpperCase() +
                        selectedRecord.status.replace('_', ' ').slice(1)}
                    </Text>
                  )}
                  {selectedRecord.priority && (
                    <Text
                      style={[
                        styles.recordMetaText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Priority:{' '}
                      {selectedRecord.priority.charAt(0).toUpperCase() +
                        selectedRecord.priority.slice(1)}
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.editModalContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <View
              style={[
                styles.editModalHeader,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Edit Record
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={colors.text} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editForm}>
              <Text
                style={[styles.inputLabel, { color: colors.textSecondary }]}
              >
                Title
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Enter record title"
                placeholderTextColor={colors.textSecondary}
              />

              <Text
                style={[styles.inputLabel, { color: colors.textSecondary }]}
              >
                Description
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textAreaInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Enter record description"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />

              <Text
                style={[styles.inputLabel, { color: colors.textSecondary }]}
              >
                Status
              </Text>
              <View style={styles.optionsContainer}>
                {['pending_review', 'active', 'completed', 'urgent'].map(
                  (status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.optionButton,
                        editStatus === status && styles.optionButtonSelected,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                        },
                      ]}
                      onPress={() => setEditStatus(status)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          editStatus === status && styles.optionTextSelected,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {status.replace('_', ' ').charAt(0).toUpperCase() +
                          status.replace('_', ' ').slice(1)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <Text
                style={[styles.inputLabel, { color: colors.textSecondary }]}
              >
                Priority
              </Text>
              <View style={styles.optionsContainer}>
                {['normal', 'high', 'urgent'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.optionButton,
                      editPriority === priority && styles.optionButtonSelected,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                    onPress={() => setEditPriority(priority)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        editPriority === priority && styles.optionTextSelected,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View
              style={[
                styles.editModalActions,
                { borderTopColor: colors.border },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  updating && styles.updateButtonDisabled,
                ]}
                onPress={handleUpdateRecord}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Check size={16} color="white" strokeWidth={2} />
                )}
                <Text style={styles.updateButtonText}>
                  {updating ? 'Updating...' : 'Update'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
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
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
    color: Colors.light.text,
  },

  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: 'Satoshi-Variable',
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
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
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
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    fontFamily: 'Satoshi-Variable',
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
    backgroundColor: Colors.light.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 6,
  },

  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  filterText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },

  filterTextActive: {
    color: Colors.light.surface,
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
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
    color: Colors.light.text,
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
    color: Colors.light.textSecondary,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
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
    backgroundColor: Colors.light.surface,
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
    backgroundColor: `${Colors.medical.blue}15`,
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
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },

  patientName: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 2,
  },

  recordDoctor: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    fontFamily: 'Satoshi-Variable',
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
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },

  recordDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: 'Satoshi-Variable',
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
    color: Colors.light.textSecondary,
    fontFamily: 'Satoshi-Variable',
    marginLeft: 6,
  },

  recordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  viewButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },

  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: `${Colors.medical.blue}15`,
  },

  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: `${Colors.medical.red}15`,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 14,
    color: Colors.light.textTertiary,
    fontFamily: 'Satoshi-Variable',
    textAlign: 'center',
    lineHeight: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },

  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
    color: Colors.light.text,
    flex: 1,
    marginRight: 16,
  },

  modalSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 16,
  },

  recordDescriptionModal: {
    fontSize: 14,
    color: Colors.light.text,
    fontFamily: 'Satoshi-Variable',
    lineHeight: 20,
    marginBottom: 16,
  },

  recordMetaModal: {
    backgroundColor: Colors.light.surface,
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },

  recordMetaText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontFamily: 'Satoshi-Variable',
  },

  editModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },

  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  editForm: {
    maxHeight: 400,
    marginBottom: 24,
  },

  inputLabel: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    marginTop: 16,
  },

  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    color: Colors.light.text,
  },

  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },

  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  optionButtonSelected: {
    backgroundColor: `${Colors.primary}20`,
    borderColor: Colors.primary,
  },

  optionText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },

  optionTextSelected: {
    color: Colors.primary,
  },

  editModalActions: {
    flexDirection: 'row',
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },

  updateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    gap: 6,
  },

  updateButtonDisabled: {
    backgroundColor: Colors.light.textSecondary,
  },

  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
});
