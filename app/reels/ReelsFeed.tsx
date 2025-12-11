"use client";

/**
 * ReelsFeed Component
 * 
 * Main feed component with swipe/scroll navigation for browsing reels.
 * Integrates ReelViewer, ReelActions, and ReelInfo components.
 * 
 * Requirements: 1.3, 1.4, 1.5
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Reel } from '@/lib/reels/types';
import { useReelsFeed } from '@/lib/reels/useReelsFeed';
import { useReelInteractions } from '@/lib/reels/useReelInteractions';
import { reelsAPI } from '@/lib/reels/api';
import ReelViewer from './ReelViewer';
import ReelActions from './ReelActions';
import ReelInfo from './ReelInfo';
import ShareModal from './ShareModal';

// Swipe threshold in pixels
const SWIPE_THRESHOLD = 50;

export interface ReelsFeedProps {
  /** Initial reels to display (optional, will fetch if not provided) */
  initialReels?: Reel[];
  /** Current user ID for determining follow button visibility */
  currentUserId?: string;
  /** Callback when load more is triggered */
  onLoadMore?: () => Promise<Reel[]>;
}

/**
 * Individual Reel Item with all interactions
 */
interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
  isMuted: boolean;
  currentUserId?: string;
  onToggleMute: () => void;
  onShare: (reel: Reel) => void;
}

