"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { useNotifications } from "../components/NotificationProvider";
import { Volume2, VolumeX, Trash2 } from "lucide-react";

type NotificationItem = {
  id: string;
  name: string;
  avatar: string;
  text: string;
  time: string;
  showFollow?: boolean;
  showActions?: boolean;
  type?: "reply" | "message";
};

export default function NotificationPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { notifications: adminNotifications, soundEnabled, toggleSound, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  if (!isOpen) return null;

  // New notifications (top section)
  const newItems: NotificationItem[] = [
    {
      id: "n1",
      name: "Mazen Mohamed",
      avatar: "https://i.pravatar.cc/80?img=10",
      text: "Commented on your post",
      time: "Now",
      type: "reply",
    },
    {
      id: "n2",
      name: "Sara Ali",
      avatar: "https://i.pravatar.cc/80?img=11",
      text: "Sent you a message",
      time: "5m",
      type: "message",
    },
    {
      id: "n3",
      name: "Omar Faruk",
      avatar: "https://i.pravatar.cc/80?img=12",
      text: "Commented on your post",
      time: "10m",
      showFollow: true,
      type: "reply",
    },
    {
      id: "n4",
      name: "Layla Noor",
      avatar: "https://i.pravatar.cc/80?img=13",
      text: "Shared your story",
      time: "12m",
      showActions: true,
      type: "message",
    },
    {
      id: "n5",
      name: "Hadi Z",
      avatar: "https://i.pravatar.cc/80?img=14",
      text: "Commented on your post",
      time: "21m",
      type: "reply",
    },
  ];

  // Yesterday's notifications (second section)
  const yesterdayItems: NotificationItem[] = [
    {
      id: "y1",
      name: "Mazen Mohamed",
      avatar: "https://i.pravatar.cc/80?img=15",
      text: "Commented on your post",
      time: "Yesterday",
      type: "reply",
    },
    {
      id: "y2",
      name: "Nadia Khan",
      avatar: "https://i.pravatar.cc/80?img=16",
      text: "Commented on your post",
      time: "Yesterday",
      type: "reply",
    },
    {
      id: "y3",
      name: "Bilal Y",
      avatar: "https://i.pravatar.cc/80?img=17",
      text: "Commented on your post",
      time: "Yesterday",
      showFollow: true,
      type: "reply",
    },
    {
      id: "y4",
      name: "Rana S",
      avatar: "https://i.pravatar.cc/80?img=18",
      text: "Commented on your post",
      time: "Yesterday",
      showActions: true,
      type: "reply",
    },
    {
      id: "y5",
      name: "Zed M",
      avatar: "https://i.pravatar.cc/80?img=19",
      text: "Sent you a message",
      time: "Yesterday",
      type: "message",
    },
  ];

  const renderItem = (it: NotificationItem) => (
    <div key={it.id} className="flex items-start gap-3">
      <div className="relative w-12 h-12 flex-shrink-0">
        <div className="rounded-full overflow-hidden w-12 h-12 bg-gray-100">
          <Image
            src={it.avatar}
            alt={it.name}
            width={48}
            height={48}
            style={{ objectFit: "cover" }}
          />
        </div>

        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center">
          <Image
            src={
              it.type === "reply" ||
              it.text.toLowerCase().includes("comment")
                ? "/icons/comment_reply.svg"
                : "/icons/messsage.svg"
            }
            alt={it.type === "reply" ? "reply" : "message"}
            width={16}
            height={16}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{it.name}</div>
            <div className="text-sm text-gray-700">{it.text}</div>
            <div className="text-xs text-gray-400 mt-1">{it.time}</div>
          </div>

          <div className="flex-shrink-0">
            {it.showFollow ? (
              <button className="inline-flex items-center justify-center bg-[#7b2030] text-white px-4 py-2 rounded-md text-sm">
                Follow back
              </button>
            ) : it.showActions ? (
              <div className="flex gap-2">
                <button className="inline-flex items-center justify-center bg-[#7b2030] text-white px-4 py-2 rounded-md text-sm">
                  Follow back
                </button>
                <button className="inline-flex items-center justify-center bg-white border border-[#f0e6e5] text-[#7b2030] px-4 py-2 rounded-md text-sm">
                  Delete
                </button>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-md bg-white/60 border border-[#f0e6e5]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Separate admin notifications and regular notifications
  const adminNotifsSorted = [...adminNotifications].sort(
    (a, b) => b.timestamp - a.timestamp
  );
  const unreadAdminNotifs = adminNotifsSorted.filter((n) => !n.read);
  const readAdminNotifs = adminNotifsSorted.filter((n) => n.read);

  return (
    <div
      ref={ref}
      className="w-[360px] max-w-[92vw] bg-[#fff6f3] border border-[#f0e6e5] rounded-2xl shadow-xl text-gray-900 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-sm font-semibold">Notifications</div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-1 rounded hover:bg-gray-100 transition"
            title={soundEnabled ? "Mute notifications" : "Unmute notifications"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-gray-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            className="text-sm text-gray-500 hover:underline"
            onClick={() => {
              /* placeholder */
            }}
          >
            See All
          </button>
        </div>
      </div>

      <div className="border-t border-[#f0e6e5]" />

      <div className="px-4 py-3 max-h-[500px] overflow-y-auto">
        {/* Admin Notifications Section */}
        {adminNotifsSorted.length > 0 && (
          <>
            {unreadAdminNotifs.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold mb-3 text-[#7b2030]">
                  System Alerts ({unreadAdminNotifs.length})
                </div>
                <div className="space-y-3">
                  {unreadAdminNotifs.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id)}
                      className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-blue-900 truncate">
                            {notif.title}
                          </div>
                          <div className="text-sm text-blue-800 mt-1 line-clamp-2">
                            {notif.message}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            {formatTime(notif.timestamp)}
                          </div>
                        </div>
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {readAdminNotifs.length > 0 && (
              <div>
                {unreadAdminNotifs.length > 0 && (
                  <div className="my-3 border-t border-[#f0e6e5]" />
                )}
                <div className="text-xs font-semibold mb-3 text-gray-500">
                  Earlier
                </div>
                <div className="space-y-3">
                  {readAdminNotifs.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-75"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-700 truncate">
                            {notif.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notif.message}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatTime(notif.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="my-4 border-t border-[#f0e6e5]" />
          </>
        )}

        {/* Regular Notifications Section */}
        {adminNotifsSorted.length === 0 && (
          <>
            {/* New section */}
            <div className="text-xs font-semibold mb-3">New</div>
            <div className="space-y-4">{newItems.map(renderItem)}</div>

            <div className="mt-4 border-t border-[#f0e6e5] pt-4" />

            {/* Yesterday section */}
            <div className="text-xs font-semibold mb-3">Yesterday</div>
            <div className="space-y-4">
              {yesterdayItems.map(renderItem)}
            </div>
          </>
        )}

        {adminNotifsSorted.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No notifications yet</p>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => onClose()}
            className="text-sm text-[#7b2030] px-4 py-2 rounded-md border border-transparent hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
