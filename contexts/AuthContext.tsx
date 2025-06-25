import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { query, where, getDocs } from 'firebase/firestore';
import { doc, setDoc} from "firebase/firestore";
import { auth, db } from "@/constants/firebase";
import {
  getDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore';

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User


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
  licenseNumber: string;
  department: string;
  hospital: string;
}

interface SignupData extends UserData {
  password: string;
  confirmPassword: string;
}


interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  signup: (data: SignupData) => Promise<void>;
  login: (identifier: string, password: string, role: 'patient' | 'doctor' | 'lab_assistant') => Promise<void>; // ✅ updated
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setUserData(null);
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
        licenseNumber: data.licenseNumber,
        department: data.department,
        hospital: data.hospital,
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
      });
    } catch (error: any) {
      console.error('Signup error:', error);
  
      let errorMessage = 'Failed to create account. Please try again.';
  
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
      }
  
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  

  const login = async (identifier: string, password: string, role: 'patient' | 'doctor'| 'lab_assistant') => {
    setIsLoading(true);
    try {
      let emailToLogin = identifier;
  
      // Check if the identifier is not an email
      if (!identifier.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', role), where('email', '!=', '')); // fallback
  
        const snapshot = await getDocs(q);
        const matchedDoc = snapshot.docs.find(doc => {
          const data = doc.data();
          return (
            data.email === identifier ||
            data.phoneNumber.replace(/\D/g, '') === identifier.replace(/\D/g, '') ||
            `${data.firstName} ${data.lastName}`.toLowerCase().includes(identifier.toLowerCase())
          );
        });
  
        if (!matchedDoc) throw new Error('No account found for this identifier');
        emailToLogin = matchedDoc.data().email;
      }
  
      const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, password);
      const user = userCredential.user;
  
      // Fetch user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
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
    signup,
    login,
    logout,
    forgotPassword, // 👈 include it here
  };
  

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};