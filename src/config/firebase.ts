// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

// Firebase configuration for Suraksha LMS
const firebaseConfig = {
  apiKey: "AIzaSyA8-bs6QKh68evrW7QUW6_Azc64SAUnnYY",
  authDomain: "suraksha-ab3c0.firebaseapp.com",
  projectId: "suraksha-ab3c0",
  storageBucket: "suraksha-ab3c0.firebasestorage.app",
  messagingSenderId: "701726387829",
  appId: "1:701726387829:web:d01761e6a286c5f458d23c",
  measurementId: "G-7PJJ1LTLYW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: Messaging | null = null;

// Check if browser supports notifications
if (typeof window !== 'undefined' && 'Notification' in window) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase messaging initialization failed:', error);
  }
}

// VAPID key for web push from Firebase Console
export const VAPID_KEY = "BObBcaw81QVuCdX-xIWHudXvNsAu6p0z_9k2-gAMCRKUdnA3QLnkIlW1RBkxW2xeXo9c5l3z-AyEdcU-ybyGuvM";

export { app, messaging, getToken, onMessage };
