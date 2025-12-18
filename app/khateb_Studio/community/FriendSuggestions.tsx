"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserPlus, X, RefreshCw } from "lucide-react";

interface SuggestedUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  mutual_friends?: number;
  role?: string;
}

export default function FriendSuggestions() {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      
      // Try to fetch from API, fallback to mock data
      try {
        const res = await fetch("/api/users/suggestions?limit=5", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.users && data.users.length > 0) {
            setSuggestions(data.users);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.log("API not available, using mock data");
      }

      // Mock data fallback
      setSuggestions([
        {
          id: "1",
          username: "sheikh_ahmad",
          display_name: "Sheikh Ahmad Al-Farsi",
          avatar_url: "https://i.pravatar.cc/150?img=11",
          mutual_friends: 12,
          role: "preacher",
        },
        {
          id: "2",
          username: "dr_fatima",
          display_name: "Dr. Fatima Hassan",
          avatar_url: "https://i.pravatar.cc/150?img=32",
          mutual_friends: 8,
          role: "scholar",
        },
        {
          id: "3",
          username: "imam_omar",
          display_name: "Imam Omar Suleiman",
          avatar_url: "https://i.pravatar.cc/150?img=15",
          mutual_friends: 24,
          role: "preacher",
        },
        {
          id: "4",
          username: "ustadh_ali",
          display_name: "Ustadh Ali Hammuda",
          avatar_url: "https://i.pravatar.cc/150?img=53",
          mutual_friends: 5,
          role: "teacher",
        },
        {
          id: "5",
          username: "sheikh_yusuf",
          display_name: "Sheikh Yusuf Estes",
          avatar_url: "https://i.pravatar.cc/150?img=60",
          mutual_friends: 18,
          role: "preacher",
        },
      ]);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    setFollowingIds((prev) => new Set([...prev, userId]));
    
    try {
      const token = localStorage.getItem("access_token");
      await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      console.error("Error following user:", error);
      setFollowingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleDismiss = (userId: string) => {
    setDismissedIds((prev) => new Set([...prev, userId]));
  };

  const visibleSuggestions = suggestions.filter(
    (user) => !dismissedIds.has(user.id)
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[#f0e6e5] p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#f0e6e5] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">People you may know</h3>
        <button
          onClick={fetchSuggestions}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          title="Refresh suggestions"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestions List */}
      <div className="divide-y divide-gray-50">
        {visibleSuggestions.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No suggestions available
          </div>
        ) : (
          visibleSuggestions.map((user) => (
            <div key={user.id} className="p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Link href={`/user-profile/${user.id}`} className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 hover:opacity-80 transition-opacity">
                    <img
                      src={user.avatar_url}
                      alt={user.display_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/icons/settings/profile.png";
                      }}
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/user-profile/${user.id}`} className="block">
                    <p className="font-medium text-sm text-gray-900 truncate hover:underline">
                      {user.display_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                  </Link>
                  {user.mutual_friends && user.mutual_friends > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {user.mutual_friends} mutual connection{user.mutual_friends > 1 ? "s" : ""}
                    </p>
                  )}
                  {user.role && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-[#FFF9F3] text-[#8A1538] rounded-full capitalize">
                      {user.role}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDismiss(user.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Follow Button */}
              <div className="mt-2 ml-13">
                <button
                  onClick={() => handleFollow(user.id)}
                  disabled={followingIds.has(user.id)}
                  className={`w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    followingIds.has(user.id)
                      ? "bg-gray-100 text-gray-500 cursor-default"
                      : "bg-[#8A1538] text-white hover:bg-[#6d1029]"
                  }`}
                >
                  {followingIds.has(user.id) ? (
                    <>Following</>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* See All Link */}
      {visibleSuggestions.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <Link
            href="/discover"
            className="text-sm text-[#8A1538] hover:text-[#6d1029] font-medium"
          >
            See all suggestions →
          </Link>
        </div>
      )}
    </div>
  );
}
