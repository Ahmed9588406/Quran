"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_AVATAR = "/icons/settings/profile.png";

interface SuggestedUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  suggestion_reason: string;
  followers_count: number;
  score: number;
}

function Avatar({ src, alt, size = 40 }: { src?: string | null; alt: string; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const avatarSrc = imgError || !src ? DEFAULT_AVATAR : src;

  return (
    <div
      className="rounded-full overflow-hidden flex-shrink-0 bg-gray-200"
      style={{ width: size, height: size }}
    >
      <img
        src={avatarSrc}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

function getSuggestionLabel(reason: string): string {
  switch (reason) {
    case "active_community_member":
      return "Active member";
    case "popular_creator":
      return "Popular creator";
    case "similar_interests":
      return "Similar interests";
    case "followed_by_friends":
      return "Followed by friends";
    default:
      return "Suggested for you";
  }
}

export default function SuggestedUsers() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loadingFollowIds, setLoadingFollowIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    async function fetchSuggested() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("/api/feed/suggested", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch suggested users");
        }

        const data = await res.json();
        setUsers(data.suggested_users || []);
      } catch (err) {
        console.error("Error fetching suggested users:", err);
        setError("Failed to load suggestions");
      } finally {
        setLoading(false);
      }
    }

    fetchSuggested();
  }, []);

  const handleFollow = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const isCurrentlyFollowing = followingIds.has(userId);
    
    // Optimistic update
    setFollowingIds((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlyFollowing) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });

    setLoadingFollowIds((prev) => new Set(prev).add(userId));

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/follow", {
        method: isCurrentlyFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        // Revert on failure
        setFollowingIds((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlyFollowing) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      }
    } catch (err) {
      console.error("Follow error:", err);
      // Revert on error
      setFollowingIds((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyFollowing) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    } finally {
      setLoadingFollowIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/other_user/${userId}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#f0e6e5] p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Suggested for you</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-24 mb-1" />
                <div className="h-2 bg-gray-200 rounded w-16" />
              </div>
              <div className="h-7 w-16 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-[#f0e6e5] p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Suggested for you</h3>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return null;
  }

  // Show first 5 users
  const displayUsers = users.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-[#f0e6e5] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Suggested for you</h3>
        
      </div>
      
      <div className="space-y-3">
        {displayUsers.map((user) => {
          const isFollowing = followingIds.has(user.id);
          const isLoading = loadingFollowIds.has(user.id);

          return (
            <div
              key={user.id}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
              onClick={() => handleUserClick(user.id)}
            >
              <Avatar src={user.avatar_url} alt={user.display_name || user.username} size={40} />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.display_name || user.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {getSuggestionLabel(user.suggestion_reason)}
                </p>
              </div>

              <button
                onClick={(e) => handleFollow(user.id, e)}
                disabled={isLoading}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  isFollowing
                    ? "bg-white text-[#7b2030] border border-[#7b2030] hover:bg-[#fffaf9]"
                    : "bg-[#7b2030] text-white hover:bg-[#5e0e27]"
                }`}
              >
                {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
