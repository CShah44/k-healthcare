import React, { createContext, useContext, useState, useEffect } from 'react';
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

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
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
  licenseNumber?: string;
  department?: string;
  hospital?: string;
  familyId?: string; // Add familyId field
  linkedAccounts?: string[]; // Array of child account IDs linked to this parent
  parentAccountId?: string; // ID of parent account if this is a child account
  isChildAccount?: boolean; // Flag to identify child accounts
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
    parentId: string
  ) => Promise<string>;
  switchToAccount: (accountId: string) => Promise<void>;
  getAccessibleAccounts: () => Promise<any[]>;
  removeParentLink: () => Promise<void>;
  login: (
    identifier: string,
    password: string,
    role: 'patient' | 'doctor' | 'lab_assistant'
  ) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>; // Add refreshUserData function
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
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [originalUser, setOriginalUser] = useState<User | null>(null); // Store original authenticated user
  const [isSwitchedAccount, setIsSwitchedAccount] = useState(false);

  // Function to fetch user data from Firestore
  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
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
    if (user) {
      await fetchUserData(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setOriginalUser(user); // Store the original authenticated user

        // Fetch user data from Firestore
        const userData = await fetchUserData(user.uid);

        // If the authenticated user is a child account, automatically switch to parent account
        if (userData?.isChildAccount && userData.parentAccountId) {
          try {
            console.log(
              'Child account detected, switching to parent account:',
              userData.parentAccountId
            );

            // Fetch parent account data
            const parentDoc = await getDoc(
              doc(db, 'users', userData.parentAccountId)
            );
            if (parentDoc.exists()) {
              const parentData = parentDoc.data() as UserData;

              // Create mock user object for parent
              const mockParentUser = {
                ...user,
                uid: userData.parentAccountId,
                email: parentData.email,
              } as User;

              // Switch to parent account
              setUser(mockParentUser);
              setUserData(parentData);
              setIsSwitchedAccount(true);
            }
          } catch (error) {
            console.error('Error switching to parent account on login:', error);
            // If switching fails, stay with the child account
          }
        }
      } else {
        setUser(null);
        setUserData(null);
        setOriginalUser(null);
        setIsSwitchedAccount(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

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
        licenseNumber: data.licenseNumber || '',
        department: data.department || '',
        hospital: data.hospital || '',
        familyId: '', // Initialize familyId as empty
        linkedAccounts: [], // Initialize linked accounts as empty array
        uid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), userDataForFirestore);

      if (data.role === 'patient') {
        await setDoc(doc(db, 'patients', user.uid), {
          ...userDataForFirestore,
          medicalHistory: [],
          appointments: [],
          prescriptions: [],
        });
      } else if (data.role === 'doctor') {
        await setDoc(doc(db, 'doctors', user.uid), {
          ...userDataForFirestore,
          specialization: '',
          experience: '',
          qualifications: [],
          availability: {},
          patients: [],
        });
      } else if (data.role === 'lab_assistant') {
        await setDoc(doc(db, 'lab_assistants', user.uid), {
          ...userDataForFirestore,
          labTestsHandled: [],
          certifications: [],
          experience: '',
        });
      }

      setUserData({
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        gender: data.gender,
        role: data.role,
        licenseNumber: data.licenseNumber,
        department: data.department,
        hospital: data.hospital,
        familyId: '',
        linkedAccounts: [],
      });
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
    parentId: string
  ): Promise<string> => {
    try {
      // Create Firebase user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const childUser = userCredential.user;

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
      };

      // Create child user document
      await setDoc(doc(db, 'users', childUser.uid), childUserData);

      // Create patient record for child
      if (data.role === 'patient') {
        await setDoc(doc(db, 'patients', childUser.uid), {
          ...childUserData,
          medicalHistory: [],
          appointments: [],
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

      if (userData?.isChildAccount) {
        // Child accounts can only switch to their parent account or back to original authenticated account
        hasAccess =
          userData.parentAccountId === accountId || // Child accessing parent
          accountId === originalUser?.uid; // Switching back to original authenticated account
      } else {
        // Parent accounts can access all their linked children or switch back to original
        hasAccess =
          userData?.linkedAccounts?.includes(accountId) || // Parent accessing child
          accountId === originalUser?.uid; // Switching back to original authenticated account
      }

      if (!hasAccess) {
        throw new Error('Access denied to this account');
      }

      // Fetch the target account data
      const targetUserData = await fetchUserData(accountId);
      if (!targetUserData) {
        throw new Error('Account not found');
      }

      // If switching back to original authenticated user, use original user object
      if (accountId === originalUser?.uid) {
        setUser(originalUser);
        setUserData(targetUserData);
        setIsSwitchedAccount(false);
      } else {
        // Create a mock Firebase User object for the target account
        const mockUser = {
          ...originalUser,
          uid: accountId,
          email: targetUserData.email,
        } as User;

        // Update both user and userData to completely switch context
        setUser(mockUser);
        setUserData(targetUserData);
        setIsSwitchedAccount(true);
      }
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
            doc(db, 'users', userData.parentAccountId)
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
            }
          );
          const linkedAccounts = await Promise.all(linkedAccountPromises);
          accounts.push(
            ...linkedAccounts.filter((account) => account !== null)
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
          'You must be at least 16 years old to remove parent link'
        );
      }
    }

    try {
      setIsLoading(true);

      const batch = writeBatch(db);

      // Remove child from parent's linked accounts
      if (userData.parentAccountId) {
        const parentDoc = await getDoc(
          doc(db, 'users', userData.parentAccountId)
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
    role: 'patient' | 'doctor' | 'lab_assistant'
  ) => {
    setIsLoading(true);
    try {
      let emailToLogin = identifier;

      // Check if the identifier is not an email
      if (!identifier.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('role', '==', role),
          where('email', '!=', '')
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

      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailToLogin,
        password
      );
      const user = userCredential.user;

      // Fetch user data
      await fetchUserData(user.uid);
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
      setUser(null);
      setUserData(null);
      setOriginalUser(null);
      setIsSwitchedAccount(false);
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

  const value: AuthContextType = {
    user,
    userData,
    isLoading,
    isSwitchedAccount,
    originalUserId: originalUser?.uid || null,
    signup,
    createChildAccount,
    switchToAccount,
    getAccessibleAccounts,
    removeParentLink,
    login,
    logout,
    forgotPassword,
    refreshUserData, // Add refreshUserData to the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
