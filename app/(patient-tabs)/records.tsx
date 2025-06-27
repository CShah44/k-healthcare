import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Search,
  Calendar,
  Download,
  Eye,
  Upload,
  TestTube2,
  Pill,
  FileImage,
  Plus,
  Filter,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/constants/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function MedicalRecordsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const { user } = useAuth();
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'patients', user.uid, 'records'),
          orderBy('uploadedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMedicalRecords(records);
      } catch (e) {
        console.error('Failed to fetch records:', e);
      }
    };
    fetchRecords();
  }, [user]);

  const filters = [
    { id: 'all', label: 'All', count: medicalRecords.length },
    { id: 'uploaded', label: 'My Uploads', count: medicalRecords.filter(r => r.type === 'uploaded').length },
    { id: 'lab_reports', label: 'Lab Reports', count: medicalRecords.filter(r => r.type === 'lab_reports').length },
    { id: 'prescriptions', label: 'Prescriptions', count: medicalRecords.filter(r => r.type === 'prescriptions').length },
  ];

  const getRecordIcon = (type: string, source: string) => {
    if (source === 'lab_uploaded') {
      return { icon: TestTube2, color: Colors.medical.green };
    }

    switch (type) {
      case 'prescriptions':
        return { icon: Pill, color: Colors.medical.orange };
      case 'uploaded':
        return { icon: FileImage, color: Colors.primary };
      default:
        return { icon: FileText, color: Colors.textSecondary };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'reviewed':
        return Colors.medical.green;
      case 'high':
      case 'critical':
        return Colors.medical.red;
      case 'active':
        return Colors.medical.blue;
      case 'archived':
        return Colors.textLight;
      default:
        return Colors.textSecondary;
    }
  };

  const filteredRecords =
    selectedFilter === 'all'
      ? medicalRecords
      : medicalRecords.filter((record) => record.type === selectedFilter);

  const openDocumentPicker = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });
      setUploading(false);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setSelectedImage(null);
      }
    } catch (e) {
      setUploading(false);
      Alert.alert('Error', 'Could not pick document.');
    }
  };

  const openImagePicker = async () => {
    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      setUploading(false);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        setSelectedFile(null);
      }
    } catch (e) {
      setUploading(false);
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  const openCamera = async () => {
    try {
      setUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      setUploading(false);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
        setSelectedFile(null);
      }
    } catch (e) {
      setUploading(false);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const handleUpload = async () => {
    // Placeholder: Implement upload logic here (e.g., upload to Firebase or backend)
    Alert.alert('Upload', 'File/photo upload logic goes here.');
    setUploadModalVisible(false);
    setSelectedFile(null);
    setSelectedImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Medical Records</Text>
            <Text style={styles.headerSubtitle}>
              {filteredRecords.length} documents
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Search size={20} color={Colors.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={() => router.push('/(patient-tabs)/upload-record')}>
              <Plus size={20} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => {
              const isSelected = selectedFilter === filter.id;

              return (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterTab,
                    isSelected && styles.filterTabActive,
                  ]}
                  onPress={() => setSelectedFilter(filter.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isSelected && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                  <View
                    style={[
                      styles.filterCount,
                      isSelected && styles.filterCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        isSelected && styles.filterCountTextActive,
                      ]}
                    >
                      {filter.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Records List */}
        <ScrollView
          style={styles.recordsList}
          contentContainerStyle={styles.recordsContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredRecords.map((record) => {
            const { icon: IconComponent, color } = getRecordIcon(
              record.type,
              record.source
            );

            return (
              <TouchableOpacity
                key={record.id}
                style={styles.recordCard}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedRecord(record);
                  setPreviewModalVisible(true);
                }}
              >
                <View style={styles.recordCardContent}>
                  {record.isNew && <View style={styles.newBadge} />}

                  <View style={styles.recordMain}>
                    <View style={styles.recordLeft}>
                      <View
                        style={[
                          styles.recordIcon,
                          { backgroundColor: `${color}15` },
                        ]}
                      >
                        <IconComponent
                          size={20}
                          color={color}
                          strokeWidth={2}
                        />
                      </View>
                      <View style={styles.recordInfo}>
                        <Text style={styles.recordTitle} numberOfLines={2}>
                          {record.title}
                        </Text>
                        <View style={styles.recordMeta}>
                          <Text style={styles.recordSource}>
                            {record.source === 'lab_uploaded'
                              ? record.lab
                              : record.doctor}
                          </Text>
                          <View style={styles.metaDot} />
                          <Text style={styles.recordDate}>
                            {new Date(record.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        </View>
                        <View style={styles.recordDetails}>
                          <Text style={styles.fileInfo}>
                            {record.fileType} • {record.fileSize}
                          </Text>
                          {record.source === 'lab_uploaded' && (
                            <View style={styles.labBadge}>
                              <Text style={styles.labBadgeText}>
                                Lab Report
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={styles.recordActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Eye size={16} color={Colors.primary} strokeWidth={2} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Download
                          size={16}
                          color={Colors.primary}
                          strokeWidth={2}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {record.status !== 'archived' && (
                    <View style={styles.recordFooter}>
                      <View
                        style={[
                          styles.statusIndicator,
                          {
                            backgroundColor: `${getStatusColor(
                              record.status
                            )}20`,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(record.status) },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(record.status) },
                          ]}
                        >
                          {record.status.charAt(0).toUpperCase() +
                            record.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Empty State */}
          {filteredRecords.length === 0 && (
            <View style={styles.emptyState}>
              <FileText size={48} color={Colors.textLight} strokeWidth={1} />
              <Text style={styles.emptyTitle}>No records found</Text>
              <Text style={styles.emptySubtitle}>
                Upload your medical documents or wait for lab reports
              </Text>
              <TouchableOpacity style={styles.uploadEmptyButton}>
                <Upload size={16} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.uploadEmptyText}>Upload Document</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Upload Modal */}
        <Modal
          visible={uploadModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setUploadModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Insert Past Record/Prescription</Text>
              {uploading ? (
                <ActivityIndicator size="large" color={Colors.primary} />
              ) : (
                <>
                  <TouchableOpacity style={styles.uploadOption} onPress={openDocumentPicker}>
                    <Text style={styles.uploadOptionText}>Upload PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.uploadOption} onPress={openImagePicker}>
                    <Text style={styles.uploadOptionText}>Upload Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.uploadOption} onPress={openCamera}>
                    <Text style={styles.uploadOptionText}>Take Photo</Text>
                  </TouchableOpacity>
                  {(selectedFile || selectedImage) && (
                    <View style={styles.previewContainer}>
                      {selectedFile && (
                        <Text style={styles.previewText}>Selected PDF: {selectedFile.name}</Text>
                      )}
                      {selectedImage && (
                        <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                      )}
                      <TouchableOpacity style={styles.uploadConfirmButton} onPress={handleUpload}>
                        <Text style={styles.uploadConfirmText}>Upload</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity style={styles.closeModalButton} onPress={() => setUploadModalVisible(false)}>
                    <Text style={styles.closeModalText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Preview Modal */}
        <Modal
          visible={previewModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setPreviewModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedRecord && (
                <>
                  <Text style={styles.modalTitle}>{selectedRecord.title}</Text>
                  <Text style={styles.modalSubtitle}>
                    Uploaded: {selectedRecord.uploadedAt?.toDate ? selectedRecord.uploadedAt.toDate().toLocaleString() : (selectedRecord.uploadedAt ? new Date(selectedRecord.uploadedAt.seconds * 1000).toLocaleString() : 'N/A')}
                  </Text>
                  {selectedRecord.fileType?.startsWith('image') ? (
                    <Image source={{ uri: selectedRecord.fileUrl }} style={{ width: 220, height: 300, borderRadius: 12, marginVertical: 16 }} resizeMode="contain" />
                  ) : selectedRecord.fileType === 'application/pdf' ? (
                    <TouchableOpacity
                      style={styles.openPdfButton}
                      onPress={() => Linking.openURL(selectedRecord.fileUrl)}
                    >
                      <Text style={styles.openPdfText}>Open PDF</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ marginVertical: 16 }}>File type not supported for preview.</Text>
                  )}
                  <TouchableOpacity style={styles.closeModalButton} onPress={() => setPreviewModalVisible(false)}>
                    <Text style={styles.closeModalText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  backgroundGradient: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 24,
  },

  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    letterSpacing: -0.5,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },

  uploadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filtersContainer: {
    marginBottom: 20,
  },

  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },

  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    gap: 8,
  },

  filterTabActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },

  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },

  filterTextActive: {
    color: '#ffffff',
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

  recordsList: {
    flex: 1,
  },

  recordsContent: {
    paddingHorizontal: 20,
  },

  recordCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    position: 'relative',
  },

  recordCardContent: {
    padding: 16,
  },

  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  recordMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  recordLeft: {
    flexDirection: 'row',
    flex: 1,
  },

  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    lineHeight: 20,
  },

  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  recordSource: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Medium',
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textLight,
    marginHorizontal: 8,
  },

  recordDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  recordDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  fileInfo: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
  },

  labBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  labBadgeText: {
    fontSize: 10,
    color: Colors.medical.green,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  recordActions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  recordFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },

  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 12,
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
  },

  emptySubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  uploadEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },

  uploadEmptyText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },

  bottomSpacing: {
    height: 100,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
    color: Colors.text,
  },
  uploadOption: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  uploadOptionText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  previewContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 15,
    color: Colors.text,
    marginBottom: 8,
  },
  previewImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  uploadConfirmButton: {
    backgroundColor: Colors.medical.green,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 8,
  },
  uploadConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  closeModalButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  closeModalText: {
    color: Colors.error,
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  openPdfButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 8,
  },
  openPdfText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
