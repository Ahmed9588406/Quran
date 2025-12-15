/**
 * Notification Service
 * Handles all notification-related operations including audio, browser notifications, and storage
 */

export interface NotificationOptions {
  title: string;
  message: string;
  type?: "system_alert" | "broadcast" | "personal";
  soundEnabled?: boolean;
  showBrowserNotification?: boolean;
  duration?: number; // Auto-dismiss duration in ms
}

class NotificationService {
  private audioContext: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private readonly SOUND_ENABLED_KEY = "notification_sound_enabled";
  private readonly NOTIFICATION_KEY = "admin_notifications";

  constructor() {
    this.soundEnabled = this.getSoundEnabled();
    this.initAudioContext();
  }

  /**
   * Initialize Web Audio API context
   */
  private initAudioContext() {
    if (typeof window !== "undefined" && !this.audioContext) {
      try {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      } catch (error) {
        console.warn("Web Audio API not supported:", error);
      }
    }
  }

  /**
   * Play a notification sound with two beeps
   */
  playSound(frequency1: number = 800, frequency2: number = 1000, duration: number = 0.1) {
    if (!this.soundEnabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;
      const now = ctx.currentTime;

      // First beep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.frequency.value = frequency1;
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc1.start(now);
      osc1.stop(now + duration);

      // Second beep (delayed)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.frequency.value = frequency2;
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + duration);
      }, 150);
    } catch (error) {
      console.error("Failed to play notification sound:", error);
    }
  }

  /**
   * Show a browser notification
   */
  showBrowserNotification(title: string, options?: NotificationOptions) {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission !== "granted") {
      return;
    }

    try {
      new Notification(title, {
        body: options?.message,
        icon: "/figma-assets/logo_wesal.png",
        tag: `notif_${Date.now()}`,
        requireInteraction: false,
      });
    } catch (error) {
      console.error("Failed to show browser notification:", error);
    }
  }

  /**
   * Request browser notification permission
   */
  requestPermission() {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  /**
   * Send a complete notification (sound + browser notification)
   */
  notify(options: NotificationOptions) {
    const { title, message, soundEnabled = this.soundEnabled, showBrowserNotification = true } = options;

    // Play sound
    if (soundEnabled) {
      this.playSound();
    }

    // Show browser notification
    if (showBrowserNotification) {
      this.showBrowserNotification(title, options);
    }

    // Log notification
    console.log(`[Notification] ${title}: ${message}`);
  }

  /**
   * Get sound enabled state
   */
  getSoundEnabled(): boolean {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(this.SOUND_ENABLED_KEY) !== "false";
  }

  /**
   * Set sound enabled state
   */
  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem(this.SOUND_ENABLED_KEY, enabled ? "true" : "false");
    }
  }

  /**
   * Toggle sound
   */
  toggleSound(): boolean {
    this.setSoundEnabled(!this.soundEnabled);
    return this.soundEnabled;
  }

  /**
   * Create a toast-like notification (visual only)
   */
  showToast(title: string, message: string, duration: number = 5000) {
    if (typeof window === "undefined") return;

    const toast = document.createElement("div");
    toast.className =
      "fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4";
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <div class="font-semibold text-blue-900">${title}</div>
          <div class="text-sm text-blue-800 mt-1">${message}</div>
        </div>
        <button class="text-blue-600 hover:text-blue-900 text-lg leading-none">&times;</button>
      </div>
    `;

    document.body.appendChild(toast);

    const closeBtn = toast.querySelector("button");
    const remove = () => {
      toast.style.animation = "fadeOut 0.3s ease-out";
      setTimeout(() => toast.remove(), 300);
    };

    closeBtn?.addEventListener("click", remove);
    setTimeout(remove, duration);
  }

  /**
   * Get all notifications from storage
   */
  getNotifications() {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(this.NOTIFICATION_KEY) || "[]");
    } catch {
      return [];
    }
  }

  /**
   * Clear all notifications
   */
  clearNotifications() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.NOTIFICATION_KEY);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export for use in components
export default notificationService;
