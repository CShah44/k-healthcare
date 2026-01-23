import { db, auth } from '@/constants/firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  arrayRemove,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Initialize Supabase Client
const { SUPABASE_URL, SUPABASE_ANON_KEY } = Constants.expoConfig?.extra ?? {};
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
const STORAGE_BUCKET = 'svastheya';

// Define Family Member interface locally to avoid circular dependencies or import issues
interface FamilyMember {
  userId: string;
  [key: string]: any;
}

export const deletePatientAccount = async (uid: string) => {
  if (!uid) throw new Error('User ID is required');

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user found');

    // Fetch user data first to get familyId and parentAccountId
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    // If user document doesn't exist, we might still want to try cleaning up other resources
    // or it might be already deleted.
    const userData = userDoc.exists() ? userDoc.data() : null;

    // 1. Delete Supabase Storage Files
    // List all files in the user's folder
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(`uploads/${uid}`);

    if (listError) {
      console.error('Error listing Supabase files:', listError);
      // We continue even if listing fails, to try deleting other resources
    }

    if (files && files.length > 0) {
      const filesToDelete = files.map((file) => `uploads/${uid}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(filesToDelete);

      if (deleteError) {
        console.error('Error deleting Supabase files:', deleteError);
      }
    }

    // 2. Delete Firestore Data
    // We'll use a batch for atomic operations where possible
    const batch = writeBatch(db);

    // A. Delete Patient Records (Subcollection)
    const recordsSnapshot = await getDocs(
      collection(db, 'patients', uid, 'records'),
    );
    recordsSnapshot.docs.forEach((recordDoc) => {
      batch.delete(recordDoc.ref);
    });

    // B. Delete Access Requests (where patientUid == uid)
    const accessRequestsQuery = query(
      collection(db, 'accessRequests'),
      where('patientUid', '==', uid),
    );
    const accessRequestsSnapshot = await getDocs(accessRequestsQuery);
    accessRequestsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // C. Delete Doctor Access (where patientUid == uid)
    const doctorAccessQuery = query(
      collection(db, 'doctorAccess'),
      where('patientUid', '==', uid),
    );
    const doctorAccessSnapshot = await getDocs(doctorAccessQuery);
    doctorAccessSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // D. Delete Main User Documents
    batch.delete(doc(db, 'patients', uid));
    batch.delete(doc(db, 'users', uid));
    batch.delete(doc(db, 'userTags', uid));

    // Handle User Statistics / Metadata if exists
    // (Assuming checking for any other collections might be good, but focusing on known ones)

    // E. Remove from Family (User Request Requirement 1)
    if (userData && userData.familyId) {
      // We need to remove this member from the family's member array
      // Since `members` is an array of objects, arrayRemove requires the EXACT object.
      // But we might not have the exact object.
      // Better approach: Read family doc, filter members, and update.
      // Note: We cannot do read-modify-write inside a simple batch.update if it depends on reading.
      // But we can do it separately before committing, or use runTransaction.
      // For simplicity and since we are already doing a batch, we'll fetch family doc now.

      // NOTE: We'll separate this from the batch to ensure it works correctly with read logic,
      // or just add the update to batch if we can construct the new array.

      // To be safe and atomic-ish, let's fetch family doc
      const familyRef = doc(db, 'families', userData.familyId);
      const familySnap = await getDoc(familyRef);

      if (familySnap.exists()) {
        const familyData = familySnap.data();
        const updatedMembers = (familyData.members || []).filter(
          (m: any) => m.userId !== uid,
        );

        // If this user was the creator/admin, we might need logic to handle that (e.g. assign new admin or warn)
        // For now, simply removing them.
        batch.update(familyRef, { members: updatedMembers });
      }
    }

    // F. Remove from Parent's Linked Accounts (User Request Requirement 1 & "Logical Flaws")
    if (userData && userData.parentAccountId && userData.isChildAccount) {
      const parentRef = doc(db, 'users', userData.parentAccountId);
      batch.update(parentRef, {
        linkedAccounts: arrayRemove(uid),
      });
    }

    // Commit Firestore changes
    await batch.commit();

    // 3. Delete Firebase Auth Account
    if (currentUser.uid === uid) {
      // User is deleting their own account
      await deleteUser(currentUser);
    } else {
      // Check if this is a parent deleting a child account
      // We verify this by checking if the user being deleted lists the current user as parent
      if (userData && userData.parentAccountId === currentUser.uid) {
        // This is a valid parent-child deletion.
        // We CANNOT delete the child's Auth user from the client SDK because we are not signed in as them.
        // However, we have successfully deleted all their data and access.
        // The logical "Delete Account" is complete from a data perspective.
        // We just return true.
        console.log(
          'Child account data deleted. Auth user remains (client-side limitation).',
        );
        return true;
      } else {
        // Verify if the current user is a family admin of the user's family?
        // Current requirements don't explicitly say family admin can delete members' ACCOUNTS, usually just remove from family.
        // But assuming `deletePatientAccount` is only called for self or child.

        throw new Error(
          "Authentication mismatch. You can only delete your own account or your child's account.",
        );
      }
    }

    return true;
  } catch (error: any) {
    console.error('Error deleting account:', error);
    // If specific auth error (requires-recent-login), re-throw it to be handled by UI
    if (error.code === 'auth/requires-recent-login') {
      throw error;
    }
    throw new Error(
      error.message || 'Failed to delete account. Please try again.',
    );
  }
};
