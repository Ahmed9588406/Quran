"use client";

/**
 * ReelActions Component
 * 
 * Renders interaction buttons for a reel: like, comment, share, save.
 * Displays like count and comment count.
 * 
 * Requirements: 5.1, 6.1, 7.1
 */

import React from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Reel } from '@/lib/reels/types';

export interface ReelActionsProps {
  reel: Reel;
  isLiked: boolean;
  isSaved: boolean;
  likeCount: number;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onComment: () => void;
}

/**
 * ReelActions - Like, comment, share, save buttons
 * 
 * - Renders like button with toggle state (Requirements: 5.1)
 * - Renders save/bookmark button with toggle state (Requirements: 6.1)
 * - Renders share button (Requirements: 7.1)
 * - Displays like count and comment count
 */
export function ReelActions({
  reel,
  isLiked,
  isSaved,
  likeCount,
  onLike,
  onSave,
  onShare,
  onComment,
}: ReelActionsProps) {
  return (
    <div 
      className="flex flex-col gap-5"
      data-testid="reel-actions"
    >
      {/* Like Button - Requirements: 5.1 */}
      <div className="flex flex-col items-center">
        <button
          onClick={onLike}
          className="mb-1 transform active:scale-110 transition-transform"
          aria-label={isLiked ? "Unlike reel" : "Like reel"}
          data-testid="like-button"
        >
          <Heart
            className={`w-7 h-7 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}
            strokeWidth={1.5}
          />
        </button>
        <span className="text-white text-xs" data-testid="like-count">
          {formatCount(likeCount)}
        </span>
      </div>

      {/* Comment Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={onComment}
          className="mb-1 transform active:scale-110 transition-transform"
          aria-label="View comments"
          data-testid="comment-button"
        >
          <MessageCircle className="w-7 h-7 text-white" strokeWidth={1.5} />
        </button>
        <span className="text-white text-xs" data-testid="comment-count">
          {formatCount(reel.comments_count)}
        </span>
      </div>

      {/* Share Button - Requirements: 7.1 */}
      <div className="flex flex-col items-center">
        <button
          onClick={onShare}
          className="mb-1 transform active:scale-110 transition-transform"
          aria-label="Share reel"
          data-testid="share-button"
        >
          <Send className="w-7 h-7 text-white" strokeWidth={1.5} />
        </button>
      </div>

      {/* Save/Bookmark Button - Requirements: 6.1 */}
      <div className="flex flex-col items-center">
        <button
          onClick={onSave}
          className="mb-1 transform active:scale-110 transition-transform"
          aria-label={isSaved ? "Unsave reel" : "Save reel"}
          data-testid="save-button"
        >
          <Bookmark
            className={`w-7 h-7 ${isSaved ? 'fill-white text-white' : 'text-white'}`}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* More Options Button */}
      <div className="flex flex-col items-center">
        <button
          className="mb-1"
          aria-label="More options"
          data-testid="more-button"
        >
          <MoreHorizontal className="w-7 h-7 text-white" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

/**
 * Formats a count number for display (e.g., 1000 -> "1k")
 */
function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

export default ReelActions;
