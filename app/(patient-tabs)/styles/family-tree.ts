import { StyleSheet } from 'react-native';

export const createFamilyTreeStyles = (colors: any) => StyleSheet.create({
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

  searchButton: {
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

  familyTreeContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  treeLevel: {
    marginBottom: 24,
  },

  levelTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 12,
  },

  membersList: {
    gap: 12,
  },

  memberCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 2,
  },

  memberRelation: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  memberDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  detailValue: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'Inter-SemiBold',
  },

  memberTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },

  memberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },

  memberTagText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
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

  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#009485',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },

  addMemberText: {
    color: '#ffffff',
    fontSize: 14,
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

  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  errorText: {
    fontSize: 14,
    color: '#ef4444',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
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

  // Additional styles needed by the component
  invitationBadge: {
    position: 'relative',
    padding: 8,
  },

  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },

  noFamilyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  noFamilyIcon: {
    marginBottom: 16,
  },

  noFamilyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 8,
  },

  noFamilyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  createFamilyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#009485',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },

  createFamilyButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },

  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },

  addChildButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },

  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },

  inviteButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },

  memberInitials: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },

  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  youLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  relationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  relationText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },

  memberEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  viewRecordsButton: {
    padding: 8,
  },

  kickButton: {
    padding: 8,
  },

  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },

  closeButton: {
    padding: 4,
  },

  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#009485',
    marginTop: 16,
  },

  submitButtonText: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Inter-SemiBold',
  },

  ageNoticeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  ageNoticeTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },

  ageNoticeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },

  relationSelector: {
    marginBottom: 16,
  },

  relationOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.surface,
  },

  relationOptionSelected: {
    backgroundColor: '#009485',
  },

  relationOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },

  relationOptionTextSelected: {
    color: 'white',
  },

  invitationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  invitationInfo: {
    flex: 1,
  },

  invitationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },

  invitationDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  relationHighlight: {
    color: '#009485',
    fontFamily: 'Inter-SemiBold',
  },

  invitationActions: {
    flexDirection: 'row',
    gap: 8,
  },

  acceptButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },

  declineButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },

  childModalDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 20,
  },

  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },

  dropdownButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },

  placeholderText: {
    color: colors.textSecondary,
  },

  dropdownArrow: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  dropdownMenu: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginTop: 4,
    maxHeight: 120,
  },

  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  dropdownOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },
});

// Keep the old export for backward compatibility
export const familyTreeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ... other static styles without colors
}); 