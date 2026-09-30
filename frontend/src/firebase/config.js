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
  getFunctions,
  connectFunctionsEmulator
} from 'firebase/functions';

// Firebase Web Configuration reading from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App instance singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Services (Authentication, Firestore, Cloud Functions - No Storage)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

// Authentication Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Local Emulator Support (Optional)
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

if (useEmulator && typeof window !== 'undefined' && !window.__FIREBASE_EMULATORS_CONNECTED__) {
  try {
    const authUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://localhost:9099';
    connectAuthEmulator(auth, authUrl, { disableWarnings: true });

    const firestoreHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || 'localhost';
    const firestorePort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8080);
    connectFirestoreEmulator(db, firestoreHost, firestorePort);

    connectFunctionsEmulator(functions, 'localhost', 5001);

    window.__FIREBASE_EMULATORS_CONNECTED__ = true;
    console.log('[SkillMatch AI] Connected to Firebase Emulators (Auth, Firestore, Functions)');
  } catch (error) {
    console.warn('[SkillMatch AI] Firebase emulator connection error:', error.message);
  }
}

export default app;
