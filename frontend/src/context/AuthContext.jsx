import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync user profile from Firestore and resolve custom claims
  const syncUserData = async (user) => {
    if (!user) {
      setCurrentUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    try {
      // 1. Check custom claims on ID token
      const idTokenResult = await user.getIdTokenResult(true);
      const hasAdminClaim = Boolean(idTokenResult.claims && idTokenResult.claims.admin);

      // 2. Fetch or create Firestore user doc
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserProfile(data);
        setIsAdmin(hasAdminClaim || data.role === 'ADMIN');
      } else {
        // Create initial user doc if not yet in database
        const newProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL || '',
          role: hasAdminClaim ? 'ADMIN' : 'USER',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        setIsAdmin(hasAdminClaim || newProfile.role === 'ADMIN');
      }

      setCurrentUser(user);
    } catch (err) {
      console.error('[SkillMatch AI] Error syncing user profile:', err);
      // Fallback: still set user so the session isn't broken
      setCurrentUser(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      await syncUserData(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Registration with Email & Password
  const register = async (email, password, displayName) => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (displayName) {
        await updateProfile(user, { displayName });
      }

      const userRef = doc(db, 'users', user.uid);
      const profileData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        role: 'USER',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, profileData);
      setUserProfile(profileData);
      setIsAdmin(false);
      setCurrentUser(user);
      return userCredential;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // Sign In with Email & Password
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await syncUserData(userCredential.user);
      return userCredential;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // Sign In with Google
  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await syncUserData(userCredential.user);
      return userCredential;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // Sign Out
  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setIsAdmin(false);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // Refresh profile manually
  const refreshUserProfile = async () => {
    if (auth.currentUser) {
      await syncUserData(auth.currentUser);
    }
  };

  const value = {
    currentUser,
    userProfile,
    role: userProfile?.role || (isAdmin ? 'ADMIN' : 'USER'),
    isAdmin,
    loading,
    authError,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
