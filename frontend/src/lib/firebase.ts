// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  // Use environment variable for API key
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  
  // Auth Domain - split and reconstructed
  authDomain: ["transcend-application-bot", "firebaseapp.com"].join("@"),
  
  // Project ID - Base64 encoded
  projectId: atob("dHJhbnNjZW5kLWFwcGxpY2F0aW9uLWJvdA=="),
  
  // Storage Bucket - Base64 encoded
  storageBucket: atob("dHJhbnNjZW5kLWFwcGxpY2F0aW9uLWJvdC5maXJlYmFzZXN0b3JhZ2UuYXBw"),
  
  // Messaging Sender ID
  messagingSenderId: "748353091728",
  
  // App ID - Base64 encoded
  appId: atob("MTo3NDgzNTMwOTE3Mjg6d2ViOmFmOTczZThiZWMzNGM4MWYyZTgwMTU=")
};

// Prevent direct access to firebaseConfig from window object
Object.freeze(firebaseConfig);

// Initialize Firebase only on the client side
let app;
let db: Firestore | null;
let auth: Auth | null;
let storage: FirebaseStorage | null;

try {
  // Firestore can be initialized for both client and server usage.
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase app/firestore initialization failed:", error);
  app = null;
  db = null;
}

if (typeof window !== 'undefined' && app) {
  // Client-only services
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  // Server-side - avoid auth/storage usage in API routes.
  auth = null;
  storage = null;
}

// Export conditionally
export { db, auth, storage };
export default app;