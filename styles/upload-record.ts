import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

export const createUploadRecordStyles = (colors: any, isDarkMode?: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.background : '#FAF8F3',
    },

    backgroundGradient: {
      flex: 1,
    },

    scrollContainer: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 120,
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
      marginBottom: 8,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDarkMode ? colors.surface : '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },

    headerContent: {
      flex: 1,
      marginLeft: 16,
    },

    headerTitle: {
      fontSize: 26,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: isDarkMode ? colors.text : '#1F2937',
      letterSpacing: -0.5,
      marginBottom: 2,
    },

    headerSubtitle: {
      fontSize: 14,
      color: isDarkMode ? colors.textSecondary : '#6B7280',
      fontFamily: 'Satoshi-Variable',
      letterSpacing: 0.1,
    },

    content: {
      paddingHorizontal: 20,
    },

    // Upload Options Section
    uploadOptionsContainer: {
      marginBottom: 24,
    },

    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: isDarkMode ? colors.text : '#1F2937',
      marginBottom: 16,
      letterSpacing: -0.3,
    },

    optionsGrid: {
      gap: 12,
    },

    uploadOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },

    uploadOptionIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },

    uploadOptionContent: {
      flex: 1,
    },

    uploadOptionText: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: isDarkMode ? colors.text : '#1F2937',
      marginBottom: 2,
    },

    uploadOptionSubtext: {
      fontSize: 13,
      fontFamily: 'Satoshi-Variable',
      color: isDarkMode ? colors.textSecondary : '#6B7280',
    },

    uploadOptionArrow: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDarkMode ? colors.surfaceSecondary : '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Preview Section
    previewContainer: {
      marginBottom: 24,
    },

    previewCard: {
      backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },

    filePreview: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? colors.border : '#F3F4F6',
    },

    fileIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: '#DBEAFE',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },

    fileInfo: {
      flex: 1,
    },

    previewTitle: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: isDarkMode ? colors.text : '#1F2937',
      marginBottom: 4,
    },

    previewText: {
      fontSize: 14,
      color: isDarkMode ? colors.textSecondary : '#6B7280',
      fontFamily: 'Satoshi-Variable',
      marginBottom: 2,
      lineHeight: 20,
    },

    fileSizeText: {
      fontSize: 12,
      color: isDarkMode ? colors.textTertiary : '#9CA3AF',
      fontFamily: 'Satoshi-Variable',
      marginTop: 2,
    },

    imagePreview: {
      marginBottom: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? colors.border : '#F3F4F6',
    },

    previewImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 12,
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB',
    },

    imageInfo: {
      alignItems: 'center',
    },

    openPdfButton: {
      backgroundColor: Colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 12,
    },

    openPdfText: {
      color: '#fff',
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
    },

    // Title Input Section
    titleSection: {
      marginBottom: 20,
    },

    titleLabel: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: isDarkMode ? colors.text : '#374151',
      marginBottom: 8,
    },

    titleInput: {
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: isDarkMode ? colors.text : '#1F2937',
    },

    // Tag Section
    tagSection: {
      marginBottom: 20,
    },

    tagHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    tagLabel: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: isDarkMode ? colors.text : '#374151',
    },

    tagDescription: {
      fontSize: 12,
      color: isDarkMode ? colors.textSecondary : '#6B7280',
      fontFamily: 'Satoshi-Variable',
      marginTop: 2,
    },

    addCustomTagButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: `${Colors.primary}15`,
      gap: 4,
    },

    addCustomTagText: {
      fontSize: 13,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: Colors.primary,
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
      backgroundColor: isDarkMode ? colors.surface : '#F3F4F6',
      gap: 6,
    },

    tagOptionSelected: {
      backgroundColor: `${Colors.primary}15`,
    },

    tagOptionText: {
      fontSize: 13,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      color: isDarkMode ? colors.text : '#374151',
    },

    removeCustomTagButton: {
      marginLeft: 2,
      padding: 2,
    },

    // Selected Tags Display
    selectedTagsSection: {
      marginBottom: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? colors.border : '#F3F4F6',
    },

    selectedTagsLabel: {
      fontSize: 13,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: isDarkMode ? colors.textSecondary : '#6B7280',
      marginBottom: 10,
    },

    selectedTagsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
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
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
    },

    // Action Buttons
    uploadConfirmButton: {
      marginBottom: 12,
      borderRadius: 14,
      overflow: 'hidden',
    },

    confirmButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 14,
      backgroundColor: Colors.primary,
      gap: 10,
    },

    uploadConfirmText: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: '#ffffff',
    },

    cancelButton: {
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.surface : '#F3F4F6',
    },

    cancelButtonText: {
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: isDarkMode ? colors.textSecondary : '#6B7280',
    },

    // Loading State
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
    },

    loadingText: {
      marginTop: 16,
      fontSize: 15,
      color: isDarkMode ? colors.textSecondary : '#6B7280',
      fontFamily: 'Satoshi-Variable',
    },

    // Tips Section
    tipsContainer: {
      backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginTop: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },

    tipsTitle: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: isDarkMode ? colors.text : '#1F2937',
      marginBottom: 14,
    },

    tipsList: {
      gap: 8,
    },

    tipItem: {
      fontSize: 14,
      color: isDarkMode ? colors.textSecondary : '#6B7280',
      fontFamily: 'Satoshi-Variable',
      lineHeight: 22,
    },

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },

    customTagModalContent: {
      backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },

    customTagModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },

    modalTitle: {
      fontSize: 20,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: isDarkMode ? colors.text : '#1F2937',
      letterSpacing: -0.3,
    },

    modalDescription: {
      fontSize: 14,
      color: isDarkMode ? colors.textSecondary : '#6B7280',
      fontFamily: 'Satoshi-Variable',
      lineHeight: 22,
      marginBottom: 20,
    },

    customTagInputContainer: {
      marginBottom: 20,
    },

    customTagInput: {
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: isDarkMode ? colors.text : '#1F2937',
    },

    customTagModalActions: {
      flexDirection: 'row',
      gap: 12,
    },

    cancelCustomTagButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.surface : '#F3F4F6',
    },

    cancelCustomTagText: {
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: isDarkMode ? colors.textSecondary : '#6B7280',
    },

    addCustomTagConfirmButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: Colors.primary,
    },

    addCustomTagConfirmButtonDisabled: {
      backgroundColor: isDarkMode ? colors.textSecondary : '#9CA3AF',
      opacity: 0.6,
    },

    addCustomTagConfirmText: {
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: '#ffffff',
    },

    // Legacy styles for compatibility (unused but kept for safety)
    uploadOptionGradient: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 140,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
  });
