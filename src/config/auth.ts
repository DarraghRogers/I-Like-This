import { useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useAuthStore } from '../stores/authStore';

export const useAuthContext = () => {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Set user and stop loading IMMEDIATELY - don't wait for Firestore
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoading(false); // App is ready to show!
        
        // Fetch profile in background
        fetchOrCreateProfile(firebaseUser.uid, firebaseUser, setProfile);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setLoading]);
};

// Background function - doesn't block UI
async function fetchOrCreateProfile(
  uid: string,
  firebaseUser: any,
  setProfile: (profile: any) => void
) {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      setProfile(userDocSnap.data() as any);
    } else {
      // Create new user profile
      const newProfile = {
        uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
      };
      await setDoc(userDocRef, newProfile);
      setProfile(newProfile);
    }
  } catch (error) {
    console.error('Error fetching/creating profile:', error);
    // Silently fail - user can still use the app
  }
}

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Google login failed:', error);
    throw error;
  }
};

export const loginWithGitHub = async () => {
  const provider = new GithubAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('GitHub login failed:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};
