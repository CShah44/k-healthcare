export interface Family {
  id: string;
  name: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
  members: FamilyMember[];
}

export interface FamilyMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  relation: FamilyRelation;
  addedBy: string;
  addedAt: any;
  status: 'pending' | 'accepted' | 'declined';
}

export type FamilyRelation =
  | 'self'
  | 'spouse'
  | 'parent'
  | 'child'
  | 'sibling'
  | 'grandparent'
  | 'grandchild'
  | 'uncle'
  | 'aunt'
  | 'cousin'
  | 'other';

export interface FamilyInvitation {
  id: string;
  familyId: string;
  familyName: string;
  invitedBy: string;
  invitedByName: string;
  invitedUserId: string;
  relation: FamilyRelation;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
  expiresAt: any;
}

export const FAMILY_RELATIONS: { value: FamilyRelation; label: string }[] = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'uncle', label: 'Uncle' },
  { value: 'aunt', label: 'Aunt' },
  { value: 'cousin', label: 'Cousin' },
  { value: 'other', label: 'Other' },
];
