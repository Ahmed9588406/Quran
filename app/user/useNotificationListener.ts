import { useEffect, useCallback, useRef } from "react";

export type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: "system_alert" | "broadcast" | "personal";
  timestamp: number;
  read: boolean;
  soundEnabled?: boolean;
};

type NotificationCallback = (notification: AdminNotification) => void;

const NOTIFICATION_KEY = "admin_notifications";
const MAX_NOTIFICATIONS = 50;
const SOUND_ENABLED_KEY = "notification_sound_enabled";

// Create notification sound
const createNotificationSound = (): HTMLAudioElement => {
  const audio = new Audio();
  // Using a data URL for a simple beep sound (you can replace with your own audio file)
  audio.src = "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==";
  audio.volume = 0.5;
  return audio;
};

// Alternative: Use Web Audio API to generate a notification sound
const playNotificationSound = async () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a pleasant notification sound (two beeps)
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);

    // Second beep
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

export function useNotificationListener(onNotification?: NotificationCallback) {
  const callbackRef = useRef(onNotification);
  const lastNotificationIdRef = useRef<string>("");

  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    // Listen for notifications from the admin console via localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === NOTIFICATION_KEY && e.newValue) {
        try {
          const notifications = JSON.parse(e.newValue) as AdminNotification[];
          if (notifications.length > 0) {
            const latestNotification = notifications[notifications.length - 1];
            
            // Only trigger if it's a new notification
            if (latestNotification.id !== lastNotificationIdRef.current) {
              lastNotificationIdRef.current = latestNotification.id;
              
              // Play sound if enabled
              const soundEnabled = localStorage.getItem(SOUND_ENABLED_KEY) !== "false";
              if (soundEnabled) {
                playNotificationSound();
              }

              // Show browser notification if permitted
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification(latestNotification.title, {
                  body: latestNotification.message,
                  icon: "/figma-assets/logo_wesal.png",
                  tag: latestNotification.id,
                });
              }

              callbackRef.current?.(latestNotification);
            }
          }
        } catch (error) {
          console.error("Failed to parse notification:", error);
        }
      }
    };

    // Also check for notifications sent via WebSocket or Server-Sent Events
    const handleNotificationMessage = (event: MessageEvent) => {
      if (event.data.type === "admin_notification") {
        const notification = event.data.payload as AdminNotification;
        
        if (notification.id !== lastNotificationIdRef.current) {
          lastNotificationIdRef.current = notification.id;
          
          // Play sound if enabled
          const soundEnabled = localStorage.getItem(SOUND_ENABLED_KEY) !== "false";
          if (soundEnabled) {
            playNotificationSound();
          }

          callbackRef.current?.(notification);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("message", handleNotificationMessage);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("message", handleNotificationMessage);
    };
  }, []);
}

export function addNotification(notification: Omit<AdminNotification, "id" | "timestamp" | "read">) {
  try {
    const existing = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || "[]") as AdminNotification[];
    const newNotification: AdminNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
      soundEnabled: localStorage.getItem(SOUND_ENABLED_KEY) !== "false",
    };

    const updated = [newNotification, ...existing].slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));

    // Play sound if enabled
    const soundEnabled = localStorage.getItem(SOUND_ENABLED_KEY) !== "false";
    if (soundEnabled) {
      playNotificationSound();
    }

    // Show browser notification if permitted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: "/figma-assets/logo_wesal.png",
        tag: newNotification.id,
      });
    }

    // Trigger storage event for other tabs
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: NOTIFICATION_KEY,
        newValue: JSON.stringify(updated),
        oldValue: JSON.stringify(existing),
      })
    );
  } catch (error) {
    console.error("Failed to add notification:", error);
  }
}

export function getNotifications(): AdminNotification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || "[]");
  } catch {
    return [];
  }
}

export function markAsRead(notificationId: string) {
  try {
    const notifications = getNotifications();
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
}

export function clearNotifications() {
  try {
    localStorage.removeItem(NOTIFICATION_KEY);
  } catch (error) {
    console.error("Failed to clear notifications:", error);
  }
}

export function isSoundEnabled(): boolean {
  return localStorage.getItem(SOUND_ENABLED_KEY) !== "false";
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem(SOUND_ENABLED_KEY, enabled ? "true" : "false");
}

export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}
