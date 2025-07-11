// src/lib/firebase.ts - Firebase Authentication only
//-----------------------------------------
// 1. Firebase Authentication initialisation
//-----------------------------------------
import { initializeApp } from "firebase/app";
import {
  User as FirebaseUser,
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

//------------------------------------------------------
// 2. Env‑driven config (Vite exposes import.meta.env.*)
//------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log("🔥 Firebase config loaded:", firebaseConfig);

//-----------------------------------------
// 3. Create app + Auth instance
//-----------------------------------------
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

//-----------------------------------------
// 4. Google provider
//-----------------------------------------
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

//-----------------------------------------
// 5. User interface (simplified without Firestore)
//-----------------------------------------
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
}

//-----------------------------------------
// 6. Convert FirebaseUser → User (simplified)
//-----------------------------------------
export const convertFirebaseUser = async (
  firebaseUser: FirebaseUser
): Promise<User> => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    isAdmin: false, // Default to false, can be managed through other means if needed
  };
};

//-----------------------------------------
// 7. Create user document (simplified - just returns void)
//-----------------------------------------
export const createUserDocument = async (
  user: FirebaseUser,
  additionalData: Record<string, unknown> = {}
): Promise<void> => {
  // No-op since we're not using Firestore
  // This function is kept for compatibility but doesn't do anything
  console.log("User document creation skipped (Firestore not used)");
};