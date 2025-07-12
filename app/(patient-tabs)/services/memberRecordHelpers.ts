import { Alert } from 'react-native';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/constants/firebase';

// Permission and access control
export function canEditRecord(record: any, userData: any, memberId: string): boolean {
  // Users can edit/delete their own records
  if (memberId === userData?.uid) return true;
  
  // Family creators can edit family member records
  if (userData?.familyId && userData?.isFamilyCreator) return true;
  
  // Allow editing of self-uploaded records
  return record.type === 'uploaded' || record.source !== 'lab_uploaded';
}

// Record management functions
export async function updateMemberRecord(
  memberId: string,
  recordId: string,
  title: string,
  tags: string[]
) {
  if (!title.trim()) {
    throw new Error('Please enter a valid title');
  }

  try {
    await updateDoc(
      doc(db, 'patients', memberId, 'records', recordId),
      {
        title: title.trim(),
        tags: tags,
        updatedAt: new Date(),
      }
    );
    return true;
  } catch (error) {
    console.error('Error updating record:', error);
    throw error;
  }
}

export async function deleteMemberRecord(memberId: string, recordId: string) {
  try {
    await deleteDoc(doc(db, 'patients', memberId, 'records', recordId));
    return true;
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
}

// Tag management
export function toggleEditTag(tagId: string, editTags: string[], setEditTags: React.Dispatch<React.SetStateAction<string[]>>) {
  setEditTags((prev: string[]) =>
    prev.includes(tagId)
      ? prev.filter((id: string) => id !== tagId)
      : [...prev, tagId]
  );
}

// File handling
export async function openFile(url: string, fileType: string) {
  try {
    if (fileType === 'application/pdf') {
      // Handle PDF opening
      return { success: true, type: 'pdf', url };
    } else if (fileType.startsWith('image/')) {
      // Handle image opening
      return { success: true, type: 'image', url };
    } else {
      // Handle other file types
      return { success: true, type: 'other', url };
    }
  } catch (error) {
    console.error('Error opening file:', error);
    throw error;
  }
}

// Record filtering and search
export function filterMemberRecords(
  records: any[],
  searchQuery: string,
  selectedTags: string[]
) {
  return records.filter((record) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      record.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.lab?.toLowerCase().includes(searchQuery.toLowerCase());

    // Tag filter
    const matchesTags =
      selectedTags.length === 0 ||
      (record.tags &&
        record.tags.some((tag: string) => selectedTags.includes(tag)));

    return matchesSearch && matchesTags;
  });
}

// Permission display helpers
export function getPermissionText(userData: any, memberId: string): string {
  if (memberId === userData?.uid) {
    return 'Your Records';
  } else if (userData?.familyId && userData?.isFamilyCreator) {
    return 'Family Creator Access';
  } else {
    return 'Limited Access';
  }
}

export function getPermissionColor(userData: any, memberId: string): string {
  if (memberId === userData?.uid) {
    return '#3b82f6'; // blue
  } else if (userData?.familyId && userData?.isFamilyCreator) {
    return '#f97316'; // orange
  } else {
    return '#6b7280'; // gray
  }
} 