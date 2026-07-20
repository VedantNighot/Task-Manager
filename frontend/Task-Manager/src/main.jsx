import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axiosInstance from './utils/axiosinstance'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Helper to convert VAPID public key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Register Service Worker and subscribe to Push notifications
async function initPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);

      // Check if user is logged in (we only subscribe when token exists in localStorage)
      const token = localStorage.getItem('token');
      if (!token) return;

      // Ask for notification permissions if not granted yet
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
      }

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        // Fetch VAPID public key from backend
        const response = await axiosInstance.get('/api/notifications/vapid-key');
        const publicKey = response.data.publicKey;

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      }

      // Send the subscription details to the backend
      await axiosInstance.post('/api/notifications/subscribe', subscription);
      console.log('Successfully registered for Push Notifications!');
    } catch (err) {
      console.error('Push notification subscription setup failed:', err.message);
    }
  }
}

// Initialize when the page loads
window.addEventListener('load', () => {
  initPushNotifications();
});

// Expose it globally so we can trigger it upon login
window.initPushNotifications = initPushNotifications;
