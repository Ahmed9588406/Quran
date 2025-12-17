/**
 * Notification Provider Component
 * Wraps the app to provide notification context
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from './useNotifications';
import { Notification } from './notificationSocket';

interface NotificationContextType {
  notifications: Notification[];
  isConnected: boolean;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  markAsRead: (notificationId: string) => void;
  removeNotification: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notificationState = useNotifications();

  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notification context
 */
export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}
