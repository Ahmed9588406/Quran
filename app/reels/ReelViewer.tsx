"use client";

/**
 * ReelViewer Component
 * 
 * Displays a single reel with video playback, autoplay, and loop functionality.
 * Handles tap to play/pause interaction.
 * 
 * Requirements: 1.2, 8.1, 8.2, 8.4
 */

import React, { useRef, useEffect } from 'react';
import { Reel } from '@/lib/reels/types';
import { useVideoPlayer } from '@/lib/reels/useVideoPlayer';

export interface ReelViewerProps {
  reel: Reel;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

/**
 * ReelViewer - Single reel display with video player
 * 
 * - Renders video element with autoplay and loop (Requirements: 8.1, 8.4)
 * - Handles tap to play/pause (Requirements: 8.2)
 * - Shows video, username, avatar, caption, like count, comment count (Requirements: 1.2)
 */
export function ReelViewer({ reel, isActive, isMuted, onToggleMute }: ReelViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { isPlaying, isBuffering, togglePlay, play, pause } = useVideoPlayer(videoRef, {
    autoPlay: isActive,
    initialMuted: isMuted,
  });

  // Handle active state changes - play when active, pause when not
  useEffect(() => {
    if (isActive) {
      play();
    } else {
      pause();
    }
  }, [isActive, play, pause]);

  // Sync muted state with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle tap/click to toggle play/pause
  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  };

  return (
    <div 
      className="relative w-full h-full bg-black"
      data-testid="reel-viewer"
    >
      {/* Video Element - Requirements: 8.1 (autoplay), 8.4 (loop) */}
      <video
        ref={videoRef}
        src={reel.video_url}
        className="w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        muted={isMuted}
        onClick={handleVideoClick}
        poster={reel.thumbnail_url}
        data-testid="reel-video"
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Play/Pause Indicator (shows briefly on toggle) */}
      {!isPlaying && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-white ml-1" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Gradient overlays for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 pointer-events-none" />

      {/* Reel metadata for display completeness - Requirements: 1.2 */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none"
        data-testid="reel-metadata"
      >
        {/* User info */}
        <div className="flex items-center gap-2 mb-2" data-testid="reel-user-info">
          <img
            src={reel.user_avatar}
            alt={reel.username}
            className="w-10 h-10 rounded-full border-2 border-white object-cover"
            data-testid="reel-avatar"
          />
          <span className="text-white font-semibold" data-testid="reel-username">
            {reel.username}
          </span>
        </div>

        {/* Caption */}
        <p className="text-white text-sm mb-2 line-clamp-2" data-testid="reel-caption">
          {reel.content}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-white/80 text-sm">
          <span data-testid="reel-like-count">{reel.likes_count} likes</span>
          <span data-testid="reel-comment-count">{reel.comments_count} comments</span>
        </div>
      </div>
    </div>
  );
}

export default ReelViewer;
