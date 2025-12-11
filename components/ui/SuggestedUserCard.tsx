"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_AVATAR = "/icons/settings/profile.png";

interface SuggestedUserCardProps {
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    suggestion_reason: string;
  };
  isFollowing: boolean;
  isLoading: boolean;
  onFollow: (userId: string, e: React.MouseEvent) => void;
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

export default function SuggestedUserCard({
  user,
  isFollowing,
  isLoading,
  onFollow,
}: SuggestedUserCardProps) {
  const [imgError, setImgError] = useState(false);
  const router = useRouter();
  const avatarSrc = imgError || !user.avatar_url ? DEFAULT_AVATAR : user.avatar_url;

  const handleClick = () => {
    router.push(`/other_user/${user.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-col cursor-pointer transition-transform hover:scale-[1.02]"
      style={{
        width: 179,
        height: 275,
        gap: 16,
        borderRadius: 8,
        padding: 8,
        background: "#FFF9F3",
        border: "1px solid #EFDEBC",
        boxShadow: "0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* User Avatar/Cover Image */}
      <div
        className="w-full rounded-lg overflow-hidden bg-gray-200"
        style={{ height: 160 }}
      >
        <img
          src={avatarSrc}
          alt={user.display_name || user.username}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>

      {/* User Info */}
      <div className="flex flex-col flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {user.display_name || user.username}
        </p>
        <p className="text-xs text-gray-500 truncate mb-auto">
          {getSuggestionLabel(user.suggestion_reason)}
        </p>

        {/* Follow Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFollow(user.id, e);
          }}
          disabled={isLoading}
          className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${
            isFollowing
              ? "bg-white text-[#7b2030] border border-[#7b2030] hover:bg-[#fffaf9]"
              : "bg-[#7b2030] text-white hover:bg-[#5e0e27]"
          }`}
        >
          {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
}
