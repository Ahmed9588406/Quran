"use client";

/**
 * ReelThumbnail Component
 * 
 * Displays a thumbnail image for a reel with play icon overlay.
 * Shows like count on hover.
 * 
 * Requirements: 2.2, 3.2
 */

import React, { useState } from 'react';
import { Play, Heart } from 'lucide-react';
import { Reel } from '@/lib/reels/types';

export interface ReelThumbnailProps {
  reel: Reel;
  onClick: (reel: Reel) => void;
}

/**
 * ReelThumbnail - Single reel thumbnail for grid display
 * 
 * - Displays thumbnail image with play icon overlay (Requirements: 2.2, 3.2)
 * - Shows like count on hover (Requirements: 2.2, 3.2)
 */
export function ReelThumbnail({ reel, onClick }: ReelThumbnailProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick(reel);
  };

  // Use thumbnail_url if available, otherwise use a placeholder or video poster
  const thumbnailSrc = reel.thumbnail_url || '/icons/reel.svg';

  return (
    <div
      className="relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="reel-thumbnail"
      data-reel-id={reel.id}
    >
      {/* Thumbnail Image */}
      <img
        src={thumbnailSrc}
        alt={reel.content || 'Reel thumbnail'}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        data-testid="thumbnail-image"
      />

      {/* Play Icon Overlay - Always visible */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Play 
            className="w-6 h-6 text-white ml-1" 
            fill="white"
            data-testid="play-icon"
          />
        </div>
      </div>

      {/* Hover Overlay with Like Count */}
      {isHovered && (
        <div 
          className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200"
          data-testid="hover-overlay"
        >
          <div className="flex items-center gap-2 text-white">
            <Heart className="w-5 h-5 fill-white" />
            <span className="font-semibold" data-testid="like-count">
              {formatLikeCount(reel.likes_count)}
            </span>
          </div>
        </div>
      )}

      {/* Bottom gradient for better visibility */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </div>
  );
}

/**
 * Formats like count for display (e.g., 1000 -> "1k")
 */
function formatLikeCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

export default ReelThumbnail;
