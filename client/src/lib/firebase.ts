// src/lib/firebase.ts - Development version without persistence
//-----------------------------------------
// 1. Firebase & Firestore initialisation
//-----------------------------------------
import { initializeApp } from "firebase/app";
import {
  User as FirebaseUser,
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  disableNetwork,
  doc,
  enableNetwork,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";

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
// 3. Create app + simple Firestore instance (NO persistence for dev)
//-----------------------------------------
const app = initializeApp(firebaseConfig);

// For development: use simple getFirestore() without persistence
export const db = getFirestore(app);
export const auth = getAuth(app);

//-----------------------------------------
// 4. Google provider
//-----------------------------------------
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

//-----------------------------------------
// 5. User interface (typed timestamps)
//-----------------------------------------
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
  createdAt?: Timestamp;
  lastLoginAt?: Timestamp;
}

// Helper to convert Firestore Timestamp → JS Date (optional)
export const tsToDate = (ts?: Timestamp | null) =>
  ts ? ts.toDate() : null;

//-----------------------------------------
// 6. Convert FirebaseUser → User
//-----------------------------------------
export const convertFirebaseUser = async (
  firebaseUser: FirebaseUser
): Promise<User> => {
  const userRef = doc(db, "users", firebaseUser.uid);
  
  try {
    const snap = await getDoc(userRef);
    const data = snap.data();

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      isAdmin: data?.isAdmin || false,
      createdAt: data?.createdAt,
      lastLoginAt: data?.lastLoginAt,
    };
  } catch (error) {
    console.error("❌ Error fetching user document:", error);
    // Return basic user info if Firestore fails
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      isAdmin: false,
    };
  }
};

//-----------------------------------------
// 7. Create / update Firestore user doc
//-----------------------------------------
export const createUserDocument = async (
  user: FirebaseUser,
  additionalData: Record<string, unknown> = {}
): Promise<void> => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  
  try {
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = serverTimestamp();

      await setDoc(userRef, {
        displayName:
          displayName ||
          additionalData.username ||
          email?.split("@")[0] ||
          "",
        email,
        photoURL: photoURL || "",
        createdAt,
        lastLoginAt: createdAt,
        isAdmin: false,
        ...additionalData,
      });
    } else {
      // update lastLoginAt only
      await setDoc(
        userRef,
        { lastLoginAt: serverTimestamp() },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("❌ Error creating/updating user document:", error);
  }
};

//-----------------------------------------
// 8. Optional helpers to toggle network
//-----------------------------------------
export const goOffline = () => disableNetwork(db);
export const enableOnline = () => enableNetwork(db);