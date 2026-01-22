// profileHelpers.ts
import { Alert } from 'react-native';

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  let birthDate: Date;
  
  // Handle different date formats (MM/DD/YYYY or ISO string)
  if (dateOfBirth.includes('/')) {
    // Handle MM/DD/YYYY format
    const parts = dateOfBirth.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      birthDate = new Date(year, month, day);
    } else {
      birthDate = new Date(dateOfBirth);
    }
  } else {
    birthDate = new Date(dateOfBirth);
  }
  
  // Check if date is valid
  if (isNaN(birthDate.getTime())) {
    console.error('Invalid date format:', dateOfBirth);
    return 0;
  }
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function canRemoveParentLink(user: any): boolean {
  if (!user?.isChildAccount || !user?.dateOfBirth) return false;
  return calculateAge(user.dateOfBirth) >= 16;
}

export async function handleSwitchAccount(accountId: string, switchToAccount: (id: string) => Promise<void>) {
  try {
    await switchToAccount(accountId);
    Alert.alert('Success', 'Switched to account successfully!');
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
} 