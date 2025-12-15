"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Bookmark, Grid, Film, Loader2 } from "lucide-react";
import Link from "next/link";
import PostCard from "../PostCard";

interface Media {
  url: string;
  media_type: string;
}

interface SavedPost {
  id: string;
  content?: string;
  created_at?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  media?: Media[];
  likes_count?: number;
  shares_count?: number;
  liked_by_current_user?: boolean;
  saved_by_current_user?: boolean;
  user_id?: string;
}

type TabType = "posts" | "reels";

export default function SavedPostsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [reels, setReels] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserAvatar, setCurrentUserAvatar] = useState("/icons/settings/profile.png");
  const [currentUserName, setCurrentUserName] = useState("You");

  const fetchSavedItems = useCallback(async (type: TabType, pageNum: number, append = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Please login to view saved posts");
        setIsLoading(false);
        return;
      }

      const res = await fetch(`/api/posts/saved?type=${type}&limit=20&page=${pageNum}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch saved posts");
      }

      const data = await res.json();

      // Normalize the response data
      const items: SavedPost[] = Array.isArray(data) 
        ? data 
        : data.posts || data.data || [];

      // Mark all items as saved since they're from the saved endpoint
      const normalizedItems = items.map((item: SavedPost) => ({
        ...item,
        saved_by_current_user: true,
      }));

      if (type === "posts") {
        setPosts(prev => append ? [...prev, ...normalizedItems] : normalizedItems);
      } else {
        setReels(prev => append ? [...prev, ...normalizedItems] : normalizedItems);
      }

      // Check if there are more items
      const total = data.total || data.meta?.total;
      const currentCount = append 
        ? (type === "posts" ? posts.length : reels.length) + normalizedItems.length 
        : normalizedItems.length;
      setHasMore(total ? currentCount < total : normalizedItems.length === 20);

    } catch (err) {
      console.error("Error fetching saved items:", err);
      setError("Failed to load saved posts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [posts.length, reels.length]);

  // Fetch current user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.avatar_url) {
            const avatarUrl = data.avatar_url.startsWith("http")
              ? data.avatar_url
              : `http://apisoapp.twingroups.com${data.avatar_url}`;
            setCurrentUserAvatar(avatarUrl);
          }
          if (data.display_name || data.username) {
            setCurrentUserName(data.display_name || data.username);
          }
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch saved items when tab changes
  useEffect(() => {
    setPage(1);
    fetchSavedItems(activeTab, 1, false);
  }, [activeTab]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSavedItems(activeTab, nextPage, true);
  };

  const handleUnsave = (postId: string) => {
    // Remove the post from the list when unsaved
    if (activeTab === "posts") {
      setPosts(prev => prev.filter(p => p.id !== postId));
    } else {
      setReels(prev => prev.filter(r => r.id !== postId));
    }
  };

  const currentItems = activeTab === "posts" ? posts : reels;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/user-profile" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#7b2030] fill-[#7b2030]" />
            <h1 className="text-lg font-semibold text-gray-900">Saved</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "posts"
                  ? "border-[#7b2030] text-[#7b2030]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Grid className="w-4 h-4" />
              Posts
            </button>
            <button
              onClick={() => setActiveTab("reels")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "reels"
                  ? "border-[#7b2030] text-[#7b2030]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Film className="w-4 h-4" />
              Reels
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {isLoading && currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#7b2030] animate-spin mb-4" />
            <p className="text-gray-500">Loading saved {activeTab}...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bookmark className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-lg font-medium text-gray-700 mb-2">
              No saved {activeTab} yet
            </h2>
            <p className="text-gray-500 text-center max-w-sm">
              {activeTab === "posts"
                ? "Save posts to view them later. Tap the bookmark icon on any post to save it."
                : "Save reels to watch them later. Tap the bookmark icon on any reel to save it."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "posts" ? (
              // Posts view - card layout
              currentItems.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  content={post.content}
                  created_at={post.created_at}
                  username={post.username}
                  display_name={post.display_name}
                  avatar_url={post.avatar_url}
                  media={post.media}
                  likes_count={post.likes_count}
                  liked_by_current_user={post.liked_by_current_user}
                  saved_by_current_user={true}
                  user_id={post.user_id}
                  currentUserAvatar={currentUserAvatar}
                  currentUserName={currentUserName}
                  onUnsave={handleUnsave}
                />
              ))
            ) : (
              // Reels view - grid layout
              <div className="grid grid-cols-3 gap-1">
                {currentItems.map((reel) => (
                  <ReelThumbnail
                    key={reel.id}
                    reel={reel}
                    onUnsave={handleUnsave}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && !isLoading && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 bg-[#7b2030] text-white rounded-full text-sm font-medium hover:bg-[#5e0e27] transition-colors"
                >
                  Load More
                </button>
              </div>
            )}

            {isLoading && currentItems.length > 0 && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-[#7b2030] animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Reel Thumbnail Component
interface ReelThumbnailProps {
  reel: SavedPost;
  onUnsave: (id: string) => void;
}

function ReelThumbnail({ reel, onUnsave }: ReelThumbnailProps) {
  const [isSaved, setIsSaved] = useState(true);

  const videoMedia = reel.media?.find((m) => m.media_type === "video");
  const thumbnailUrl = videoMedia?.url
    ? videoMedia.url.startsWith("http")
      ? videoMedia.url
      : `http://apisoapp.twingroups.com${videoMedia.url}`
    : null;

  const handleUnsave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await fetch(`/api/posts/${reel.id}/save`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setIsSaved(false);
        onUnsave(reel.id);
      }
    } catch (err) {
      console.error("Error unsaving reel:", err);
    }
  };

  return (
    <div className="relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden group cursor-pointer">
      {thumbnailUrl ? (
        <video
          src={thumbnailUrl}
          className="w-full h-full object-cover"
          muted
          preload="metadata"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <Film className="w-8 h-8 text-gray-500" />
        </div>
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          onClick={handleUnsave}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        >
          <Bookmark
            className={`w-6 h-6 ${
              isSaved ? "text-[#7b2030] fill-[#7b2030]" : "text-white"
            }`}
          />
        </button>
      </div>

      {/* Play icon */}
      <div className="absolute bottom-2 left-2">
        <Film className="w-4 h-4 text-white drop-shadow-lg" />
      </div>
    </div>
  );
}
