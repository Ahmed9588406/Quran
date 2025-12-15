"use client";

/**
 * CommentsModal Component
 * 
 * Displays comments for a reel and allows users to add new comments.
 * Endpoint: POST /reels/{reel_id}/comment
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Heart, Trash2, Loader2 } from 'lucide-react';
import { ReelComment } from '@/lib/reels/types';
import { reelsAPI } from '@/lib/reels/api';

const BASE_URL = 'http://192.168.1.18:9001';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reelId: string;
  onCommentAdded?: () => void;
}

function normalizeUrl(url?: string | null): string {
  if (!url) return "/icons/settings/profile.png";
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

export function CommentsModal({ isOpen, onClose, reelId, onCommentAdded }: CommentsModalProps) {
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);


  // Get current user ID from localStorage
  const getCurrentUserId = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || user.user_id || null;
      }
      return localStorage.getItem('user_id');
    } catch {
      return null;
    }
  };

  // Fetch comments
  const fetchComments = async (pageNum: number = 1, append: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await reelsAPI.getComments(reelId, pageNum, 20);
      if (append) {
        setComments(prev => [...prev, ...response.comments]);
      } else {
        setComments(response.comments);
      }
      setHasMore(response.has_more);
      setPage(pageNum);
    } catch (err: any) {
      console.error('[CommentsModal] Failed to fetch comments:', err);
      setError(err.message || 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  // Load comments when modal opens
  useEffect(() => {
    if (isOpen && reelId) {
      fetchComments(1);
      // Focus input after a short delay
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, reelId]);

  // Handle submit comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await reelsAPI.createComment(reelId, { content: newComment.trim() });
      if (response.success && response.comment) {
        setComments(prev => [response.comment, ...prev]);
        setNewComment('');
        onCommentAdded?.();
      }
    } catch (err: any) {
      console.error('[CommentsModal] Failed to create comment:', err);
      setError(err.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete comment
  const handleDelete = async (commentId: string) => {
    try {
      await reelsAPI.deleteComment(reelId, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err: any) {
      console.error('[CommentsModal] Failed to delete comment:', err);
    }
  };

  // Handle like comment
  const handleLikeComment = async (comment: ReelComment) => {
    try {
      if (comment.is_liked) {
        await reelsAPI.unlikeComment(reelId, comment.id);
        setComments(prev => prev.map(c => 
          c.id === comment.id 
            ? { ...c, is_liked: false, likes_count: (c.likes_count || 1) - 1 }
            : c
        ));
      } else {
        await reelsAPI.likeComment(reelId, comment.id);
        setComments(prev => prev.map(c => 
          c.id === comment.id 
            ? { ...c, is_liked: true, likes_count: (c.likes_count || 0) + 1 }
            : c
        ));
      }
    } catch (err: any) {
      console.error('[CommentsModal] Failed to like/unlike comment:', err);
    }
  };

  // Load more comments
  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchComments(page + 1, true);
    }
  };

  if (!isOpen) return null;

  const currentUserId = getCurrentUserId();


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div 
        className="bg-zinc-900 w-full max-w-lg rounded-t-2xl max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-white font-semibold text-lg">Comments</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comments List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && comments.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
            </div>
          ) : error && comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-2">{error}</p>
              <button 
                onClick={() => fetchComments(1)} 
                className="text-blue-400 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <>
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={normalizeUrl(comment.user_avatar)}
                    alt={comment.username}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-medium text-sm">
                          {comment.username}
                        </span>
                        <span className="text-zinc-400 text-xs ml-2">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                        <p className="text-zinc-200 text-sm mt-1 break-words">
                          {comment.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleLikeComment(comment)}
                          className="flex flex-col items-center"
                        >
                          <Heart
                            className={`w-4 h-4 ${comment.is_liked ? 'fill-red-500 text-red-500' : 'text-zinc-400'}`}
                          />
                          {(comment.likes_count || 0) > 0 && (
                            <span className="text-zinc-400 text-xs">{comment.likes_count}</span>
                          )}
                        </button>
                        {currentUserId === comment.user_id && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="w-full py-2 text-blue-400 hover:underline disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Load more comments'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-700">
          {error && comments.length > 0 && (
            <p className="text-red-400 text-sm mb-2">{error}</p>
          )}
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="text-blue-400 disabled:text-zinc-600 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CommentsModal;
