// profileHelpers.ts
import { Alert } from 'react-native';

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
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