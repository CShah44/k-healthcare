import { initializeApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} = Constants.expoConfig?.extra || {};

// Validate required Firebase config
if (!FIREBASE_API_KEY || !FIREBASE_AUTH_DOMAIN || !FIREBASE_PROJECT_ID) {
  console.error('Firebase configuration is missing required fields:', {
    apiKey: FIREBASE_API_KEY ? 'present' : 'missing',
    authDomain: FIREBASE_AUTH_DOMAIN ? 'present' : 'missing',
    projectId: FIREBASE_PROJECT_ID ? 'present' : 'missing',
  });
}

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

console.log('Firebase Config:', {
  apiKey: FIREBASE_API_KEY ? `${FIREBASE_API_KEY.substring(0, 10)}...` : 'missing',
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
});

// Prevent re-initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

import { Platform } from 'react-native';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, browserSessionPersistence, Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Auth with platform-specific persistence
let auth: Auth;
if (Platform.OS === 'web') {
  auth = initializeAuth(app, {
    persistence: browserSessionPersistence
  });
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
