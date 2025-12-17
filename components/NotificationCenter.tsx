/**
 * Notification Center Component
 * Displays notifications in a toast-like format
 */

'use client';

import React, { useState, useEffect } from 'react';
import { notificationSocket } from '@/lib/notifications/notificationSocket';
import { X, Bell, AlertCircle, MessageSquare, Heart, UserPlus } from 'lucide-react';

interface ToastNotification {
  id: string;
  notification: any;
  visible: boolean;
}

export function NotificationCenter() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Connect to WebSocket on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    console.log('[NotificationCenter] Initializing, token exists:', !!token);
    
    if (token && !notificationSocket.isConnected()) {
      console.log('[NotificationCenter] Connecting to WebSocket...');
      notificationSocket.connect(token).catch((error) => {
        console.error('[NotificationCenter] Failed to connect:', error);
      });
    }

    // Subscribe to connection changes
    const unsubscribeConnection = notificationSocket.onConnectionChange((connected) => {
      console.log('[NotificationCenter] Connection status changed:', connected);
      setIsConnected(connected);
    });

    // Subscribe to notifications
    const unsubscribeNotification = notificationSocket.onNotification((notification) => {
      console.log('[NotificationCenter] Received notification from socket:', notification);
    });

    return () => {
      console.log('[NotificationCenter] Cleaning up');
      unsubscribeConnection();
      unsubscribeNotification();
    };
  }, []);

  // Listen for WebSocket notifications
  useEffect(() => {
    const handleNotification = (event: Event) => {
      console.log('[NotificationCenter] Received websocket-notification event:', event);
      const customEvent = event as CustomEvent;
      const notification = customEvent.detail;

      console.log('[NotificationCenter] Notification detail:', notification);

      if (notification && notification.title) {
        console.log('[NotificationCenter] Creating toast for notification:', notification);
        const newToast: ToastNotification = {
          id: notification.id,
          notification: notification,
          visible: true,
        };

        setToasts((prev) => {
          const updated = [newToast, ...prev].slice(0, 5);
          console.log('[NotificationCenter] Updated toasts:', updated);
          return updated;
        });

        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
          setToasts((prev) =>
            prev.map((t) =>
              t.id === newToast.id ? { ...t, visible: false } : t
            )
          );
        }, 5000);

        return () => clearTimeout(timer);
      } else {
        console.warn('[NotificationCenter] Invalid notification:', notification);
      }
    };

    console.log('[NotificationCenter] Setting up websocket-notification listener');
    window.addEventListener('websocket-notification', handleNotification);
    return () => {
      console.log('[NotificationCenter] Removing websocket-notification listener');
      window.removeEventListener('websocket-notification', handleNotification);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-5 h-5" />;
      case 'like':
        return <Heart className="w-5 h-5" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'system_alert':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'system_alert':
        return 'bg-red-50 border-red-200';
      case 'follow':
        return 'bg-blue-50 border-blue-200';
      case 'like':
        return 'bg-pink-50 border-pink-200';
      case 'comment':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'system_alert':
        return 'text-red-800';
      case 'follow':
        return 'text-blue-800';
      case 'like':
        return 'text-pink-800';
      case 'comment':
        return 'text-purple-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-40">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
            isConnected
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-600' : 'bg-yellow-600'
            }`}
          />
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`transform transition-all duration-300 ${
              toast.visible
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0'
            }`}
          >
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${getBackgroundColor(
                toast.notification.type
              )}`}
            >
              <div className={`flex-shrink-0 ${getTextColor(toast.notification.type)}`}>
                {getIcon(toast.notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm ${getTextColor(toast.notification.type)}`}>
                  {toast.notification.title}
                </h3>
                <p className={`text-sm mt-1 ${getTextColor(toast.notification.type)} opacity-90`}>
                  {toast.notification.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className={`flex-shrink-0 ${getTextColor(toast.notification.type)} hover:opacity-70`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
