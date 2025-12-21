"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Play } from "lucide-react";
import { likePost, unlikePost, savePost, unsavePost } from "@/src/api/postsApi";

interface PostCardProps {
  id: string;
  author: {
    name: string;
    avatar: string;
    id?: string; // User ID for follow functionality
  };
  time: string;
  content: string;
  media?: {
    type: "image" | "video";
    src: string;
    thumbnail?: string;
  };
  likes?: number;
  comments?: number;
  reposts?: number;
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

export default function PostCard({
  id,
  author,
  time,
  content,
  media,
  likes = 0,
  comments = 0,
  reposts = 0,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  // NEW: saved state and menu
  const [saved, setSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLike = async () => {
    // optimistic update
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || undefined : undefined;
      const result = prevLiked ? await unlikePost(id, token) : await likePost(id, token);

      if (result && result.likesCount !== undefined) {
        setLikeCount(result.likesCount);
      }
    } catch (err) {
      // revert on failure
      console.error("Failed to toggle like on post:", err);
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const handleFollowClick = async () => {
    if (!author.id || isTogglingFollow) return;
    
    const prev = isFollowing;
    setIsFollowing(!prev);
    setIsTogglingFollow(true);
    
    const success = await toggleFollowUser(author.id, prev);
    
    if (!success) {
      setIsFollowing(prev);
    }
    
    setIsTogglingFollow(false);
  };

  const toggleSave = async () => {
    const prev = saved;
    setSaved(!prev); // optimistic
    setMenuOpen(false);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || undefined : undefined;
      if (prev) {
        await unsavePost(id, token);
      } else {
        await savePost(id, token);
      }
    } catch (err) {
      console.error("Failed to toggle save on post:", err);
      setSaved(prev); // revert
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#f0e6e5] p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={author.avatar}
              alt={author.name}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{author.name}</h3>
            <p className="text-xs text-gray-500">{time}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleFollowClick}
            disabled={isTogglingFollow}
            className={`px-4 py-1 text-xs font-medium rounded-full transition-colors ${
              isFollowing
                ? "bg-white text-[#7b2030] border border-[#7b2030] hover:bg-[#fffaf9]"
                : "bg-[#7b2030] text-white hover:bg-[#5e0e27]"
            } ${isTogglingFollow ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isTogglingFollow ? "..." : isFollowing ? "Following" : "Follow"}
          </button>
          <div className="relative">
            <button
              aria-label="More options"
              className="p-1 text-gray-400 hover:text-gray-600"
              onClick={() => setMenuOpen((s) => !s)}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                <button
                  onClick={toggleSave}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {saved ? "Unsave post" : "Save post"}
                </button>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="mt-3 text-sm text-gray-700 leading-relaxed">{content}</p>

      {/* Media */}
      {media && (
        <div className="mt-3 relative rounded-lg overflow-hidden">
          {media.type === "image" ? (
            <div className="relative aspect-video">
              <Image
                src={media.src}
                alt="Post media"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            <div className="relative aspect-video bg-black">
              <Image
                src={media.thumbnail || media.src}
                alt="Video thumbnail"
                fill
                style={{ objectFit: "cover" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/40 transition-colors">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100">
        {!liked ? (
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#7b2030]"
          >
            <Heart className="w-5 h-5" />
            <span>
              Like{likeCount > 0 ? ` (${likeCount})` : ""}
            </span>
          </button>
        ) : (
          <button
            onClick={async () => {
              // Dislike (DELETE)
              const prevLiked = liked;
              const prevCount = likeCount;
              setLiked(false);
              setLikeCount(Math.max(0, prevCount - 1));
              try {
                const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || undefined : undefined;
                const result = await unlikePost(id, token);
                if (result && result.likesCount !== undefined) {
                  setLikeCount(result.likesCount);
                }
              } catch (err) {
                // revert on failure
                console.error("Failed to dislike post:", err);
                setLiked(prevLiked);
                setLikeCount(prevCount);
              }
            }}
            className="flex items-center gap-2 text-sm text-[#7b2030] cursor-default"
          >
            <Heart className="w-5 h-5 fill-current text-[#7b2030]" />
            <span>
              Dislike{likeCount > 0 ? ` (${likeCount})` : ""}
            </span>
          </button>
        )}

        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <MessageCircle className="w-5 h-5" />
          <span>comment</span>
        </button>

        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <Repeat2 className="w-5 h-5" />
          <span>Repost</span>
        </button>

        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <Share className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
