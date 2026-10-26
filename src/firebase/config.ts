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
      if (auth.currentUser) {
        try {
          await signOut(auth);
          await getDocFromServer(doc(db, 'test', 'connection'));
          return;
        } catch (_) {}
      }
      console.error('Please check your Firebase configuration.');
    }
  }
}

export async function loginWithGoogle(): Promise<{ user: any; error?: string; code?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  } catch (error: any) {
    const code = error?.code || 'auth/unknown';
    let message = error?.message || 'Google sign-in could not be completed.';
    if (code === 'auth/popup-blocked') {
      message = 'Popup was blocked by your browser. Please allow popups or use the Owner PIN to sign in.';
    } else if (code === 'auth/popup-closed-by-user') {
      message = 'Sign-in popup was closed before completing.';
    } else if (code === 'auth/unauthorized-domain') {
      message = 'This preview domain is not in Firebase authorized domains. Please sign in with the Owner PIN.';
    } else if (message.includes('token-service-api') || message.includes('securetoken')) {
      message = 'Google Token Service API is disabled on project 969664109416. Enable it at https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=969664109416 or use the Owner PIN below.';
    }
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
