// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqaPyYEv7PE34Njb1w8VFXdeU8UulCXmw",
  authDomain: "transcend-application-bot.firebaseapp.com",
  projectId: "transcend-application-bot",
  storageBucket: "transcend-application-bot.firebasestorage.app",
  messagingSenderId: "748353091728",
  appId: "1:748353091728:web:af973e8bec34c81f2e8015"
};

// Initialize Firebase only on the client side
let app;
let db: Firestore | null;
let auth: Auth | null;
let storage: FirebaseStorage | null;

if (typeof window !== 'undefined') {
  // Client-side initialization
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  // Server-side - provide mock objects
  app = null;
  db = null;
  auth = null;
  storage = null;
}

// Export conditionally
export { db, auth, storage };
export default app;