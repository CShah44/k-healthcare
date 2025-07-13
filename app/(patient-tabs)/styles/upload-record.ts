import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const createUploadRecordStyles = (colors: any) =>
  StyleSheet.create({
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
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      letterSpacing: -0.5,
    },

    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      marginTop: 2,
    },

    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },

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

    uploadForm: {
      paddingHorizontal: 20,
    },

    formSection: {
      marginBottom: 24,
    },

    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 16,
      letterSpacing: -0.3,
    },

    inputGroup: {
      marginBottom: 16,
    },

    inputLabel: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 8,
    },

    requiredLabel: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 8,
    },

    requiredAsterisk: {
      color: '#ef4444',
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
    },

    textArea: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      backgroundColor: colors.surface,
      height: 100,
      textAlignVertical: 'top',
    },

    pickerContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },

    picker: {
      color: colors.text,
    },

    fileUploadSection: {
      marginBottom: 24,
    },

    uploadArea: {
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginBottom: 16,
    },

    uploadAreaActive: {
      borderColor: '#009485',
      backgroundColor: 'rgba(0, 148, 133, 0.05)',
    },

    uploadIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(0, 148, 133, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },

    uploadTitle: {
      fontSize: 18,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 8,
    },

    uploadSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 16,
    },

    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#009485',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },

    uploadButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
    },

    fileInfo: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },

    fileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },

    fileName: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      flex: 1,
    },

    fileSize: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    fileProgress: {
      marginTop: 8,
    },

    progressBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },

    progressFill: {
      height: '100%',
      backgroundColor: '#009485',
    },

    progressText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      marginTop: 4,
    },

    removeFileButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    tagsSection: {
      marginBottom: 24,
    },

    tagsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },

    addTagButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    addTagText: {
      fontSize: 14,
      color: '#009485',
      fontFamily: 'Satoshi-Variable',
    },

    selectedTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
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
    },

    removeTagButton: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    privacySection: {
      marginBottom: 24,
    },

    privacyOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },

    privacyOptionSelected: {
      borderColor: '#009485',
      backgroundColor: 'rgba(0, 148, 133, 0.05)',
    },

    privacyIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    privacyContent: {
      flex: 1,
    },

    privacyTitle: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 2,
    },

    privacyDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    privacyRadio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    privacyRadioSelected: {
      borderColor: '#009485',
    },

    privacyRadioDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#009485',
    },

    formActions: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },

    cancelButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },

    cancelButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    uploadSubmitButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: '#009485',
    },

    uploadSubmitButtonDisabled: {
      backgroundColor: colors.textSecondary,
    },

    uploadSubmitText: {
      fontSize: 16,
      color: '#ffffff',
      fontFamily: 'Satoshi-Variable',
    },

    loadingContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    errorContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },

    errorText: {
      fontSize: 14,
      color: '#ef4444',
      fontFamily: 'Satoshi-Variable',
      textAlign: 'center',
    },

    successContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },

    successText: {
      fontSize: 14,
      color: '#22c55e',
      fontFamily: 'Satoshi-Variable',
      textAlign: 'center',
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
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
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

    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },

    cancelModalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },

    cancelModalText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    addCustomTagButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: '#009485',
    },

    addCustomTagButtonDisabled: {
      backgroundColor: colors.textSecondary,
    },

    addCustomTagText: {
      fontSize: 14,
      color: '#ffffff',
      fontFamily: 'Satoshi-Variable',
    },

    bottomSpacing: {
      height: 100,
    },

    // Additional styles needed by the component
    headerContent: {
      flex: 1,
      marginLeft: 12,
    },

    headerTitle: {
      fontSize: 24,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 2,
    },

    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    scrollContainer: {
      flex: 1,
    },

    content: {
      paddingHorizontal: 20,
    },

    uploadOptionsContainer: {
      marginBottom: 32,
    },

    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 16,
    },

    uploadOption: {
      flex: 1,
      minWidth: (screenWidth - 60) / 3,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },

    pdfOption: {
      // Specific styling for PDF option
    },

    cameraOption: {
      // Specific styling for camera option
    },

    galleryOption: {
      // Specific styling for gallery option
    },

    uploadOptionGradient: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120,
    },

    iconContainer: {
      marginBottom: 8,
    },

    uploadOptionText: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: '#ffffff',
      marginBottom: 4,
    },

    uploadOptionSubtext: {
      fontSize: 12,
      fontFamily: 'Satoshi-Variable',
      color: 'rgba(255, 255, 255, 0.8)',
    },

    previewContainer: {
      marginBottom: 32,
    },

    previewCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },

    filePreview: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },

    fileIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: 'rgba(0, 148, 133, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    previewTitle: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 4,
    },

    previewText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      marginBottom: 2,
    },

    fileSizeText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    imagePreview: {
      marginBottom: 20,
    },

    previewImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 12,
    },

    imageInfo: {
      alignItems: 'center',
    },

    titleSection: {
      marginBottom: 20,
    },

    titleLabel: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 8,
    },

    titleInput: {
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

    tagSection: {
      marginBottom: 20,
    },

    tagHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },

    tagLabel: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 4,
    },

    tagDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
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
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
    },

    removeCustomTagButton: {
      marginLeft: 4,
    },

    selectedTagsSection: {
      marginBottom: 20,
    },

    selectedTagsLabel: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 8,
    },

    selectedTagsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    uploadConfirmButton: {
      marginBottom: 12,
    },

    confirmButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
    },

    uploadConfirmText: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: '#ffffff',
    },

    tipsContainer: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },

    tipsTitle: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 12,
    },

    tipsList: {
      gap: 8,
    },

    tipItem: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      lineHeight: 20,
    },

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
      backgroundColor: '#009485',
    },

    addCustomTagConfirmButtonDisabled: {
      backgroundColor: colors.textSecondary,
    },

    addCustomTagConfirmText: {
      fontSize: 14,
      color: '#ffffff',
      fontFamily: 'Satoshi-Variable',
    },
  });

// Keep the old export for backward compatibility
export const uploadRecordStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ... other static styles without colors
});
