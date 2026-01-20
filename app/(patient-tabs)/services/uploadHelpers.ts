import CryptoJS from 'crypto-js';
import { Colors } from '@/constants/Colors';
import {
  Heart,
  Brain,
  Bone,
  Activity,
  TestTube2,
  Pill,
  FileText,
} from 'lucide-react-native';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = Constants.expoConfig?.extra ?? {};
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

const BUCKET = 'svastheya';

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

// Encryption helpers
export function getUserEncryptionKey(uid: string): string {
  return CryptoJS.SHA256(uid + '_svastheya_secret').toString();
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Upload functions
export { supabase };

// Upload functions
export async function uploadFile(
  fileUri: string,
  fileName: string,
  fileType: string,
  userId: string,
  recordTitle: string,
  selectedTags: string[],
  fileBlob?: Blob,
) {
  try {
    let uploadBlob: Blob | undefined;
    let arrayBuffer: ArrayBuffer | undefined;

    if (fileBlob) {
      if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
        arrayBuffer = await fileBlob.arrayBuffer();
      } else {
        uploadBlob = fileBlob;
      }
    } else {
      const response = await fetch(fileUri);
      if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
        arrayBuffer = await response.arrayBuffer();
      } else {
        uploadBlob = await response.blob();
      }
    }

    // Encrypt PDFs and images
    if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
      if (!arrayBuffer) throw new Error('Failed to read file data');

      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
      const encryptionKey = getUserEncryptionKey(userId);

      const encrypted = CryptoJS.AES.encrypt(
        wordArray,
        encryptionKey,
      ).toString();
      const encryptedBytes = base64ToUint8Array(encrypted);

      uploadBlob = new Blob([encryptedBytes as any], {
        type: 'application/octet-stream',
      });
    } else if (!uploadBlob) {
      // Should satisfy the TS checker that uploadBlob is assigned if not encrypted
      throw new Error('Failed to prepare upload blob');
    }

    // Upload to Supabase
    // User requested path: uploads/user uid
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(`uploads/${userId}/${Date.now()}_${fileName}`, uploadBlob, {
        contentType:
          fileType === 'application/pdf' || fileType.startsWith('image/')
            ? 'application/octet-stream'
            : fileType,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      fileName,
      fileType,
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Upload public asset (unencrypted) for letterheads etc.
export async function uploadProfileAsset(
  fileUri: string,
  fileName: string,
  userId: string,
  folder: 'avatars' | 'letterheads' = 'letterheads',
) {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const fileType = blob.type;

    // Upload to Supabase
    // If folder is avatars, use avatars collection (root)
    // Otherwise keep existing behavior (doctor-assets)
    let path = `doctor-assets/${userId}/${folder}/${Date.now()}_${fileName}`;

    if (folder === 'avatars') {
      path = `avatars/${userId}/${Date.now()}_${fileName}`;
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, {
        contentType: fileType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Asset upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Asset upload error:', error);
    throw error;
  }
}

// Tag management for upload
export async function addCustomTag(
  newTagInput: string,
  customTags: string[],
  selectedTags: string[],
  setCustomTags: React.Dispatch<React.SetStateAction<string[]>>,
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>,
  saveUserCustomTags: (tags: string[]) => Promise<void>,
) {
  const trimmedTag = newTagInput.trim().toLowerCase();
  if (!trimmedTag) {
    throw new Error('Please enter a tag name');
  }

  // Check if tag already exists
  const allExistingTags = [...PREDEFINED_TAGS.map((t) => t.id), ...customTags];
  if (allExistingTags.includes(trimmedTag)) {
    throw new Error('This tag already exists');
  }

  // Add to custom tags and select it
  const newCustomTags = [...customTags, trimmedTag];
  setCustomTags(newCustomTags);
  setSelectedTags((prev: string[]) => [...prev, trimmedTag]);

  // Save to database
  await saveUserCustomTags(newCustomTags);

  return trimmedTag;
}

export function toggleTag(
  tagId: string,
  selectedTags: string[],
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>,
) {
  setSelectedTags((prev: string[]) =>
    prev.includes(tagId)
      ? prev.filter((id: string) => id !== tagId)
      : [...prev, tagId],
  );
}
