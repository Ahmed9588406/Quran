/**
 * Reels Utility Functions
 * 
 * This file contains utility functions for file validation, formatting,
 * and other helper operations for the Reels feature.
 */

import {
  SUPPORTED_VIDEO_FORMATS,
  SUPPORTED_IMAGE_FORMATS,
  SupportedVideoFormat,
  SupportedImageFormat,
} from './types';

/**
 * Validates if a file is a supported video format
 * @param file - The file to validate
 * @returns true if the file is a valid video format, false otherwise
 */
export function isValidVideoFile(file: File | null | undefined): boolean {
  if (!file) return false;
  return (SUPPORTED_VIDEO_FORMATS as readonly string[]).includes(file.type);
}

/**
 * Validates if a file is a supported thumbnail/image format
 * @param file - The file to validate
 * @returns true if the file is a valid image format, false otherwise
 */
export function isValidThumbnailFile(file: File | null | undefined): boolean {
  if (!file) return false;
  return (SUPPORTED_IMAGE_FORMATS as readonly string[]).includes(file.type);
}

/**
 * Formats a timestamp for display on reels
 * @param dateString - ISO date string
 * @returns Formatted time string (e.g., "2h ago", "3d ago")
 */
export function formatReelTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}w ago`;
  } else {
    return date.toLocaleDateString();
  }
}


/**
 * Formats a number for display (e.g., 1000 -> "1k", 1500000 -> "1.5M")
 * @param num - The number to format
 * @returns Formatted string
 */
export function formatCount(num: number): string {
  if (num < 1000) {
    return num.toString();
  } else if (num < 1000000) {
    const k = num / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  } else {
    const m = num / 1000000;
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
  }
}

/**
 * Calculates the next index in a reels feed
 * @param currentIndex - Current reel index
 * @param totalReels - Total number of reels
 * @returns Next index, or current if at end
 */
export function getNextIndex(currentIndex: number, totalReels: number): number {
  if (totalReels <= 0) return 0;
  if (currentIndex < totalReels - 1) {
    return currentIndex + 1;
  }
  return currentIndex;
}

/**
 * Calculates the previous index in a reels feed
 * @param currentIndex - Current reel index
 * @returns Previous index, or 0 if at beginning
 */
export function getPreviousIndex(currentIndex: number): number {
  if (currentIndex > 0) {
    return currentIndex - 1;
  }
  return 0;
}

/**
 * Checks if we should load more reels based on current position
 * @param currentIndex - Current reel index
 * @param totalReels - Total number of loaded reels
 * @param threshold - How many reels before end to trigger load (default 2)
 * @returns true if more reels should be loaded
 */
export function shouldLoadMore(
  currentIndex: number,
  totalReels: number,
  threshold: number = 2
): boolean {
  return currentIndex >= totalReels - threshold;
}

/**
 * Creates a File object for testing purposes
 * @param name - File name
 * @param type - MIME type
 * @param size - File size in bytes
 * @returns Mock File object
 */
export function createMockFile(
  name: string,
  type: string,
  size: number = 1024
): File {
  const blob = new Blob([''], { type });
  return new File([blob], name, { type });
}

/**
 * Gets the file extension from a MIME type
 * @param mimeType - The MIME type
 * @returns File extension or empty string
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
    'image/jpeg': 'jpg',
    'image/png': 'png',
  };
  return mimeToExt[mimeType] || '';
}
