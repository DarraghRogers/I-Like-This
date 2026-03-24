/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBNox9vAz5iPuD2y1ZLUwY-PQT7_d7SY9Q",
  authDomain: "i-like-this-32a33.firebaseapp.com",
  projectId: "i-like-this-32a33",
  storageBucket: "i-like-this-32a33.firebasestorage.app",
  messagingSenderId: "777241894142",
  appId: "1:777241894142:web:653e0f604ffba86bf619af"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};

  self.registration.showNotification(title || 'I Like This!', {
    body: body || 'Something new happened in your community!',
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: payload.data,
    tag: payload.data?.type || 'general',
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/');
    })
  );
});
