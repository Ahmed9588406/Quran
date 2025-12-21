"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Settings } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  avatar: string;
  posts: number;
  followers: number;
  following: number;
  bio: string;
  tags: string[];
  isOwnProfile?: boolean;
  userId?: string; // User ID for follow functionality
}

/**
 * Toggle follow/unfollow for a user
 * Endpoint: POST/DELETE http://apisoapp.twingroups.com/follow/{{user_id}}
 * Body: {"target_user_id":"..."}
 */
async function toggleFollowUser(targetUserId: string, isCurrentlyFollowing: boolean): Promise<boolean> {
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch("/api/follow", {
      method: isCurrentlyFollowing ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ target_user_id: targetUserId }),
    });
    return res.ok;
  } catch (err) {
    console.error("Follow toggle failed:", err);
    return false;
  }
}

export default function ProfileHeader({
  name,
  avatar,
  posts,
  followers,
  following,
  bio,
  tags,
  isOwnProfile = false,
  userId,
}: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);
  const [followerCount, setFollowerCount] = useState(followers);

  const handleFollowClick = async () => {
    if (!userId || isTogglingFollow) return;
    
    const prev = isFollowing;
    setIsFollowing(!prev);
    setFollowerCount(prev ? followerCount - 1 : followerCount + 1);
    setIsTogglingFollow(true);
    
    const success = await toggleFollowUser(userId, prev);
    
    if (!success) {
      setIsFollowing(prev);
      setFollowerCount(prev ? followerCount : followerCount - 1);
    }
    
    setIsTogglingFollow(false);
  };

  return (
    <div className=" border-b border-[#f0e6e5] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
            <Image
              src={avatar}
              alt={name}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-gray-900">{name}</h1>

                {isOwnProfile ? (
                  <div className="flex items-center gap-2">
                    <button className="px-5 py-1.5 bg-[#7b2030] text-white text-sm font-medium rounded-full hover:bg-[#5e0e27] transition-colors">
                      Edit Profile
                    </button>
                    <button
                      className="px-5 py-1.5 text-[#D7BA83] rounded-full hover:bg-gray-50 transition-colors"
                      style={{
                        border:
                          "1.5px solid var(--Tinted-Muted-Gold-1, #D7BA83)",
                        fontFamily:
                          "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                        fontWeight: 600,
                        fontStyle: "normal", // "Semi Bold" is represented by font-weight: 600
                        fontSize: "14px",
                        lineHeight: "100%",
                        letterSpacing: "0",
                      }}
                    >
                      View Archive
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleFollowClick}
                      disabled={isTogglingFollow}
                      className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        isFollowing
                          ? "bg-white text-[#7b2030] border border-[#7b2030] hover:bg-[#fffaf9]"
                          : "bg-[#7b2030] text-white hover:bg-[#5e0e27]"
                      } ${isTogglingFollow ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isTogglingFollow ? "..." : isFollowing ? "Following" : "Follow"}
                    </button>
                    <button
                      className="px-5 py-1.5 text-[#D7BA83] rounded-full hover:bg-gray-50 transition-colors"
                      style={{
                        border: "1.5px solid var(--Tinted-Muted-Gold-1, #D7BA83)",
                        fontFamily:
                          "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                        fontWeight: 600,
                        fontStyle: "normal",
                        fontSize: "14px",
                        lineHeight: "100%",
                        letterSpacing: "0",
                      }}
                    >
                      Message
                    </button>
                  </div>
                )}
              </div>

              <button
                aria-label="Settings"
                className="p-2 text-[#7b2030] hover:bg-gray-100 rounded-full transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-3 text-sm">
              <div>
                <span className="font-semibold text-gray-900">{posts}</span>
                <span className="text-gray-500 ml-1">posts</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{followerCount}</span>
                <span className="text-gray-500 ml-1">followers</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{following}</span>
                <span className="text-gray-500 ml-1">following</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mt-3">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  • {tag}
                </span>
              ))}
            </div>

            {/* Bio */}
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              <span className="font-medium text-gray-800">Bio:</span> {bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
