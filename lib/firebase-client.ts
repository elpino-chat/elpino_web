"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

// Public web config — safe to ship to the browser; Firebase's actual
// security boundary is the backend verifying the ID token, not this config.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function firebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

// Client-side Google popup — Firebase handles the OAuth dance entirely in
// the browser. The ID token it hands back is verified server-side (see
// apps/auth-service/src/auth/firebase-admin.util.ts) before anything is
// trusted; this function's return value is not itself proof of identity.
export async function signInWithGooglePopup(): Promise<string> {
  const auth = getAuth(firebaseApp());
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user.getIdToken();
}
