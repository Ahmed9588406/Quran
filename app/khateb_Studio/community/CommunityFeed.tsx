/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Repeat2, Share2, MoreHorizontal, Send, ThumbsUp, Bookmark } from "lucide-react";
import { likePost, unlikePost, likeComment, unlikeComment, addComment, addReply, savePost, unsavePost } from "@/src/api/postsApi";

const DEFAULT_AVATAR = "/icons/settings/profile.png";

type Media = {
  url?: string;
  media_url?: string;
  media_type: string;
};

/**
 * Comment reply interface
 */
interface CommentReply {
  id: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  created_at: string;
  likes_count: number;
  liked_by_current_user: boolean;
}

/**
 * Comment interface
 */
interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  created_at: string;
  likes_count: number;
  liked_by_current_user: boolean;
  replies: CommentReply[];
  replies_count?: number;
}

type Post = {
  id: string;
  author_id?: string;
  user_id?: string;
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
  saved_by_current_user?: boolean;
  media?: Media[];
};

interface CommunityFeedProps {
  perPage?: number;
  refreshTrigger?: number;
}

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

const normalizeMediaUrl = (media?: Media | any): string | null => {
  if (!media) return null;
  
  // Handle both 'url' and 'media_url' field names from API
  let url = media.url || media.media_url || media.file_url || media.path;
  
  // If media is a string directly
  if (typeof media === 'string') {
    url = media;
  }
  
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  // Already a full URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // Relative URL - prepend base
  return `https://apisoapp.twingroups.com${url.startsWith('/') ? '' : '/'}${url}`;
};

// Helper to normalize avatar URLs
const normalizeAvatarUrl = (url?: string): string => {
  if (!url) return DEFAULT_AVATAR;
  if (url.startsWith("http")) return url;
  return `https://apisoapp.twingroups.com${url}`;
};

/**
 * MediaGrid component for displaying post media - shows only 2 images with +X badge
 */
