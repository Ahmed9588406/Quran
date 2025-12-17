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
  CommentsResponse,
  CreateCommentData,
  CreateCommentResponse,
  ReelComment,
} from './types';

// API base URL - call backend directly for file uploads
const BASE_URL = 'http://apisoapp.twingroups.com';

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
async function handleResponse<T>(response: Response, endpoint?: string): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorCode = 'UNKNOWN_ERROR';
    let rawResponse = '';
    
    try {
      rawResponse = await response.text();
      const errorData = JSON.parse(rawResponse);
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorCode = errorData.error || errorCode;
    } catch {
      errorMessage = rawResponse || response.statusText || errorMessage;
    }
    
    console.error(`[ReelsAPI] ${endpoint || 'Request'} failed:`, {
      status: response.status,
      statusText: response.statusText,
      errorCode,
      errorMessage,
      rawResponse,
    });
    
    throw new ReelsAPIError(errorMessage, response.status, errorCode);
  }
  
  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

/**
 * Sanitizes filename to remove special characters that may cause issues
 */
function sanitizeFilename(filename: string): string {
  // Get extension
  const ext = filename.split('.').pop() || '';
  // Generate a simple filename with timestamp
  return `video_${Date.now()}.${ext}`;
}

/**
 * Builds FormData for reel creation
 * Requirements: 4.6 - Form data structure for reel creation
 * 
 * Exact fields expected by backend (as shown in Postman):
 * - video: File (required)
 * - content: Text (required)
 * - visibility: Text (required) - 'public', 'private', or 'followers'
 * - thumbnail: File (optional)
 * 
 * @param data - CreateReelData object
 * @returns FormData with video, content, visibility, and optional thumbnail
 */
