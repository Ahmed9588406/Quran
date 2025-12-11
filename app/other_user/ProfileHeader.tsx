"use client";
import React from "react";
import { MapPin, Briefcase, GraduationCap } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  username?: string;
  avatar?: string | null;
  coverUrl?: string | null;
  posts: number;
  followers: number;
  following: number;
  bio: string;
  tags: string[];
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  isTogglingFollow?: boolean;
  country?: string | null;
  location?: string | null;
  education?: string | null;
  work?: string | null;
  interests?: string | null;
  reelsCount?: number;
  onFollow?: () => void;
  onMessage?: () => void;
}

export default function ProfileHeader({
  name,
  username,
  avatar,
  posts,
  followers,
  following,
  bio,
  tags,
  isOwnProfile = false,
  isFollowing = false,
  isTogglingFollow = false,
  location,
  education,
  work,
  onFollow,
  onMessage,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white border-b border-[#f0e6e5]">
      {/* Profile Info */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 flex-shrink-0 shadow-lg">
            <img
              src={avatar || "/icons/settings/profile.png"}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name and actions */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
                {username && <p className="text-sm text-gray-500">@{username}</p>}
              </div>

              {!isOwnProfile && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onFollow}
                    disabled={isTogglingFollow}
                    className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                      isFollowing
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-[#7b2030] text-white hover:bg-[#5e0e27]"
                    }`}
                  >
                    {isTogglingFollow ? "..." : isFollowing ? "Following" : "Follow"}
                  </button>
                  <button
                    onClick={onMessage}
                    style={{
                      border: "1.5px solid var(--Tinted-Muted-Gold-1, #D7BA83)",
                      color: "var(--Tinted-Muted-Gold-1, #D7BA83)",
                    }}
                    className="px-5 py-2 text-sm font-medium rounded-full hover:bg-[rgba(215,186,131,0.08)] transition-colors"
                  >
                    Message
                  </button>
                </div>
              )}
            </div>

            {/* Bio */}
            {bio && <p className="mt-3 text-sm text-gray-700">{bio}</p>}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div>
                <span className="text-lg font-semibold text-gray-900">{posts}</span>
                <span className="text-sm text-gray-500 ml-1">Posts</span>
              </div>
              <div>
                <span className="text-lg font-semibold text-gray-900">{followers}</span>
                <span className="text-sm text-gray-500 ml-1">Followers</span>
              </div>
              <div>
                <span className="text-lg font-semibold text-gray-900">{following}</span>
                <span className="text-sm text-gray-500 ml-1">Following</span>
              </div>
            </div>

            {/* Location, Work, Education */}
            <div className="flex flex-wrap gap-4 mt-4">
              {location && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  {location}
                </div>
              )}
              {work && (
                <div className="flex items-center text-sm text-gray-500">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {work}
                </div>
              )}
              {education && (
                <div className="flex items-center text-sm text-gray-500">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  {education}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
