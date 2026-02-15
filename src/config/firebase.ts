// Firebase Configuration
// Get your config from: https://console.firebase.google.com/

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyCtIhaUnsTiq0qZNosp_f5lAHvqsQ5xozQ',
  authDomain: 'peace-play-official-d6c9e.firebaseapp.com',
  projectId: 'peace-play-official',
  storageBucket: 'peace-play-official.firebasestorage.app',
  messagingSenderId: '114417080075',
  appId: '1:114417080075:web:075aca46db66b8406ff40e',
  measurementId: undefined,
};

const legacyFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_LEGACY_FIREBASE_API_KEY || 'AIzaSyCMZn8sVtszG_gl1NHjbViAnPy6JVeCHvo',
  authDomain: process.env.NEXT_PUBLIC_LEGACY_FIREBASE_AUTH_DOMAIN || 'peace-script-ai.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_LEGACY_FIREBASE_PROJECT_ID || 'peace-script-ai',
  storageBucket: process.env.NEXT_PUBLIC_LEGACY_FIREBASE_STORAGE_BUCKET || 'peace-script-ai.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_LEGACY_FIREBASE_MESSAGING_SENDER_ID || '624211706340',
  appId: process.env.NEXT_PUBLIC_LEGACY_FIREBASE_APP_ID || '1:624211706340:web:b46101b954cd19535187f1',
  measurementId: process.env.NEXT_PUBLIC_LEGACY_FIREBASE_MEASUREMENT_ID || undefined,
};

// Initialize Firebase
// Singleton pattern for Next.js to prevent "Firebase App named '[DEFAULT]' already exists" errors
import { getApps, getApp } from 'firebase/app';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const legacyApp = getApps().find(existingApp => existingApp.name === 'legacy-peace-script')
  || initializeApp(legacyFirebaseConfig, 'legacy-peace-script');

// Initialize Services
export const auth = getAuth(app);
// Ensure auth state persists across redirects and reloads
setPersistence(auth, browserLocalPersistence).catch(() => {
  // If persistence fails (e.g. restricted environments), fall back to default
});
export const db = getFirestore(app);
export const legacyDb = getFirestore(legacyApp);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Analytics is optional and can break initialization in some environments/bundlers.
// Load it lazily only in the browser.
export let analytics: unknown | null = null;
if (typeof window !== 'undefined') {
  // Fire-and-forget: app should not depend on analytics to render.
  import('firebase/analytics')
    .then(async m => {
      // Prefer isSupported() when available.
      if (typeof m.isSupported === 'function') {
        const ok = await m.isSupported().catch(() => false);
        if (!ok) return;
      }
      analytics = m.getAnalytics(app);
    })
    .catch(() => {
      // ignore
    });
}

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export default app;
