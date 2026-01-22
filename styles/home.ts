import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const createHomeStyles = (colors: any, isDarkMode?: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.background : '#FAF8F3', // Match Profile soft beige background
    },

    backgroundGradient: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.background : '#FAF8F3', // Match Profile background
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 120,
      paddingTop: 8,
    },

    // Subtle decorative background elements
    decorativeCircle1: {
      position: 'absolute',
      top: -80,
      right: -60,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'rgba(0, 148, 133, 0.04)',
    },

    decorativeCircle2: {
      position: 'absolute',
      bottom: 300,
      left: -80,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(139, 92, 246, 0.03)',
    },

    decorativeCircle3: {
      position: 'absolute',
      top: 350,
      right: -40,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(249, 168, 212, 0.05)',
    },

    // Background illustration styling
    backgroundIllustration: {
      position: 'absolute',
      width: 180,
      height: 180,
      opacity: 0.06,
    },

    illustrationTopRight: {
      top: 80,
      right: -20,
    },

    illustrationBottomLeft: {
      bottom: 200,
      left: -30,
    },

    // Bottom corner illustration - visible and decorative
    bottomIllustration: {
      position: 'absolute',
      bottom: 80,
      right: -10,
      width: 180,
      height: 180,
      opacity: 0.12,
    },

    // Header Section - Compact and calm
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 4,
      marginBottom: 20,
    },

    headerLeft: {
      flex: 1,
      paddingRight: 12,
    },

    greeting: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      letterSpacing: 0.2,
      marginBottom: 2,
    },

    name: {
      fontSize: 26,
      color: colors.text,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      letterSpacing: -0.5,
      lineHeight: 32,
    },

    idContainer: {
      marginTop: 8,
      backgroundColor: '#A7F3D0', // Match Profile patient ID container
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },

    idText: {
      fontSize: 11,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: '#047857', // Match Profile patient ID text color
      letterSpacing: 0.2,
    },

    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    notificationButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode ? colors.card : '#F9FAFB', // Match Profile card background
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
      borderWidth: 0,
    },

    notificationBadge: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#009485',
    },

    // Health Score Card - Premium featured section
    healthScoreContainer: {
      marginHorizontal: 24,
      marginBottom: 24,
    },

    healthScoreCard: {
      backgroundColor: '#FDF8F3',
      borderRadius: 28,
      padding: 24,
      shadowColor: '#D4A574',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 4,
      overflow: 'hidden',
    },

    healthScoreHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },

    healthScoreTitle: {
      fontSize: 13,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: 'rgba(0, 0, 0, 0.5)',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },

    healthScoreBadge: {
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },

    healthScoreBadgeText: {
      fontSize: 12,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: '#10B981',
    },

    healthScoreValue: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 8,
    },

    healthScoreNumber: {
      fontSize: 56,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -2,
    },

    healthScoreUnit: {
      fontSize: 18,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      color: colors.textSecondary,
      marginLeft: 4,
    },

    healthScoreSubtext: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.textSecondary,
    },

    // Stats Container - Compact refined cards
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 12,
      marginBottom: 20,
    },

    statCard: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.card : '#F9FAFB', // Match Profile card background
      borderRadius: 16,
      padding: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
      borderWidth: 0,
    },

    statCardAccent1: {
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB',
    },

    statCardAccent2: {
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB',
    },

    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },

    statIconAccent1: {
      backgroundColor: '#D1FAE5', // Pastel green like Profile
    },

    statIconAccent2: {
      backgroundColor: '#DBEAFE', // Pastel blue like Profile
    },

    statContent: {
      flex: 1,
    },

    statNumber: {
      fontSize: 22,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
      letterSpacing: -0.3,
    },

    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
      letterSpacing: 0.1,
    },
    
    skeletonContainer: {
      gap: 6,
    },
    
    skeletonNumber: {
      width: 40,
      height: 22,
      borderRadius: 6,
      backgroundColor: isDarkMode ? colors.surfaceSecondary : '#E5E7EB',
    },
    
    skeletonLabel: {
      width: 60,
      height: 12,
      borderRadius: 6,
      backgroundColor: isDarkMode ? colors.surfaceSecondary : '#E5E7EB',
    },

    // Quick Actions - Compact CTA buttons
    actionsContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },

    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.2,
      marginBottom: 4,
    },

    sectionSubtitle: {
      fontSize: 13,
      fontFamily: 'Satoshi-Variable',
      color: colors.textSecondary,
      marginBottom: 12,
    },

    actionButtons: {
      flexDirection: 'row',
      gap: 12,
    },

    actionButton: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.card : '#F9FAFB', // Match Profile card background
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
      borderWidth: 0,
    },

    actionButtonPrimary: {
      backgroundColor: '#009485',
    },

    actionButtonSecondary: {
      backgroundColor: isDarkMode ? colors.surface : '#F9FAFB', // Match Profile card background
    },

    actionIconWrapper: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },

    actionIconPrimary: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },

    actionIconSecondary: {
      backgroundColor: '#DBEAFE', // Pastel blue like Profile
    },

    actionText: {
      fontSize: 13,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      letterSpacing: 0.1,
    },

    actionTextPrimary: {
      color: '#FFFFFF',
    },

    // Records Container - Clean list design
    recordsContainer: {
      paddingHorizontal: 24,
      marginBottom: 32,
    },

    recordsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
    },

    recordsHeaderLeft: {
      flex: 1,
    },

    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 148, 133, 0.08)',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 4,
    },

    viewAllText: {
      fontSize: 13,
      color: '#009485',
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
    },

    recordsList: {
      gap: 12,
    },

    recordCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 10,
      elevation: 1,
      borderWidth: 0,
    },

    recordIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },

    recordInfo: {
      flex: 1,
    },

    recordTitle: {
      fontSize: 15,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      lineHeight: 20,
    },

    recordDate: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '400',
    },

    recordArrow: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.03)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Loading State - Minimal
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: 48,
      backgroundColor: colors.card,
      borderRadius: 20,
    },

    loadingText: {
      marginTop: 16,
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '500',
    },

    // Empty State - Friendly and inviting
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
      paddingHorizontal: 32,
      backgroundColor: colors.card,
      borderRadius: 24,
    },

    emptyIconWrapper: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: 'rgba(0, 148, 133, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },

    emptyTitle: {
      fontSize: 18,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },

    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Satoshi-Variable',
      textAlign: 'center',
      lineHeight: 22,
    },

    emptyButton: {
      marginTop: 24,
      backgroundColor: '#009485',
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 16,
    },

    emptyButtonText: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: '#FFFFFF',
    },

    // Wellness Tips Section - Compact
    tipsContainer: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },

    tipCard: {
      backgroundColor: isDarkMode ? colors.card : '#F9FAFB', // Match Profile card background
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },

    tipIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(249, 168, 37, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    tipContent: {
      flex: 1,
    },

    tipTitle: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },

    tipText: {
      fontSize: 12,
      fontFamily: 'Satoshi-Variable',
      color: colors.textSecondary,
      lineHeight: 18,
    },

    // Health Summary Card - Compact
    summaryContainer: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },

    summaryCard: {
      backgroundColor: isDarkMode ? colors.card : '#F9FAFB', // Match Profile card background
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
    },

    summaryHeader: {
      marginBottom: 12,
    },

    summaryTitle: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      fontWeight: '600',
      color: colors.text,
    },

    summaryContent: {
      gap: 10,
    },

    summaryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    summaryDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },

    summaryText: {
      fontSize: 13,
      fontFamily: 'Satoshi-Variable',
      color: colors.textSecondary,
      flex: 1,
    },

    // Legacy styles (keeping for compatibility)
    userName: {
      fontSize: 28,
      color: colors.text,
      fontFamily: 'Satoshi-Variable',
      marginTop: 4,
      letterSpacing: -0.5,
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
      borderWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
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
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },

    insertButtonText: {
      color: '#fff',
      fontSize: 16,
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
});