export function buildReelFormData(data: CreateReelData): FormData {
  const formData = new FormData();
  
  // Video file - REQUIRED
  // Use sanitized filename to avoid issues with special characters
  const sanitizedVideoName = sanitizeFilename(data.video.name);
  formData.append('video', data.video, sanitizedVideoName);
  
  // Content/description - REQUIRED (can be empty string)
  formData.append('content', data.content || '');
  
  // Visibility setting - REQUIRED
  formData.append('visibility', data.visibility);
  
  // Thumbnail/cover photo - OPTIONAL
  if (data.thumbnail) {
    const sanitizedThumbName = sanitizeFilename(data.thumbnail.name);
    formData.append('thumbnail', data.thumbnail, sanitizedThumbName);
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
    
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? '/api/reels' : `${this.baseUrl}/reels`;
    
    const response = await fetch(`${apiPath}?${params}`, {
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
    
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? `/api/reels/user/${userId}` : `${this.baseUrl}/users/${userId}/reels`;
    
    const response = await fetch(`${apiPath}?${params}`, {
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
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? `/api/reels/user/${userId}` : `${this.baseUrl}/reels/${userId}`;
    
    const response = await fetch(apiPath, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<UserReelsResponse>(response);
  }


  // ============================================================================
  // Reel Creation
  // ============================================================================

  /**
   * Creates a new reel with video upload using XMLHttpRequest.
   * XMLHttpRequest handles multipart form data more reliably with some backends.
   * 
   * Requirements: 4.6
   * 
   * @param data - CreateReelData with video, content, visibility, and optional thumbnail
   * @returns Promise resolving to CreateReelResponse with the created reel
   */
  async createReel(data: CreateReelData): Promise<CreateReelResponse> {
    const formData = buildReelFormData(data);
    
    // Log what we're sending for debugging
    console.log('[ReelsAPI] createReel - Sending:', {
      videoName: data.video.name,
      videoSize: data.video.size,
      videoType: data.video.type,
      content: data.content,
      visibility: data.visibility,
      hasThumbnail: !!data.thumbnail,
    });
    
    // Log FormData entries
    console.log('[ReelsAPI] FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(name=${value.name}, size=${value.size}, type=${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    const token = getAuthToken();
    
    // Use XMLHttpRequest for better multipart handling
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.baseUrl}/reels`, true);
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.onload = () => {
        console.log('[ReelsAPI] XHR Response status:', xhr.status);
        console.log('[ReelsAPI] XHR Response text:', xhr.responseText);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('[ReelsAPI] Upload success:', response);
            resolve(response);
          } catch (parseError) {
            console.error('[ReelsAPI] Failed to parse success response:', parseError);
            reject(new ReelsAPIError('Invalid JSON response', xhr.status));
          }
        } else {
          let errorMessage = 'Upload failed';
          let errorCode = 'UNKNOWN_ERROR';
          const rawResponse = xhr.responseText;
          
          try {
            const errorData = JSON.parse(rawResponse);
            errorMessage = errorData.message || errorData.error || errorMessage;
            errorCode = errorData.error || errorCode;
          } catch {
            errorMessage = rawResponse || xhr.statusText || errorMessage;
          }
          
          console.error('[ReelsAPI] POST /reels failed - Status:', xhr.status);
          console.error('[ReelsAPI] POST /reels failed - Error code:', errorCode);
          console.error('[ReelsAPI] POST /reels failed - Error message:', errorMessage);
          console.error('[ReelsAPI] POST /reels failed - Raw response:', rawResponse);
          
          reject(new ReelsAPIError(errorMessage, xhr.status, errorCode));
        }
      };
      
      xhr.onerror = () => {
        console.error('[ReelsAPI] XHR Network error');
        reject(new ReelsAPIError('Network error', 0, 'NETWORK_ERROR'));
      };
      
      xhr.send(formData);
    });
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
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? `/api/reels/${reelId}/like` : `${this.baseUrl}/reels/${reelId}/like`;
    
    const response = await fetch(apiPath, {
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
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? `/api/reels/${reelId}/like` : `${this.baseUrl}/reels/${reelId}/like`;
    
    const response = await fetch(apiPath, {
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
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? `/api/reels/${reelId}/save` : `${this.baseUrl}/reels/${reelId}/save`;
    
    const response = await fetch(apiPath, {
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
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? `/api/reels/${reelId}/save` : `${this.baseUrl}/reels/${reelId}/save`;
    
    const response = await fetch(apiPath, {
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
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? '/api/follow' : `${this.baseUrl}/follow`;
    
    const response = await fetch(apiPath, {
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
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? '/api/follow' : `${this.baseUrl}/follow`;
    
    const response = await fetch(apiPath, {
      method: 'DELETE',
      headers: createHeaders('application/json'),
      body: JSON.stringify({ user_id: userId }),
    });
    
    return handleResponse<FollowResponse>(response);
  }

  // ============================================================================
  // Comment Operations
  // ============================================================================

  /**
   * Gets comments for a reel.
   * 
   * @param reelId - ID of the reel
   * @param page - Page number (default 1)
   * @param limit - Number of comments per page (default 20)
   * @returns Promise resolving to CommentsResponse
   */
  async getComments(reelId: string, page: number = 1, limit: number = 20): Promise<CommentsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? `/api/reels/${reelId}/comments` : `${this.baseUrl}/reels/${reelId}/comments`;
    
    const response = await fetch(`${apiPath}?${params}`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<CommentsResponse>(response);
  }

  /**
   * Creates a comment on a reel.
   * Endpoint: POST /reels/{reel_id}/comment
   * 
   * @param reelId - ID of the reel to comment on
   * @param data - Comment content
   * @returns Promise resolving to CreateCommentResponse
   */
  async createComment(reelId: string, data: CreateCommentData): Promise<CreateCommentResponse> {
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? `/api/reels/${reelId}/comment` : `${this.baseUrl}/reels/${reelId}/comment`;
    
    console.log('[ReelsAPI] createComment called');
    console.log('[ReelsAPI] reelId:', reelId);
    console.log('[ReelsAPI] data:', data);
    console.log('[ReelsAPI] apiPath:', apiPath);
    
    const headers = createHeaders('application/json');
    console.log('[ReelsAPI] headers:', headers);
    
    const response = await fetch(apiPath, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });
    
    console.log('[ReelsAPI] createComment response status:', response.status);
    console.log('[ReelsAPI] createComment response ok:', response.ok);
    
    const result = await handleResponse<CreateCommentResponse>(response, 'createComment');
    console.log('[ReelsAPI] createComment result:', result);
    
    return result;
  }

  /**
   * Deletes a comment.
   * 
   * @param reelId - ID of the reel
   * @param commentId - ID of the comment to delete
   * @returns Promise resolving to success status
   */
  async deleteComment(reelId: string, commentId: string): Promise<{ success: boolean }> {
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? `/api/reels/${reelId}/comments/${commentId}` : `${this.baseUrl}/reels/${reelId}/comments/${commentId}`;
    
    const response = await fetch(apiPath, {
      method: 'DELETE',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<{ success: boolean }>(response);
  }

  /**
   * Likes a comment.
   * 
   * @param reelId - ID of the reel
   * @param commentId - ID of the comment to like
   * @returns Promise resolving to LikeResponse
   */
  async likeComment(reelId: string, commentId: string): Promise<LikeResponse> {
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? `/api/reels/${reelId}/comments/${commentId}/like` : `${this.baseUrl}/reels/${reelId}/comments/${commentId}/like`;
    
    const response = await fetch(apiPath, {
      method: 'POST',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<LikeResponse>(response);
  }

  /**
   * Unlikes a comment.
   * 
   * @param reelId - ID of the reel
   * @param commentId - ID of the comment to unlike
   * @returns Promise resolving to LikeResponse
   */
  async unlikeComment(reelId: string, commentId: string): Promise<LikeResponse> {
    // Use Next.js API proxy to avoid CORS issues
    const apiPath = typeof window !== 'undefined' ? `/api/reels/${reelId}/comments/${commentId}/like` : `${this.baseUrl}/reels/${reelId}/comments/${commentId}/like`;
    
    const response = await fetch(apiPath, {
      method: 'DELETE',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<LikeResponse>(response);
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
