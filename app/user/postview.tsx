"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Repeat, Share2, MoreHorizontal } from "lucide-react";
import Link from "next/link";

type Post = {
  id: string;
  title?: string;
  body?: string;
  image?: string;
  createdAt?: string;
  // add other fields from your backend as needed
};

function readSavedAuth() {
  try {
    const raw =
      localStorage.getItem("currentUser") ??
      localStorage.getItem("auth") ??
      localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const id = parsed.id ?? parsed.user?.id ?? parsed.userId;
    const token = parsed.token ?? parsed.accessToken ?? parsed.authToken;
    if (!id && !token) return null;
    return { id, token };
  } catch {
    return null;
  }
}

export default function PostView() {
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = (id: string) => {
    setLikedIds((s) => ({ ...s, [id]: !s[id] }));
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const auth = readSavedAuth();
        if (!auth || !auth.id) {
          throw new Error("No logged-in user found in localStorage.");
        }
        const userId = encodeURIComponent(String(auth.id));
        const limit = 20;
        const page = 1;
        const url = `http://192.168.1.18:9001/users/${userId}/posts?limit=${limit}&page=${page}`;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (auth.token) headers["Authorization"] = `Bearer ${auth.token}`;

        const res = await fetch(url, { method: "GET", headers });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Failed to load posts: ${res.status} ${res.statusText} ${text}`);
        }
        const data = await res.json();
        // normalize common shapes
        let items: Post[] = [];
        if (Array.isArray(data)) items = data;
        else if (Array.isArray(data.posts)) items = data.posts;
        else if (Array.isArray(data.data)) items = data.data;
        // fallback empty
        if (!cancelled) setPosts(items);
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
  }, []);

  return (
    <div className="w-full flex justify-center py-8 px-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Posts</h2>
          <p className="text-sm text-gray-500">Your recent posts</p>
        </div>

        {loading && <div className="text-sm text-gray-600">Loading posts...</div>}
        {error && <div className="text-sm text-red-500">Error: {error}</div>}
        {!loading && !error && posts.length === 0 && (
          <div className="text-sm text-gray-600">No posts found.</div>
        )}

        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#fff6f3] rounded-xl shadow-md border border-[#f0e6e5] overflow-hidden flex flex-col"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-11 h-11 relative rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image src="/figma-assets/avatar.png" alt="avatar" fill style={{ objectFit: "cover" }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href="#" className="font-semibold text-sm text-gray-900 truncate">
                      Mazen Mohamed
                    </Link>
                    <span className="text-xs text-gray-400">· {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "2d"}</span>
                  </div>
                </div>

                <button className="bg-[#7b2030] text-white text-sm px-3 py-1 rounded-md font-medium hover:opacity-95">
                  Follow
                </button>

                <button aria-label="more" className="ml-2 text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {post.title && (
                <div className="px-4 pb-2 flex-shrink-0">
                  <p className="text-sm text-gray-800 font-medium">{post.title}</p>
                </div>
              )}

              {post.body && (
                <div className="px-4 pb-3 flex-shrink-0">
                  <p className="text-sm text-gray-800 leading-relaxed">{post.body}</p>
                </div>
              )}

              <div className="px-4 pb-4">
                <div className="w-full rounded-lg overflow-hidden bg-gray-50 shadow-sm h-64">
                  <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <Image
                      src={post.image ?? "/moshaf.svg"}
                      alt="post"
                      fill
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-6">
                    <button onClick={() => toggleLike(post.id)} className="flex flex-col items-center text-center focus:outline-none">
                      <Heart className={`w-5 h-5 ${likedIds[post.id] ? "text-red-500" : "text-gray-500"}`} />
                      <span className="text-xs mt-1 text-gray-600">Like</span>
                    </button>

                    <button className="flex flex-col items-center text-center text-gray-600 focus:outline-none">
                      <MessageCircle className="w-5 h-5 text-gray-500" />
                      <span className="text-xs mt-1 text-gray-600">Comment</span>
                    </button>

                    <button className="flex flex-col items-center text-center text-gray-600 focus:outline-none">
                      <Repeat className="w-5 h-5 text-gray-500" />
                      <span className="text-xs mt-1 text-gray-600">Repost</span>
                    </button>

                    <button className="flex flex-col items-center text-center text-gray-600 focus:outline-none">
                      <Share2 className="w-5 h-5 text-gray-500" />
                      <span className="text-xs mt-1 text-gray-600">Share</span>
                    </button>
                  </div>

                  <div className="text-sm text-gray-400"> </div>
                </div>
              </div>

              <div className="px-4 pb-4 text-xs text-gray-400">
                {/* meta / time */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
