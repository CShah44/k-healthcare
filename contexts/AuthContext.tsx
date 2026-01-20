import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps } from 'firebase/app';
import {
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import {
  query,
  where,
  getDocs,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/constants/firebase';
import { getDoc, collection, serverTimestamp } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { generateUniquePatientId } from '@/utils/patientIdGenerator';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  getAuth,
} from 'firebase/auth';

interface UserData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  gender: string;
  role: 'patient' | 'doctor' | 'lab_assistant';
  customUserId?: string; // 8-character nanoid for user identification
  licenseNumber?: string;
  department?: string;
  hospital?: string;
  familyId?: string; // Add familyId field
  linkedAccounts?: string[]; // Array of child account IDs linked to this parent
  parentAccountId?: string; // ID of parent account if this is a child account
  isChildAccount?: boolean; // Flag to identify child accounts
  patientId?: string; // Unique human-readable ID for patients (e.g., SVP-A1B2C3)
  specialty?: string;
  avatarUrl?: string;
  letterheadUrl?: string;
}

interface SignupData extends UserData {
  password: string;
  confirmPassword: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  isSwitchedAccount: boolean;
  originalUserId: string | null;
  signup: (data: SignupData) => Promise<void>;
  createChildAccount: (
    data: Omit<SignupData, 'confirmPassword'>,
    parentId: string,
  ) => Promise<string>;
  switchToAccount: (accountId: string) => Promise<void>;
  getAccessibleAccounts: () => Promise<any[]>;
  removeParentLink: () => Promise<void>;
  login: (
    identifier: string,
    password: string,
    role: 'patient' | 'doctor' | 'lab_assistant',
  ) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>; // Add refreshUserData function
  updateUserProfile: (updates: Partial<UserData>) => Promise<void>; // Add updateUserProfile function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived state
  const isSwitchedAccount =
    firebaseUser && activeAccountId
      ? firebaseUser.uid !== activeAccountId
      : false;

  const user = React.useMemo(() => {
    if (!firebaseUser) return null;
    if (!activeAccountId || activeAccountId === firebaseUser.uid)
      return firebaseUser;

    // Create mock user for switched account
    return {
      ...firebaseUser,
      uid: activeAccountId,
      email: userData?.email || firebaseUser.email,
    } as User;
  }, [firebaseUser, activeAccountId, userData]);

  // Function to fetch user data from Firestore
  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;

        // Backfill patientId for existing ID-less patients
        if (data.role === 'patient' && !data.patientId) {
          try {
            const newPatientId = await generateUniquePatientId(db);
            await updateDoc(doc(db, 'users', userId), {
              patientId: newPatientId,
              updatedAt: serverTimestamp(),
            });
            await updateDoc(doc(db, 'patients', userId), {
              patientId: newPatientId,
              updatedAt: serverTimestamp(),
            });
            data.patientId = newPatientId;
          } catch (error) {
            console.error(
              'Error generating patientId for existing user:',
              error,
            );
          }
        }

