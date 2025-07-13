import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const createProfileStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 16,
    },
    title: {
      fontSize: 32,
      fontFamily: 'Satoshi-Variable',
      fontWeight: 'bold',
      color: colors.text,
    },
    profileSection: {
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 16,
    },
    profileName: {
      fontSize: 22,
      fontFamily: 'Satoshi-Variable',
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: colors.textSecondary,
    },
    switchedAccountIndicator: {
      marginTop: 12,
      padding: 12,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.2)',
      alignItems: 'center',
    },

    switchedAccountText: {
      fontSize: 12,
      color: Colors.primary,
      fontFamily: 'Satoshi-Variable',
      marginBottom: 8,
    },

    switchBackButton: {
      backgroundColor: Colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 6,
    },

    switchBackButtonText: {
      fontSize: 12,
      color: 'white',
      fontFamily: 'Satoshi-Variable',
    },
    menuSection: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: 'bold',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
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
  });
