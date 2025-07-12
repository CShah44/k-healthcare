import { Colors } from '@/constants/Colors';
import { Heart, Brain, Bone, Activity, TestTube2, Pill, FileText, Tag } from 'lucide-react-native';
import { doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/constants/firebase';

// Predefined tags for medical records
export const PREDEFINED_TAGS = [
  {
    id: 'cardiology',
    label: 'Cardiology',
    icon: Heart,
    color: Colors.medical.red,
    isCustom: false,
  },
  {
    id: 'neurology',
    label: 'Neurology',
    icon: Brain,
    color: Colors.medical.blue,
    isCustom: false,
  },
  {
    id: 'orthopedics',
    label: 'Orthopedics',
    icon: Bone,
    color: Colors.medical.orange,
    isCustom: false,
  },
  {
    id: 'general',
    label: 'General',
    icon: Activity,
    color: Colors.medical.green,
    isCustom: false,
  },
  {
    id: 'lab_reports',
    label: 'Lab Reports',
    icon: TestTube2,
    color: Colors.medical.purple,
    isCustom: false,
  },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: Pill,
    color: Colors.medical.yellow,
    isCustom: false,
  },
  {
    id: 'imaging',
    label: 'Imaging',
    icon: FileText,
    color: Colors.primary,
    isCustom: false,
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: Activity,
    color: Colors.medical.red,
    isCustom: false,
  },
];

// Helper to convert base64 to Uint8Array
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Tag management functions
export async function saveUserCustomTags(userId: string, tags: string[]) {
  try {
    await setDoc(
      doc(db, 'userTags', userId),
      {
        customTags: tags,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving custom tags:', error);
    throw error;
  }
}

export function getAllAvailableTags(customTags: string[]) {
  return [
    ...PREDEFINED_TAGS,
    ...customTags.map((tag) => ({
      id: tag,
      label: tag.charAt(0).toUpperCase() + tag.slice(1),
      icon: Tag,
      color: Colors.primary,
      isCustom: true,
    })),
  ];
}

export async function addCustomTag(
  userId: string,
  newTagInput: string,
  customTags: string[],
  selectedTags: string[],
  setCustomTags: React.Dispatch<React.SetStateAction<string[]>>,
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>,
  showAlert: (title: string, message: string) => void
) {
  const trimmedTag = newTagInput.trim().toLowerCase();
  if (!trimmedTag) {
    showAlert('Error', 'Please enter a tag name');
    return;
  }

  // Check if tag already exists
  const allExistingTags = [
    ...PREDEFINED_TAGS.map((t) => t.id),
    ...customTags,
  ];
  if (allExistingTags.includes(trimmedTag)) {
    showAlert('Error', 'This tag already exists');
    return;
  }

  try {
    // Add to custom tags and select it
    const newCustomTags = [...customTags, trimmedTag];
    setCustomTags(newCustomTags);
    setSelectedTags((prev: string[]) => [...prev, trimmedTag]);

    // Save to database
    await saveUserCustomTags(userId, newCustomTags);

    // Show success feedback
    showAlert(
      'Success',
      `Tag "${trimmedTag}" has been added and is now available for filtering!`
    );
  } catch (error) {
    console.error('Error adding custom tag:', error);
    showAlert('Error', 'Failed to save custom tag. Please try again.');

    // Revert local changes on error
    setCustomTags((prev: string[]) => prev.filter((tag: string) => tag !== trimmedTag));
    setSelectedTags((prev: string[]) => prev.filter((tag: string) => tag !== trimmedTag));
  }
}

export async function removeCustomTag(
  userId: string,
  tagId: string,
  customTags: string[],
  selectedTags: string[],
  setCustomTags: React.Dispatch<React.SetStateAction<string[]>>,
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>,
  showAlert: (title: string, message: string) => void
) {
  try {
    const newCustomTags = customTags.filter((id: string) => id !== tagId);
    setCustomTags(newCustomTags);
    setSelectedTags((prev: string[]) => prev.filter((id: string) => id !== tagId));

    // Save to database
    await saveUserCustomTags(userId, newCustomTags);
  } catch (error) {
    console.error('Error removing custom tag:', error);
    showAlert('Error', 'Failed to remove custom tag. Please try again.');

    // Revert local changes on error
    setCustomTags((prev: string[]) => [...prev, tagId]);
  }
}

// Record management functions
export function canEditRecord(record: any): boolean {
  return record.type === 'uploaded' || record.source !== 'lab_uploaded';
}

export async function addTagToRecord(userId: string, recordId: string, tagId: string, medicalRecords: any[]) {
  try {
    const record = medicalRecords.find((r) => r.id === recordId);
    if (!record) return;

    const currentTags = record.tags || [];
    if (currentTags.includes(tagId)) return;

    const updatedTags = [...currentTags, tagId];

    await updateDoc(doc(db, 'patients', userId, 'records', recordId), {
      tags: updatedTags,
    });
  } catch (error) {
    console.error('Error adding tag:', error);
    throw error;
  }
}

export async function removeTagFromRecord(userId: string, recordId: string, tagId: string, medicalRecords: any[]) {
  try {
    const record = medicalRecords.find((r) => r.id === recordId);
    if (!record) return;

    const currentTags = record.tags || [];
    const updatedTags = currentTags.filter((tag: string) => tag !== tagId);

    await updateDoc(doc(db, 'patients', userId, 'records', recordId), {
      tags: updatedTags,
    });
  } catch (error) {
    console.error('Error removing tag:', error);
    throw error;
  }
}

export async function updateRecord(
  userId: string,
  recordId: string,
  title: string,
  tags: string[],
  showAlert: (title: string, message: string) => void
) {
  if (!title.trim()) {
    showAlert('Error', 'Please enter a valid title');
    return;
  }

  try {
    await updateDoc(
      doc(db, 'patients', userId, 'records', recordId),
      {
        title: title.trim(),
        tags: tags,
        updatedAt: new Date(),
      }
    );
    showAlert('Success', 'Record updated successfully');
  } catch (error) {
    console.error('Error updating record:', error);
    showAlert('Error', 'Failed to update record');
    throw error;
  }
}

export async function deleteRecord(userId: string, recordId: string) {
  try {
    await deleteDoc(doc(db, 'patients', userId, 'records', recordId));
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
}

// Filtering functions
export function filterRecords(
  medicalRecords: any[],
  searchQuery: string,
  selectedTags: string[],
  selectedFilter: string
) {
  return medicalRecords.filter((record) => {
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

    // Type filter
    const matchesType =
      selectedFilter === 'all' || record.type === selectedFilter;

    return matchesSearch && matchesTags && matchesType;
  });
}

export function getAvailableTags(medicalRecords: any[], customTags: string[]) {
  return Array.from(
    new Set(
      medicalRecords
        .flatMap((record) => record.tags || [])
        .concat(PREDEFINED_TAGS.map((tag) => tag.id))
        .concat(customTags)
    )
  );
} 