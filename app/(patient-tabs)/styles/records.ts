import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const createRecordsStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      marginBottom: 20,
    },

    headerLeft: {
      flex: 1,
    },

    headerTitle: {
      fontSize: 32,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.8,
      lineHeight: 38,
    },

    headerSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      marginTop: 4,
      letterSpacing: -0.2,
    },

    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },

    headerButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },

    headerButtonActive: {
      backgroundColor: `${Colors.primary}15`,
      borderColor: Colors.primary,
      shadowColor: Colors.primary,
      shadowOpacity: 0.2,
    },

    filterBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: Colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },

    filterBadgeText: {
      fontSize: 11,
      color: '#ffffff',
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
    },

    uploadButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: Colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },

    searchContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },

    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    searchInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      color: colors.text,
      letterSpacing: -0.2,
    },

    selectedTagsContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },

    selectedTagsList: {
      flexDirection: 'row',
      gap: 10,
    },

    selectedTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },

    selectedTagText: {
      fontSize: 13,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      letterSpacing: -0.1,
    },

    filtersContainer: {
      marginBottom: 24,
    },

    filtersContent: {
      paddingHorizontal: 20,
      gap: 10,
    },

    filterTab: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },

    filterTabActive: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
      shadowColor: Colors.primary,
      shadowOpacity: 0.2,
    },

    filterText: {
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      color: colors.text,
      letterSpacing: -0.2,
    },

    filterTextActive: {
      color: '#ffffff',
    },

    filterCount: {
      backgroundColor: colors.border,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      minWidth: 24,
      alignItems: 'center',
    },

    filterCountActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },

    filterCountText: {
      fontSize: 12,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.textSecondary,
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
      borderRadius: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },

    recordCardContent: {
      padding: 20,
    },

    newBadge: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: Colors.primary,
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 3,
    },

    recordMain: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },

    recordLeft: {
      flexDirection: 'row',
      flex: 1,
    },

    recordIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },

    recordInfo: {
      flex: 1,
    },

    recordTitle: {
      fontSize: 17,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
      lineHeight: 22,
      letterSpacing: -0.3,
    },

    recordMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },

    recordSource: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      letterSpacing: -0.1,
    },

    metaDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.textTertiary,
      marginHorizontal: 10,
    },

    recordDate: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      letterSpacing: -0.1,
    },

    recordTags: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },

    recordTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      gap: 4,
    },

    recordTagText: {
      fontSize: 11,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      letterSpacing: -0.1,
    },

    moreTagsText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
    },

    recordDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    fileInfo: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      letterSpacing: -0.1,
    },

    labBadge: {
      backgroundColor: `${Colors.medical.green}15`,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: `${Colors.medical.green}30`,
    },

    labBadgeText: {
      fontSize: 11,
      color: Colors.medical.green,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    recordActions: {
      flexDirection: 'row',
      gap: 10,
    },

    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },

    recordFooter: {
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
      fontFamily: 'Satoshi-Variable',
    },

    emptyState: {
      alignItems: 'center',
      paddingVertical: 80,
      paddingHorizontal: 40,
    },

    emptyTitle: {
      fontSize: 22,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.text,
      marginTop: 20,
      marginBottom: 12,
      textAlign: 'center',
      letterSpacing: -0.4,
    },

    emptySubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
      letterSpacing: -0.2,
    },

    uploadEmptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${Colors.primary}15`,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 16,
      gap: 10,
      borderWidth: 1,
      borderColor: `${Colors.primary}30`,
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },

    uploadEmptyText: {
      fontSize: 15,
      color: Colors.primary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      letterSpacing: -0.2,
    },

    bottomSpacing: {
      height: 120,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    tagModalContent: {
      backgroundColor: colors.card,
      borderRadius: 24,
      margin: 20,
      maxHeight: '80%',
      width: '90%',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },

    tagModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    modalTitle: {
      fontSize: 20,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.4,
    },

    tagModalHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    addCustomTagHeaderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    addCustomTagHeaderText: {
      fontSize: 14,
      color: Colors.primary,
      fontFamily: 'Satoshi-Variable',
    },

    tagsList: {
      padding: 20,
    },

    loadingTagsContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },

    loadingTagsText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    tagOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: colors.surface,
    },

    tagOptionSelected: {
      backgroundColor: `${Colors.primary}15`,
      borderWidth: 1,
      borderColor: Colors.primary,
    },

    tagOptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },

    tagOptionText: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
    },

    customTagBadge: {
      backgroundColor: `${Colors.primary}15`,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },

    customTagBadgeText: {
      fontSize: 10,
      color: Colors.primary,
      fontFamily: 'Satoshi-Variable',
    },

    tagOptionRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    tagCheckmark: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    tagCheckmarkText: {
      color: '#ffffff',
      fontSize: 12,
      fontFamily: 'Satoshi-Variable',
    },

    removeTagButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    tagModalActions: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    clearTagsButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },

    clearTagsText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    applyTagsButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: Colors.primary,
    },

    applyTagsText: {
      fontSize: 14,
      color: '#ffffff',
      fontFamily: 'Satoshi-Variable',
    },

    // Custom tag modal
    customTagModalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      margin: 20,
      padding: 20,
      width: '90%',
    },

    customTagModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },

    modalDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      lineHeight: 20,
      marginBottom: 20,
    },

    customTagInputContainer: {
      marginBottom: 20,
    },

    customTagInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      backgroundColor: colors.surface,
    },

    customTagModalActions: {
      flexDirection: 'row',
      gap: 12,
    },

    cancelCustomTagButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },

    cancelCustomTagText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    addCustomTagConfirmButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: Colors.primary,
    },

    addCustomTagConfirmButtonDisabled: {
      backgroundColor: colors.textSecondary,
    },

    addCustomTagConfirmText: {
      fontSize: 14,
      color: '#ffffff',
      fontFamily: 'Satoshi-Variable',
    },

    // Preview modal
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      margin: 20,
      padding: 20,
      maxHeight: '80%',
      width: '90%',
    },

    previewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },

    modalSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      marginBottom: 20,
    },

    tagManagement: {
      marginBottom: 20,
    },

    tagManagementTitle: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
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
      fontFamily: 'Satoshi-Variable',
      color: colors.textSecondary,
    },

    openPdfButton: {
      backgroundColor: Colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 16,
    },

    openPdfText: {
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
    },

    unsupportedText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      textAlign: 'center',
      marginTop: 16,
    },

    // Edit modal
    editModalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      margin: 20,
      padding: 20,
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
      fontFamily: 'Satoshi-Variable',
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
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      backgroundColor: colors.surface,
      marginBottom: 16,
    },

    tagGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
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
      fontFamily: 'Satoshi-Variable',
    },

    updateButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: Colors.primary,
    },

    updateButtonDisabled: {
      backgroundColor: colors.textSecondary,
    },

    updateButtonText: {
      fontSize: 14,
      color: '#ffffff',
      fontFamily: 'Satoshi-Variable',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },

    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      letterSpacing: -0.2,
    },

    // Additional styles for member records page
    backButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },

    headerContent: {
      flex: 1,
      marginLeft: 16,
    },

    headerMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 4,
    },

    permissionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${Colors.medical.orange}15`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },

    permissionText: {
      fontSize: 11,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: Colors.medical.orange,
      letterSpacing: -0.1,
    },

    ownRecordsBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${Colors.primary}15`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },

    ownRecordsText: {
      fontSize: 11,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: Colors.primary,
      letterSpacing: -0.1,
    },

    viewOnlyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${Colors.medical.blue}15`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },

    viewOnlyText: {
      fontSize: 11,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: Colors.medical.blue,
      letterSpacing: -0.1,
    },

    tagsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },

    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
  });
