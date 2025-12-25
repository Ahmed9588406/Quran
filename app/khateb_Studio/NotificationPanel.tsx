"use client";
import React, { useEffect, useRef } from "react";
import { X, Bell, Volume2, VolumeX, Trash2 } from "lucide-react";
import { useNotifications } from "../components/NotificationProvider";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, soundEnabled, markAsRead, markAllAsRead, clearAll, toggleSound } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "system_alert":
        return "bg-blue-50 border-blue-200";
      case "broadcast":
        return "bg-purple-50 border-purple-200";
      case "personal":
        return "bg-green-50 border-green-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "system_alert":
        return "🔔";
      case "broadcast":
        return "📢";
      case "personal":
        return "👤";
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      default:
        return "🔔";
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-16 right-4 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#FFF9F3] to-[#fff6f3]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#8A1538]" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white bg-[#ff6b6b]">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 text-xs font-medium text-[#8A1538] bg-[#FFF0F5] hover:bg-[#FFE0E8] rounded-lg transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              title={soundEnabled ? "Disable sound" : "Enable sound"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-gray-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                title="Clear all notifications"
              >
                <Trash2 className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Bell className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    notification.read ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#8A1538] flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
