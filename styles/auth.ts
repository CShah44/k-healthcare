import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const authStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  decorativeCircle: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },

  // Header Styles
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 36,
    fontFamily: 'IvyMode-Regular',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Form Styles
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: Colors.light.error,
    borderWidth: 2,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  inputIcon: {
    position: 'absolute',
    right: 18,
    top: 18,
  },
  eyeIcon: {
    position: 'absolute',
    right: 18,
    top: 16,
    padding: 6,
    zIndex: 1,
  },
  errorText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: 6,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
  },
  passwordHint: {
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'Satoshi-Variable',
    fontStyle: 'italic',
    opacity: 0.7,
  },

  // Button Styles
  primaryButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Link Styles
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
  },
  linkText: {
    color: Colors.primary,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },

  // Section Styles
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'IvyMode-Regular',
    marginLeft: 10,
    letterSpacing: -0.3,
  },

  // Name Row Styles
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  nameInputContainer: {
    flex: 1,
  },

  // Dropdown Styles
  dropdownButton: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },
  dropdownArrow: {
    fontSize: 12,
    opacity: 0.6,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dropdownOptionText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },

  // Role Selection Styles
  roleSelection: {
    marginBottom: 20,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  roleButtonText: {
    fontSize: 15,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#ffffff',
  },

  // Verification Section Styles
  verificationSection: {
    borderRadius: 18,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1.5,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationTitle: {
    fontSize: 20,
    fontFamily: 'IvyMode-Regular',
    fontWeight: '600',
    marginLeft: 10,
    letterSpacing: -0.3,
  },
  verificationSubtitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 24,
    lineHeight: 22,
  },
  verifyButton: {
    borderRadius: 14,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonGradient: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  verifyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    color: '#ffffff',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    padding: 28,
    borderRadius: 20,
    width: '88%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'IvyMode-Regular',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  modalDescription: {
    fontSize: 15,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 24,
    lineHeight: 22,
  },
  resetInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },
  resetMessage: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  otpInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    textAlign: 'center',
    letterSpacing: 4,
  },
  otpError: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 12,
    textAlign: 'center',
    color: Colors.light.error,
    fontWeight: '500',
  },

  // Loading Screen Styles
  fullscreenLoadingContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDecorativeCircle1: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  loadingDecorativeCircle2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  loadingDecorativeCircle3: {
    position: 'absolute',
    top: '40%',
    right: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    borderWidth: 2.5,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  spinnerContainer: {
    marginBottom: 36,
  },
  loadingTitle: {
    fontSize: 32,
    fontFamily: 'IvyMode-Regular',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  loadingSubtitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: 24,
  },
  progressBar: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '70%',
    borderRadius: 3,
  },

  // Council Modal Styles
  councilModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  councilModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    maxHeight: '85%',
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  councilModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  councilModalTitle: {
    fontSize: 22,
    fontFamily: 'IvyMode-Regular',
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  councilList: {
    paddingHorizontal: 24,
  },
  councilItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  councilItemText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },
});
