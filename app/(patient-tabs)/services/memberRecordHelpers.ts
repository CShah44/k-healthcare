import { Alert } from 'react-native';
import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/constants/firebase';
import { MedicalRecord } from '@/types/medical';

// Permission and access control
export function canEditRecord(
  record: any,
  userData: any,
  memberId: string,
  familyData?: any,
): boolean {
  // Users can edit/delete their own records
  if (memberId === userData?.uid) return true;

  // Family creators (owners) can edit any family member's records
  if (familyData && familyData.createdBy === userData?.uid) return true;

  // All other family members can only view records, not edit
  return false;
}

// Helper to check if a record is a prescription
export const isPrescription = (record: any): boolean => {
  return (
    record.type === 'prescriptions' ||
    record.type === 'prescription' ||
    record.tags?.includes('prescriptions') ||
    record.tags?.includes('prescription')
  );
};

// Helper function to check if a record matches a filter by tags
export const matchesFilterByTags = (
  record: any,
  filterId: string,
  predefinedTagIds: string[],
): boolean => {
  if (filterId === 'all') return true;
  if (filterId === 'prescriptions') return isPrescription(record);
  if (filterId === 'lab_reports') {
    return (
      record.type === 'lab_reports' ||
      record.source === 'lab_uploaded' ||
      record.tags?.includes('lab_reports')
    );
  }
  if (filterId === 'uploaded') {
    return record.type === 'uploaded' || record.source === 'user_uploaded';
  }
  // Check if any of the record's tags match predefined tag IDs
  return (
    record.tags?.some(
      (tag: string) => predefinedTagIds.includes(tag) && tag === filterId,
    ) || false
  );
};

// Record management functions
export async function updateMemberRecord(
  memberId: string,
  recordId: string,
  title: string,
  tags: string[],
) {
  if (!title.trim()) {
    throw new Error('Please enter a valid title');
  }

  try {
    await updateDoc(doc(db, 'patients', memberId, 'records', recordId), {
      title: title.trim(),
      tags: tags,
      updatedAt: new Date(),
    });
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
export function toggleEditTag(
  tagId: string,
  editTags: string[],
  setEditTags: React.Dispatch<React.SetStateAction<string[]>>,
) {
  setEditTags((prev: string[]) =>
    prev.includes(tagId)
      ? prev.filter((id: string) => id !== tagId)
      : [...prev, tagId],
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
  selectedTags: string[],
  selectedFilter: string = 'all',
  predefinedTagIds: string[] = [],
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

    // Type filter - check type, source, and tags
    const matchesType =
      selectedFilter === 'all' ||
      record.type === selectedFilter ||
      matchesFilterByTags(record, selectedFilter, predefinedTagIds);

    return matchesSearch && matchesTags && matchesType;
  });
}

// Permission display helpers
export function getPermissionText(
  userData: any,
  memberId: string,
  familyData?: any,
): string {
  if (memberId === userData?.uid) {
    return 'Your Records';
  } else if (familyData && familyData.createdBy === userData?.uid) {
    return 'Family Owner Access';
  } else {
    return 'View Only Access';
  }
}

export function getPermissionColor(
  userData: any,
  memberId: string,
  familyData?: any,
): string {
  if (memberId === userData?.uid) {
    return '#3b82f6'; // blue
  } else if (familyData && familyData.createdBy === userData?.uid) {
    return '#f97316'; // orange
  } else {
    return '#6b7280'; // gray
  }
}

export const fetchMemberRecords = async (
  memberId: string,
): Promise<MedicalRecord[]> => {
  const records: MedicalRecord[] = [];
  const recordsCollection = collection(db, `patients/${memberId}/records`);
  const recordsSnapshot = await getDocs(recordsCollection);
  recordsSnapshot.forEach((doc) => {
    records.push({ id: doc.id, ...doc.data() } as MedicalRecord);
  });
  return records;
};
