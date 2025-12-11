/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Repeat2, Share2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { likePost, unlikePost } from "@/src/api/postsApi";

type Media = {
  url: string;
  media_type: string;
};

type Post = {
  id: string;
  author_id?: string;
  content?: string;
  visibility?: string;
  created_at?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  is_following?: number;
  liked_by_me?: boolean;
  media?: Media[];
};

function formatDate(d?: string) {
  if (!d) return "";
  try {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  } catch {
    return d;
  }
}

export default function PostView() {
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const toggleLike = (id: string) => {
    setLikedIds((s) => ({ ...s, [id]: !s[id] }));
  };

  // Like/dislike logic for feed posts
  const handleToggleLike = async (id: string) => {
    const prevLiked = likedIds[id];
    setLikedIds((s) => ({ ...s, [id]: !prevLiked }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              likes_count: prevLiked
                ? Math.max(0, (p.likes_count ?? 0) - 1)
                : (p.likes_count ?? 0) + 1,
            }
          : p
      )
    );
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || undefined : undefined;
      const result = prevLiked
        ? await unlikePost(id, token)
        : await likePost(id, token);
      if (result && result.likesCount !== undefined) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, likes_count: result.likesCount }
              : p
          )
        );
      }
    } catch (err) {
      // revert on failure
      setLikedIds((s) => ({ ...s, [id]: prevLiked }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                likes_count: prevLiked
                  ? (p.likes_count ?? 0) + 1
                  : Math.max(0, (p.likes_count ?? 0) - 1),
              }
            : p
        )
      );
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token") ?? undefined;
        const res = await fetch(`/api/feed?page=${page}&per_page=10`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Failed to load feed: ${res.status} ${res.statusText} ${text}`);
        }

        const data = await res.json();
        const items: Post[] = Array.isArray(data.posts) ? data.posts : [];

        if (!cancelled) {
          setPosts(items);
          setHasMore(items.length >= 10);
          // Initialize liked state
          const likedState: Record<string, boolean> = {};
          items.forEach((p) => {
            likedState[p.id] = p.liked_by_me ?? false;
          });
          setLikedIds(likedState);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="w-full flex justify-center py-8 px-4">
      <div className="w-full max-w-3xl mx-auto">
        {loading && <div className="text-sm text-gray-600 text-center">Loading posts...</div>}
        {error && <div className="text-sm text-red-500 text-center">Error: {error}</div>}
        {!loading && !error && posts.length === 0 && (
          <div className="text-sm text-gray-600 text-center">No posts found.</div>
        )}

        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#fff6f3] rounded-xl shadow-md border border-[#f0e6e5] overflow-hidden flex flex-col"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-11 h-11 relative rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {post.avatar_url ? (
                    <Image
                      src={post.avatar_url}
                      alt={post.display_name ?? post.username ?? "avatar"}
                      fill
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  ) : (
                    <Image src="/figma-assets/avatar.png" alt="avatar" fill style={{ objectFit: "cover" }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href="#" className="font-semibold text-sm text-gray-900 truncate">
                      {post.display_name ?? post.username}
                    </Link>
                    <span className="text-xs text-gray-400">· {formatDate(post.created_at)}</span>
                  </div>
                </div>

                {post.is_following === 0 && (
                  <button className="bg-[#7b2030] text-white text-sm px-3 py-1 rounded-md font-medium hover:opacity-95">
                    Follow
                  </button>
                )}

                <button aria-label="more" className="ml-2 text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {post.content && (
                <div className="px-4 pb-3 flex-shrink-0">
                  <p className="text-sm text-gray-800 leading-relaxed">{post.content}</p>
                </div>
              )}

              {post.media && post.media.length > 0 && (
                <div className="px-4 pb-4">
                  <div className="grid gap-2">
                    {post.media.map((m, idx) =>
                      (m.media_type || "").includes("video") ? (
                        <video
                          key={idx}
                          src={m.url}
                          controls
                          className="w-full max-h-[480px] rounded-lg bg-black"
                        />
                      ) : (
                        <div key={idx} className="relative w-full h-64 rounded-lg overflow-hidden">
                          <Image
                            src={m.url}
                            alt={`media-${idx}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="px-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-6">
                    {/* Like/Dislike button */}
                    {!likedIds[post.id] ? (
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className="flex flex-col items-center text-center focus:outline-none"
                      >
                        <Heart className="w-5 h-5 text-gray-500" />
                        <span className="text-xs mt-1 text-gray-600">
                          {post.likes_count ?? 0}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className="flex flex-col items-center text-center focus:outline-none"
                      >
                        <Heart className="w-5 h-5 text-gray-400 fill-current" />
                        <span className="text-xs mt-1 text-gray-600">
                          Dislike{post.likes_count ? ` (${post.likes_count})` : ""}
                        </span>
                      </button>
                    )}

                    <button className="flex flex-col items-center text-center text-gray-600 focus:outline-none">
                      <MessageCircle className="w-5 h-5 text-gray-500" />
                      <span className="text-xs mt-1">{post.comments_count ?? 0}</span>
                    </button>

                    <button className="flex flex-col items-center text-center text-gray-600 focus:outline-none">
                      <Repeat2 className="w-5 h-5 text-gray-500" />
                      <span className="text-xs mt-1">{post.shares_count ?? 0}</span>
                    </button>

                    <button className="flex flex-col items-center text-center text-gray-600 focus:outline-none">
                      <Share2 className="w-5 h-5 text-gray-500" />
                      <span className="text-xs mt-1">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {posts.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((s) => Math.max(1, s - 1))}
              disabled={page <= 1 || loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <button
              onClick={() => setPage((s) => s + 1)}
              disabled={!hasMore || loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}