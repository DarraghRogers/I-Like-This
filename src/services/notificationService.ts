import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db, getMessagingInstance } from '../config/firebase';

// VAPID key from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
// Generate one at: https://console.firebase.google.com/project/i-like-this-32a33/settings/cloudmessaging
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

export type NotificationStatus = 'default' | 'granted' | 'denied' | 'unsupported';

export const getNotificationStatus = async (): Promise<NotificationStatus> => {
  const messaging = await getMessagingInstance();
  if (!messaging || !('Notification' in window)) return 'unsupported';
  return Notification.permission as NotificationStatus;
};

export const requestNotificationPermission = async (userId: string): Promise<boolean> => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      await saveToken(userId, token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const saveToken = async (userId: string, token: string): Promise<void> => {
  try {
    const tokenRef = doc(db, 'fcmTokens', `${userId}_${token}`);
    await setDoc(tokenRef, {
      userId,
      token,
      createdAt: Timestamp.now(),
      platform: detectPlatform(),
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

export const removeToken = async (userId: string): Promise<void> => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return;

    const swRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (swRegistration) {
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });
      if (token) {
        await deleteDoc(doc(db, 'fcmTokens', `${userId}_${token}`));
      }
    }
  } catch (error) {
    console.error('Error removing FCM token:', error);
  }
};

export const isUserSubscribed = async (userId: string): Promise<boolean> => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging || Notification.permission !== 'granted') return false;

    const swRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!swRegistration) return false;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });
    if (!token) return false;

    const tokenDoc = await getDoc(doc(db, 'fcmTokens', `${userId}_${token}`));
    return tokenDoc.exists();
  } catch {
    return false;
  }
};

export const setupForegroundNotifications = async (
  onNotification: (title: string, body: string) => void
): Promise<(() => void) | null> => {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  const unsubscribe = onMessage(messaging, (payload) => {
    const title = payload.notification?.title || 'I Like This!';
    const body = payload.notification?.body || '';
    onNotification(title, body);
  });

  return unsubscribe;
};

const detectPlatform = (): string => {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  return 'web';
};
