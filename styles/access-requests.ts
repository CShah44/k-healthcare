import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const createAccessRequestsStyles = (colors: any, isDarkMode?: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.background : '#FAF8F3', // Match Profile soft beige background
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      letterSpacing: -0.4,
    },
    content: {
      flex: 1,
    },
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    tab: {
      marginRight: 20,
      paddingBottom: 8,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: Colors.primary,
    },
    tabText: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: '#666',
      fontWeight: '500',
    },
    activeTabText: {
      color: Colors.primary,
      fontWeight: '700',
    },
    contentContainer: {
      padding: 20,
    },
    infoBox: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB', // Match Profile card background
      padding: 16,
      borderRadius: 16,
      marginBottom: 24,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
    },
    infoIcon: {
      marginTop: 2,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      lineHeight: 20,
    },
    requestCard: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      backgroundColor: isDarkMode ? colors.card : '#F9FAFB', // Match Profile card background
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
      borderWidth: 0,
    },
    cardHeader: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    doctorInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    doctorName: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      marginBottom: 4,
      letterSpacing: -0.2,
    },
    specialty: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      marginBottom: 8,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    timestamp: {
      fontSize: 12,
      fontFamily: 'Satoshi-Variable',
    },
    divider: {
      height: 1,
      width: '100%',
      marginBottom: 16,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    rejectButton: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    approveButton: {
      backgroundColor: Colors.primary,
    },
    rejectText: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: Colors.medical.red,
    },
    approveText: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: 'white',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      marginTop: 40,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB', // Match Profile card background
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      marginBottom: 8,
      letterSpacing: -0.2,
    },
    emptySubtitle: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: '#666',
      textAlign: 'center',
      lineHeight: 20,
      maxWidth: 240,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      borderRadius: 20,
      padding: 24,
      backgroundColor: isDarkMode ? colors.card : '#F9FAFB', // Match Profile card background
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
      letterSpacing: -0.4,
    },
    modalSubtitle: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    optionsContainer: {
      gap: 12,
      marginBottom: 24,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      gap: 12,
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    optionLabel: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalButtonText: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
    },
  });
