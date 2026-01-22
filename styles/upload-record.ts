import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

const { width: screenWidth } = Dimensions.get('window');

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
      paddingBottom: 100,
    },

    // Modern Header Styles
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 16 : 20,
      paddingBottom: 20,
      marginBottom: 8,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    headerContent: {
      flex: 1,
      marginLeft: 16,
    },

    headerTitle: {
      fontSize: 28,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 4,
    },

    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      letterSpacing: 0.2,
    },

    content: {
      paddingHorizontal: 20,
    },

    // Upload Options Section
    uploadOptionsContainer: {
      marginBottom: 32,
    },

    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.text,
      marginBottom: 20,
      letterSpacing: -0.3,
    },

    optionsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },

    uploadOption: {
      flex: 1,
      minWidth: (screenWidth - 60) / 3,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 5,
    },

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

    uploadOptionText: {
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 4,
      textAlign: 'center',
    },

    uploadOptionSubtext: {
      fontSize: 11,
      fontFamily: 'Satoshi-Variable',
      color: 'rgba(255, 255, 255, 0.85)',
      textAlign: 'center',
    },

    // Preview Section
    previewContainer: {
      marginBottom: 32,
    },

    previewCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },

    filePreview: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 24,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    fileIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: isDarkMode 
        ? 'rgba(0, 148, 133, 0.2)' 
        : 'rgba(0, 148, 133, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },

    fileInfo: {
      flex: 1,
    },

    previewTitle: {
      fontSize: 18,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },

    previewText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      marginBottom: 4,
      lineHeight: 20,
    },

    fileSizeText: {
      fontSize: 12,
      color: colors.textTertiary,
      fontFamily: 'Satoshi-Variable',
      marginTop: 4,
    },

    imagePreview: {
      marginBottom: 24,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    previewImage: {
      width: '100%',
      height: 240,
      borderRadius: 16,
      marginBottom: 16,
      backgroundColor: colors.surface,
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
      shadowColor: Colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },

    openPdfText: {
      color: '#fff',
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
    },

    // Title Input Section
    titleSection: {
      marginBottom: 24,
    },

    titleLabel: {
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },

    titleInput: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 16,
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      backgroundColor: colors.surface,
    },

    // Tag Section
    tagSection: {
      marginBottom: 24,
    },

    tagHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },

    tagLabel: {
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },

    tagDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      lineHeight: 18,
    },

    addCustomTagButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: isDarkMode 
        ? 'rgba(0, 148, 133, 0.15)' 
        : 'rgba(0, 148, 133, 0.1)',
      borderWidth: 1,
      borderColor: Colors.primary,
      gap: 6,
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
      gap: 10,
    },

    tagOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      gap: 8,
    },

    tagOptionSelected: {
      borderColor: Colors.primary,
      backgroundColor: isDarkMode 
        ? 'rgba(0, 148, 133, 0.15)' 
        : 'rgba(0, 148, 133, 0.08)',
    },

    tagOptionText: {
      fontSize: 13,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      color: colors.text,
    },

    removeCustomTagButton: {
      marginLeft: 4,
      padding: 2,
    },

    // Selected Tags Display
    selectedTagsSection: {
      marginBottom: 24,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    selectedTagsLabel: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },

    selectedTagsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    selectedTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
    },

    selectedTagText: {
      fontSize: 12,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
    },

    // Action Buttons
    uploadConfirmButton: {
      marginBottom: 12,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#10b981',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },

    confirmButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      borderRadius: 16,
      gap: 10,
    },

    uploadConfirmText: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: '#ffffff',
    },

    cancelButton: {
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
    },

    cancelButtonText: {
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.textSecondary,
    },

    // Loading State
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },

    loadingText: {
      marginTop: 16,
      fontSize: 15,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    // Tips Section
    tipsContainer: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
    },

    tipsTitle: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.text,
      marginBottom: 14,
    },

    tipsList: {
      gap: 10,
    },

    tipItem: {
      fontSize: 14,
      color: colors.textSecondary,
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
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },

    customTagModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },

    modalTitle: {
      fontSize: 22,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
    },

    modalDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      lineHeight: 22,
      marginBottom: 24,
    },

    customTagInputContainer: {
      marginBottom: 24,
    },

    customTagInput: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 16,
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
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
    },

    cancelCustomTagText: {
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.textSecondary,
    },

    addCustomTagConfirmButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: Colors.primary,
    },

    addCustomTagConfirmButtonDisabled: {
      backgroundColor: colors.textSecondary,
      opacity: 0.6,
    },

    addCustomTagConfirmText: {
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: '#ffffff',
    },
  });
