import { db, auth } from '@/constants/firebase';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    writeBatch
} from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Initialize Supabase Client
const { SUPABASE_URL, SUPABASE_ANON_KEY } = Constants.expoConfig?.extra ?? {};
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
const STORAGE_BUCKET = 'svastheya';


export const deletePatientAccount = async (uid: string) => {
    if (!uid) throw new Error('User ID is required');

    try {
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
            const filesToDelete = files.map(file => `uploads/${uid}/${file.name}`);
            const { error: deleteError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove(filesToDelete);

            if (deleteError) {
                console.error('Error deleting Supabase files:', deleteError);
            }
        }

        // 2. Delete Firestore Data
        // We'll use a batch for atomic operations where possible, 
        // but some queries might need separate batches if they are too large.
        const batch = writeBatch(db);

        // A. Delete Patient Records (Subcollection)
        // Note: Batches have a limit of 500 ops. If there are many records, this might need chunking.
        // For this implementation, we assume a reasonable number of records.
        const recordsSnapshot = await getDocs(collection(db, 'patients', uid, 'records'));
        recordsSnapshot.docs.forEach((recordDoc) => {
            batch.delete(recordDoc.ref);
        });

        // B. Delete Access Requests (where patientUid == uid)
        const accessRequestsQuery = query(
            collection(db, 'accessRequests'),
            where('patientUid', '==', uid)
        );
        const accessRequestsSnapshot = await getDocs(accessRequestsQuery);
        accessRequestsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // C. Delete Doctor Access (where patientUid == uid)
        const doctorAccessQuery = query(
            collection(db, 'doctorAccess'),
            where('patientUid', '==', uid)
        );
        const doctorAccessSnapshot = await getDocs(doctorAccessQuery);
        doctorAccessSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // D. Delete Main User Documents
        batch.delete(doc(db, 'patients', uid));
        batch.delete(doc(db, 'users', uid));
        batch.delete(doc(db, 'userTags', uid));

        // Commit Firestore changes
        await batch.commit();

        // 3. Delete Firebase Auth Account
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === uid) {
            await deleteUser(currentUser);
        } else {
            // If the user to delete matches the auth user but for some reason auth.currentUser is not sync or different context
            // This case strictly handles "Delete My Account", so it should match.
            throw new Error("Authentication mismatch. Please re-login.");
        }

        return true;
    } catch (error: any) {
        console.error('Error deleting account:', error);
        // If specific auth error (requires-recent-login), re-throw it to be handled by UI
        if (error.code === 'auth/requires-recent-login') {
            throw error;
        }
        throw new Error('Failed to delete account. Please try again.');
    }
};