function ReelItem({ reel, isActive, isMuted, currentUserId, onToggleMute, onShare }: ReelItemProps) {
  const {
    isLiked,
    isSaved,
    likeCount,
    toggleLike,
    toggleSave,
  } = useReelInteractions(reel.id, {
    initialIsLiked: reel.is_liked ?? false,
    initialIsSaved: reel.is_saved ?? false,
    initialLikeCount: reel.likes_count,
  });

  const [isFollowing, setIsFollowing] = useState(reel.is_following ?? false);
  const isCurrentUser = currentUserId === reel.user_id;

  const handleFollow = useCallback(async () => {
    try {
      await reelsAPI.followUser(reel.user_id);
      setIsFollowing(true);
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  }, [reel.user_id]);

  const handleShare = useCallback(() => {
    // Open ShareModal - Requirements: 7.1
    onShare(reel);
  }, [reel, onShare]);

  const handleComment = useCallback(() => {
    // Comment functionality - placeholder for now
    console.log('Open comments for reel:', reel.id);
  }, [reel.id]);

  return (
    <div className="relative w-full h-full" data-testid="reel-item">
      {/* Video Player */}
      <ReelViewer
        reel={reel}
        isActive={isActive}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
      />

      {/* User Info - Bottom Left */}
      <div className="absolute bottom-0 left-0 right-20 p-4 pb-6 z-20 pointer-events-auto">
        <ReelInfo
          reel={reel}
          isFollowing={isFollowing}
          isCurrentUser={isCurrentUser}
          onFollow={handleFollow}
        />
      </div>

      {/* Actions - Right Side */}
      <div className="absolute bottom-32 right-3 z-20 pointer-events-auto">
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
    </div>
  );
}


/**
 * ReelsFeed - Main feed component with swipe navigation
 * 
 * - Implements touch/mouse swipe handlers (Requirements: 1.3, 1.4)
 * - Integrates ReelViewer, ReelActions, ReelInfo
 * - Auto-loads more reels when reaching end (Requirements: 1.5)
 */
export function ReelsFeed({ initialReels, currentUserId, onLoadMore }: ReelsFeedProps) {
  const {
    reels,
    currentIndex,
    isLoading,
    error,
    hasMore,
    goToNext,
    goToPrevious,
    loadMore,
    refresh,
  } = useReelsFeed({ autoLoad: !initialReels });

  // Use initial reels if provided, otherwise use fetched reels
  const displayReels = initialReels && initialReels.length > 0 ? initialReels : reels;

  const [isMuted, setIsMuted] = useState(true);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Share modal state - Requirements: 7.1
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareReel, setShareReel] = useState<Reel | null>(null);

  const currentReel = displayReels[currentIndex];

  // Toggle mute for all reels
  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  /**
   * Open share modal for a reel
   * Requirements: 7.1 - Display sharing options
   */
  const handleOpenShareModal = useCallback((reel: Reel) => {
    setShareReel(reel);
    setIsShareModalOpen(true);
  }, []);

  /**
   * Close share modal
   */
  const handleCloseShareModal = useCallback(() => {
    setIsShareModalOpen(false);
    setShareReel(null);
  }, []);

  /**
   * Handle share to chat
   * Requirements: 7.2 - Send to chat option
   */
  const handleShareToChat = useCallback((reel: Reel, userId: string) => {
    // In a real implementation, this would send the reel to the chat
    console.log('Sharing reel', reel.id, 'to user', userId);
    // Could integrate with chat API here
  }, []);

  /**
   * Touch event handlers for swipe navigation
   * Requirements: 1.3 (swipe up), 1.4 (swipe down)
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    setDragOffset(diff);
  }, [isDragging, startY]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;
    setIsDragging(false);
    setDragOffset(0);

    // Swipe threshold check
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        // Swipe up -> next reel (Requirements: 1.3)
        goToNext();
      } else {
        // Swipe down -> previous reel (Requirements: 1.4)
        goToPrevious();
      }
    }
  }, [isDragging, startY, goToNext, goToPrevious]);

  /**
   * Mouse event handlers for desktop swipe navigation
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setStartY(e.clientY);
    setIsDragging(true);
    setDragOffset(0);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = startY - e.clientY;
    setDragOffset(diff);
  }, [isDragging, startY]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const endY = e.clientY;
    const diff = startY - endY;
    setIsDragging(false);
    setDragOffset(0);

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  }, [isDragging, startY, goToNext, goToPrevious]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
    }
  }, [isDragging]);

  /**
   * Keyboard navigation support
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'k') {
        goToPrevious();
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        goToNext();
      } else if (e.key === 'm') {
        setIsMuted(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  /**
   * Loading State - Requirements: 10.1
   * Display loading spinner during initial fetch
   */
  if (isLoading && displayReels.length === 0) {
    return (
      <div 
        className="w-full h-screen flex items-center justify-center bg-black"
        data-testid="reels-feed-loading"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Loading Spinner */}
          <div 
            className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"
            data-testid="loading-spinner"
          />
          <p className="text-white/70 text-sm">Loading reels...</p>
        </div>
      </div>
    );
  }

  /**
   * Error State - Requirements: 10.3
   * Display error message with retry option
   */
  if (error && displayReels.length === 0) {
    return (
      <div 
        className="w-full h-screen flex items-center justify-center bg-black"
        data-testid="reels-feed-error"
      >
        <div className="flex flex-col items-center gap-4 text-center px-4">
          {/* Error Icon */}
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <div>
            <p className="text-white text-lg font-medium mb-1">Something went wrong</p>
            <p className="text-white/60 text-sm mb-4" data-testid="error-message">
              {error.message || 'Failed to load reels'}
            </p>
          </div>
          {/* Retry Button */}
          <button
            onClick={refresh}
            className="px-6 py-2.5 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
            data-testid="retry-button"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!isLoading && displayReels.length === 0 && !error) {
    return (
      <div 
        className="w-full h-screen flex items-center justify-center bg-black"
        data-testid="reels-feed-empty"
      >
        <div className="text-center text-white">
          <p className="text-lg mb-2">No reels available</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center select-none bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      data-testid="reels-feed"
    >
      {/* Main Reel Container */}
      <div 
        className="relative w-full max-w-[500px] h-full"
        style={{
          transform: isDragging ? `translateY(${-dragOffset * 0.3}px)` : 'none',
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Current Reel */}
        {currentReel && (
          <ReelItem
            reel={currentReel}
            isActive={true}
            isMuted={isMuted}
            currentUserId={currentUserId}
            onToggleMute={handleToggleMute}
            onShare={handleOpenShareModal}
          />
        )}

        {/* Progress bar at top - show current reel index */}
        <div className="absolute top-2 left-4 right-4 flex gap-1 z-30">
          {displayReels.slice(0, Math.min(displayReels.length, 10)).map((_, idx) => (
            <div 
              key={idx} 
              className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
            >
              <div 
                className={`h-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'w-full bg-white' 
                    : idx < currentIndex 
                      ? 'w-full bg-white/60' 
                      : 'w-0 bg-white'
                }`} 
              />
            </div>
          ))}
          {displayReels.length > 10 && (
            <span className="text-white/60 text-xs ml-1">
              +{displayReels.length - 10}
            </span>
          )}
        </div>

        {/* Volume Control - Bottom Left */}
        <div className="absolute bottom-6 left-4 z-30">
          <button 
            onClick={handleToggleMute}
            className="bg-black/40 backdrop-blur-sm p-2 rounded-full"
            aria-label={isMuted ? "Unmute" : "Mute"}
            data-testid="mute-button"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Navigation hints */}
        <div className="absolute top-1/2 right-2 transform -translate-y-1/2 z-30 flex flex-col gap-2 opacity-50">
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="p-2 bg-black/30 rounded-full"
              aria-label="Previous reel"
              data-testid="prev-button"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
          {currentIndex < displayReels.length - 1 && (
            <button
              onClick={goToNext}
              className="p-2 bg-black/30 rounded-full"
              aria-label="Next reel"
              data-testid="next-button"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Loading More Indicator - Requirements: 10.1 */}
        {isLoading && displayReels.length > 0 && (
          <div 
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30"
            data-testid="loading-more-indicator"
          >
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-white/80 text-xs">Loading more...</span>
            </div>
          </div>
        )}

        {/* End of Feed Indicator */}
        {!hasMore && displayReels.length > 0 && currentIndex === displayReels.length - 1 && (
          <div 
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30"
            data-testid="end-of-feed"
          >
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white/60 text-xs">You've seen all reels</span>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal - Requirements: 7.1, 7.2 */}
      <ShareModal
        isOpen={isShareModalOpen}
        reel={shareReel}
        onClose={handleCloseShareModal}
        onShareToChat={handleShareToChat}
      />
    </div>
  );
}

export default ReelsFeed;
