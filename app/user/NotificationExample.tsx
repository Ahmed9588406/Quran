"use client";
import React, { useEffect, useState } from "react";
import { useNotificationListener, addNotification, requestNotificationPermission } from "./useNotificationListener";
import { notificationService } from "./notificationService";
import { Bell, Volume2, VolumeX } from "lucide-react";

/**
 * Example component demonstrating the notification system
 * This shows how to:
 * 1. Listen for notifications
 * 2. Send notifications
 * 3. Control sound settings
 * 4. Show browser notifications
 */
export default function NotificationExample() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [testMessage, setTestMessage] = useState("Test notification message");

  // Listen for incoming notifications
  useNotificationListener((notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 10));
    console.log("New notification received:", notification);
  });

  // Initialize on mount
  useEffect(() => {
    setSoundEnabled(notificationService.getSoundEnabled());
    requestNotificationPermission();
  }, []);

  // Send a test notification
  const handleSendNotification = () => {
    addNotification({
      title: "Test Notification",
      message: testMessage,
      type: "system_alert",
    });

    // Also show a toast
    notificationService.showToast("Success", "Notification sent!");
  };

  // Toggle sound
  const handleToggleSound = () => {
    const newState = notificationService.toggleSound();
    setSoundEnabled(newState);
  };

  // Play test sound
  const handlePlaySound = () => {
    notificationService.playSound();
  };

  // Show browser notification
  const handleShowBrowserNotification = () => {
    notificationService.showBrowserNotification("Test Browser Notification", {
      message: "This is a browser notification",
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6" />
        Notification System Demo
      </h2>

      {/* Sound Control */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Sound Settings</h3>
          <button
            onClick={handleToggleSound}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {soundEnabled ? "Mute" : "Unmute"}
          </button>
        </div>
        <p className="text-sm text-gray-600">Sound is currently {soundEnabled ? "enabled" : "disabled"}</p>
      </div>

      {/* Test Sound */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <button
          onClick={handlePlaySound}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          🔊 Play Test Sound
        </button>
      </div>

      {/* Send Notification */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Send Test Notification</h3>
        <textarea
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg mb-3 text-sm"
          rows={3}
          placeholder="Enter notification message..."
        />
        <button
          onClick={handleSendNotification}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          📢 Send Notification
        </button>
      </div>

      {/* Browser Notification */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <button
          onClick={handleShowBrowserNotification}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
        >
          🌐 Show Browser Notification
        </button>
      </div>

      {/* Notifications List */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Recent Notifications ({notifications.length})</h3>
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500">No notifications yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-3 bg-white border border-gray-200 rounded-lg text-sm">
                <div className="font-semibold text-gray-900">{notif.title}</div>
                <div className="text-gray-600 mt-1">{notif.message}</div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(notif.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <h4 className="font-semibold mb-2">How to use:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Toggle sound to enable/disable notification sounds</li>
          <li>Click "Play Test Sound" to hear the notification sound</li>
          <li>Send test notifications to see them appear in the list</li>
          <li>Browser notifications require permission (check your browser settings)</li>
          <li>Open the admin console to send notifications from the backend</li>
        </ul>
      </div>
    </div>
  );
}
