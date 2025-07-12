import { StyleSheet } from 'react-native';

export const createMemberRecordsStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  backgroundGradient: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 100,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 24,
  },

  headerLeft: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },

  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },

  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  uploadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#009485',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },

  selectedTagsContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },

  selectedTagsList: {
    flexDirection: 'row',
    gap: 8,
  },

  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },

  selectedTagText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },

  filtersContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },

  filtersContent: {
    gap: 8,
  },

  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },

  filterTabActive: {
    backgroundColor: '#009485',
    borderColor: '#009485',
  },

  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
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
    color: colors.text,
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
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  recordCardContent: {
    padding: 16,
  },

  recordMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },

  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  recordSource: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textSecondary,
  },

  recordDate: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  recordTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },

  recordTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },

  recordTagText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },

  moreTagsText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  recordDetails: {
    marginTop: 8,
  },

  fileInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  labBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },

  labBadgeText: {
    fontSize: 10,
    color: '#22c55e',
    fontFamily: 'Inter-SemiBold',
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
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
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

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  uploadEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#009485',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },

  uploadEmptyText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    margin: 20,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },

  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },

  tagManagement: {
    marginBottom: 20,
  },

  tagManagementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 12,
  },

  tagManagementList: {
    flexDirection: 'row',
    gap: 8,
  },

  tagManagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    backgroundColor: colors.surface,
  },

  tagManagementText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },

  openPdfButton: {
    backgroundColor: '#009485',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },

  openPdfText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  unsupportedText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 16,
  },

  bottomSpacing: {
    height: 100,
  },

  // Additional styles needed by the component
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },

  permissionText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#ffc107',
  },

  ownRecordsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 148, 133, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },

  ownRecordsText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#009485',
  },

  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginTop: 16,
  },

  editModalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    margin: 20,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },

  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  editForm: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 8,
  },

  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },

  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },

  tagOptionSelected: {
    borderColor: colors.primary,
  },

  tagOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },

  editModalActions: {
    flexDirection: 'row',
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },

  cancelButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-SemiBold',
  },

  updateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#009485',
  },

  updateButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },

  updateButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
});

// Keep the old export for backward compatibility
export const memberRecordsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ... other static styles without colors
}); 