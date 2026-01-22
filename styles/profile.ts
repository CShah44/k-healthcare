import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const createProfileStyles = (colors: any, isDarkMode?: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.background : '#FAF8F3', // Soft beige/cream background for light mode
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100, // Increased for bottom tab bar spacing
      paddingTop: 8,
    },
    // Profile Header Section
    profileHeader: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 24,
      alignItems: 'flex-start',
    },
    profilePhotoContainer: {
      position: 'relative',
      marginRight: 16,
    },
    profilePhoto: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    profilePhotoPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: '#E5E7EB',
      alignItems: 'center',
      justifyContent: 'center',
    },
    editPhotoButton: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#F3F4F6',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 24,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: isDarkMode ? colors.text : '#1F2937',
      marginBottom: 12,
      lineHeight: 30,
    },
    demographicsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    demographicItem: {
      marginRight: 12,
    },
    demographicLabel: {
      fontSize: 10,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      color: '#9CA3AF',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    demographicValue: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: isDarkMode ? colors.text : '#1F2937',
    },
    demographicDivider: {
      width: 1,
      height: 16,
      backgroundColor: '#E5E7EB',
      marginRight: 12,
    },
    patientIdContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#A7F3D0', // Muted green background (lighter for better contrast)
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginTop: 4,
      alignSelf: 'flex-start',
    },
    patientIdLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    patientIdText: {
      fontSize: 13,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: '#047857', // Darker green for better readability
      letterSpacing: 0.5,
    },
    switchedAccountIndicator: {
      marginHorizontal: 20,
      marginTop: 12,
      marginBottom: 12,
      padding: 16,
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB', // Match Profile card background
      borderRadius: 16,
      borderWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    switchedAccountText: {
      fontSize: 14,
      color: Colors.primary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      flex: 1,
    },
    switchBackButton: {
      backgroundColor: Colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    switchBackButtonText: {
      fontSize: 13,
      color: 'white',
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
    },
    // Clinical Profile Section
    clinicalProfileSection: {
      paddingHorizontal: 20,
      marginTop: 8,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: isDarkMode ? colors.text : '#1F2937',
      marginBottom: 12,
      letterSpacing: 0.3,
    },
    clinicalProfileCard: {
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB',
      borderRadius: 16,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    clinicalProfileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    clinicalProfileIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    clinicalProfileItemText: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      color: isDarkMode ? colors.text : '#1F2937',
    },
    countBadge: {
      backgroundColor: isDarkMode ? colors.text : '#1F2937',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 8,
      minWidth: 24,
      alignItems: 'center',
    },
    countBadgeText: {
      fontSize: 12,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: '#FFFFFF',
    },
    chevron: {
      marginLeft: 4,
    },
    // Settings Section
    settingsSection: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    settingsCard: {
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB',
      borderRadius: 16,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    settingsIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    settingsItemText: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      color: isDarkMode ? colors.text : '#1F2937',
    },
    menuSection: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginBottom: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    menuItemTitle: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 24,
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: `${Colors.medical.red}1A`,
      gap: 8,
    },
    signOutText: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: 'bold',
      color: Colors.medical.red,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
    },
    modalTitle: {
      fontSize: 24,
      fontFamily: 'Satoshi-Variable',
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    modalContent: {
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    accountItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    accountItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    accountName: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
    },
    linkedAccountsCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: Colors.primary,
    },

    linkedAccountsDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      marginBottom: 16,
      lineHeight: 20,
    },

    linkedAccountItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.1)',
    },

    linkedAccountInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    linkedAccountAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    linkedAccountInitials: {
      fontSize: 14,
      color: 'white',
      fontFamily: 'Satoshi-Variable',
    },

    linkedAccountDetails: {
      flex: 1,
    },

    linkedAccountName: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 2,
    },

    linkedAccountType: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    parentAccountAvatar: {
      backgroundColor: Colors.medical.orange,
    },

    parentAccountType: {
      color: Colors.medical.orange,
      fontFamily: 'Satoshi-Variable',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      color: colors.text,
    },
  });
