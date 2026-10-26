import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline status check:', error.message);
    }
  }
}

export async function loginWithGoogle(): Promise<{ user: any; error?: string; code?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  } catch (error: any) {
    const code = error?.code || 'auth/unknown';
    const message = error?.message || 'Google sign-in could not be completed.';
    console.warn(`Firebase Google Sign-In Status (${code}):`, message);
    return { user: null, error: message, code };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}
