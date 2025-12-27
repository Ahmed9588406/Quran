/**
 * Reels Feature Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the Instagram-like
 * Reels feature, including data models, API responses, and constants.
 */

// Supported file formats for validation
export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
] as const;

export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/png',
] as const;

export type SupportedVideoFormat = typeof SUPPORTED_VIDEO_FORMATS[number];
export type SupportedImageFormat = typeof SUPPORTED_IMAGE_FORMATS[number];

// Visibility options for reels
export type ReelVisibility = 'public' | 'private' | 'followers';

/**
 * Reel data model representing a single reel
 */
export interface Reel {
  id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  video_url: string;
  thumbnail_url?: string;
  content: string; // caption
  visibility: ReelVisibility;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  is_saved?: boolean;
  is_following?: boolean;
  created_at: string;
}

/**
 * API response for reels feed
 */
export interface ReelsFeedResponse {
  reels: Reel[];
  page: number;
  limit: number;
  has_more: boolean;
}

/**
 * API response for user-specific reels
 */
export interface UserReelsResponse {
  reels: Reel[];
  user_id: string;
  total_count: number;
}


/**
 * Data required to create a new reel
 */
export interface CreateReelData {
  video: File;
  content: string;
  visibility: ReelVisibility;
  thumbnail?: File;
}

/**
 * Reel interaction state
 */
export interface ReelInteractionState {
  isLiked: boolean;
  isSaved: boolean;
  likeCount: number;
}

/**
 * Video player state
 */
export interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  isBuffering: boolean;
}

/**
 * Reels feed state for the useReelsFeed hook
 */
export interface ReelsFeedState {
  reels: Reel[];
  currentIndex: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * API error response
 */
export interface ReelsAPIError {
  error: string;
  status: number;
  message?: string;
}

/**
 * Like/Unlike response
 */
export interface LikeResponse {
  success: boolean;
  likes_count: number;
}

/**
 * Save/Unsave response
 */
export interface SaveResponse {
  success: boolean;
}

/**
 * Follow response
 */
export interface FollowResponse {
  success: boolean;
  is_following: boolean;
}

/**
 * Create reel response
 */
export interface CreateReelResponse {
  success: boolean;
  reel: Reel;
}

/**
 * Comment data model
 */
export interface ReelComment {
  display_name: string;
  avatar_url: string;
  id: string;
  reel_id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  content: string;
  created_at: string;
  likes_count?: number;
  is_liked?: boolean;
}

/**
 * Comments list response
 */
export interface CommentsResponse {
  comments: ReelComment[];
  total_count: number;
  page: number;
  limit: number;
  has_more: boolean;
}

/**
 * Create comment request
 */
export interface CreateCommentData {
  content: string;
}

/**
 * Create comment response
 */
export interface CreateCommentResponse {
  success: boolean;
  comment: ReelComment;
}
