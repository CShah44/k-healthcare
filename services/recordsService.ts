import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  where,
} from 'firebase/firestore';
import { db } from '@/constants/firebase';

export interface MedicalRecord {
  id: string;
  title: string;
  type: string;
  source?: string;
  doctor?: string;
  lab?: string;
  status?: string;
  fileType?: string;
  fileSize?: string;
  fileUrl?: string;
  tags?: string[];
  uploadedAt: any;
  isNew?: boolean;
  [key: string]: any;
}

export class RecordsService {
  // Get recent records for a user (limited number)
  static async getRecentRecords(
    userId: string,
    limitCount: number = 5
  ): Promise<MedicalRecord[]> {
    try {
      const q = query(
        collection(db, 'patients', userId, 'records'),
        orderBy('uploadedAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MedicalRecord[];
    } catch (error) {
      console.error('Error fetching recent records:', error);
      throw new Error('Failed to fetch recent records');
    }
  }

  // Get all records for a user
  static async getAllRecords(userId: string): Promise<MedicalRecord[]> {
    try {
      const q = query(
        collection(db, 'patients', userId, 'records'),
        orderBy('uploadedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MedicalRecord[];
    } catch (error) {
      console.error('Error fetching all records:', error);
      throw new Error('Failed to fetch records');
    }
  }

  // Get records by type
  static async getRecordsByType(
    userId: string,
    type: string
  ): Promise<MedicalRecord[]> {
    try {
      const q = query(
        collection(db, 'patients', userId, 'records'),
        where('type', '==', type),
        orderBy('uploadedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MedicalRecord[];
    } catch (error) {
      console.error('Error fetching records by type:', error);
      throw new Error('Failed to fetch records by type');
    }
  }

  // Get a single record by ID
  static async getRecordById(
    userId: string,
    recordId: string
  ): Promise<MedicalRecord | null> {
    try {
      const docRef = doc(db, 'patients', userId, 'records', recordId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as MedicalRecord;
      }
      return null;
    } catch (error) {
      console.error('Error fetching record by ID:', error);
      throw new Error('Failed to fetch record');
    }
  }

  // Subscribe to real-time updates for recent records
  static subscribeToRecentRecords(
    userId: string,
    limitCount: number = 5,
    callback: (records: MedicalRecord[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const q = query(
        collection(db, 'patients', userId, 'records'),
        orderBy('uploadedAt', 'desc'),
        limit(limitCount)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const records = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as MedicalRecord[];
          callback(records);
        },
        (error) => {
          console.error('Error in real-time records subscription:', error);
          if (onError) {
            onError(new Error('Failed to subscribe to records updates'));
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up records subscription:', error);
      if (onError) {
        onError(new Error('Failed to set up records subscription'));
      }
      return () => {}; // Return empty function if setup fails
    }
  }

  // Subscribe to all records with real-time updates
  static subscribeToAllRecords(
    userId: string,
    callback: (records: MedicalRecord[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const q = query(
        collection(db, 'patients', userId, 'records'),
        orderBy('uploadedAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const records = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as MedicalRecord[];
          callback(records);
        },
        (error) => {
          console.error('Error in real-time all records subscription:', error);
          if (onError) {
            onError(new Error('Failed to subscribe to all records updates'));
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up all records subscription:', error);
      if (onError) {
        onError(new Error('Failed to set up all records subscription'));
      }
      return () => {}; // Return empty function if setup fails
    }
  }

  // Get records count for a user
  static async getRecordsCount(userId: string): Promise<number> {
    try {
      const snapshot = await getDocs(
        collection(db, 'patients', userId, 'records')
      );
      return snapshot.size;
    } catch (error) {
      console.error('Error getting records count:', error);
      return 0;
    }
  }

  // Check if user has any records
  static async hasRecords(userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'patients', userId, 'records'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking if user has records:', error);
      return false;
    }
  }
}