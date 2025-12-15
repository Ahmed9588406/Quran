"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { X, Bell, Volume2, VolumeX } from "lucide-react";

export type GlobalNotification = {
  id: string;
  title: string;
  message: string;
  type: "system_alert" | "broadcast" | "personal" | "success" | "error" | "info";
  timestamp: number;
  read: boolean;
};

type NotificationContextType = {
  notifications: GlobalNotification[];
  unreadCount: number;
  soundEnabled: boolean;
  addNotification: (notification: Omit<GlobalNotification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  toggleSound: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

const NOTIFICATION_KEY = "admin_notifications";
const SOUND_ENABLED_KEY = "notification_sound_enabled";
const MAX_NOTIFICATIONS = 50;

// Play notification sound using Web Audio API
const playNotificationSound = async () => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);

    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);

      osc2.frequency.value = 1000;
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.1);
    }, 150);
  } catch (error) {
    console.error("Failed to play notification sound:", error);
  }
};

// Toast notification component
function NotificationToast({
  notification,
  onClose,
  onRead,
}: {
  notification: GlobalNotification;
  onClose: () => void;
  onRead: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    system_alert: "bg-blue-500",
    broadcast: "bg-purple-500",
    personal: "bg-green-500",
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[notification.type] || "bg-blue-500";

  return (
    <div
      className={`${bgColor} text-white rounded-lg shadow-2xl p-4 max-w-sm w-full animate-slide-in cursor-pointer transform transition-all hover:scale-[1.02]`}
      onClick={() => {
        onRead();
        onClose();
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{notification.title}</p>
          <p className="text-sm opacity-90 mt-1 line-clamp-2">{notification.message}</p>
          <p className="text-xs opacity-75 mt-2">Just now</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
  const [toasts, setToasts] = useState<GlobalNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
      setSoundEnabled(localStorage.getItem(SOUND_ENABLED_KEY) !== "false");
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  }, []);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === NOTIFICATION_KEY && e.newValue) {
        try {
          const newNotifications = JSON.parse(e.newValue) as GlobalNotification[];
          const currentIds = new Set(notifications.map((n) => n.id));
          
          // Find new notifications
          const brandNew = newNotifications.filter((n) => !currentIds.has(n.id));
          
          if (brandNew.length > 0) {
            // Show toast for new notifications
            setToasts((prev) => [...prev, ...brandNew]);
            
            // Play sound
            if (soundEnabled) {
              playNotificationSound();
            }

            // Show browser notification
            if ("Notification" in window && Notification.permission === "granted") {
              brandNew.forEach((n) => {
                new Notification(n.title, {
                  body: n.message,
                  icon: "/figma-assets/logo_wesal.png",
                  tag: n.id,
                });
              });
            }
          }
          
          setNotifications(newNotifications);
        } catch (error) {
          console.error("Failed to parse notifications:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [notifications, soundEnabled]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const addNotification = useCallback(
    (notification: Omit<GlobalNotification, "id" | "timestamp" | "read">) => {
      const newNotification: GlobalNotification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
        localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
        
        // Trigger storage event for other tabs
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: NOTIFICATION_KEY,
            newValue: JSON.stringify(updated),
            oldValue: JSON.stringify(prev),
          })
        );
        
        return updated;
      });

      // Show toast
      setToasts((prev) => [...prev, newNotification]);

      // Play sound
      if (soundEnabled) {
        playNotificationSound();
      }

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: "/figma-assets/logo_wesal.png",
          tag: newNotification.id,
        });
      }
    },
    [soundEnabled]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(NOTIFICATION_KEY);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem(SOUND_ENABLED_KEY, newValue ? "true" : "false");
      return newValue;
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        soundEnabled,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        toggleSound,
      }}
    >
      {children}

      {/* Toast Container - Fixed position, visible on all screens */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <NotificationToast
              notification={toast}
              onClose={() => removeToast(toast.id)}
              onRead={() => markAsRead(toast.id)}
            />
          </div>
        ))}
      </div>

      {/* Global styles for animation */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
