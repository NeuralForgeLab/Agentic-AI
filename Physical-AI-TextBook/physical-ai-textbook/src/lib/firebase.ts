import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Firebase configuration - hardcoded for client-side use
// These are public Firebase config values (safe to expose)
const firebaseConfig = {
  apiKey: "AIzaSyBJ9SFgWa_PwAMsljzI0IGPsXfCuKV2OD0",
  authDomain: "physical-ai-textbook-d5909.firebaseapp.com",
  projectId: "physical-ai-textbook-d5909",
  storageBucket: "physical-ai-textbook-d5909.firebasestorage.app",
  messagingSenderId: "26476153084",
  appId: "1:26476153084:web:e1f96cc5809c2b27ceaf79",
};

// Initialize Firebase only on client side and only once
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

export const initializeFirebase = () => {
  if (typeof window !== "undefined" && !app) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth, db };
};

// Auto-initialize on import (client-side only)
if (typeof window !== "undefined") {
  initializeFirebase();
}

export { app, auth, db };
export default app;
