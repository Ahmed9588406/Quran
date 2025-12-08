"use client";
import { useState } from "react";
import { MessageCircle, Repeat2, Share2, MoreHorizontal, Send, ThumbsUp } from "lucide-react";

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
  isOwnProfile?: boolean;
  currentUserAvatar?: string;
  currentUserName?: string;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, content: string) => void;
  onShare?: (postId: string) => void;
  onRepost?: (postId: string) => void;
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

/**
 * Single Comment Component
 */
interface CommentItemProps {
  comment: Comment;
  currentUserAvatar: string;
  onLikeComment: (commentId: string) => void;
  onReplyToComment: (commentId: string, content: string) => void;
}

function CommentItem({ comment, currentUserAvatar, onLikeComment, onReplyToComment }: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReplyToComment(comment.id, replyContent.trim());
      setReplyContent("");
      setShowReplyInput(false);
    }
  };

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
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 pl-2">
            {!showReplies ? (
              <button
                onClick={() => setShowReplies(true)}
                className="text-xs text-[#7b2030] font-medium hover:underline"
              >
                View {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            ) : (
              <div className="space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-2">
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * PostCard Component - Displays a single post with comments and reply functionality
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
  isOwnProfile = false,
  currentUserAvatar = DEFAULT_AVATAR,
  currentUserName = "You",
  onLike,
  onComment,
  onShare,
  onRepost,
}: PostCardProps) {
  const [liked, setLiked] = useState(liked_by_current_user);
  const [likeCount, setLikeCount] = useState(likes_count);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const authorName = display_name || username || "User";
  const authorAvatar = avatar_url || DEFAULT_AVATAR;
  const timeAgo = formatRelativeTime(created_at);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    onLike?.(id);
  };

  const handleToggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
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
      // Handle different response shapes
      let fetchedComments: Comment[] = [];
      const commentsArray = data?.comments || (Array.isArray(data) ? data : []);
      
      fetchedComments = commentsArray.map((c: any) => ({
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

  // Helper to normalize avatar URLs
  const normalizeAvatarUrl = (url?: string): string => {
    if (!url) return DEFAULT_AVATAR;
    if (url.startsWith("http")) return url;
    return `http://192.168.1.18:9001${url}`;
  };

  // Helper to normalize media URLs
  const normalizeMediaUrl = (url?: string): string => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://192.168.1.18:9001${url}`;
  };

  const handleSubmitComment = async () => {
    if (commentText.trim()) {
      // Add optimistic comment
      const newComment: Comment = {
        id: `temp-${Date.now()}`,
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
      };
      setComments((prev) => [newComment, ...prev]);
      
      const commentContent = commentText.trim();
      setCommentText("");
      
      // Call API to add comment
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          await fetch(`/api/posts/${id}/comments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: commentContent }),
          });
        }
      } catch (err) {
        console.error("Error posting comment:", err);
      }
      
      onComment?.(id, commentContent);
    }
  };

  const handleLikeComment = (commentId: string) => {
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
  };

  const handleReplyToComment = (commentId: string, replyContent: string) => {
    const newReply: CommentReply = {
      id: `reply-${Date.now()}`,
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
        c.id === commentId ? { ...c, replies: [...(c.replies || []), newReply] } : c
      )
    );
  };

  // Suppress unused variable warnings
  void likeCount;

  return (
    <div className="bg-white rounded-lg border border-[#f0e6e5] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-0">
        <div className="flex items-center gap-3">
          <Avatar src={authorAvatar} alt={authorName} size={40} />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{authorName}</h3>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isOwnProfile && (
            <button className="px-4 py-1 bg-[#7b2030] text-white text-xs font-medium rounded-full hover:bg-[#5e0e27] transition-colors">
              Follow
            </button>
          )}
          <button
            aria-label="More options"
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {content && (
        <p className="px-4 mt-3 text-sm text-gray-700 leading-relaxed">{content}</p>
      )}

      {/* Media */}
      {media && media.length > 0 && (
        <div className="mt-3">
          {media.map((item, index) => {
            const mediaUrl = normalizeMediaUrl(item.url);
            return (
              <div key={index} className="relative">
                {item.media_type === "video" ? (
                  <div className="relative aspect-video bg-black">
                    <video
                      src={mediaUrl}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                      poster={mediaUrl}
                    />
                  </div>
                ) : (
                  <div className="relative w-full">
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 mt-3">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm ${
            liked ? "text-[#7b2030]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ThumbsUp className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
          <span>Like</span>
        </button>

        <button
          onClick={handleToggleComments}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <MessageCircle className="w-5 h-5" />
          <span>comment</span>
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
                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
              />
              <button
                onClick={handleSubmitComment}
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
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first to comment!</div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserAvatar={currentUserAvatar}
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
