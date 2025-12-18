/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Repeat2, Share2, MoreHorizontal, Send, ThumbsUp, Bookmark } from "lucide-react";
import { likeComment, unlikeComment, addComment, addReply } from "@/src/api/postsApi";

const DEFAULT_AVATAR = "/icons/settings/profile.png";

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

type Media = {
  url?: string;
  media_url?: string;
  media_type: string;
};

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

interface PostCardProps {
  post: Post;
  liked: boolean;
  saved: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
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
  
  let url = media.url || media.media_url;
  
  if (typeof media === 'string') {
    url = media;
  }
  
  if (!url || typeof url !== 'string') return null;
  
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  return `http://apisoapp.twingroups.com${url.startsWith('/') ? '' : '/'}${url}`;
};

const normalizeAvatarUrl = (url?: string): string => {
  if (!url) return DEFAULT_AVATAR;
  if (url.startsWith("http")) return url;
  return `http://apisoapp.twingroups.com${url}`;
};

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

function MediaGrid({ media }: { media: Media[] }) {
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  
  const handleError = (url: string) => {
    setFailedUrls(prev => new Set([...prev, url]));
  };
  
  const validMedia = media.filter(m => {
    const url = normalizeMediaUrl(m);
    return url && !failedUrls.has(url);
  });
  
  if (validMedia.length === 0) return null;
  
  return (
    <div className={`grid gap-2 ${validMedia.length === 1 ? '' : validMedia.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
      {validMedia.map((m, idx) => {
        const mediaUrl = normalizeMediaUrl(m);
        if (!mediaUrl) return null;
        
        const isVideo = (m.media_type || "").toLowerCase().includes("video");
        
        return isVideo ? (
          <video
            key={`video-${idx}-${mediaUrl}`}
            src={mediaUrl}
            controls
            className="w-full max-h-[480px] rounded-lg bg-black object-cover"
            onError={() => handleError(mediaUrl)}
          />
        ) : (
          <div 
            key={`image-${idx}-${mediaUrl}`} 
            className={`relative rounded-lg overflow-hidden bg-gray-100 ${validMedia.length === 1 ? 'w-full h-80' : 'aspect-square'}`}
          >
            <img
              src={mediaUrl}
              alt={`media-${idx}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => handleError(mediaUrl)}
            />
          </div>
        );
      })}
    </div>
  );
}

function CommentItem({ comment, postId, currentUserAvatar, currentUserName, onLikeComment, onReplyToComment }: any) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentReply[]>(comment.replies || []);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [repliesFetched, setRepliesFetched] = useState(false);

  const handleSubmitReply = async () => {
    if (replyContent.trim()) {
      const tempId = `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

      try {
        const token = localStorage.getItem("access_token") || undefined;
        const result = await addReply(postId, comment.id, replyText, token);
        
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
        setReplies((prev) => prev.filter((r) => r.id !== tempId));
      }

      onReplyToComment(comment.id, replyText);
    }
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

        {repliesCount > 0 && (
          <div className="mt-2 pl-2">
            {!showReplies ? (
              <button
                onClick={() => setShowReplies(true)}
                className="text-xs text-[#8A1538] font-medium hover:underline"
              >
                View {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
              </button>
            ) : (
              <div className="space-y-3">
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostCard({ post, liked, saved, onToggleLike, onToggleSave }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.comments_count ?? 0);
  
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
          <img
            src={normalizeAvatarUrl(post.avatar_url)}
            alt={post.display_name ?? post.username ?? "avatar"}
            className="w-full h-full object-cover"
          />
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
