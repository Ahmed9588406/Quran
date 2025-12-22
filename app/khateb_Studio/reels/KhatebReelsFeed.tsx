"use client";

/**
 * KhatebReelsFeed Component
 *
 * Main feed component with swipe/scroll navigation for browsing reels in Khateb Studio.
 * Integrates ReelViewer, ReelActions, and ReelInfo components.
 * Styled to match the Khateb Studio design system.
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";
import { Reel } from "@/lib/reels/types";
import { useReelInteractions } from "@/lib/reels/useReelInteractions";
import { reelsAPI } from "@/lib/reels/api";
import ReelViewer from "../../reels/ReelViewer";
import ShareModal from "../../reels/ShareModal";
import CommentsModal from "../../reels/CommentsModal";

const BASE_URL = "http://apisoapp.twingroups.com";

// Swipe threshold in pixels
const SWIPE_THRESHOLD = 50;

function normalizeUrl(url?: string | null): string {
  if (!url) return "/icons/settings/profile.png";
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

export interface KhatebReelsFeedProps {
  initialReels?: Reel[];
  currentUserId?: string;
  onLoadMore?: () => Promise<Reel[]>;
}

interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
  isMuted: boolean;
  currentUserId?: string;
  onToggleMute: () => void;
  onShare: (reel: Reel) => void;
  onComment: (reel: Reel) => void;
}

function ReelItem({
  reel,
  isActive,
  isMuted,
  currentUserId,
  onToggleMute,
  onShare,
  onComment,
}: ReelItemProps) {
  const { isLiked, isSaved, likeCount, toggleLike, toggleSave } =
    useReelInteractions(reel.id, {
      initialIsLiked: reel.is_liked ?? false,
      initialIsSaved: reel.is_saved ?? false,
      initialLikeCount: reel.likes_count,
    });

  const [isFollowing, setIsFollowing] = useState(reel.is_following ?? false);
  const [commentCount, setCommentCount] = useState(reel.comments_count);
  const isCurrentUser = currentUserId === reel.user_id;

  const handleCommentClick = useCallback(() => {
    onComment(reel);
  }, [reel, onComment]);

  useEffect(() => {
    setCommentCount(reel.comments_count);
  }, [reel.id]);

  const handleFollow = useCallback(async () => {
    try {
      // Use the correct API format: POST /api/follow with body {"target_user_id":"..."}
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ target_user_id: reel.user_id }),
      });
      if (res.ok) {
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Failed to follow user:", error);
    }
  }, [reel.user_id]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden" data-testid="reel-item">
      {/* Video Player */}
      <ReelViewer
        reel={reel}
        isActive={isActive}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
      />

      {/* Gradient overlay for text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* User Info Overlay - Bottom of video */}
      <div className="absolute bottom-4 left-4 right-16 z-20">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={normalizeUrl(reel.user_avatar)}
            alt={reel.username}
            className="w-10 h-10 rounded-full border-2 border-white object-cover"
          />
          <span className="text-white font-semibold text-sm">{reel.username}</span>
          {!isCurrentUser && !isFollowing && (
            <button
              onClick={handleFollow}
              className="px-4 py-1.5 bg-[#8A1538]/80 backdrop-blur-sm border border-[#C9A96E]/40 rounded-full text-white text-xs font-medium hover:bg-[#8A1538] transition-colors"
            >
              Follow
            </button>
          )}
        </div>
        <p className="text-white text-sm line-clamp-2 leading-relaxed">
          {reel.content}
        </p>
        {reel.content && reel.content.length > 100 && (
          <button className="text-white/70 text-xs mt-1 hover:text-white">
            ...See More
          </button>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-5">
        {/* User Avatar */}
        <div className="relative">
          <img
            src={normalizeUrl(reel.user_avatar)}
            alt={reel.username}
            className="w-11 h-11 rounded-full border-2 border-[#C9A96E] object-cover"
          />
        </div>

        {/* Like Button */}
        <button
          onClick={toggleLike}
          className="flex flex-col items-center gap-1"
          aria-label={isLiked ? "Unlike" : "Like"}
        >
          <svg
            className={`w-7 h-7 ${isLiked ? "fill-[#8A1538] text-[#8A1538]" : "text-white"}`}
            viewBox="0 0 24 24"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="text-white text-xs font-medium">{formatCount(likeCount)}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={handleCommentClick}
          className="flex flex-col items-center gap-1"
          aria-label="Comments"
        >
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
          <span className="text-white text-xs font-medium">{formatCount(commentCount)}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => onShare(reel)}
          className="flex flex-col items-center gap-1"
          aria-label="Share"
        >
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          <span className="text-white text-xs font-medium">Share</span>
        </button>

        {/* Save Button */}
        <button
          onClick={toggleSave}
          className="flex flex-col items-center gap-1"
          aria-label={isSaved ? "Unsave" : "Save"}
        >
          <svg
            className={`w-7 h-7 ${isSaved ? "fill-[#C9A96E] text-[#C9A96E]" : "text-white"}`}
            viewBox="0 0 24 24"
            fill={isSaved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
          <span className="text-white text-xs font-medium">Save</span>
        </button>
      </div>
    </div>
  );
}

