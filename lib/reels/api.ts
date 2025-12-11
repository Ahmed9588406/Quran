/**
 * Reels API Service
 * 
 * Provides typed API methods for all reels operations including:
 * - Feed retrieval and pagination
 * - User reels listing
 * - Reel creation with video upload
 * - Interactions (like, save, follow)
 * 
 * Requirements: 1.1, 2.1, 3.1, 4.6, 5.3, 6.3, 9.2, 11.2
 */

import {
  Reel,
  ReelsFeedResponse,
  UserReelsResponse,
  CreateReelData,
  CreateReelResponse,
  LikeResponse,
  SaveResponse,
  FollowResponse,
} from './types';

// Backend API base URL
const BASE_URL = 'http://192.168.1.18:9001';

/**
 * Custom error class for Reels API errors
 */
export class ReelsAPIError extends Error {
  public statusCode: number;
  public errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'ReelsAPIError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

/**
 * Gets the authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

/**
 * Creates headers for API requests including authentication
 * Requirements: 11.2 - Authorization header inclusion
 */
export function createHeaders(contentType?: string): HeadersInit {
  const headers: HeadersInit = {};
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  return headers;
}


/**
 * Handles API response and throws appropriate errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorCode = 'UNKNOWN_ERROR';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorCode = errorData.error || errorCode;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new ReelsAPIError(errorMessage, response.status, errorCode);
  }
  
  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

/**
 * Builds FormData for reel creation
 * Requirements: 4.6 - Form data structure for reel creation
 * 
 * @param data - CreateReelData object
 * @returns FormData with video, content, visibility, and optional thumbnail
 */
export function buildReelFormData(data: CreateReelData): FormData {
  const formData = new FormData();
  
  // Required fields
  formData.append('video', data.video);
  formData.append('content', data.content);
  formData.append('visibility', data.visibility);
  
  // Optional thumbnail
  if (data.thumbnail) {
    formData.append('thumbnail', data.thumbnail);
  }
  
  return formData;
}

/**
 * Reels API Service Class
 * 
 * Provides all REST API methods for the reels system.
 */
export class ReelsAPI {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ============================================================================
  // Feed Operations
  // ============================================================================

  /**
   * Gets the reels feed with pagination.
   * 
   * Requirements: 1.1
   * 
   * @param page - Page number (default 1)
   * @param limit - Number of reels per page (default 10)
   * @returns Promise resolving to ReelsFeedResponse
   */
  async getFeed(page: number = 1, limit: number = 10): Promise<ReelsFeedResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    const response = await fetch(`${this.baseUrl}/reels?${params}`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<ReelsFeedResponse>(response);
  }

  // ============================================================================
  // User Reels Operations
  // ============================================================================

  /**
   * Gets reels for the current authenticated user.
   * 
   * Requirements: 2.1
   * 
   * @param userId - ID of the current user
   * @param page - Page number (default 1)
   * @param limit - Number of reels per page (default 10)
   * @returns Promise resolving to UserReelsResponse
   */
  async getUserReels(userId: string, page: number = 1, limit: number = 10): Promise<UserReelsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    const response = await fetch(`${this.baseUrl}/users/${userId}/reels?${params}`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<UserReelsResponse>(response);
  }

  /**
   * Gets reels for another user (public profile view).
   * 
   * Requirements: 3.1
   * 
   * @param userId - ID of the user whose reels to fetch
   * @returns Promise resolving to UserReelsResponse
   */
  async getOtherUserReels(userId: string): Promise<UserReelsResponse> {
    const response = await fetch(`${this.baseUrl}/reels/${userId}`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<UserReelsResponse>(response);
  }


  // ============================================================================
  // Reel Creation
  // ============================================================================

  /**
   * Creates a new reel with video upload.
   * 
   * Requirements: 4.6
   * 
   * @param data - CreateReelData with video, content, visibility, and optional thumbnail
   * @returns Promise resolving to CreateReelResponse with the created reel
   */
  async createReel(data: CreateReelData): Promise<CreateReelResponse> {
    const formData = buildReelFormData(data);
    
    // Don't set Content-Type header - browser will set it with boundary for multipart
    const headers: HeadersInit = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${this.baseUrl}/reels`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    return handleResponse<CreateReelResponse>(response);
  }

  // ============================================================================
  // Reel Interactions
  // ============================================================================

  /**
   * Likes a reel.
   * 
   * Requirements: 5.3
   * 
   * @param reelId - ID of the reel to like
   * @returns Promise resolving to LikeResponse
   */
  async likeReel(reelId: string): Promise<LikeResponse> {
    const response = await fetch(`${this.baseUrl}/reels/${reelId}/like`, {
      method: 'POST',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<LikeResponse>(response);
  }

  /**
   * Unlikes a reel.
   * 
   * Requirements: 5.3
   * 
   * @param reelId - ID of the reel to unlike
   * @returns Promise resolving to LikeResponse
   */
  async unlikeReel(reelId: string): Promise<LikeResponse> {
    const response = await fetch(`${this.baseUrl}/reels/${reelId}/like`, {
      method: 'DELETE',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<LikeResponse>(response);
  }

  /**
   * Saves a reel for later viewing.
   * 
   * Requirements: 6.3
   * 
   * @param reelId - ID of the reel to save
   * @returns Promise resolving to SaveResponse
   */
  async saveReel(reelId: string): Promise<SaveResponse> {
    const response = await fetch(`${this.baseUrl}/reels/${reelId}/save`, {
      method: 'POST',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<SaveResponse>(response);
  }

  /**
   * Unsaves a reel.
   * 
   * Requirements: 6.3
   * 
   * @param reelId - ID of the reel to unsave
   * @returns Promise resolving to SaveResponse
   */
  async unsaveReel(reelId: string): Promise<SaveResponse> {
    const response = await fetch(`${this.baseUrl}/reels/${reelId}/save`, {
      method: 'DELETE',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<SaveResponse>(response);
  }

  // ============================================================================
  // User Operations
  // ============================================================================

  /**
   * Follows a user (reel creator).
   * 
   * Requirements: 9.2
   * 
   * @param userId - ID of the user to follow
   * @returns Promise resolving to FollowResponse
   */
  async followUser(userId: string): Promise<FollowResponse> {
    const response = await fetch(`${this.baseUrl}/follow`, {
      method: 'POST',
      headers: createHeaders('application/json'),
      body: JSON.stringify({ user_id: userId }),
    });
    
    return handleResponse<FollowResponse>(response);
  }

  /**
   * Unfollows a user.
   * 
   * @param userId - ID of the user to unfollow
   * @returns Promise resolving to FollowResponse
   */
  async unfollowUser(userId: string): Promise<FollowResponse> {
    const response = await fetch(`${this.baseUrl}/follow`, {
      method: 'DELETE',
      headers: createHeaders('application/json'),
      body: JSON.stringify({ user_id: userId }),
    });
    
    return handleResponse<FollowResponse>(response);
  }
}

// ============================================================================
// Default Instance
// ============================================================================

/**
 * Default ReelsAPI instance using the standard backend URL.
 * Import and use this for most cases.
 */
export const reelsAPI = new ReelsAPI();

/**
 * Creates a new ReelsAPI instance with a custom base URL.
 * Useful for testing or connecting to different environments.
 * 
 * @param baseUrl - Custom base URL for the API
 * @returns New ReelsAPI instance
 */
export function createReelsAPI(baseUrl: string): ReelsAPI {
  return new ReelsAPI(baseUrl);
}
