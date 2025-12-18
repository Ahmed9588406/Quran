"use client";

/**
 * KhatebReelsGrid Component
 * 
 * Renders a 3-column grid of reel thumbnails for Khateb Studio profile pages.
 * Handles click to open full-screen viewer.
 * Styled to match the Khateb Studio design system.
 */

import React, { useState } from 'react';
import { Reel } from '@/lib/reels/types';
import { ReelThumbnail } from '../../reels/ReelThumbnail';
import ReelViewer from '../../reels/ReelViewer';
import { ReelActions } from '../../reels/ReelActions';
import { ReelInfo } from '../../reels/ReelInfo';
import { useReelInteractions } from '@/lib/reels/useReelInteractions';
import { X, Volume2, VolumeX, Film } from 'lucide-react';

export interface KhatebReelsGridProps {
  reels: Reel[];
  onReelClick?: (reel: Reel) => void;
  emptyMessage?: string;
}

/**
 * KhatebReelsGrid - Grid display for Khateb Studio profile pages
 */
export function KhatebReelsGrid({ reels, onReelClick, emptyMessage = "No reels yet" }: KhatebReelsGridProps) {
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleReelClick = (reel: Reel) => {
    if (onReelClick) {
      onReelClick(reel);
    } else {
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
        className="flex flex-col items-center justify-center py-16 text-gray-500"
        data-testid="khateb-reels-grid-empty"
      >
        <div className="w-16 h-16 mb-4 bg-[#F7E9CF] rounded-full flex items-center justify-center">
          <Film className="w-8 h-8 text-[#8A1538]" />
        </div>
        <p className="text-lg font-medium text-gray-700">{emptyMessage}</p>
        <p className="text-sm text-gray-400 mt-1">Create your first reel to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* 3-Column Grid */}
      <div 
        className="grid grid-cols-3 gap-2 sm:gap-3"
        data-testid="khateb-reels-grid"
      >
        {reels.map((reel) => (
          <ReelThumbnail
            key={reel.id}
            reel={reel}
            onClick={handleReelClick}
          />
        ))}
      </div>

      {/* Full-Screen Viewer Modal */}
      {selectedReel && (
        <KhatebFullScreenReelViewer
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
 * KhatebFullScreenReelViewer - Modal for viewing a reel in full-screen
 * Styled for Khateb Studio
 */
interface KhatebFullScreenReelViewerProps {
  reel: Reel;
  isMuted: boolean;
  onClose: () => void;
  onToggleMute: () => void;
}

function KhatebFullScreenReelViewer({ 
  reel, 
  isMuted, 
  onClose, 
  onToggleMute 
}: KhatebFullScreenReelViewerProps) {
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
    if (navigator.share) {
      navigator.share({
        title: reel.content || 'Check out this reel',
        url: window.location.href,
      }).catch(() => {});
    }
  };

  const handleComment = () => {
    console.log('Open comments for reel:', reel.id);
  };

  const handleFollow = () => {
    console.log('Follow user:', reel.user_id);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      data-testid="khateb-fullscreen-viewer"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-[#8A1538]/50 rounded-full hover:bg-[#8A1538]/70 transition-colors"
        aria-label="Close viewer"
        data-testid="close-button"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Mute Button */}
      <button
        onClick={onToggleMute}
        className="absolute top-4 left-4 z-10 p-2 bg-[#8A1538]/50 rounded-full hover:bg-[#8A1538]/70 transition-colors"
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

export default KhatebReelsGrid;