function MediaGrid({ media }: { media: Media[] }) {
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  
  const handleError = (url: string) => {
    console.error("Failed to load media:", url);
    setFailedUrls(prev => new Set([...prev, url]));
  };
  
  // Filter out invalid media and already failed URLs
  const validMedia = media.filter(m => {
    const url = normalizeMediaUrl(m);
    return url && !failedUrls.has(url);
  });
  
  if (validMedia.length === 0) return null;

  const renderMediaItem = (m: Media, idx: number, className: string, showOverlay?: number) => {
    const mediaUrl = normalizeMediaUrl(m);
    if (!mediaUrl) return null;
    
    const isVideo = (m.media_type || "").toLowerCase().includes("video");
    
    return (
      <div
        key={`media-${idx}-${mediaUrl}`}
        className={`relative bg-gray-100 overflow-hidden cursor-pointer group rounded-lg ${className}`}
        onClick={() => setSelectedMediaIndex(idx)}
      >
        {isVideo ? (
          <>
            <video
              src={mediaUrl}
              className="w-full h-full object-cover"
              onError={() => handleError(mediaUrl)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
              <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-white fill-current ml-1" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <img
            src={mediaUrl}
            alt={`media-${idx}`}
            className="w-full h-full object-cover group-hover:brightness-95 transition-all"
            loading="lazy"
            onError={() => handleError(mediaUrl)}
          />
        )}
        {showOverlay && showOverlay > 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/70 transition-all">
            <span className="text-white text-4xl font-bold">+{showOverlay}</span>
          </div>
        )}
      </div>
    );
  };

  // Show only 2 images in feed, with +X badge for remaining
  const renderLayout = () => {
    const count = validMedia.length;

    // Single image - full width
    if (count === 1) {
      return (
        <div className="w-full">
          {renderMediaItem(validMedia[0], 0, "w-full max-h-[500px]")}
        </div>
      );
    }

    // Two or more images - show 2 side by side
    return (
      <div className="grid grid-cols-2 gap-1">
        {renderMediaItem(validMedia[0], 0, "aspect-square")}
        {renderMediaItem(validMedia[1], 1, "aspect-square", count > 2 ? count - 2 : undefined)}
      </div>
    );
  };
  
  return (
    <>
      {renderLayout()}

      {/* Lightbox for viewing full media */}
      {selectedMediaIndex !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setSelectedMediaIndex(null)}
            className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition z-10"
          >
            ✕
          </button>

          {validMedia.length > 1 && (
            <button
              onClick={() => setSelectedMediaIndex(Math.max(0, selectedMediaIndex - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full transition disabled:opacity-30 z-10"
              disabled={selectedMediaIndex === 0}
            >
              ‹
            </button>
          )}

          <div className="max-w-5xl max-h-[90vh] flex items-center justify-center px-16">
            {(() => {
              const m = validMedia[selectedMediaIndex];
              const mediaUrl = normalizeMediaUrl(m);
              const isVideo = (m.media_type || "").toLowerCase().includes("video");
              
              return isVideo ? (
                <video
                  src={mediaUrl || ''}
                  controls
                  autoPlay
                  className="max-w-full max-h-[90vh] rounded"
                />
              ) : (
                <img
                  src={mediaUrl || ''}
                  alt="Full view"
                  className="max-w-full max-h-[90vh] rounded object-contain"
                />
              );
            })()}
          </div>

          {validMedia.length > 1 && (
            <button
              onClick={() => setSelectedMediaIndex(Math.min(validMedia.length - 1, selectedMediaIndex + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full transition disabled:opacity-30 z-10"
              disabled={selectedMediaIndex === validMedia.length - 1}
            >
              ›
            </button>
          )}

          {validMedia.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {validMedia.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedMediaIndex(idx)}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === selectedMediaIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Avatar component with fallback handling
 */
function Avatar({ src, alt, size = 32 }: { src?: string; alt: string; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const avatarSrc = imgError || !src ? DEFAULT_AVATAR : src;
  
  return (
    <div 
      className="rounded-full overflow-hidden flex-shrink-0 bg-gray-200"
      style={{ width: size, height: size }}
    >
      <img
        src={avatarSrc}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

export default function CommunityFeed({ perPage = 10, refreshTrigger = 0 }: CommunityFeedProps) {
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

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
            p.id === id ? { ...p, likes_count: result.likesCount } : p
          )
        );
      }
    } catch (err) {
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

  const handleToggleSave = async (id: string) => {
    const prevSaved = savedIds[id];
    setSavedIds((s) => ({ ...s, [id]: !prevSaved }));
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || undefined : undefined;
      if (prevSaved) {
        await unsavePost(id, token);
      } else {
        await savePost(id, token);
      }
    } catch (err) {
      setSavedIds((s) => ({ ...s, [id]: prevSaved }));
    }
  };

  const loadPosts = useCallback(async (pageNum: number) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    try {
      const token = localStorage.getItem("access_token") ?? undefined;
      const res = await fetch(`/api/feed?page=${pageNum}&per_page=${perPage}`, {
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

      // Debug: Log posts with their media
      console.log("=== FEED POSTS LOADED ===");
      console.log("Total posts:", items.length);
      const postsWithMedia = items.filter(p => p.media && p.media.length > 0);
      console.log("Posts with media:", postsWithMedia.length);
      postsWithMedia.forEach((post) => {
        console.log(`Post ${post.id}:`, post.media);
      });
      console.log("=========================");

      if (pageNum === 1) {
        setPosts(items);
        const likedState: Record<string, boolean> = {};
        const savedState: Record<string, boolean> = {};
        items.forEach((p) => {
          likedState[p.id] = p.liked_by_me ?? false;
          savedState[p.id] = p.saved_by_current_user ?? false;
        });
        setLikedIds(likedState);
        setSavedIds(savedState);
      } else {
        setPosts((prev) => {
          // Deduplicate: only add items that aren't already in the list
          const existingIds = new Set(prev.map((p) => p.id));
          const newItems = items.filter((item) => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
        setLikedIds((prevLiked) => {
          const newLiked = { ...prevLiked };
          items.forEach((p) => {
            newLiked[p.id] = p.liked_by_me ?? false;
          });
          return newLiked;
        });
        setSavedIds((prevSaved) => {
          const newSaved = { ...prevSaved };
          items.forEach((p) => {
            newSaved[p.id] = p.saved_by_current_user ?? false;
          });
          return newSaved;
        });
      }

      setHasMore(items.length >= perPage);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [perPage]);

  // Initial load and refresh when refreshTrigger changes
  useEffect(() => {
    // Clear existing posts before refreshing to avoid duplicates
    setPosts([]);
    setLikedIds({});
    setSavedIds({});
    setPage(1);
    setHasMore(true);
    loadPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      loadPosts(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore, loading]);

  return (
    <div className="w-full">
      {loading && posts.length === 0 && (
        <div className="text-sm text-gray-600 text-center py-4">Loading posts...</div>
      )}
      {error && posts.length === 0 && (
        <div className="text-sm text-red-500 text-center py-4">Error: {error}</div>
      )}
      {!loading && !error && posts.length === 0 && (
        <div className="text-sm text-gray-600 text-center py-4">No posts found.</div>
      )}

      <div className="flex flex-col gap-4">
        {posts.map((post, index) => (
          <PostCard
            key={`${post.id}-${index}`}
            post={post}
            liked={likedIds[post.id]}
            saved={savedIds[post.id]}
            onToggleLike={() => handleToggleLike(post.id)}
            onToggleSave={() => handleToggleSave(post.id)}
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="py-8 flex justify-center">
        {isLoadingMore && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600">Loading more posts...</span>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <span className="text-sm text-gray-500">No more posts</span>
        )}
      </div>
    </div>
  );
}

interface PostCardProps {
  post: Post;
  liked: boolean;
  saved: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
}

/**
 * Single Comment Component with reply fetching
 */
interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUserAvatar: string;
  currentUserName: string;
  onLikeComment: (commentId: string) => void;
  onReplyToComment: (commentId: string, content: string) => void;
}

function CommentItem({ comment, postId, currentUserAvatar, currentUserName, onLikeComment, onReplyToComment }: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentReply[]>(comment.replies || []);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [repliesFetched, setRepliesFetched] = useState(false);

  const handleSubmitReply = async () => {
    if (replyContent.trim()) {
      const tempId = `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      // Add optimistic reply
      const newReply: CommentReply = {
        id: tempId,
        author: {
          name: currentUserName,
          avatar: currentUserAvatar,
          username: "current_user",
        },
        content: replyContent.trim(),
        created_at: new Date().toISOString(),
        likes_count: 0,
        liked_by_current_user: false,
      };
      setReplies((prev) => [...prev, newReply]);
      
      const replyText = replyContent.trim();
      setReplyContent("");
      setShowReplyInput(false);
      setShowReplies(true);

      // Call API to add reply
      try {
        const token = localStorage.getItem("access_token") || undefined;
        const result = await addReply(postId, comment.id, replyText, token);
        
        // Update the temp reply with the real ID from server
        if (result.success && result.reply) {
          setReplies((prev) =>
            prev.map((r) =>
              r.id === tempId
                ? {
                    ...r,
                    id: result.reply!.id,
                    created_at: result.reply!.created_at || r.created_at,
                  }
                : r
            )
          );
        }
      } catch (err) {
        console.error("Error posting reply:", err);
        // Remove the optimistic reply on error
        setReplies((prev) => prev.filter((r) => r.id !== tempId));
      }

      onReplyToComment(comment.id, replyText);
    }
  };

  const fetchReplies = async () => {
    if (repliesFetched || isLoadingReplies) return;
    
    setIsLoadingReplies(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoadingReplies(false);
        return;
      }

      const res = await fetch(`/api/comments/${comment.id}/replies`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch replies:", res.status);
        setReplies([]);
        return;
      }

      const data = await res.json();
      const repliesArray = data?.replies || (Array.isArray(data) ? data : []);
      
      const fetchedReplies: CommentReply[] = repliesArray.map((r: any) => ({
        id: r.id,
        author: {
          name: r.author?.display_name || r.author?.username || r.display_name || r.username || "User",
          avatar: normalizeAvatarUrl(r.author?.avatar_url || r.author?.avatar || r.avatar_url || r.avatar),
          username: r.author?.username || r.username || "",
        },
        content: r.content || r.text || "",
        created_at: r.created_at,
        likes_count: r.likes_count || 0,
        liked_by_current_user: r.liked_by_current_user || false,
      }));
      
      setReplies(fetchedReplies);
      setRepliesFetched(true);
    } catch (err) {
      console.error("Error fetching replies:", err);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleToggleReplies = async () => {
    if (!showReplies && !repliesFetched && (comment.replies_count || 0) > 0) {
      await fetchReplies();
    }
    setShowReplies(!showReplies);
  };

  const repliesCount = comment.replies_count || replies.length;

  return (
    <div className="flex gap-3">
      <Avatar src={comment.author.avatar} alt={comment.author.name} size={32} />
      <div className="flex-1">
        <div className="bg-gray-100 rounded-xl px-3 py-2">
          <span className="text-sm font-semibold text-gray-900">{comment.author.name}</span>
          <p className="text-sm text-gray-700">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 px-2">
          <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
          <button
            onClick={() => onLikeComment(comment.id)}
            className={`text-xs font-medium ${comment.liked_by_current_user ? "text-[#8A1538]" : "text-gray-500 hover:text-gray-700"}`}
          >
            Like {comment.likes_count > 0 && `(${comment.likes_count})`}
          </button>
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            Reply
          </button>
        </div>

        {/* Reply Input */}
        {showReplyInput && (
          <div className="flex items-center gap-2 mt-2 pl-2">
            <Avatar src={currentUserAvatar} alt="Your avatar" size={24} />
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${comment.author.name}...`}
              className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-[#8A1538]"
              onKeyDown={(e) => e.key === "Enter" && handleSubmitReply()}
            />
            <button
              onClick={handleSubmitReply}
              disabled={!replyContent.trim()}
              className="p-1.5 text-[#8A1538] hover:bg-gray-100 rounded-full disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Replies */}
        {repliesCount > 0 && (
          <div className="mt-2 pl-2">
            {!showReplies ? (
              <button
                onClick={handleToggleReplies}
                className="text-xs text-[#8A1538] font-medium hover:underline"
              >
                View {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
              </button>
            ) : (
              <div className="space-y-3">
                {isLoadingReplies ? (
                  <div className="text-xs text-gray-500">Loading replies...</div>
                ) : (
                  <>
                    {replies.map((reply, index) => (
                      <div key={reply.id || `reply-${index}`} className="flex gap-2">
                        <Avatar src={reply.author.avatar} alt={reply.author.name} size={24} />
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-xl px-3 py-1.5">
                            <span className="text-xs font-semibold text-gray-900">{reply.author.name}</span>
                            <p className="text-xs text-gray-700">{reply.content}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 px-2">
                            <span className="text-xs text-gray-500">{formatDate(reply.created_at)}</span>
                            <button className="text-xs text-gray-500 hover:text-gray-700">Like</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowReplies(false)}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Hide replies
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, liked, saved, onToggleLike, onToggleSave }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.comments_count ?? 0);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Get current user info from localStorage
  const [currentUserAvatar, setCurrentUserAvatar] = useState(DEFAULT_AVATAR);
  const [currentUserName, setCurrentUserName] = useState("You");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAvatar = localStorage.getItem("user_avatar");
      const storedName = localStorage.getItem("user_display_name") || localStorage.getItem("username");
      if (storedAvatar) setCurrentUserAvatar(normalizeAvatarUrl(storedAvatar));
      if (storedName) setCurrentUserName(storedName);
    }
  }, []);
  
  const userId = post.user_id || post.author_id;
  const profileHref = userId ? `/user-profile/${userId}` : '#';

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoadingComments(false);
        return;
      }

      const res = await fetch(`/api/posts/${post.id}/comments?limit=10`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch comments:", res.status);
        setComments([]);
        return;
      }

      const data = await res.json();
      const commentsArray = data?.comments || (Array.isArray(data) ? data : []);
      
      const fetchedComments: Comment[] = commentsArray.map((c: any) => ({
        id: c.id,
        author: {
          name: c.author?.display_name || c.author?.username || c.display_name || c.username || "User",
          avatar: normalizeAvatarUrl(c.author?.avatar_url || c.author?.avatar || c.avatar_url || c.avatar),
          username: c.author?.username || c.username || "",
        },
        content: c.content || c.text || "",
        created_at: c.created_at,
        likes_count: c.likes_count || 0,
        liked_by_current_user: c.liked_by_current_user || false,
        replies_count: c.replies_count || 0,
        replies: (c.replies || []).map((r: any) => ({
          id: r.id,
          author: {
            name: r.author?.display_name || r.author?.username || r.display_name || r.username || "User",
            avatar: normalizeAvatarUrl(r.author?.avatar_url || r.author?.avatar || r.avatar_url || r.avatar),
            username: r.author?.username || r.username || "",
          },
          content: r.content || r.text || "",
          created_at: r.created_at,
          likes_count: r.likes_count || 0,
          liked_by_current_user: r.liked_by_current_user || false,
        })),
      }));
      
      setComments(fetchedComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleToggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      await fetchComments();
    }
  };

  const handleSubmitComment = async () => {
    if (commentText.trim()) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newComment: Comment = {
        id: tempId,
        author: {
          name: currentUserName,
          avatar: currentUserAvatar,
          username: "current_user",
        },
        content: commentText.trim(),
        created_at: new Date().toISOString(),
        likes_count: 0,
        liked_by_current_user: false,
        replies: [],
        replies_count: 0,
      };
      setComments((prev) => [newComment, ...prev]);
      setLocalCommentsCount((prev) => prev + 1);
      
      const commentContent = commentText.trim();
      setCommentText("");
      
      try {
        const token = localStorage.getItem("access_token") || undefined;
        const result = await addComment(post.id, commentContent, undefined, token);
        
        // Update the temp comment with the real ID from server
        if (result.success && result.comment) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === tempId
                ? {
                    ...c,
                    id: result.comment!.id,
                    created_at: result.comment!.created_at || c.created_at,
                  }
                : c
            )
          );
        }
      } catch (err) {
        console.error("Error posting comment:", err);
        // Remove the optimistic comment on error
        setComments((prev) => prev.filter((c) => c.id !== tempId));
        setLocalCommentsCount((prev) => prev - 1);
      }
    }
  };

  const handleLikeComment = async (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId);
    const isCurrentlyLiked = comment?.liked_by_current_user ?? false;

    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              liked_by_current_user: !c.liked_by_current_user,
              likes_count: c.liked_by_current_user ? c.likes_count - 1 : c.likes_count + 1,
            }
          : c
      )
    );

    try {
      const token = localStorage.getItem("access_token") || undefined;
      const result = isCurrentlyLiked
        ? await unlikeComment(commentId, token)
        : await likeComment(commentId, token);
      
      if (result.likesCount !== undefined) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, likes_count: result.likesCount! }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Failed to like/unlike comment:", error);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                liked_by_current_user: isCurrentlyLiked,
                likes_count: isCurrentlyLiked ? c.likes_count + 1 : c.likes_count - 1,
              }
            : c
        )
      );
    }
  };

  const handleReplyToComment = (commentId: string, replyContent: string) => {
    const newReply: CommentReply = {
      id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      author: {
        name: currentUserName,
        avatar: currentUserAvatar,
        username: "current_user",
      },
      content: replyContent,
      created_at: new Date().toISOString(),
      likes_count: 0,
      liked_by_current_user: false,
    };
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId 
          ? { 
              ...c, 
              replies: [...(c.replies || []), newReply],
              replies_count: (c.replies_count || 0) + 1
            } 
          : c
      )
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#f0e6e5] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={profileHref} className="w-11 h-11 relative rounded-full overflow-hidden bg-gray-100 flex-shrink-0 hover:opacity-80 transition-opacity">
          {post.avatar_url ? (
            <Image
              src={post.avatar_url}
              alt={post.display_name ?? post.username ?? "avatar"}
              fill
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : (
            <Image src={DEFAULT_AVATAR} alt="avatar" fill style={{ objectFit: "cover" }} />
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={profileHref} className="font-semibold text-sm text-gray-900 truncate hover:underline">
              {post.display_name ?? post.username}
            </Link>
            <span className="text-xs text-gray-400">· {formatDate(post.created_at)}</span>
          </div>
          {post.username && (
            <p className="text-xs text-gray-500">@{post.username}</p>
          )}
        </div>

        {post.is_following === 0 && (
          <button className="bg-[#8A1538] text-white text-sm px-3 py-1 rounded-md font-medium hover:bg-[#6d1029] transition-colors">
            Follow
          </button>
        )}

        <button aria-label="more" className="ml-2 text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-800 leading-relaxed">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="px-4 pb-4">
          <MediaGrid media={post.media} />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <button
            onClick={onToggleLike}
            className={`flex items-center gap-2 text-sm ${liked ? "text-[#8A1538]" : "text-gray-500 hover:text-[#8A1538]"}`}
          >
            <ThumbsUp className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            <span>{liked ? "Liked" : "Like"} {(post.likes_count ?? 0) > 0 ? `(${post.likes_count})` : ""}</span>
          </button>

          <button 
            onClick={handleToggleComments}
            className={`flex items-center gap-2 text-sm ${showComments ? "text-[#8A1538]" : "text-gray-500 hover:text-gray-700"}`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comment {localCommentsCount > 0 ? `(${localCommentsCount})` : ""}</span>
          </button>

          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <Repeat2 className="w-5 h-5" />
            <span>Repost {(post.shares_count ?? 0) > 0 ? `(${post.shares_count})` : ""}</span>
          </button>

          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>

          <button 
            onClick={onToggleSave}
            className={`flex items-center gap-2 text-sm ${saved ? "text-[#8A1538]" : "text-gray-500 hover:text-[#8A1538]"}`}
          >
            <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Comment Input */}
          <div className="flex items-center gap-3 py-3">
            <Avatar src={currentUserAvatar} alt="Your avatar" size={32} />
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-[#8A1538]"
                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className="p-2 text-[#8A1538] hover:bg-gray-100 rounded-full disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="text-center text-gray-500 text-sm py-4">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first to comment!</div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <CommentItem
                  key={comment.id || `comment-${index}`}
                  comment={comment}
                  postId={post.id}
                  currentUserAvatar={currentUserAvatar}
                  currentUserName={currentUserName}
                  onLikeComment={handleLikeComment}
                  onReplyToComment={handleReplyToComment}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
