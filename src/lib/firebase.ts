/**
 * Firebase Client Initialization & Singleton Instances
 *
 * Configured for Matager Cloud infrastructure with Cloud Firestore,
 * Firebase Authentication, and Realtime Database fallback.
 * Protected via environment variables with safe defaults.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getDatabase, type Database } from "firebase/database";

export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyDtR4bpaQkEpCmmKeIdmww9yckJmbqibHU",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "matager-f1f00.firebaseapp.com",
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    "https://matager-f1f00-default-rtdb.firebaseio.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "matager-f1f00",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "matager-f1f00.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "922824110897",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:922824110897:web:c96f9a90a2b2ff4a2e7610",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    "G-TVHBP63CSV",
};

// Singleton Firebase App instance
export const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Firebase Auth Instance
export const auth: Auth = getAuth(app);

// Cloud Firestore Instance (Primary Multi-Tenant E-Commerce Database)
export const db: Firestore = getFirestore(app);

// Realtime Database Instance (Available for low-latency telemetry if needed)
export const rtdb: Database = getDatabase(app);
