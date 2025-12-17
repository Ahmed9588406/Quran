/**
 * React Hook for Notifications
 * Provides easy integration of notification socket in React components
 */

import { useEffect, useState, useCallback } from 'react';
import { notificationSocket, Notification } from './notificationSocket';

interface UseNotificationsReturn {
  notifications: Notification[];
  isConnected: boolean;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  markAsRead: (notificationId: string) => void;
  removeNotification: (notificationId: string) => void;
}

/**
 * Hook to manage notifications
 * Automatically connects on mount and disconnects on unmount
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    if (!token) {
      console.warn('[useNotifications] No access token found');
      return;
    }

    // Connect to notification socket
    notificationSocket.connect(token).catch((error) => {
      console.error('[useNotifications] Failed to connect:', error);
    });

    // Subscribe to notifications
    const unsubscribeNotification = notificationSocket.onNotification((notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    // Subscribe to connection changes
    const unsubscribeConnection = notificationSocket.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeNotification();
      unsubscribeConnection();
      notificationSocket.disconnect();
    };
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
  }, []);

  return {
    notifications,
    isConnected,
    addNotification,
    clearNotifications,
    markAsRead,
    removeNotification,
  };
}
