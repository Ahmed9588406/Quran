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

const BASE_URL = 'http://apisoapp.twingroups.com';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reelId: string;
  onCommentAdded?: () => void;
  onCommentPosted?: () => void;
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

export function CommentsModal({ isOpen, onClose, reelId, onCommentAdded, onCommentPosted }: CommentsModalProps) {
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [localComments, setLocalComments] = useState<ReelComment[]>([]); // Track locally added comments
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);


  // Get current user data from localStorage
  const getCurrentUser = (): { id: string; username: string; avatar: string } => {
    if (typeof window === 'undefined') return { id: '', username: '', avatar: '' };
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          id: user.id || user.user_id || '',
          username: user.username || user.name || 'You',
          avatar: user.avatar || user.profile_picture || '',
        };
      }
      return { id: '', username: '', avatar: '' };
    } catch {
      return { id: '', username: '', avatar: '' };
    }
  };

  // Get current user ID from localStorage (for compatibility)
  const getCurrentUserId = (): string | null => {
    const user = getCurrentUser();
    return user.id || null;
  };

  // Fetch comments using the reels API
  const fetchComments = async (pageNum: number = 1, append: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      // Get auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      console.log('[CommentsModal] Fetching comments for reel:', reelId, 'page:', pageNum);
      
      // Use the comments endpoint which fetches from /reels/{reel_id}
      const response = await fetch(
        `/api/reels/${reelId}/comments?page=${pageNum}&limit=20`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        }
      );
      
      console.log('[CommentsModal] Fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[CommentsModal] Fetch response data:', data);
      
      // Handle the response format from our API
      let commentsArray: ReelComment[] = [];
      
      if (Array.isArray(data)) {
        commentsArray = data;
      } else if (data.comments && Array.isArray(data.comments)) {
        commentsArray = data.comments;
      } else if (data.data && Array.isArray(data.data)) {
        commentsArray = data.data;
      }
      
      // Ensure all comments have required fields
      commentsArray = commentsArray.map(c => ({
        id: c.id,
        reel_id: c.reel_id || reelId,
        user_id: c.user_id || '',
        username: c.username || c.display_name || 'User',
        user_avatar: c.user_avatar || c.avatar_url || '',
        content: c.content || '',
        created_at: c.created_at || new Date().toISOString(),
        likes_count: c.likes_count || 0,
        is_liked: c.is_liked || false,
      }));
      
      console.log('[CommentsModal] Parsed comments count:', commentsArray.length);
      
      if (append) {
        setComments(prev => [...prev, ...commentsArray]);
      } else {
        // Merge local comments with fetched comments, avoiding duplicates
        const fetchedIds = new Set(commentsArray.map(c => c.id));
        const uniqueLocalComments = localComments.filter(lc => !fetchedIds.has(lc.id));
        setComments([...uniqueLocalComments, ...commentsArray]);
      }
      setHasMore(data.has_more || data.hasMore || false);
      setPage(pageNum);
    } catch (err: any) {
      console.error('[CommentsModal] Failed to fetch comments:', err);
      setError(err.message || 'Failed to load comments');
      // Even on error, show local comments if any
      if (localComments.length > 0) {
        setComments(localComments);
        setError(null);
      }
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
    const commentText = newComment.trim();
    const currentUser = getCurrentUser();
    
    console.log('[CommentsModal] handleSubmit called');
    console.log('[CommentsModal] Comment text:', commentText);
    console.log('[CommentsModal] Current user:', currentUser);
    console.log('[CommentsModal] isSubmitting:', isSubmitting);
    console.log('[CommentsModal] reelId:', reelId);
    
    if (!commentText || isSubmitting) {
      console.log('[CommentsModal] Skipping - empty comment or already submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    // Clear input immediately for better UX
    setNewComment('');
    
    // Create optimistic comment immediately
    const optimisticComment: ReelComment = {
      id: `local_${Date.now()}`,
      reel_id: reelId,
      user_id: currentUser.id || '',
      username: currentUser.username || 'You',
      user_avatar: currentUser.avatar || '',
      content: commentText,
      created_at: new Date().toISOString(),
      likes_count: 0,
      is_liked: false,
    };
    
    // Add optimistic comment immediately
    setComments(prev => [optimisticComment, ...prev]);
    setLocalComments(prev => [optimisticComment, ...prev]);
    
    try {
      console.log('[CommentsModal] Sending comment to API...');
      
      // Create headers with user data
      const headers = new Headers({
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify({
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
        }),
      });
      
      // Get auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Use the dedicated comment endpoint
      const response = await fetch(`/api/reels/${reelId}/comment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: commentText }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to post comment: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('[CommentsModal] API Response:', data);
      
      // Handle response
      if (data.success || data.comment) {
        console.log('[CommentsModal] Comment posted successfully');
        
        // Update the optimistic comment with real data if available
        if (data.comment && data.comment.id) {
          setComments(prev => prev.map(c => 
            c.id === optimisticComment.id 
              ? { ...c, id: data.comment.id, created_at: data.comment.created_at || c.created_at }
              : c
          ));
          setLocalComments(prev => prev.map(c => 
            c.id === optimisticComment.id 
              ? { ...c, id: data.comment.id, created_at: data.comment.created_at || c.created_at }
              : c
          ));
        }
        
        // Call callbacks
        onCommentPosted?.();
        onCommentAdded?.();
        
        console.log('[CommentsModal] Comment flow completed successfully');
      } else {
        console.warn('[CommentsModal] Response success is false:', data);
        // Keep the optimistic comment visible anyway
      }
    } catch (err: any) {
      console.error('[CommentsModal] Failed to create comment:', err);
      console.error('[CommentsModal] Error message:', err.message);
      // Keep the optimistic comment visible - don't remove it
      // Just log the error, user can still see their comment
    } finally {
      setIsSubmitting(false);
      console.log('[CommentsModal] handleSubmit completed');
    }
  };

  // Handle delete comment
  const handleDelete = async (commentId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      // Use the Khateb Studio reels API proxy for deleting comments
      const response = await fetch(
        `/khateb_Studio/reels/api?reel_id=${reelId}&comment_id=${commentId}&action=delete_comment`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        }
      );
      
      // Optimistically remove the comment from the list regardless of API response
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      if (!response.ok) {
        console.warn('[CommentsModal] Delete API returned error, but comment removed from UI');
      }
    } catch (err: any) {
      console.error('[CommentsModal] Failed to delete comment:', err);
      // Still remove from UI for better UX
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  // Handle like comment
  const handleLikeComment = async (comment: ReelComment) => {
    // Optimistic update
    const isCurrentlyLiked = comment.is_liked;
    setComments(prev => prev.map(c => 
      c.id === comment.id 
        ? { 
            ...c, 
            is_liked: !isCurrentlyLiked, 
            likes_count: isCurrentlyLiked ? (c.likes_count || 1) - 1 : (c.likes_count || 0) + 1 
          }
        : c
    ));

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const method = isCurrentlyLiked ? 'DELETE' : 'POST';
      
      // Use the Khateb Studio reels API proxy for liking/unliking comments
      const response = await fetch(
        `/khateb_Studio/reels/api?reel_id=${reelId}&comment_id=${comment.id}&action=like_comment`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        }
      );
      
      if (!response.ok) {
        // Revert optimistic update on failure
        console.warn('[CommentsModal] Like/unlike API returned error, reverting');
        setComments(prev => prev.map(c => 
          c.id === comment.id 
            ? { 
                ...c, 
                is_liked: isCurrentlyLiked, 
                likes_count: isCurrentlyLiked ? (c.likes_count || 0) + 1 : (c.likes_count || 1) - 1 
              }
            : c
        ));
      }
    } catch (err: any) {
      console.error('[CommentsModal] Failed to like/unlike comment:', err);
      // Revert optimistic update on error
      setComments(prev => prev.map(c => 
        c.id === comment.id 
          ? { 
              ...c, 
              is_liked: isCurrentlyLiked, 
              likes_count: isCurrentlyLiked ? (c.likes_count || 0) + 1 : (c.likes_count || 1) - 1 
            }
          : c
      ));
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
