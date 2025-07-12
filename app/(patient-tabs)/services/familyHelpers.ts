import { Alert } from 'react-native';
import { FamilyService } from '@/services/familyService';
import { Family, FamilyMember, FamilyInvitation, FamilyRelation } from '@/types/family';

// Family management functions
export async function createFamily(
  familyName: string,
  user: any,
  createChildAccount: any
) {
  if (!familyName.trim()) {
    throw new Error('Please enter a family name');
  }

  try {
    const family = await FamilyService.createFamily(
      user!.uid,
      `${user!.firstName} ${user!.lastName}`,
      user!.email,
      familyName
    );
    Alert.alert('Success', 'Family created successfully!');
    return family;
  } catch (error: any) {
    Alert.alert('Error', error.message);
    throw error;
  }
}

export async function inviteMember(
  memberIdentifier: string,
  selectedRelation: FamilyRelation,
  family: Family,
  user: any
) {
  if (!memberIdentifier.trim()) {
    throw new Error('Please enter an email or phone number');
  }

  try {
    await FamilyService.inviteFamilyMember(
      family.id,
      family.name,
      user!.uid,
      `${user!.firstName} ${user!.lastName}`,
      memberIdentifier.trim(),
      selectedRelation
    );
    Alert.alert('Success', 'Invitation sent successfully!');
  } catch (error: any) {
    Alert.alert('Error', error.message);
    throw error;
  }
}

export async function createChildAccount(
  childFormData: any,
  childRelation: FamilyRelation,
  family: Family,
  user: any,
  createChildAccount: any
) {
  if (!family || !user) return;

  try {
    // Create child account through Firebase authentication
    const childUserId = await createChildAccount(
      {
        firstName: childFormData.firstName,
        middleName: childFormData.middleName,
        lastName: childFormData.lastName,
        email: childFormData.email,
        password: childFormData.password,
        phoneNumber: childFormData.phoneNumber,
        dateOfBirth: childFormData.dateOfBirth,
        address: childFormData.address,
        gender: childFormData.gender,
        role: 'patient',
        familyId: family.id,
      },
      user!.uid
    );

    // Add child to family
    await FamilyService.addChildToFamily(
      family.id,
      childUserId,
      {
        firstName: childFormData.firstName,
        lastName: childFormData.lastName,
        email: childFormData.email,
      },
      childRelation,
      user!.uid
    );

    Alert.alert('Success', 'Child account created and added to family!');
    return childUserId;
  } catch (error: any) {
    Alert.alert('Error', error.message);
    throw error;
  }
}

// Invitation management
export async function acceptInvitation(
  invitation: FamilyInvitation,
  user: any,
  refreshUserData: any
) {
  try {
    await FamilyService.acceptFamilyInvitation(
      invitation.id,
      user!.uid,
      `${user!.firstName} ${user!.lastName}`,
      user!.email
    );
    await refreshUserData();
    Alert.alert('Success', 'Invitation accepted! You are now part of the family.');
  } catch (error: any) {
    Alert.alert('Error', error.message);
    throw error;
  }
}

export async function declineInvitation(invitation: FamilyInvitation) {
  try {
    await FamilyService.declineFamilyInvitation(invitation.id);
    Alert.alert('Success', 'Invitation declined.');
  } catch (error: any) {
    Alert.alert('Error', error.message);
    throw error;
  }
}

// Member management
export async function removeMember(
  member: FamilyMember,
  family: Family,
  user: any
) {
  Alert.alert(
    'Remove Member',
    `Are you sure you want to remove ${member.firstName} ${member.lastName} from the family?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await FamilyService.kickFamilyMember(family.id, member.userId, user!.uid);
            Alert.alert('Success', 'Member removed from family.');
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]
  );
}

// Utility functions
export function getMemberInitials(member: FamilyMember): string {
  return `${member.firstName[0]}${member.lastName[0]}`;
}

export function getRelationColor(relation: FamilyRelation): string {
  switch (relation) {
    case 'parent':
      return '#f97316'; // orange
    case 'child':
      return '#3b82f6'; // blue
    case 'sibling':
      return '#10b981'; // green
    case 'spouse':
      return '#8b5cf6'; // purple
    default:
      return '#6b7280'; // gray
  }
}

export function validateChildForm(childFormData: any): string | null {
  if (!childFormData.firstName.trim()) return 'First name is required';
  if (!childFormData.lastName.trim()) return 'Last name is required';
  if (!childFormData.email.trim()) return 'Email is required';
  if (!childFormData.password.trim()) return 'Password is required';
  if (!childFormData.dateOfBirth.trim()) return 'Date of birth is required';
  if (!childFormData.gender.trim()) return 'Gender is required';
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(childFormData.email)) return 'Please enter a valid email';
  
  // Password validation
  if (childFormData.password.length < 6) return 'Password must be at least 6 characters';
  
  return null;
} 