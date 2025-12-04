"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Play } from "lucide-react";

interface PostCardProps {
  id: string;
  author: {
    name: string;
    avatar: string;
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

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <div className="bg-[#FFF9F3] rounded-lg border border-[#f0e6e5] p-4">
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
          <button className="px-4 py-1 bg-[#7b2030] text-white text-xs font-medium rounded-full hover:bg-[#5e0e27] transition-colors">
            Follow
          </button>
          <button
            aria-label="More options"
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
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
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm ${
            liked ? "text-red-500" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
          <span>Like</span>
        </button>

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
