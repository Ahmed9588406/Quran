"use client";

/**
 * ReelViewer Component
 * 
 * Displays a single reel with video playback, autoplay, and loop functionality.
 * Handles tap to play/pause interaction.
 * 
 * Requirements: 1.2, 8.1, 8.2, 8.4
 */

import React, { useRef, useEffect, useState } from 'react';
import { Reel } from '@/lib/reels/types';
import { useVideoPlayer } from '@/lib/reels/useVideoPlayer';

export interface ReelViewerProps {
  reel: Reel;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

/**
 * Gets the video URL - uses the video proxy for proper streaming and CORS handling
 */
function getVideoUrl(videoUrl: string): string {
  if (!videoUrl) return '';
  
  // Normalize the video URL first
  let normalizedUrl = videoUrl;
  if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
    const baseUrl = 'http://apisoapp.twingroups.com';
    normalizedUrl = `${baseUrl}${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}`;
  }
  
  // Use the video proxy to handle streaming and CORS
  return `/api/video-proxy?url=${encodeURIComponent(normalizedUrl)}`;
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
  const [videoError, setVideoError] = useState<string | null>(null);
  
  // Start muted for autoplay, but allow unmuting
  const { isPlaying, isBuffering, togglePlay, play, pause } = useVideoPlayer(videoRef, {
    autoPlay: isActive,
    initialMuted: true, // Always start muted for autoplay
  });

  // Handle active state changes - play when active, pause when not
  useEffect(() => {
    if (isActive && videoRef.current) {
      // Ensure video is ready before playing
      if (videoRef.current.readyState >= 2) {
        play();
      }
    } else if (!isActive) {
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

  // Handle video errors
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const errorCode = video.error?.code;
    const errorMessage = video.error?.message || 'Unknown error';
    
    // Map error codes to human-readable messages
    const errorCodeMap: Record<number, string> = {
      1: 'MEDIA_ERR_ABORTED - Loading aborted',
      2: 'MEDIA_ERR_NETWORK - Network error',
      3: 'MEDIA_ERR_DECODE - Decoding error',
      4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Source not supported',
    };
    
    const readableError = errorCodeMap[errorCode || 0] || `Error code ${errorCode}`;
    
    console.error('[ReelViewer] Video error:', {
      errorCode,
      readableError,
      errorMessage,
      videoUrl: reel.video_url,
      normalizedUrl: getVideoUrl(reel.video_url),
    });
    
    setVideoError(`Video failed to load: ${readableError}`);
  };

  // Handle video loaded
  const handleVideoLoadStart = () => {
    setVideoError(null);
  };

  const videoUrl = getVideoUrl(reel.video_url);

  return (
    <div 
      className="relative w-full h-full bg-black"
      data-testid="reel-viewer"
    >
      {/* Video Element - Requirements: 8.1 (autoplay), 8.4 (loop) */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        muted={isMuted}
        onClick={handleVideoClick}
        poster={reel.thumbnail_url}
        data-testid="reel-video"
        onError={handleVideoError}
        onLoadStart={handleVideoLoadStart}
        preload="metadata"
        controls={false}
        crossOrigin="anonymous"
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Play/Pause Indicator (shows briefly on toggle) */}
      {!isPlaying && !isBuffering && !videoError && (
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

      {/* Error Indicator */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center px-4">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white text-sm">{videoError}</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default ReelViewer;