export function KhatebReelsFeed({ initialReels, currentUserId }: KhatebReelsFeedProps) {
  // State for managing reels
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Fetch khateb's reels from the endpoint
  useEffect(() => {
    const fetchKhatebReels = async () => {
      if (!currentUserId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        
        const response = await fetch(`${BASE_URL}/users/${currentUserId}/reels`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reels: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle different response formats
        const reelsData = Array.isArray(data) ? data : data.reels || data.data || [];
        
        console.log('[KhatebReelsFeed] Fetched reels:', reelsData);
        setReels(reelsData);
        setHasMore(false); // No pagination for now
      } catch (err) {
        console.error('[KhatebReelsFeed] Error fetching reels:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch reels'));
        setReels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKhatebReels();
  }, [currentUserId]);

  const displayReels = initialReels && initialReels.length > 0 ? initialReels : reels;

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => {
      const nextIndex = Math.min(prev + 1, displayReels.length - 1);
      return nextIndex;
    });
  }, [displayReels.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const refresh = useCallback(async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    setError(null);
    setCurrentIndex(0);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      const response = await fetch(`${BASE_URL}/users/${currentUserId}/reels`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reels: ${response.statusText}`);
      }

      const data = await response.json();
      const reelsData = Array.isArray(data) ? data : data.reels || data.data || [];
      
      setReels(reelsData);
    } catch (err) {
      console.error('[KhatebReelsFeed] Error refreshing reels:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh reels'));
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  const [isMuted, setIsMuted] = useState(true);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareReel, setShareReel] = useState<Reel | null>(null);

  // Comments modal state
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [commentReel, setCommentReel] = useState<Reel | null>(null);

  const currentReel = displayReels[currentIndex];

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleOpenShareModal = useCallback((reel: Reel) => {
    setShareReel(reel);
    setIsShareModalOpen(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setIsShareModalOpen(false);
    setShareReel(null);
  }, []);

  const handleShareToChat = useCallback((reel: Reel, userId: string) => {
    console.log("Sharing reel", reel.id, "to user", userId);
  }, []);

  const handleOpenCommentsModal = useCallback((reel: Reel) => {
    setCommentReel(reel);
    setIsCommentsModalOpen(true);
  }, []);

  const handleCloseCommentsModal = useCallback(() => {
    setIsCommentsModalOpen(false);
    setCommentReel(null);
  }, []);

  const handleCommentPosted = useCallback(() => {
    // Comment count will be updated by the CommentsModal
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const currentY = e.touches[0].clientY;
      const diff = startY - currentY;
      setDragOffset(diff);
    },
    [isDragging, startY]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const endY = e.changedTouches[0].clientY;
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
    },
    [isDragging, startY, goToNext, goToPrevious]
  );

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setStartY(e.clientY);
    setIsDragging(true);
    setDragOffset(0);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const diff = startY - e.clientY;
      setDragOffset(diff);
    },
    [isDragging, startY]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [isDragging, startY, goToNext, goToPrevious]
  );

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
    }
  }, [isDragging]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "k") {
        goToPrevious();
      } else if (e.key === "ArrowDown" || e.key === "j") {
        goToNext();
      } else if (e.key === "m") {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Loading state
  if (isLoading && displayReels.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#fff6f3]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#8A1538]/30 border-t-[#8A1538] rounded-full animate-spin" />
          <p className="text-[#8A1538]/70 text-sm">Loading reels...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && displayReels.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#fff6f3]">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-800 text-lg font-medium">Something went wrong</p>
          <p className="text-gray-500 text-sm mb-2">{error.message || "Failed to load reels"}</p>
          <button onClick={refresh} className="px-6 py-2.5 bg-[#8A1538] text-white rounded-full font-medium hover:bg-[#6d1029] transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && displayReels.length === 0 && !error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#fff6f3]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#F7E9CF] rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#8A1538]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-2">No reels available</p>
          <p className="text-gray-400 text-sm mb-4">Be the first to create a reel!</p>
          <button onClick={refresh} className="px-4 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#fff6f3] flex">
      {/* Left Sidebar - User Info */}
      <div className="hidden lg:flex flex-col justify-end w-72 p-6 pb-32 flex-shrink-0">
        {currentReel && (
          <div className="space-y-3 pr-4 ml-4">
            <div className="flex items-start gap-3">
              <img
                src={normalizeUrl(currentReel.user_avatar)}
                alt={currentReel.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#C9A96E]/40 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{currentReel.username}</p>
                {currentUserId !== currentReel.user_id && (
                  <button className="mt-1 px-3 py-1 bg-[#8A1538] text-white text-xs font-medium rounded-full hover:bg-[#6d1029] transition-colors whitespace-nowrap">
                    Follow
                  </button>
                )}
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-4 break-words ml-5">
              {currentReel.content}
            </p>
          </div>
        )}
      </div>

      {/* Center - Video Container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center py-4 px-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative w-full max-w-[400px] h-[calc(100vh-120px)] max-h-[700px]"
          style={{
            transform: isDragging ? `translateY(${-dragOffset * 0.3}px)` : "none",
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
        >
          {currentReel && (
            <ReelItem
              reel={currentReel}
              isActive={true}
              isMuted={isMuted}
              currentUserId={currentUserId}
              onToggleMute={handleToggleMute}
              onShare={handleOpenShareModal}
              onComment={handleOpenCommentsModal}
            />
          )}

          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            className="absolute bottom-4 left-4 z-30 bg-black/40 backdrop-blur-sm p-2 rounded-full"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Right Side - Navigation Arrows */}
      <div className="hidden md:flex flex-col items-center justify-center w-20 gap-4">
        {/* Up Arrow */}
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            currentIndex === 0
              ? "bg-[#C9A96E]/30 text-[#C9A96E]/50 cursor-not-allowed"
              : "bg-[#C9A96E] text-white hover:bg-[#b8985d] shadow-lg"
          }`}
          aria-label="Previous reel"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {/* Down Arrow */}
        <button
          onClick={goToNext}
          disabled={currentIndex >= displayReels.length - 1}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            currentIndex >= displayReels.length - 1
              ? "bg-[#C9A96E]/30 text-[#C9A96E]/50 cursor-not-allowed"
              : "bg-[#C9A96E] text-white hover:bg-[#b8985d] shadow-lg"
          }`}
          aria-label="Next reel"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        reel={shareReel}
        onClose={handleCloseShareModal}
        onShareToChat={handleShareToChat}
      />

      {/* Comments Modal */}
      {commentReel && (
        <CommentsModal
          isOpen={isCommentsModalOpen}
          onClose={handleCloseCommentsModal}
          reelId={commentReel.id}
          onCommentPosted={handleCommentPosted}
        />
      )}

      {/* Loading More Indicator */}
      {isLoading && displayReels.length > 0 && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <div className="w-4 h-4 border-2 border-[#8A1538]/30 border-t-[#8A1538] rounded-full animate-spin" />
            <span className="text-gray-600 text-xs">Loading more...</span>
          </div>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && displayReels.length > 0 && currentIndex === displayReels.length - 1 && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <span className="text-gray-500 text-xs">You've seen all reels</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default KhatebReelsFeed;
