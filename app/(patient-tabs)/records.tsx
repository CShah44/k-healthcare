import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
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

const { width } = Dimensions.get('window');

export default function MedicalRecordsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All', count: 24 },
    { id: 'uploaded', label: 'My Uploads', count: 8 },
    { id: 'lab_reports', label: 'Lab Reports', count: 12 },
    { id: 'prescriptions', label: 'Prescriptions', count: 4 },
  ];

  const medicalRecords = [
    {
      id: '1',
      title: 'Blood Test Results - CBC',
      type: 'lab_reports',
      source: 'lab_uploaded', // lab_uploaded or user_uploaded
      date: '2024-10-15',
      lab: 'PathLab Diagnostics',
      doctor: 'Dr. Sarah Wilson',
      fileType: 'PDF',
      fileSize: '2.4 MB',
      status: 'normal',
      isNew: true,
    },
    {
      id: '2',
      title: 'Chest X-Ray Report',
      type: 'uploaded',
      source: 'user_uploaded',
      date: '2024-10-12',
      doctor: 'Dr. Michael Chen',
      fileType: 'PDF',
      fileSize: '5.1 MB',
      status: 'reviewed',
      isNew: false,
    },
    {
      id: '3',
      title: 'Hypertension Medication',
      type: 'prescriptions',
      source: 'user_uploaded',
      date: '2024-10-10',
      doctor: 'Dr. Sarah Wilson',
      fileType: 'JPG',
      fileSize: '1.2 MB',
      status: 'active',
      isNew: false,
    },
    {
      id: '4',
      title: 'Lipid Profile Test',
      type: 'lab_reports',
      source: 'lab_uploaded',
      date: '2024-10-08',
      lab: 'MedLab Services',
      doctor: 'Dr. Jennifer Martinez',
      fileType: 'PDF',
      fileSize: '1.8 MB',
      status: 'high',
      isNew: false,
    },
    {
      id: '5',
      title: 'Previous Medical History',
      type: 'uploaded',
      source: 'user_uploaded',
      date: '2024-10-05',
      doctor: 'Self Uploaded',
      fileType: 'PDF',
      fileSize: '3.2 MB',
      status: 'archived',
      isNew: false,
    },
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
            <TouchableOpacity style={styles.uploadButton}>
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

        {/* Floating Upload Button */}
        <TouchableOpacity style={styles.floatingButton} activeOpacity={0.8}>
          <LinearGradient
            colors={[Colors.primary, '#1e40af']}
            style={styles.floatingButtonGradient}
          >
            <Upload size={24} color="#ffffff" strokeWidth={2} />
          </LinearGradient>
        </TouchableOpacity>
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

  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomSpacing: {
    height: 100,
  },
});
