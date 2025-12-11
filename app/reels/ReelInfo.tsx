"use client";

/**
 * ReelInfo Component
 * 
 * Displays user information, caption, and follow button for a reel.
 * 
 * Requirements: 1.2, 9.1
 */

import React from 'react';
import { Music } from 'lucide-react';
import { Reel } from '@/lib/reels/types';

export interface ReelInfoProps {
  reel: Reel;
  isFollowing: boolean;
  isCurrentUser: boolean;
  onFollow: () => void;
}

/**
 * ReelInfo - User info, caption, follow button
 * 
 * - Displays username, avatar, caption (Requirements: 1.2)
 * - Shows follow button when viewing non-followed user's reel (Requirements: 9.1)
 */
export function ReelInfo({
  reel,
  isFollowing,
  isCurrentUser,
  onFollow,
}: ReelInfoProps) {
  // Determine if follow button should be visible
  // Requirements: 9.1 - Show follow button when creator is not current user and not following
  const showFollowButton = !isCurrentUser && !isFollowing;

  return (
    <div 
      className="flex flex-col gap-3"
      data-testid="reel-info"
    >
      {/* User header with avatar, username, and follow button */}
      <div className="flex items-center gap-2" data-testid="reel-user-header">
        <img
          src={reel.user_avatar}
          alt={reel.username}
          className="w-8 h-8 rounded-full border-2 border-white object-cover"
          data-testid="reel-info-avatar"
        />
        <span className="text-white font-semibold text-sm" data-testid="reel-info-username">
          {reel.username}
        </span>
        
        {/* Follow Button - Requirements: 9.1 */}
        {showFollowButton && (
          <button
            onClick={onFollow}
            className="px-3 py-1 border border-white rounded-md text-white text-xs font-semibold hover:bg-white/10 transition-colors"
            aria-label={`Follow ${reel.username}`}
            data-testid="follow-button"
          >
            Follow
          </button>
        )}
        
        {/* Show "Following" badge if already following */}
        {!isCurrentUser && isFollowing && (
          <span 
            className="px-3 py-1 bg-white/20 rounded-md text-white text-xs font-semibold"
            data-testid="following-badge"
          >
            Following
          </span>
        )}
      </div>

      {/* Caption - Requirements: 1.2 */}
      <p 
        className="text-white text-sm leading-relaxed line-clamp-3"
        data-testid="reel-info-caption"
      >
        {reel.content}
      </p>

      {/* Audio/Music bar (decorative) */}
      <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2 max-w-fit">
        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-sm flex items-center justify-center animate-spin-slow">
          <Music className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 overflow-hidden max-w-[200px]">
          <div className="text-white text-xs whitespace-nowrap">
            Original audio • {reel.username}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default ReelInfo;