        setUserData(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Function to refresh user data
  const refreshUserData = async () => {
    if (activeAccountId) {
      await fetchUserData(activeAccountId);
    }
  };

  // Load state and handle auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setFirebaseUser(authUser);

      if (authUser) {
        try {
          // If we're already initialized with this user, don't reset unless necessary
          // But here we want to ensure we have the correct activeAccountId

          let targetAccountId = authUser.uid;

          // Check for persisted active account ID
          const storedAccountId = await AsyncStorage.getItem('activeAccountId');
          if (storedAccountId) {
            // Verify if we can legally access this account (basic check: is it us or are we a parent?)
            // For now, we'll try to use it, and let fetchUserData handle existence checks.
            // Ideally we should verify linkage here too, but simple persistence is key for now.
            targetAccountId = storedAccountId;
          }

          setActiveAccountId(targetAccountId);
          await fetchUserData(targetAccountId);
        } catch (error) {
          console.error('Error restoring auth state:', error);
          // Fallback to default user
          setActiveAccountId(authUser.uid);
          await fetchUserData(authUser.uid);
        }
      } else {
        // Signed out
        setActiveAccountId(null);
        setUserData(null);
        await AsyncStorage.removeItem('activeAccountId');
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sync activeAccountId to storage
  useEffect(() => {
    if (activeAccountId) {
      AsyncStorage.setItem('activeAccountId', activeAccountId);
    } else {
      AsyncStorage.removeItem('activeAccountId');
    }
  }, [activeAccountId]);

  // Refetch user data when activeAccountId changes (if it's not the initial load)
  // We can actually merge this logic. The onAuthStateChanged handles the initial load.
  // This effect handles subsequent switches.
  useEffect(() => {
    // Only refetch if we are not loading (initial load handled above) and we have an ID
    if (!isLoading && activeAccountId) {
      fetchUserData(activeAccountId);
    }
  }, [activeAccountId]);

  const signup = async (data: SignupData) => {
    // setIsLoading(true); // Removed to allow local loading state
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      const newUser = userCredential.user;

      // Generate 8-character nanoid for custom user ID
      const customUserId = nanoid(8);

      // Generate patientId if role is patient
      let patientId = '';
      if (data.role === 'patient') {
        patientId = await generateUniquePatientId(db);
      }

      const userDataForFirestore: UserData & {
        createdAt: any;
        updatedAt: any;
        uid: string;
      } = {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        gender: data.gender,
        role: data.role,
        customUserId: customUserId, // Store the generated nanoid
        licenseNumber: data.licenseNumber || '',
        department: data.department || '',
        hospital: data.hospital || '',
        familyId: '', // Initialize familyId as empty
        linkedAccounts: [], // Initialize linked accounts as empty array
        uid: newUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(patientId ? { patientId } : {}), // Add patientId if generated
      };

      await setDoc(doc(db, 'users', newUser.uid), userDataForFirestore);

      if (data.role === 'patient') {
        await setDoc(doc(db, 'patients', newUser.uid), {
          ...userDataForFirestore,
          medicalHistory: [],
          prescriptions: [],
        });
      } else if (data.role === 'doctor') {
        await setDoc(doc(db, 'doctors', newUser.uid), {
          ...userDataForFirestore,
          specialization: '',
          experience: '',
          qualifications: [],
          availability: {},
          patients: [],
        });
      } else if (data.role === 'lab_assistant') {
        await setDoc(doc(db, 'lab_assistants', newUser.uid), {
          ...userDataForFirestore,
          labTestsHandled: [],
          certifications: [],
          experience: '',
        });
      }

      // onAuthStateChanged will handle state updates
    } catch (error: any) {
      console.error('Signup error:', error);

      let errorMessage = 'Failed to create account. Please try again.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage =
            'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/network-request-failed':
          errorMessage =
            'Network error. Please check your connection and try again.';
          break;
      }

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Create child account with Firebase authentication
  const createChildAccount = async (
    data: Omit<SignupData, 'confirmPassword'>,
    parentId: string,
  ): Promise<string> => {
    try {
      // Create Firebase user with email and password
      // Note: This signs in the new user automatically, we need to handle this
      // Ideally should be done via a cloud function to strictly avoid signing out the parent
      // But for client-side:
      const currentParent = auth.currentUser;

      const app2 = initializeApp(getApps()[0].options, 'Secondary');
      const auth2 = getAuth(app2);

      const userCredential = await createUserWithEmailAndPassword(
        auth2,
        data.email,
        data.password,
      );

      const childUser = userCredential.user;

      // Clean up secondary app
      // deleteApp(app2); // Ideally

      // Generate 8-character nanoid for custom user ID
      const customUserId = nanoid(8);

      // Generate patientId if role is patient
      let patientId = '';
      if (data.role === 'patient') {
        patientId = await generateUniquePatientId(db);
      }

      const childUserData: UserData & {
        createdAt: any;
        updatedAt: any;
        uid: string;
      } = {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        gender: data.gender,
        role: data.role,
        customUserId: customUserId, // Store the generated nanoid
        licenseNumber: data.licenseNumber || '',
        department: data.department || '',
        hospital: data.hospital || '',
        familyId: data.familyId || '',
        parentAccountId: parentId,
        isChildAccount: true,
        linkedAccounts: [], // Children don't have linked accounts - only access to parent
        uid: childUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(patientId ? { patientId } : {}), // Add patientId if generated
      };

      // Create child user document
      await setDoc(doc(db, 'users', childUser.uid), childUserData);

      // Create patient record for child
      if (data.role === 'patient') {
        await setDoc(doc(db, 'patients', childUser.uid), {
          ...childUserData,
          medicalHistory: [],
          prescriptions: [],
        });
      }

      // Update parent's linked accounts
      const parentDoc = await getDoc(doc(db, 'users', parentId));
      if (parentDoc.exists()) {
        const parentData = parentDoc.data();
        const currentLinkedAccounts = parentData.linkedAccounts || [];
        await updateDoc(doc(db, 'users', parentId), {
          linkedAccounts: [...currentLinkedAccounts, childUser.uid],
          updatedAt: serverTimestamp(),
        });
      }

      return childUser.uid;
    } catch (error: any) {
      console.error('Error creating child account:', error);

      let errorMessage = 'Failed to create child account. Please try again.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage =
            'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/network-request-failed':
          errorMessage =
            'Network error. Please check your connection and try again.';
          break;
      }

      throw new Error(errorMessage);
    }
  };

  // Switch to a different account with restricted access for children
  const switchToAccount = async (accountId: string): Promise<void> => {
    try {
      setIsLoading(true);

      // Determine access permissions based on current account type
      let hasAccess = false;
      const currentAuthUser = firebaseUser; // Use firebaseUser as source of truth for permissions

      // We need to fetch the requester's data securely or rely on what we have if we trust it
      // Re-fetching strictly to ensure safety:
      const requesterDoc = await getDoc(
        doc(db, 'users', currentAuthUser?.uid || ''),
      );
      const requesterData = requesterDoc.data() as UserData;

      if (requesterData?.isChildAccount) {
        // Child accounts can only switch to their parent account or back to original authenticated account
        hasAccess =
          requesterData.parentAccountId === accountId || // Child accessing parent
          accountId === currentAuthUser?.uid; // Switching back to original authenticated account
      } else {
        // Parent accounts can access all their linked children or switch back to original
        hasAccess =
          requesterData?.linkedAccounts?.includes(accountId) || // Parent accessing child
          accountId === currentAuthUser?.uid; // Switching back to original authenticated account
      }

      if (!hasAccess) {
        // Also allow switching back to self trivially
        if (accountId === currentAuthUser?.uid) {
          hasAccess = true;
        } else {
          throw new Error('Access denied to this account');
        }
      }

      // Update active account ID - the effect will handle data fetching
      setActiveAccountId(accountId);
    } catch (error) {
      console.error('Error switching account:', error);
      throw new Error('Failed to switch account');
    } finally {
      setIsLoading(false);
    }
  };

  // Get accessible accounts based on account type (restricted for children)
  const getAccessibleAccounts = async (): Promise<any[]> => {
    if (!userData) return [];

    try {
      const accounts = [];

      if (userData.isChildAccount) {
        // Child accounts can only see their parent account
        if (userData.parentAccountId) {
          const parentDoc = await getDoc(
            doc(db, 'users', userData.parentAccountId),
          );
          if (parentDoc.exists()) {
            accounts.push({
              id: userData.parentAccountId,
              ...parentDoc.data(),
              type: 'parent',
            });
          }
        }
      } else {
        // Parent accounts can see all their linked child accounts
        if (userData.linkedAccounts && userData.linkedAccounts.length > 0) {
          const linkedAccountPromises = userData.linkedAccounts.map(
            async (accountId: string) => {
              const accountDoc = await getDoc(doc(db, 'users', accountId));
              if (accountDoc.exists()) {
                return { id: accountId, ...accountDoc.data(), type: 'child' };
              }
              return null;
            },
          );
          const linkedAccounts = await Promise.all(linkedAccountPromises);
          accounts.push(
            ...linkedAccounts.filter((account) => account !== null),
          );
        }
      }

      return accounts;
    } catch (error) {
      console.error('Error fetching accessible accounts:', error);
      return [];
    }
  };

  // Remove parent link for users 16+ years old
  const removeParentLink = async (): Promise<void> => {
    if (!user || !userData) {
      throw new Error('User not authenticated');
    }

    if (!userData.isChildAccount || !userData.parentAccountId) {
      throw new Error('User is not a child account');
    }

    // Check if user is 16 or older
    if (userData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(userData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 16) {
        throw new Error(
          'You must be at least 16 years old to remove parent link',
        );
      }
    }

    try {
      setIsLoading(true);

      const batch = writeBatch(db);

      // Remove child from parent's linked accounts
      if (userData.parentAccountId) {
        const parentDoc = await getDoc(
          doc(db, 'users', userData.parentAccountId),
        );
        if (parentDoc.exists()) {
          const parentData = parentDoc.data();
          const updatedLinkedAccounts = (
            parentData.linkedAccounts || []
          ).filter((accountId: string) => accountId !== user.uid);

          batch.update(doc(db, 'users', userData.parentAccountId), {
            linkedAccounts: updatedLinkedAccounts,
            updatedAt: serverTimestamp(),
          });
        }
      }

      // Update child account to remove parent link
      batch.update(doc(db, 'users', user.uid), {
        parentAccountId: '',
        isChildAccount: false,
        linkedAccounts: [],
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      // Refresh user data
      await refreshUserData();
    } catch (error) {
      console.error('Error removing parent link:', error);
      throw new Error('Failed to remove parent link');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    identifier: string,
    password: string,
    role: 'patient' | 'doctor' | 'lab_assistant',
  ) => {
    // setIsLoading(true); // Removed to allow local loading state
    try {
      let emailToLogin = identifier;

      // Check if the identifier is not an email
      if (!identifier.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('role', '==', role),
          where('email', '!=', ''),
        );

        const snapshot = await getDocs(q);
        const matchedDoc = snapshot.docs.find((doc) => {
          const data = doc.data();
          return (
            data.email === identifier ||
            data.phoneNumber.replace(/\D/g, '') ===
              identifier.replace(/\D/g, '') ||
            `${data.firstName} ${data.lastName}`
              .toLowerCase()
              .includes(identifier.toLowerCase())
          );
        });

        if (!matchedDoc)
          throw new Error('No account found for this identifier');
        emailToLogin = matchedDoc.data().email;
      }

      await signInWithEmailAndPassword(auth, emailToLogin, password);
      // onAuthStateChanged will handle state updates
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        errorMessage = 'Invalid email or password.';
      }
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will handle state clearing
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length === 0) {
        throw new Error('No account found with this email.');
      }
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw new Error('Failed to send reset email. Please try again.');
    }
  };

  // Update user profile function
  const updateUserProfile = async (updates: Partial<UserData>) => {
    if (!user || !userData) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);

      const updatedData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Update main users collection
      await updateDoc(doc(db, 'users', activeAccountId!), updatedData);

      // Update role-specific collection
      if (userData.role === 'patient') {
        await updateDoc(doc(db, 'patients', activeAccountId!), updatedData);
      } else if (userData.role === 'doctor') {
        await updateDoc(doc(db, 'doctors', activeAccountId!), updatedData);
      } else if (userData.role === 'lab_assistant') {
        await updateDoc(
          doc(db, 'lab_assistants', activeAccountId!),
          updatedData,
        );
      }

      // Update local state
      setUserData((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    isLoading,
    isSwitchedAccount,
    originalUserId: firebaseUser?.uid || null,
    signup,
    createChildAccount,
    switchToAccount,
    getAccessibleAccounts,
    removeParentLink,
    login,
    logout,
    forgotPassword,
    refreshUserData, // Add refreshUserData to the context value
    updateUserProfile, // Add updateUserProfile to the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
