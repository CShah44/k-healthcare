import { StyleSheet } from 'react-native';

export const createAppointmentsStyles = (colors: any) => StyleSheet.create({
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
    fontFamily: 'Inter-Bold',
    color: colors.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },

  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#009485',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },

  // Missing input style
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },

  filtersContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },

  filtersContent: {
    gap: 8,
  },

  // Missing filterTabs style
  filterTabs: {
    marginHorizontal: 20,
    marginBottom: 20,
  },

  // Missing filterTabsContent style
  filterTabsContent: {
    gap: 8,
  },

  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },

  filterTabActive: {
    backgroundColor: '#009485',
    borderColor: '#009485',
  },

  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
  },

  // Missing filterTabText style
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
  },

  filterTextActive: {
    color: '#ffffff',
  },

  filterCount: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },

  filterCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  filterCountText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },

  filterCountTextActive: {
    color: '#ffffff',
  },

  appointmentsList: {
    flex: 1,
  },

  appointmentsContent: {
    paddingHorizontal: 20,
  },

  // Missing appointmentsContainer style
  appointmentsContainer: {
    paddingHorizontal: 20,
  },

  appointmentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  appointmentCardContent: {
    padding: 16,
  },

  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  appointmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  appointmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  appointmentInfo: {
    flex: 1,
  },

  appointmentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },

  // Missing appointmentDoctor style
  appointmentDoctor: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  appointmentDate: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textSecondary,
  },

  appointmentTime: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  appointmentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  appointmentStatusText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },

  // Missing statusBadge style
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Missing statusText style
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },

  appointmentDetails: {
    marginTop: 8,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
    width: 80,
  },

  detailValue: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },

  // Missing detailText style
  detailText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },

  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },

  // Missing appointmentFooter style
  appointmentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // Missing typeBadge style
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Missing typeText style
  typeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  bookAppointmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#009485',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },

  bookAppointmentText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },

  // Missing bookButton style
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#009485',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },

  // Missing bookButtonText style
  bookButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },

  form: {
    marginBottom: 20,
  },

  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Regular',
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

  modalActions: {
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
    fontFamily: 'Inter-SemiBold',
  },

  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#009485',
  },

  saveButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },

  saveButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },

  bottomSpacing: {
    height: 100,
  },
});

// Keep the old export for backward compatibility
export const appointmentsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ... other static styles without colors
}); 