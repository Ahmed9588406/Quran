"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Settings, MapPin, Briefcase, GraduationCap, MessageCircle } from "lucide-react";
import FollowersModal from "./FollowersModal";

const BASE_URL = "http://apisoapp.twingroups.com"; // same backend host used by the proxy

function normalizeUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return url;
}

interface ProfileHeaderProps {
  name: string;
  username?: string;
  avatar?: string | null; // backend may return "avatar"
  avatar_url?: string | null; // or "avatar_url"
  coverUrl?: string | null;
  posts: number;
  followers: number;
  following: number;
  bio: string;
  tags: string[];
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  country?: string | null;
  location?: string | null;
  education?: string | null;
  work?: string | null;
  interests?: string | null;
  reelsCount?: number;
  userId?: string; // User ID for messaging and follow
  onMessage?: () => void; // Callback when message button is clicked
  onFollowChange?: (isFollowing: boolean) => void; // Callback when follow state changes
}

/**
 * Follow/unfollow a user via the API
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
  username,
  avatar,
  avatar_url,
  coverUrl,
  posts,
  followers,
  following,
  bio,
  tags,
  isOwnProfile = false,
  isFollowing: initialIsFollowing = false,
  country,
  location,
  education,
  work,
  interests,
  reelsCount = 0,
  userId,
  onMessage,
  onFollowChange,
}: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);
  const [followerCount, setFollowerCount] = useState(followers);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);

  // prefer avatar then avatar_url; normalize relative paths; fallback to local asset
  const avatarSrc = normalizeUrl(avatar ?? avatar_url) ?? "/default-avatar.png";
  const coverSrc = normalizeUrl(coverUrl) ?? undefined;

  const handleFollowClick = async () => {
    if (!userId || isTogglingFollow) return;
    
    const prev = isFollowing;
    // Optimistic update
    setIsFollowing(!prev);
    setFollowerCount(prev ? followerCount - 1 : followerCount + 1);
    setIsTogglingFollow(true);
    
    const success = await toggleFollowUser(userId, prev);
    
    if (!success) {
      // Revert on failure
      setIsFollowing(prev);
      setFollowerCount(prev ? followerCount : followerCount - 1);
    } else {
      onFollowChange?.(!prev);
    }
    
    setIsTogglingFollow(false);
  };

  // Log profile header props (visible in browser console)
  console.info("ProfileHeader props:", {
    name,
    username,
    avatar: avatarSrc,
    coverUrl,
    posts,
    followers,
    following,
    bio,
    tags,
    isOwnProfile,
    isFollowing,
    country,
    location,
    education,
    work,
    interests,
    reelsCount,
  });

  return (
    <div className="border-b border-[#f0e6e5]">
      {/* Cover Image */}
      {coverSrc && (
        <div className="relative w-full h-32 bg-gradient-to-r from-[#7b2030] to-[#d4a574]">
          <Image src={coverSrc} alt="Cover" fill style={{ objectFit: "cover" }} />
        </div>
      )}

      <div className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div
              className={`relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0 ${
                coverSrc ? "-mt-12" : ""
              }`}
            >
              <Image src={avatarSrc} alt={name} fill style={{ objectFit: "cover" }} unoptimized />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{name}</h1>
                    {username && <p className="text-sm text-gray-500">@{username}</p>}
                  </div>

                  {isOwnProfile ? (
                    <div className="flex items-center gap-2">
                      <button className="px-5 py-1.5 bg-[#7b2030] text-white text-sm font-medium rounded-full hover:bg-[#5e0e27] transition-colors">
                        Edit Profile
                      </button>
                      <button
                        className="px-5 py-1.5 text-[#D7BA83] rounded-full hover:bg-gray-50 transition-colors"
                        style={{
                          border: "1.5px solid var(--Tinted-Muted-Gold-1, #D7BA83)",
                          fontWeight: 600,
                          fontSize: "14px",
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
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-[#7b2030] text-white hover:bg-[#5e0e27]"
                        } ${isTogglingFollow ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {isTogglingFollow ? "..." : isFollowing ? "Following" : "Follow"}
                      </button>
                      <button
                        onClick={onMessage}
                        className="px-5 py-1.5 text-[#D7BA83] rounded-full hover:bg-gray-50 transition-colors flex items-center gap-2"
                        style={{
                          border: "1.5px solid var(--Tinted-Muted-Gold-1, #D7BA83)",
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
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
                <button
                  onClick={() => setIsFollowersModalOpen(true)}
                  className="hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <span className="font-semibold text-gray-900">{followerCount}</span>
                  <span className="text-gray-500 ml-1">followers</span>
                </button>
                <div>
                  <span className="font-semibold text-gray-900">{following}</span>
                  <span className="text-gray-500 ml-1">following</span>
                </div>
                {reelsCount > 0 && (
                  <div>
                    <span className="font-semibold text-gray-900">{reelsCount}</span>
                    <span className="text-gray-500 ml-1">reels</span>
                  </div>
                )}
              </div>

              {/* Location & Work Info */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                {(country || location) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{location || country}</span>
                  </div>
                )}
                {work && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{work}</span>
                  </div>
                )}
                {education && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>{education}</span>
                  </div>
                )}
              </div>

              {/* Tags / Interests */}
              {(tags.length > 0 || interests) && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      • {tag}
                    </span>
                  ))}
                  {interests && !tags.length && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      • {interests}
                    </span>
                  )}
                </div>
              )}

              {/* Bio */}
              {bio && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  <span className="font-medium text-gray-800">Bio:</span> {bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      <FollowersModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        userId={userId || ''}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}
