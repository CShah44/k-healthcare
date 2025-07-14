import { StyleSheet } from 'react-native';

export const createHomeStyles = (colors: any) =>
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

    decorativeCircle1: {
      position: 'absolute',
      top: -50,
      right: -50,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
    },

    decorativeCircle2: {
      position: 'absolute',
      bottom: 200,
      left: -40,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(34, 197, 94, 0.06)',
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      marginBottom: 32,
    },

    headerLeft: {
      flex: 1,
    },

    greeting: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    name: {
      fontSize: 28,
      color: colors.text,
      fontFamily: 'Satoshi-Variable',
      marginTop: 4,
      letterSpacing: -0.5,
    },

    userName: {
      fontSize: 28,
      color: colors.text,
      fontFamily: 'Satoshi-Variable',
      marginTop: 4,
      letterSpacing: -0.5,
    },

    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    notificationButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
    },

    notificationBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#009485',
    },

    profileButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'rgba(59, 130, 246, 0.2)',
    },

    profileImage: {
      width: '100%',
      height: '100%',
    },

    // Stats Container
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 12,
      marginBottom: 24,
    },

    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },

    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },

    statContent: {
      flex: 1,
    },

    statNumber: {
      fontSize: 24,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 2,
    },

    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    // Actions Container
    actionsContainer: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },

    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },

    actionButton: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },

    actionText: {
      fontSize: 12,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginTop: 8,
      textAlign: 'center',
    },

    // Records Container
    recordsContainer: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },

    recordsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },

    recordsList: {
      gap: 8,
    },

    viewAllText: {
      fontSize: 14,
      color: '#009485',
      fontFamily: 'Satoshi-Variable',
    },

    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 12,
      marginBottom: 16,
    },

    actionCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },

    actionCardContent: {
      padding: 16,
      alignItems: 'center',
    },

    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },

    actionTitle: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 4,
    },

    actionSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      textAlign: 'center',
    },

    section: {
      paddingHorizontal: 20,
      marginBottom: 32,
      marginTop: 16,
    },

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },

    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      letterSpacing: -0.3,
    },

    sectionLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    sectionLinkText: {
      fontSize: 14,
      color: '#009485',
      fontFamily: 'Satoshi-Variable',
    },

    recordCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },

    recordContent: {
      fontFamily: 'Satoshi-Variable',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },

    newBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#009485',
    },

    recordLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    recordIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    recordInfo: {
      flex: 1,
    },

    recordTitle: {
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 2,
      lineHeight: 20,
    },

    recordDate: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    recordMeta: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
    },

    recordStatus: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },

    recordStatusText: {
      fontSize: 11,
      fontFamily: 'Satoshi-Variable',
    },

    insertButton: {
      backgroundColor: '#009485',
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginHorizontal: 20,
      marginBottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#009485',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },

    insertButtonText: {
      color: '#fff',
      fontSize: 16,
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

    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },

    emptyTitle: {
      fontSize: 18,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },

    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      textAlign: 'center',
      paddingHorizontal: 40,
    },

    emptyRecordsContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },

    emptyRecordsText: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 8,
    },

    emptyRecordsSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      textAlign: 'center',
    },

    bottomSpacing: {
      height: 100,
    },
  });

// Keep the old export for backward compatibility
export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ... other static styles without colors
});
