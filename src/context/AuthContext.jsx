import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth } from '../services/firebase';
import Preloader from '../components/ui/Preloader';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minDelayComplete, setMinDelayComplete] = useState(false);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  function loginWithGithub() {
    const provider = new GithubAuthProvider();
    return signInWithPopup(auth, provider);
  }

  function logout() {
    return signOut(auth);
  }

  // Update the user's display name and refresh auth state without reloading
  const updateUserDisplayName = useCallback(async (name) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName: name.trim() });
    // Re-read the updated user from Firebase Auth and sync to React state
    setCurrentUser({ ...auth.currentUser });
  }, []);

  useEffect(() => {
    const minimumUXDelay = setTimeout(() => {
      setMinDelayComplete(true);
    }, 300);

    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      clearTimeout(minimumUXDelay);
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    loginWithGoogle,
    loginWithGithub,
    logout,
    updateUserDisplayName
  };

  return (
    <AuthContext.Provider value={value}>
      {(loading || !minDelayComplete) ? <Preloader /> : children}
    </AuthContext.Provider>
  );
}
