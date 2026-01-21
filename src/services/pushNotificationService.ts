// src/services/pushNotificationService.ts
import { messaging, getToken, onMessage, VAPID_KEY } from '../config/firebase';
import { apiClient } from '../api/client';

// Device type enum matching backend
export enum DeviceType {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web'
}

interface FcmTokenPayload {
  userId: string;
  fcmToken: string;
  deviceId: string;
  deviceType: DeviceType;
  deviceName?: string;
  appVersion?: string;
  osVersion?: string;
  isActive?: boolean;
}

interface FcmTokenResponse {
  id: string;
  userId: string;
  fcmToken: string;
  deviceId: string;
  deviceType: DeviceType;
  deviceName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class PushNotificationService {
  private fcmToken: string | null = null;
  private deviceId: string | null = null;

  /**
   * Generate a unique device ID
   */
  private generateDeviceId(): string {
    let deviceId = localStorage.getItem('suraksha_device_id');
    if (!deviceId) {
      deviceId = 'web_' + crypto.randomUUID();
      localStorage.setItem('suraksha_device_id', deviceId);
    }
    return deviceId;
  }

  /**
   * Get browser/device information
   */
  private getDeviceInfo(): { deviceName: string; osVersion: string } {
    const userAgent = navigator.userAgent;
    let deviceName = 'Unknown Browser';
    let osVersion = 'Unknown OS';

    // Detect browser
    if (userAgent.includes('Chrome')) {
      deviceName = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      deviceName = 'Firefox';
    } else if (userAgent.includes('Safari')) {
      deviceName = 'Safari';
    } else if (userAgent.includes('Edge')) {
      deviceName = 'Edge';
    }

    // Detect OS
    if (userAgent.includes('Windows')) {
      osVersion = 'Windows';
    } else if (userAgent.includes('Mac OS')) {
      osVersion = 'macOS';
    } else if (userAgent.includes('Linux')) {
      osVersion = 'Linux';
    } else if (userAgent.includes('Android')) {
      osVersion = 'Android';
    } else if (userAgent.includes('iOS')) {
      osVersion = 'iOS';
    }

    return { deviceName, osVersion };
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && messaging !== null;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission === 'granted';
  }

  /**
   * Get FCM token from Firebase
   */
  async getFcmToken(): Promise<string | null> {
    if (!messaging) {
      console.warn('Firebase messaging not initialized');
      return null;
    }

    try {
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (currentToken) {
        console.log('FCM Token obtained:', currentToken.substring(0, 20) + '...');
        this.fcmToken = currentToken;
        return currentToken;
      } else {
        console.warn('No FCM token available. Request permission first.');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Register FCM token with backend
   * Call this after user logs in
   */
  async registerToken(userId: string): Promise<FcmTokenResponse | null> {
    // Step 1: Request permission
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Notification permission denied');
      return null;
    }

    // Step 2: Get FCM token
    const fcmToken = await this.getFcmToken();
    if (!fcmToken) {
      console.error('Failed to get FCM token');
      return null;
    }

    // Step 3: Prepare payload
    this.deviceId = this.generateDeviceId();
    const { deviceName, osVersion } = this.getDeviceInfo();

    const payload: FcmTokenPayload = {
      userId,
      fcmToken,
      deviceId: this.deviceId,
      deviceType: DeviceType.WEB,
      deviceName,
      osVersion,
      appVersion: '1.0.0',
      isActive: true
    };

    // Step 4: Send to backend
    try {
      const response = await apiClient.post<FcmTokenResponse>(
        '/users/fcm-tokens',
        payload
      );

      console.log('FCM token registered successfully:', response);
      
      // Store token ID for later use (e.g., logout)
      if (response?.id) {
        localStorage.setItem('fcm_token_id', response.id);
      }
      
      return response;
    } catch (error) {
      console.error('Failed to register FCM token:', error);
      return null;
    }
  }

  /**
   * Unregister FCM token when user logs out
   */
  async unregisterToken(): Promise<boolean> {
    const tokenId = localStorage.getItem('fcm_token_id');
    
    if (!tokenId) {
      console.warn('No FCM token ID found to unregister');
      return false;
    }

    try {
      await apiClient.delete(`/users/fcm-tokens/${tokenId}`);
      console.log('FCM token unregistered successfully');
      this.fcmToken = null;
      localStorage.removeItem('fcm_token_id');
      return true;
    } catch (error) {
      console.error('Failed to unregister FCM token:', error);
      return false;
    }
  }

  /**
   * Listen for foreground messages
   */
  onForegroundMessage(callback: (payload: any) => void): () => void {
    if (!messaging) {
      console.warn('Firebase messaging not initialized');
      return () => {};
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });

    return unsubscribe;
  }

  /**
   * Get stored FCM token
   */
  getStoredToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Get stored device ID
   */
  getStoredDeviceId(): string | null {
    return localStorage.getItem('suraksha_device_id');
  }
}

export const pushNotificationService = new PushNotificationService();
