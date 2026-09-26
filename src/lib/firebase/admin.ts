import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Handle newlines in private key string
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Initialize only if not already initialized and config is present
export const customInitApp = () => {
  if (getApps().length <= 0) {
    if (firebaseAdminConfig.projectId && firebaseAdminConfig.privateKey) {
      initializeApp({
        credential: cert(firebaseAdminConfig),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    } else {
      console.warn("Firebase Admin missing credentials. Falling back to default app.");
      initializeApp({
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    }
  }
};

customInitApp();

export const adminDb = getDatabase();
