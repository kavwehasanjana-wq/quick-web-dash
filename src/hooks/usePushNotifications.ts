// src/hooks/usePushNotifications.ts
import { useEffect, useState, useCallback } from 'react';
import { pushNotificationService } from '../services/pushNotificationService';
import { useAuth } from '@/contexts/AuthContext';

interface PushNotificationPayload {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
    image?: string;
  };
  data?: {
    notificationId?: string;
    actionUrl?: string;
    scope?: string;
    instituteId?: string;
    [key: string]: string | undefined;
  };
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [latestNotification, setLatestNotification] = useState<PushNotificationPayload | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

  // Check permission status on mount
  useEffect(() => {
    setPermissionStatus(pushNotificationService.getPermissionStatus());
  }, []);

  // Register FCM token when user is logged in
  useEffect(() => {
    if (!user?.id) {
      setIsRegistered(false);
      return;
    }

    const registerToken = async () => {
      try {
        const result = await pushNotificationService.registerToken(user.id);
        if (result) {
          setIsRegistered(true);
          setPermissionStatus('granted');
          console.log('✅ Push notifications registered successfully');
        }
      } catch (error) {
        console.error('Failed to register push notifications:', error);
      }
    };

    // Only register if permission is granted or default (will prompt)
    if (permissionStatus !== 'denied') {
      registerToken();
    }
  }, [user?.id, permissionStatus]);

  // Listen for foreground messages
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = pushNotificationService.onForegroundMessage((payload) => {
      console.log('📬 New notification received:', payload);
      setLatestNotification(payload);
      setShowToast(true);

      // Auto-hide toast after 5 seconds
      setTimeout(() => setShowToast(false), 5000);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  const dismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const handleNotificationClick = useCallback(() => {
    if (latestNotification?.data?.actionUrl) {
      window.location.href = latestNotification.data.actionUrl;
    }
    dismissToast();
  }, [latestNotification, dismissToast]);

  const requestPermission = useCallback(async () => {
    const granted = await pushNotificationService.requestPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    return granted;
  }, []);

  return {
    latestNotification,
    showToast,
    dismissToast,
    handleNotificationClick,
    isRegistered,
    permissionStatus,
    requestPermission,
    isSupported: pushNotificationService.isSupported()
  };
};
