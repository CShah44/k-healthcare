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
  Search,
  X,
  Plus,
  Upload,
  FileText,
  TestTube2,
  Pill,
  FileImage,
  ChevronRight,
  Filter,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { RecordsService, MedicalRecord } from '@/services/recordsService';
import { createRecordsStyles } from './styles/records';

const { width } = Dimensions.get('window');

export default function RecordsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createRecordsStyles(colors);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddTagModal, setShowAddTagModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecords();
    }
  }, [user]);

  useEffect(() => {
    filterRecords();
  }, [records, searchQuery, selectedTags]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const userRecords = await RecordsService.getAllRecords(user!.uid);
      setRecords(userRecords);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = records;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((record) =>
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.lab?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((record) =>
        selectedTags.some((tag) => record.tags?.includes(tag))
      );
    }

    setFilteredRecords(filtered);
  };

  const getRecordIcon = (type: string, source?: string) => {
    switch (type) {
      case 'lab_result':
        return { icon: TestTube2, color: Colors.medical.green };
      case 'prescription':
        return { icon: Pill, color: Colors.medical.orange };
      case 'image':
        return { icon: FileImage, color: Colors.primary };
      case 'test_result':
        return { icon: TestTube2, color: Colors.medical.green };
      default:
        return { icon: FileText, color: colors.textSecondary };
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'normal':
        return Colors.medical.green;
      case 'abnormal':
        return Colors.medical.red;
      case 'pending':
        return Colors.medical.blue;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Unknown date';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const allTags = Array.from(
    new Set(records.flatMap((record) => record.tags || []))
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>Medical Records</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {filteredRecords.length} of {records.length} records
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Search size={18} color={showSearch ? Colors.primary : colors.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowAddTagModal(true)}
            >
              <Filter size={18} color={selectedTags.length > 0 ? Colors.primary : colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Search size={18} color={colors.textSecondary} strokeWidth={2} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search records..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
            contentContainerStyle={styles.tagsContent}
          >
            {selectedTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, { backgroundColor: Colors.primary }]}
                onPress={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
              >
                <Text style={[styles.tagText, { color: '#fff' }]}>{tag}</Text>
                <X size={12} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Records List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading records...
            </Text>
          </View>
        ) : filteredRecords.length > 0 ? (
          <View style={styles.recordsList}>
            {filteredRecords.map((record) => {
              const { icon: IconComponent, color } = getRecordIcon(record.type, record.source);
              const statusColor = getStatusColor(record.status);
              return (
                <TouchableOpacity
                  key={record.id}
                  style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/record-details/${record.id}`)}
                >
                  <View style={styles.recordHeader}>
                    <View style={[styles.recordIcon, { backgroundColor: `${color}15` }]}>
                      <IconComponent size={20} color={color} strokeWidth={2} />
                    </View>
                    <View style={styles.recordInfo}>
                      <Text style={[styles.recordTitle, { color: colors.text }]} numberOfLines={1}>
                        {record.title}
                      </Text>
                      <Text style={[styles.recordMeta, { color: colors.textSecondary }]}>
                        {record.doctor || record.lab || 'Self-uploaded'} • {formatDate(record.uploadedAt)}
                      </Text>
                    </View>
                    {record.status && (
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {record.status}
                        </Text>
                      </View>
                    )}
                  </View>

                  {record.tags && record.tags.length > 0 && (
                    <View style={styles.tagsRow}>
                      {record.tags.slice(0, 3).map((tag) => (
                        <View key={tag} style={[styles.recordTag, { backgroundColor: colors.surface }]}>
                          <Text style={[styles.recordTagText, { color: colors.textSecondary }]}>
                            {tag}
                          </Text>
                        </View>
                      ))}
                      {record.tags.length > 3 && (
                        <Text style={[styles.moreTagsText, { color: colors.textSecondary }]}>
                          +{record.tags.length - 3} more
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FileText size={64} color={colors.textSecondary} strokeWidth={1} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Records Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery || selectedTags.length > 0
                ? 'No records match your search criteria'
                : 'Upload your first medical record to get started'}
            </Text>
          </View>
        )}

        {/* Floating Action Buttons */}
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/(patient-tabs)/upload-record')}
          >
            <Upload size={16} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: Colors.primary }]}
            onPress={() => setShowAddTagModal(true)}
          >
            <Plus size={16} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Upload Modal */}
      {showUploadModal && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Upload Record</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <X size={24} color={colors.text} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={[styles.uploadOption, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  setShowUploadModal(false);
                  router.push('/(patient-tabs)/upload-record');
                }}
              >
                <Upload size={24} color={Colors.primary} strokeWidth={2} />
                <Text style={[styles.uploadOptionText, { color: colors.text }]}>Upload File</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.uploadOption, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  setShowUploadModal(false);
                  // Handle camera capture
                }}
              >
                <Plus size={24} color={Colors.primary} strokeWidth={2} />
                <Text style={[styles.uploadOptionText, { color: colors.text }]}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Add Tag Modal */}
      {showAddTagModal && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filter by Tags</Text>
              <TouchableOpacity onPress={() => setShowAddTagModal(false)}>
                <X size={24} color={colors.text} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Select tags to filter records:
              </Text>
              <View style={styles.tagsGrid}>
                {allTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.filterTag,
                      {
                        backgroundColor: selectedTags.includes(tag) ? Colors.primary : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.filterTagText,
                        { color: selectedTags.includes(tag) ? '#fff' : colors.textSecondary },
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setSelectedTags([])}
                >
                  <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: Colors.primary }]}
                  onPress={() => setShowAddTagModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
