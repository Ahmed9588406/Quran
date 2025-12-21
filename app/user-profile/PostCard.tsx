/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { MessageCircle, Repeat2, Share2, MoreHorizontal, Send, ThumbsUp, X, Bookmark } from "lucide-react";
import { likeComment, unlikeComment, addComment, addReply, likePost, unlikePost, savePost, unsavePost } from "@/src/api/postsApi";
import Image from "next/image";
import Link from "next/link";
import SavePostModal from "./SavePostModal";

const DEFAULT_AVATAR = "/icons/settings/profile.png";

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

/**
 * Media interface for post media
 */
interface Media {
  url: string;
  media_type: string;
}


/**
 * Props for PostCard component
 */
interface PostCardProps {
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
  isOwnProfile?: boolean;
  currentUserAvatar?: string;
  currentUserName?: string;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, content: string) => void;
  onShare?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onUnsave?: (postId: string) => void;
  user_id?: string;
}

/**
 * Format relative time from date string
 */
function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
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
}

// Helper to normalize avatar URLs
const normalizeAvatarUrl = (url?: string): string => {
  if (!url) return DEFAULT_AVATAR;
  if (url.startsWith("http")) return url;
  return `http://apisoapp.twingroups.com${url}`;
};

// Helper to normalize media URLs
const normalizeMediaUrl = (url?: string): string | null => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://apisoapp.twingroups.com${url}`;
};

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
          <span className="text-xs text-gray-500">{formatRelativeTime(comment.created_at)}</span>
          <button
            onClick={() => onLikeComment(comment.id)}
            className={`text-xs font-medium ${comment.liked_by_current_user ? "text-[#7b2030]" : "text-gray-500 hover:text-gray-700"}`}
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
              className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-[#7b2030]"
              onKeyDown={(e) => e.key === "Enter" && handleSubmitReply()}
            />
            <button
              onClick={handleSubmitReply}
              disabled={!replyContent.trim()}
              className="p-1.5 text-[#7b2030] hover:bg-gray-100 rounded-full disabled:opacity-50"
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
                className="text-xs text-[#7b2030] font-medium hover:underline"
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
                            <span className="text-xs text-gray-500">{formatRelativeTime(reply.created_at)}</span>
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


/**
 * Facebook-style Media Grid Component
 */
interface MediaGridProps {
  media: Media[];
  onImageClick: (index: number) => void;
}

function MediaGrid({ media, onImageClick }: MediaGridProps) {
  // Check for video types - handle both "video" and "video/mp4", "video/webm", etc.
  const isVideo = (m: Media) => m.media_type === "video" || m.media_type?.startsWith("video/");
  const imageMedia = media.filter(m => !isVideo(m));
  const videoMedia = media.filter(m => isVideo(m));
  const totalImages = imageMedia.length;

  // Render videos first (full width) with better styling
  const renderVideos = () => (
    <>
      {videoMedia.map((item, index) => {
        const mediaUrl = normalizeMediaUrl(item.url);
        if (!mediaUrl) return null;
        return (
          <div key={`video-${index}`} className="relative aspect-video bg-black rounded-lg overflow-hidden mb-2">
            <video
              src={mediaUrl}
              className="w-full h-full object-contain"
              controls
              preload="metadata"
              playsInline
              onError={(e) => {
                console.error("Video failed to load:", mediaUrl);
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
              }}
            />
          </div>
        );
      })}
    </>
  );

  // If only videos, render them without image grid
  if (totalImages === 0 && videoMedia.length > 0) {
    return <div className="mt-3">{renderVideos()}</div>;
  }

  // Single image - full width
  if (totalImages === 1) {
    const mediaUrl = normalizeMediaUrl(imageMedia[0].url);
    if (!mediaUrl) return <div className="mt-3">{renderVideos()}</div>;
    return (
      <div className="mt-3">
        {renderVideos()}
        <div 
          className="relative w-full cursor-pointer"
          onClick={() => onImageClick(0)}
        >
          <img
            src={mediaUrl}
            alt="Post media"
            className="w-full h-auto object-cover max-h-[500px]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      </div>
    );
  }

  // Two or more images - show only 2 side by side with +X badge for remaining
  if (totalImages >= 2) {
    const remainingCount = totalImages > 2 ? totalImages - 2 : 0;
    return (
      <div className="mt-3">
        {renderVideos()}
        <div className="grid grid-cols-2 gap-1">
          {imageMedia.slice(0, 2).map((item, index) => {
            const mediaUrl = normalizeMediaUrl(item.url);
            if (!mediaUrl) return null;
            const isLastVisible = index === 1 && remainingCount > 0;
            return (
              <div 
                key={index} 
                className="relative aspect-square cursor-pointer overflow-hidden group"
                onClick={() => onImageClick(index)}
              >
                <img
                  src={mediaUrl}
                  alt={`Post media ${index + 1}`}
                  className="w-full h-full object-cover group-hover:brightness-95 transition-all"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {isLastVisible && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/70 transition-all">
                    <span className="text-white text-4xl font-bold">+{remainingCount}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback for edge cases
  if (totalImages === 0 && videoMedia.length > 0) {
    return (
      <div className="mt-3">
        {renderVideos()}
      </div>
    );
  }

  // This line should never be reached but kept for safety
  return (
    <div className="mt-3">
      {renderVideos()}
      <div className="grid grid-cols-2 gap-1">
        {imageMedia.slice(0, 2).map((item, index) => {
          const mediaUrl = normalizeMediaUrl(item.url);
          if (!mediaUrl) return null;
          const isLastVisible = index === 3 && remainingCount > 0;
          return (
            <div 
              key={index} 
              className="relative aspect-square cursor-pointer overflow-hidden"
              onClick={() => onImageClick(index)}
            >
              <img
                src={mediaUrl}
                alt={`Post media ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {isLastVisible && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">+{remainingCount}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Image Lightbox Component
 */
interface LightboxProps {
  media: Media[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ media, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const currentMedia = media[currentIndex];
  const mediaUrl = normalizeMediaUrl(currentMedia?.url);

  if (!mediaUrl) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full z-10"
      >
        <X className="w-6 h-6" />
      </button>
      
      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 text-white p-3 hover:bg-white/20 rounded-full text-3xl"
        >
          ‹
        </button>
      )}
      
      <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={mediaUrl}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>
      
      {currentIndex < media.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 text-white p-3 hover:bg-white/20 rounded-full text-3xl"
        >
          ›
        </button>
      )}
      
      <div className="absolute bottom-4 text-white text-sm">
        {currentIndex + 1} / {media.length}
      </div>
    </div>
  );
}


/**
 * PostCard Component - Displays a single post with Facebook-style media grid and comments
 */
export default function PostCard({
  id,
  content,
  created_at,
  username,
  display_name,
  avatar_url,
  media,
  likes_count = 0,
  liked_by_current_user = false,
  saved_by_current_user = false,
  isOwnProfile = false,
  currentUserAvatar = DEFAULT_AVATAR,
  currentUserName = "You",
  onLike,
  onComment,
  onShare,
  onRepost,
  onUnsave,
  user_id,
}: PostCardProps) {
  // All state hooks must be declared at the top level
  const [liked, setLiked] = useState(liked_by_current_user);
  const [likeCount, setLikeCount] = useState(likes_count);
  const [saved, setSaved] = useState(saved_by_current_user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  const authorName = display_name || username || "User";
  const authorAvatar = normalizeAvatarUrl(avatar_url);
  const timeAgo = formatRelativeTime(created_at);
  const imageMedia = media?.filter(m => m.media_type !== "video") || [];
  const hasValidUserId = user_id && user_id !== '';
  const profileHref = hasValidUserId ? `/user-profile/${user_id}` : '#';

  // Ensure comments is always an array
  const safeComments: Comment[] = Array.isArray(comments) ? comments : [];

  /**
   * Toggle follow/unfollow for the post author
   * Endpoint: POST/DELETE http://apisoapp.twingroups.com/follow/{{user_id}}
   * Body: {"target_user_id":"..."}
   */
  const handleFollowToggle = async () => {
    if (!user_id || isTogglingFollow) return;
    
    const prev = isFollowing;
    setIsFollowing(!prev);
    setIsTogglingFollow(true);
    
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/follow", {
        method: prev ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ target_user_id: user_id }),
      });
      
      if (!res.ok) {
        // Revert on failure
        setIsFollowing(prev);
      }
    } catch (err) {
      console.error("Follow toggle failed:", err);
      setIsFollowing(prev);
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const handleLike = () => {
    // Optimistic update + call API
    const prev = liked;
    const prevCount = likeCount;
    setLiked(!prev);
    setLikeCount(prev ? Math.max(0, prevCount - 1) : prevCount + 1);

    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || undefined : undefined;
        const result = prev ? await unlikePost(id, token) : await likePost(id, token);
        if (result && result.likesCount !== undefined) {
          setLikeCount(result.likesCount);
        }
      } catch (err) {
        console.error("Failed to toggle like on post:", err);
        // revert optimistic update
        setLiked(prev);
        setLikeCount(prevCount);
      }
    })();

    // preserve external callback
    onLike?.(id);
  };

  const handleToggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && safeComments.length === 0) {
      await fetchComments();
    }
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoadingComments(false);
        return;
      }

      const res = await fetch(`/api/posts/${id}/comments?limit=10`, {
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

  const handleSubmitComment = async (imageUrl?: string) => {
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
      
      const commentContent = commentText.trim();
      setCommentText("");
      
      try {
        const token = localStorage.getItem("access_token") || undefined;
        const result = await addComment(id, commentContent, imageUrl, token);
        
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
      }
      
      onComment?.(id, commentContent);
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

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
  };

  const handleSavePost = async () => {
    setIsSavingPost(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || undefined : undefined;
      await savePost(id, token);
      setSaved(true);
      setTimeout(() => setShowSaveModal(false), 500);
    } catch (err) {
      console.error("Failed to save post:", err);
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleUnsavePost = async () => {
    setIsSavingPost(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || undefined : undefined;
      await unsavePost(id, token);
      setSaved(false);
      onUnsave?.(id);
      setTimeout(() => setShowSaveModal(false), 500);
    } catch (err) {
      console.error("Failed to unsave post:", err);
    } finally {
      setIsSavingPost(false);
    }
  };

  // Debug save handler — use local API via savePost(...) to avoid CORS
  async function handleBackendSave(postId: string, setSaved?: (v: boolean) => void) {
    console.log("[debug] Calling local save API for postId:", postId);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || undefined : undefined;
      const result = await savePost(postId, token);
      console.log("[debug] savePost result:", result);
      if (result?.success) {
        setSaved?.(true);
        console.log("[debug] Save succeeded for post:", postId);
      } else {
        console.warn("[debug] Save reported no success:", result);
      }
    } catch (err) {
      console.error("[debug] Error calling local save API:", err);
    }
  }
  
  return (
    <>
      <div className="bg-white rounded-lg border border-[#f0e6e5] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-0">
          <div className="flex items-center gap-3">
            {hasValidUserId ? (
              <Link href={profileHref} className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 cursor-pointer hover:opacity-80 transition-opacity">
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_AVATAR;
                    }}
                  />
                </div>
              </Link>
            ) : (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_AVATAR;
                  }}
                />
              </div>
            )}
            
            <div>
              {hasValidUserId ? (
                <Link href={profileHref} className="font-semibold text-sm text-gray-900 hover:underline cursor-pointer">
                  {authorName}
                </Link>
              ) : (
                <span className="font-semibold text-sm text-gray-900">{authorName}</span>
              )}
              
              {username && (
                hasValidUserId ? (
                  <Link href={profileHref}>
                    <p className="text-xs text-gray-500 hover:underline cursor-pointer">@{username}</p>
                  </Link>
                ) : (
                  <p className="text-xs text-gray-500">@{username}</p>
                )
              )}
              
              {created_at && <p className="text-xs text-gray-400">{timeAgo}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOwnProfile && hasValidUserId && (
              <button 
                onClick={handleFollowToggle}
                disabled={isTogglingFollow}
                className={`px-4 py-1 text-xs font-medium rounded-full transition-colors ${
                  isFollowing
                    ? "bg-white text-[#7b2030] border border-[#7b2030] hover:bg-[#fffaf9]"
                    : "bg-[#7b2030] text-white hover:bg-[#5e0e27]"
                } ${isTogglingFollow ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isTogglingFollow ? "..." : isFollowing ? "Following" : "Follow"}
              </button>
            )}
            
            <div className="relative">
              <button
                aria-label="More options"
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={() => setMenuOpen((s) => !s)}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-50">
                  <button
                    onClick={() => {
                      setShowSaveModal(true);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    {saved ? "Unsave post" : "Save post"}
                  </button>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {content && (
          <p className="px-4 mt-3 text-sm text-gray-700 leading-relaxed">{content}</p>
        )}

        {/* Media Grid */}
        {media && media.length > 0 && (
          <MediaGrid media={media} onImageClick={handleImageClick} />
        )}

        {/* Actions (replace the existing actions JSX with this changed block) */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 mt-3">
          {!liked ? (
            <button
              onClick={handleLike}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#7b2030]"
            >
              <ThumbsUp className="w-5 h-5" />
              <span>Like{likeCount > 0 ? ` (${likeCount})` : ""}</span>
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
              <ThumbsUp className="w-5 h-5 fill-current text-[#7b2030]" />
              <span>Dislike{likeCount > 0 ? ` (${likeCount})` : ""}</span>
            </button>
          )}
          <button
            onClick={handleToggleComments}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comment</span>
          </button>

          <button
            onClick={() => onRepost?.(id)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <Repeat2 className="w-5 h-5" />
            <span>Repost</span>
          </button>

          <button
            onClick={() => onShare?.(id)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>

          {/* Save button with filled state when saved */}
          <button
            onClick={async () => {
              if (saved) {
                await handleUnsavePost();
              } else {
                await handleSavePost();
              }
            }}
            className={`flex items-center gap-2 text-sm ${
              saved 
                ? "text-[#7b2030]" 
                : "text-gray-500 hover:text-[#7b2030]"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${saved ? "fill-[#7b2030]" : ""}`} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
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
                  className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-[#7b2030]"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitComment(undefined)}
                />
                <button
                  onClick={() => handleSubmitComment(undefined)}
                  disabled={!commentText.trim()}
                  className="p-2 text-[#7b2030] hover:bg-gray-100 rounded-full disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="text-center text-gray-500 text-sm py-4">Loading comments...</div>
            ) : safeComments.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first to comment!</div>
            ) : (
              <div className="space-y-4">
                {safeComments.map((comment, index) => (
                  <CommentItem
                    key={comment.id || `comment-${index}`}
                    comment={comment}
                    postId={id}
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
    </>
  );
}

