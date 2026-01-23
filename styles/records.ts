import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

export const createRecordsStyles = (colors: any, isDarkMode?: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.background : '#FAF8F3', // Match Profile soft beige background
    },

    backgroundGradient: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.background : '#FAF8F3', // Match Profile background
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
      flexDirection: 'row',
      alignItems: 'center',
    },

    headerTitle: {
      fontSize: Platform.OS === 'web' ? 32 : 18,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.8,
      lineHeight: Platform.OS === 'web' ? 38 : 20,
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
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB', // Match Profile card background
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 0,
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
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
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB', // Match Profile card background
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      borderWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
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
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB', // Match Profile card background
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 24,
      borderWidth: 0,
      gap: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
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
      paddingBottom: 40,
    },

    sectionHeader: {
      fontSize: 13,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 20,
      marginBottom: 10,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      opacity: 0.8,
    },

    recordCard: {
      backgroundColor: isDarkMode ? colors.card : '#F9FAFB', // Match Profile card background
      borderRadius: 16,
      marginBottom: 0, // Margin handled by container gap or group
      borderWidth: 1, // Cleaner look
      borderColor: isDarkMode ? colors.border : 'rgba(0,0,0,0.03)',
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.01,
      shadowRadius: 2,
      elevation: 0,
    },

    recordCardContent: {
      padding: 14, // Compact padding
    },

    newBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors.primary,
      zIndex: 1,
    },

    recordMain: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },

    recordLeft: {
      flexDirection: 'row',
      flex: 1,
      marginRight: 12,
    },

    recordIcon: {
      width: 38, // Slightly smaller
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    recordInfo: {
      flex: 1,
      minWidth: 0, // Allow text to wrap properly
    },

    recordTitle: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: isDarkMode ? colors.text : '#1F2937', // Match Profile text color
      marginBottom: 8,
      lineHeight: 22,
      letterSpacing: -0.2,
    },

    recordMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      flexWrap: 'wrap',
    },

    recordSource: {
      fontSize: 13,
      color: isDarkMode ? colors.textSecondary : '#6B7280', // Lighter secondary text
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      letterSpacing: 0,
    },

    metaDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: isDarkMode ? colors.textTertiary : '#D1D5DB', // Softer dot
      marginHorizontal: 8,
    },

    recordDate: {
      fontSize: 13,
      color: isDarkMode ? colors.textSecondary : '#6B7280', // Lighter secondary text
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      letterSpacing: 0,
    },

    recordTags: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },

    recordTagsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
    },

    recordTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 8,
      gap: 4,
      borderWidth: 1,
      backgroundColor: isDarkMode
        ? colors.surfaceSecondary
        : 'rgba(255, 255, 255, 0.6)',
    },

    recordTagText: {
      fontSize: 10,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      letterSpacing: -0.1,
    },

    moreTagsText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
    },

    recordDetailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 2,
    },

    fileInfo: {
      fontSize: 12,
      color: isDarkMode ? colors.textTertiary : '#9CA3AF', // Even lighter tertiary text
      fontFamily: 'Satoshi-Variable',
      fontWeight: '400',
      letterSpacing: 0,
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

    categoryBadge: {
      backgroundColor: isDarkMode ? colors.surfaceSecondary : '#F3F4F6', // Softer, more subtle
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },

    categoryBadgeText: {
      fontSize: 11,
      color: isDarkMode ? colors.textSecondary : '#9CA3AF', // Lighter, more subtle
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      letterSpacing: 0.1,
    },

    recordActions: {
      flexDirection: 'column',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },

    actionButton: {
      width: 32, // Smaller actions
      height: 32,
      borderRadius: 10,
      backgroundColor: 'transparent', // Cleaner
      alignItems: 'center',
      justifyContent: 'center',
    },

    recordFooter: {
      paddingTop: 12,
      borderTopWidth: 0,
      marginTop: 12,
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
      backgroundColor: isDarkMode ? colors.card : '#F9FAFB', // Match Profile card background
      borderRadius: 16,
      marginHorizontal: 20,
      marginTop: 20,
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
      borderWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center', // Center properly
      alignItems: 'center',
      padding: 20,
    },

    tagModalContent: {
      backgroundColor: colors.card,
      borderRadius: 24, // Rounded all corners for center modal / or top if bottom sheet
      // Make tag modal a bottom sheet for mobile feel
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      maxHeight: '85%',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
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

    tagModalHeaderTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },

    modalTitle: {
      fontSize: 22,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.4,
    },

    selectedTagsCountBadge: {
      backgroundColor: Colors.primary,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },

    selectedTagsCountText: {
      fontSize: 12,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: '#ffffff',
    },

    tagModalHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    addCustomTagHeaderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: `${Colors.primary}10`,
    },

    addCustomTagHeaderText: {
      fontSize: 14,
      color: Colors.primary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
    },

    closeModalButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDarkMode ? colors.surfaceSecondary : '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },

    tagSearchContainer: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 8,
    },

    tagSearchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.surfaceSecondary : '#F9FAFB',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },

    tagSearchInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      fontWeight: '500',
    },

    clearSearchButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.textTertiary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },

    tagsList: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
    },

    tagSection: {
      marginBottom: 24,
    },

    tagSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    tagSectionTitle: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.2,
      marginBottom: 12,
    },

    tagChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 24,
      gap: 8,
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB',
      borderWidth: 1.5,
      borderColor: isDarkMode ? colors.border : '#E5E7EB',
      minHeight: 44,
    },

    tagChipText: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      color: colors.text,
    },

    tagCountBadge: {
      backgroundColor: isDarkMode ? colors.surfaceSecondary : '#E5E7EB',
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      minWidth: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },

    tagCountText: {
      fontSize: 11,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.textSecondary,
    },

    tagSelectedIndicator: {
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
    },

    removeCustomTagButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: isDarkMode ? colors.surfaceSecondary : '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
    },

    noTagsFound: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },

    noTagsFoundText: {
      fontSize: 18,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },

    noTagsFoundSubtext: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.textSecondary,
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
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingBottom: 32,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? colors.border : '#F3F4F6',
      backgroundColor: colors.card,
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
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: Colors.primary,
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },

    applyTagsButtonDisabled: {
      backgroundColor: colors.textTertiary,
      shadowOpacity: 0,
      elevation: 0,
    },

    applyTagsText: {
      fontSize: 15,
      color: '#ffffff',
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
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
    // Preview modal - Center it
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      maxHeight: '85%',
      width: '100%',
      maxWidth: 500, // Constrain width for cleaner look on web/tablets
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },

    previewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      width: '100%',
    },

    previewModalTitle: {
      fontSize: 22,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.4,
      flex: 1,
      marginRight: 16,
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
      borderRadius: 24,
      padding: 24,
      width: '100%',
      maxWidth: 500,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
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
    emptyStateIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },

    emptyStateTitle: {
      fontSize: 18,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },

    emptyStateText: {
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      maxWidth: 260,
    },

    recordDescription: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });
