import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;

  // Check if Firebase config is provided
  if (!firebaseConfig.apiKey) {
    return null;
  }

  try {
    if (!app) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }
    return app;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  try {
    if (!auth) {
      auth = getAuth(firebaseApp);
    }
    return auth;
  } catch (error) {
    console.error('Failed to get Firebase Auth:', error);
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey);
}
