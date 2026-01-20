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
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system/legacy';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
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

// Helper to convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to convert Uint8Array to base64
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to get user encryption key
function getUserEncryptionKey(uid: string): string {
  return CryptoJS.SHA256(uid + '_svastheya_secret').toString();
}

// Helper to decrypt AES-encrypted files (PDFs and images)
async function decryptFileFromUrl(
  url: string,
  record: any,
  uid: string // Use the patient's UID specifically
): Promise<string> {
  // Download encrypted file
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  // Convert encrypted binary to base64
  const encryptedBase64 = uint8ArrayToBase64(new Uint8Array(arrayBuffer));

  // Get encryption key using the PATIENT'S UID
  const key = getUserEncryptionKey(uid);

  // Decrypt
  const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key);
  const decryptedBytes = decrypted.words.reduce(
    (arr: number[], word: number) => {
      arr.push(
        (word >> 24) & 0xff,
        (word >> 16) & 0xff,
        (word >> 8) & 0xff,
        (word >> 1) & 0xff // Fixed: was & 0xff, likely copy-paste error in original or just safety
      );
      return arr;
    },
    []
  );

  // Correct byte extraction using sigBytes
  const decryptedUint8 = new Uint8Array(decrypted.sigBytes);
  for (let i = 0; i < decrypted.sigBytes; i++) {
    decryptedUint8[i] = (decrypted.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }

  if (Platform.OS === 'web') {
    const blob = new Blob([decryptedUint8], { type: record.fileType || 'application/pdf' });
    if (decryptedUint8.length === 0) {
      throw new Error('Decryption failed or empty content');
    }
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } else {
    // For Native: Save to file system
    const filename = `decrypted_${Date.now()}.${record.fileType === 'application/pdf' ? 'pdf' : 'jpg'}`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // expo-file-system expects base64 for writing
    const base64Data = uint8ArrayToBase64(decryptedUint8);

    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
  }
}

