import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    overflowY: 'auto',
  },
  
  // Layout
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  padded: {
    padding: 20,
  },
  
  paddedHorizontal: {
    paddingHorizontal: 20,
  },
  
  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16,
  },
  
  // Typography
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  
  body: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  
  bodySecondary: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  caption: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
  },
  
  // Buttons
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  buttonSecondary: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.secondary,
  },
  
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  
  // Forms
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 48,
  },
  
  inputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
  },
  
  // Status colors
  statusActive: {
    backgroundColor: Colors.medical.lightGreen,
    color: Colors.medical.green,
  },
  
  statusPending: {
    backgroundColor: Colors.medical.lightOrange,
    color: Colors.medical.orange,
  },
  
  statusCritical: {
    backgroundColor: Colors.medical.lightRed,
    color: Colors.medical.red,
  },
});