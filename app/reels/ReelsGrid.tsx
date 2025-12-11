"use client";

/**
 * ReelsGrid Component
 * 
 * Renders a 3-column grid of reel thumbnails for profile pages.
 * Handles click to open full-screen viewer.
 * 
 * Requirements: 2.2, 2.3, 3.2, 3.3
 */

import React, { useState } from 'react';
import { Reel } from '@/lib/reels/types';
import { ReelThumbnail } from './ReelThumbnail';
import { ReelViewer } from './ReelViewer';
import { ReelActions } from './ReelActions';
import { ReelInfo } from './ReelInfo';
import { useReelInteractions } from '@/lib/reels/useReelInteractions';
import { X, Volume2, VolumeX } from 'lucide-react';

export interface ReelsGridProps {
  reels: Reel[];
  onReelClick?: (reel: Reel) => void;
}

/**
 * ReelsGrid - Grid display for profile pages
 * 
 * - Renders 3-column grid of reel thumbnails (Requirements: 2.2, 3.2)
 * - Handles click to open full-screen viewer (Requirements: 2.3, 3.3)
 */
export function ReelsGrid({ reels, onReelClick }: ReelsGridProps) {
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleReelClick = (reel: Reel) => {
    if (onReelClick) {
      onReelClick(reel);
    } else {
      // Default behavior: open full-screen viewer
      setSelectedReel(reel);
    }
  };

  const handleCloseViewer = () => {
    setSelectedReel(null);
  };

  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
  };

  if (reels.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-12 text-gray-500"
        data-testid="reels-grid-empty"
      >
        <p className="text-lg">No reels yet</p>
      </div>
    );
  }

  return (
    <>
      {/* 3-Column Grid - Requirements: 2.2, 3.2 */}
      <div 
        className="grid grid-cols-3 gap-1 sm:gap-2"
        data-testid="reels-grid"
      >
        {reels.map((reel) => (
          <ReelThumbnail
            key={reel.id}
            reel={reel}
            onClick={handleReelClick}
          />
        ))}
      </div>

      {/* Full-Screen Viewer Modal - Requirements: 2.3, 3.3 */}
      {selectedReel && (
        <FullScreenReelViewer
          reel={selectedReel}
          isMuted={isMuted}
          onClose={handleCloseViewer}
          onToggleMute={handleToggleMute}
        />
      )}
    </>
  );
}

/**
 * FullScreenReelViewer - Modal for viewing a reel in full-screen
 */
interface FullScreenReelViewerProps {
  reel: Reel;
  isMuted: boolean;
  onClose: () => void;
  onToggleMute: () => void;
}

function FullScreenReelViewer({ 
  reel, 
  isMuted, 
  onClose, 
  onToggleMute 
}: FullScreenReelViewerProps) {
  const {
    isLiked,
    isSaved,
    likeCount,
    toggleLike,
    toggleSave,
  } = useReelInteractions(reel.id, {
    initialIsLiked: reel.is_liked || false,
    initialIsSaved: reel.is_saved || false,
    initialLikeCount: reel.likes_count,
  });

  const handleShare = () => {
    // Share functionality - can be expanded later
    if (navigator.share) {
      navigator.share({
        title: reel.content || 'Check out this reel',
        url: window.location.href,
      }).catch(() => {
        // User cancelled or error
      });
    }
  };

  const handleComment = () => {
    // Comment functionality - can be expanded later
    console.log('Open comments for reel:', reel.id);
  };

  const handleFollow = () => {
    // Follow functionality - can be expanded later
    console.log('Follow user:', reel.user_id);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      data-testid="fullscreen-viewer"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
        aria-label="Close viewer"
        data-testid="close-button"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Mute Button */}
      <button
        onClick={onToggleMute}
        className="absolute top-4 left-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
        data-testid="mute-button"
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-white" />
        ) : (
          <Volume2 className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Reel Content */}
      <div className="relative w-full h-full max-w-md mx-auto">
        <ReelViewer
          reel={reel}
          isActive={true}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
        />

        {/* Actions Sidebar */}
        <div className="absolute right-4 bottom-32 z-10">
          <ReelActions
            reel={reel}
            isLiked={isLiked}
            isSaved={isSaved}
            likeCount={likeCount}
            onLike={toggleLike}
            onSave={toggleSave}
            onShare={handleShare}
            onComment={handleComment}
          />
        </div>

        {/* Reel Info */}
        <div className="absolute left-4 bottom-8 right-20 z-10">
          <ReelInfo
            reel={reel}
            isFollowing={reel.is_following || false}
            isCurrentUser={false}
            onFollow={handleFollow}
          />
        </div>
      </div>
    </div>
  );
}

export default ReelsGrid;
