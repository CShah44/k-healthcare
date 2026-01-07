import { collection, query, where, getDocs, Firestore } from 'firebase/firestore';

/**
 * Generates a random alphanumeric string of a given length.
 * Uses uppercase letters and numbers.
 */
const generateRandomCode = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generates a unique patient ID in the format "SVP-XXXXXX".
 * Checks against the 'users' collection in Firestore to ensure uniqueness.
 */
export const generateUniquePatientId = async (db: Firestore): Promise<string> => {
  const MAX_RETRIES = 5;
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    const randomCode = generateRandomCode(6);
    const patientId = `SVP-${randomCode}`;

    try {
      // Check if this ID already exists in the users collection
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('patientId', '==', patientId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return patientId;
      }

      // If we get here, the ID exists, so we loop again
      console.log(`Generated patient ID ${patientId} already exists, retrying...`);
      retryCount++;
    } catch (error) {
      console.error('Error checking patient ID uniqueness:', error);
      throw new Error('Failed to generate unique patient ID');
    }
  }

  throw new Error('Failed to generate unique patient ID after multiple attempts');
};
