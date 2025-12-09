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
  coverUrl,
  posts,
  followers,
  following,
  bio,
  tags,
  isOwnProfile = false,
  isFollowing = false,
  isTogglingFollow = false,
  country,
  location,
  education,
  work,
  interests,
  reelsCount = 0,
  onFollow,
  onMessage,
}: ProfileHeaderProps) {
  return (
    <div className="border-b border-[#f0e6e5] bg-white rounded-xl">
      {/* Cover Image */}
      {coverUrl && (
        <div className="h-48 bg-gradient-to-r from-[#7b2030] to-[#5e0e27] relative">
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="px-6 py-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 flex-shrink-0">
            <img src={avatar || "/icons/settings/profile.png"} alt={name} className="w-full h-full object-cover" />
          </div>

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
                    className="px-5 py-2 text-sm font-medium rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
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
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="mt-4 flex items-center gap-6">
              <div>
                <p className="text-lg font-semibold text-gray-900">{posts}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{followers}</p>
                <p className="text-xs text-gray-500">Followers</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{following}</p>
                <p className="text-xs text-gray-500">Following</p>
              </div>
            </div>

            {/* Location, Work, Education */}
            <div className="mt-4 flex flex-col gap-2">
              {location && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-5 h-5 mr-2" />
                  {location}
                </div>
              )}
              {work && (
                <div className="flex items-center text-sm text-gray-500">
                  <Briefcase className="w-5 h-5 mr-2" />
                  {work}
                </div>
              )}
              {education && (
                <div className="flex items-center text-sm text-gray-500">
                  <GraduationCap className="w-5 h-5 mr-2" />
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
