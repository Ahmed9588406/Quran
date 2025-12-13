"use client";
import React, { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { chatAPI } from "@/lib/chat/api";
import { User as ChatUser } from "@/lib/chat/types";

type User = { id: string; name: string; avatar: string; isOnline?: boolean };

const BASE_URL = "http://192.168.1.18:9001";

function normalizeUrl(url?: string | null): string {
  if (!url) return "/icons/settings/profile.png";
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

export default function StartNewMessage({
  isOpen,
  onClose,
  users: propUsers,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  users?: User[];
  onSelect: (u: User) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>(propUsers || []);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Get current user ID
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id || "");
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      const fetchedUsers = await chatAPI.searchUsers(query);
      const mappedUsers: User[] = fetchedUsers
        .filter((u: ChatUser) => u.id !== currentUserId)
        .map((u: ChatUser) => ({
          id: u.id,
          name: u.display_name || u.username,
          avatar: normalizeUrl(u.avatar_url),
          isOnline: u.status === "online",
        }));
      setUsers(mappedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (propUsers) setUsers(propUsers);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, query, currentUserId, propUsers]);

  // Fetch users when modal opens or query changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchUsers]);

  useEffect(() => {
    if (!isOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  // Filter users locally for instant feedback
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q));
  }, [users, query]);

  // Separate online and offline users
  const onlineUsers = filtered.filter((u) => u.isOnline);
  const offlineUsers = filtered.filter((u) => !u.isOnline);

  if (!isOpen) return null;

  const handleSelectUser = (u: User) => {
    // Call onSelect - chat.tsx will handle creating the chat
    onSelect(u);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose()} />
      <div
        ref={ref}
        id="start-new-modal"
        className="absolute right-6 bottom-28 w-[360px] max-w-[92vw] bg-[#fff6f3] rounded-2xl shadow-xl border border-[#f0e6e5] p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-[#7b2030]">New Message</div>
          <button aria-label="Close" onClick={() => onClose()} className="text-[#7b2030]">
            Close
          </button>
        </div>

        <div className="mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full px-3 py-2 border rounded-md border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#7b2030] text-black placeholder-gray-400"
            autoFocus
          />
        </div>

        <div className="max-h-72 overflow-auto space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7b2030]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">No users found</div>
          ) : (
            <>
              {/* Online Users Section */}
              {onlineUsers.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-green-600 px-2 py-1 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Online ({onlineUsers.length})
                  </div>
                  {onlineUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 text-left"
                    >
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          <img 
                            src={u.avatar} 
                            alt={u.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/icons/settings/profile.png";
                            }}
                          />
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-black truncate">{u.name}</div>
                        <div className="text-xs text-green-500">Online</div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* Offline Users Section */}
              {offlineUsers.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-gray-500 px-2 py-1 mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                    Offline ({offlineUsers.length})
                  </div>
                  {offlineUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 text-left"
                    >
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          <img 
                            src={u.avatar} 
                            alt={u.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/icons/settings/profile.png";
                            }}
                          />
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-400 rounded-full border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-black truncate">{u.name}</div>
                        <div className="text-xs text-gray-400">Offline</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