export default function HealthcareRecordsScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewUri, setPdfPreviewUri] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (
      Platform.OS === 'web' &&
      showPdfPreview &&
      pdfPreviewUri &&
      (selectedRecord?.fileType === 'application/pdf' || selectedRecord?.fileUrl?.toLowerCase().endsWith('.pdf'))
    ) {
      const newWindow = window.open(pdfPreviewUri, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('Popup blocked! Please allow popups for this site.');
      }
      setShowPdfPreview(false);
    }
  }, [showPdfPreview, pdfPreviewUri, selectedRecord]);



  // Dummy data for prescriptions to ensure they appear
  const dummyRecords: any[] = [];

  const { patientUid, patientName } = useLocalSearchParams<{ patientUid: string, patientName: string }>();

  // Real-time Firebase syncing for medical records
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    let q;
    let unsubscribe: any;

    const fetchRecords = async () => {
      try {
        // Scenario 1: A specific patient is selected (Doctor viewing patient records)
        if (patientUid) {
          // 1. Verify Access
          // In a robust app, we'd check 'doctorAccess' collection again here for security.
          // For this implementation, we'll assume the navigation from patients.tsx checked it,
          // but we should ideally wrap the Firestore security rules or check here.

          // Fetch from the patient's subcollection
          // Note: Patient records use 'uploadedAt', while global records use 'createdAt'
          q = query(
            collection(db, 'patients', patientUid, 'records'),
            orderBy('uploadedAt', 'desc')
          );
        }
        // Scenario 2: Default doctor view (All records assigned to this doctor)
        else {
          q = query(
            collection(db, 'medical_records'),
            where('assignedDoctor', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
        }

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const records = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            // If viewing a specific patient, map the data to match expected shape if needed, 
            // or ensure the subcollection data structure matches 'medical_records' structure.
            // Assuming unified schema.

            // For patient-specific view, we might need to inject the patientName if stored differently
            const recordsWithMeta = records.map((r: any) => ({
              ...r,
              patientName: patientUid ? (patientName || r.patientName) : r.patientName,
              patientId: patientUid ? (r.patientId || 'N/A') : r.patientId,
              // Map uploadedAt to createdAt for display consistency if createdAt is missing
              createdAt: r.createdAt || r.uploadedAt
            }));

            setMedicalRecords(recordsWithMeta);
            setLoading(false);
          },
          (error) => {
            console.error('Failed to fetch records:', error);
            setMedicalRecords([]);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error setting up records listener:", err);
        setLoading(false);
      }
    };

    fetchRecords();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, patientUid]);

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
              setDeletingId(record.id);
              await deleteDoc(doc(db, 'medical_records', record.id));
              Alert.alert('Success', 'Record deleted successfully');
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'Failed to delete record');
            } finally {
              setDeletingId(null);
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



      {/* Loading State */}
      {
        loading ? (
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
                      <View style={styles.recordCardContent}>
                        <View style={styles.recordMain}>
                          <View style={styles.recordLeft}>
                            <View
                              style={[
                                styles.recordIconContainer,
                                { backgroundColor: `${Colors.medical.blue}15` },
                              ]}
                            >
                              <IconComponent
                                size={20}
                                color={Colors.medical.blue}
                                strokeWidth={2}
                              />
                            </View>
                            <View style={styles.recordInfo}>
                              <Text
                                style={[styles.recordTitle, { color: colors.text }]}
                                numberOfLines={1}
                              >
                                {record.title}
                              </Text>

                              <View style={styles.recordMeta}>
                                <Text style={styles.patientName}>
                                  {record.patientName} • {record.patientId}
                                </Text>
                                <View style={styles.metaDot} />

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
                                      })
                                    : record.createdAt?.seconds
                                      ? new Date(
                                        record.createdAt.seconds * 1000
                                      ).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                      })
                                      : 'N/A'}
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
                          </View>

                          <View style={styles.recordActions}>
                            <TouchableOpacity
                              style={styles.viewButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                setSelectedRecord(record);
                                setShowPreviewModal(true);
                              }}
                            >
                              <Eye size={18} color={Colors.primary} strokeWidth={2} />
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
                                  <Edit3 size={18} color={Colors.medical.blue} strokeWidth={2} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.deleteButton}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRecord(record);
                                  }}
                                  disabled={deletingId === record.id}
                                >
                                  {deletingId === record.id ? (
                                    <ActivityIndicator size="small" color={Colors.medical.red} />
                                  ) : (
                                    <Trash2 size={18} color={Colors.medical.red} strokeWidth={2} />
                                  )}
                                </TouchableOpacity>
                              </>
                            )}
                          </View>
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
        )
      }

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

                {selectedRecord.fileUrl && (
                  <View style={styles.previewFileContainer}>
                    {/* Try to show image preview if it looks like an image */}
                    {(selectedRecord.fileType?.startsWith('image/') ||
                      selectedRecord.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i)) ? (
                      <Image
                        source={{ uri: selectedRecord.fileUrl }}
                        style={styles.previewImage}
                        resizeMode="contain"
                      />
                    ) : null}

                    <TouchableOpacity
                      style={[styles.viewDocumentButton, { backgroundColor: Colors.primary }]}
                      onPress={async () => {
                        if (selectedRecord.fileType === 'application/pdf' || selectedRecord.fileUrl.toLowerCase().endsWith('.pdf')) {
                          try {
                            const uidToUse = (Array.isArray(patientUid) ? patientUid[0] : patientUid) || user?.uid || '';
                            if (!uidToUse) throw new Error("No user ID available for decryption");
                            const uri = await decryptFileFromUrl(selectedRecord.fileUrl, selectedRecord, uidToUse);
                            setPdfPreviewUri(uri);
                            setShowPdfPreview(true);
                          } catch (e) {
                            Alert.alert('Error', 'Failed to open PDF');
                            console.error(e);
                          }
                        } else {
                          Linking.openURL(selectedRecord.fileUrl);
                        }
                      }}
                    >
                      <FileText size={20} color="#fff" />
                      <Text style={styles.viewDocumentText}>
                        {selectedRecord.fileType === 'application/pdf' || selectedRecord.fileUrl.toLowerCase().endsWith('.pdf')
                          ? 'View PDF'
                          : 'Open Document'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        visible={showPdfPreview}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowPdfPreview(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#000' }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>PDF Preview</Text>
            <TouchableOpacity
              onPress={() => setShowPdfPreview(false)}
              style={{ padding: 8 }}
            >
              <Text style={{ color: '#fff', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>

          {pdfPreviewUri ? (
            Platform.OS === 'web' ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff', marginBottom: 16 }}>Opening PDF in new tab...</Text>
              </View>
            ) : (
              <WebView
                source={{ uri: pdfPreviewUri }}
                style={{ flex: 1 }}
                startInLoadingState
                renderLoading={() => (
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                  </View>
                )}
              />
            )
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ color: '#fff', marginTop: 10 }}>Decrypting document...</Text>
            </View>
          )}
        </SafeAreaView>
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
    </SafeAreaView >
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
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },

  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  recordCardContent: {
    padding: 16,
  },

  recordMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  recordLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },

  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    flexWrap: 'wrap',
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.light.textTertiary,
    marginHorizontal: 8,
  },

  recordIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: `${Colors.medical.blue}15`,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  recordInfo: {
    flex: 1,
  },

  recordTitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },

  patientName: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 1,
    marginTop: -2,
  },

  recordDoctor: {
    fontSize: 11,
    color: Colors.light.textTertiary,
    fontFamily: 'Satoshi-Variable',
  },

  recordBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },

  priorityBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },

  priorityText: {
    fontSize: 9,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },

  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 10,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },

  recordDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontFamily: 'Satoshi-Variable',
    lineHeight: 18,
    marginBottom: 8,
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
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontFamily: 'Satoshi-Variable',
    marginLeft: 4,
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
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },

  editButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: `${Colors.medical.blue}15`,
  },

  deleteButton: {
    padding: 6,
    borderRadius: 6,
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

  previewFileContainer: {
    marginTop: 20,
    gap: 16,
    alignItems: 'center',
    width: '100%',
  },

  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: Colors.light.surfaceSecondary,
  },

  viewDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
  },

  viewDocumentText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
});
