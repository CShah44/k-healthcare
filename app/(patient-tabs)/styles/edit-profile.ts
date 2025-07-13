import { StyleSheet } from 'react-native';

export const createEditProfileStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },

    headerTitle: {
      fontSize: 20,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
    },

    saveButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#009485',
      alignItems: 'center',
      justifyContent: 'center',
    },

    saveButtonDisabled: {
      backgroundColor: colors.textSecondary,
    },

    form: {
      paddingHorizontal: 20,
      paddingTop: 10,
    },

    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginBottom: 20,
    },

    inputGroup: {
      marginBottom: 20,
    },

    inputLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },

    labelText: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      marginLeft: 8,
    },

    required: {
      color: '#ef4444',
    },

    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },

    multilineInput: {
      height: 80,
      textAlignVertical: 'top',
    },

    genderContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    genderOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    genderOptionSelected: {
      backgroundColor: '#009485',
      borderColor: '#009485',
    },

    genderOptionText: {
      fontSize: 14,
      fontFamily: 'Satoshi-Variable',
      color: colors.text,
    },

    genderOptionTextSelected: {
      color: '#ffffff',
      fontFamily: 'Satoshi-Variable',
    },

    buttonContainer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
    },

    saveButtonLarge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#009485',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 18,
      gap: 6,
      width: 250,
      height: 40,
      marginBottom: 50,
      marginHorizontal: 10,
      alignSelf: 'center',
    },

    saveButtonText: {
      fontSize: 16,
      fontFamily: 'Satoshi-Variable',
      color: '#ffffff',
    },

    fixedButtonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingBottom: 12,
      paddingTop: 4,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      zIndex: 100,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 8,
      width: '100%',
    },
  });

// Keep the old export for backward compatibility
export const editProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ... other static styles without colors
});
