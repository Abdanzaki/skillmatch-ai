import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  connectAuthEmulator
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator
} from 'firebase/firestore';
import {
  getStorage,
  connectStorageEmulator
} from 'firebase/storage';
import {
  getFunctions,
  connectFunctionsEmulator
} from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'mock-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'skillmatch-ai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'skillmatch-ai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'skillmatch-ai.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '100000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:100000000000:web:0000000000000000000000',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-DEV0000000',
};

// Initialize Firebase App instance singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Authentication Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Local Emulator Support
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

if (useEmulator && typeof window !== 'undefined' && !window.__FIREBASE_EMULATORS_CONNECTED__) {
  try {
    const authUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://localhost:9099';
    connectAuthEmulator(auth, authUrl, { disableWarnings: true });

    const firestoreHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || 'localhost';
    const firestorePort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8080);
    connectFirestoreEmulator(db, firestoreHost, firestorePort);

    const storageHost = import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost';
    const storagePort = Number(import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT || 9199);
    connectStorageEmulator(storage, storageHost, storagePort);

    connectFunctionsEmulator(functions, 'localhost', 5001);

    window.__FIREBASE_EMULATORS_CONNECTED__ = true;
    console.log('[SkillMatch AI] Connected to Firebase Emulators (Auth, Firestore, Storage, Functions)');
  } catch (error) {
    console.warn('[SkillMatch AI] Firebase emulator connection error:', error.message);
  }
}

export default app;
