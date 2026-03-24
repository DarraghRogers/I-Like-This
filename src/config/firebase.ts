import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';
import type { Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBNox9vAz5iPuD2y1ZLUwY-PQT7_d7SY9Q",
  authDomain: "i-like-this-32a33.firebaseapp.com",
  projectId: "i-like-this-32a33",
  storageBucket: "i-like-this-32a33.firebasestorage.app",
  messagingSenderId: "777241894142",
  appId: "1:777241894142:web:653e0f604ffba86bf619af"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// FCM — only available in browsers that support it (not SSR, not Firefox private, etc.)
let messagingInstance: Messaging | null = null;

export const getMessagingInstance = async (): Promise<Messaging | null> => {
  if (messagingInstance) return messagingInstance;
  const supported = await isSupported();
  if (supported) {
    messagingInstance = getMessaging(app);
  }
  return messagingInstance;
};

export default app;
