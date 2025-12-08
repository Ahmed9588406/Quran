/**
 * Auth helper functions for dynamic user routing
 * Feature: dynamic-user-routing
 */

/**
 * Interface for various authentication response shapes
 */
export interface AuthResponse {
  user_id?: string;
  data?: {
    user?: {
      id?: string;
    };
  };
  user?: {
    id?: string;
  };
  tokens?: {
    user?: {
      id?: string;
    };
  };
}

/**
 * Extracts user ID from various authentication response shapes.
 * Handles: user_id, data.user.id, user.id, tokens.user.id
 * 
 * @param response - The authentication response object
 * @returns The user ID string if found, null otherwise
 * 
 * Requirements: 1.1, 1.2
 */
export function extractUserId(response: AuthResponse | null | undefined): string | null {
  if (!response) return null;
  
  // Check direct user_id field
  if (response.user_id && typeof response.user_id === 'string') {
    return response.user_id;
  }
  
  // Check data.user.id path
  if (response.data?.user?.id && typeof response.data.user.id === 'string') {
    return response.data.user.id;
  }
  
  // Check user.id path
  if (response.user?.id && typeof response.user.id === 'string') {
    return response.user.id;
  }
  
  // Check tokens.user.id path
  if (response.tokens?.user?.id && typeof response.tokens.user.id === 'string') {
    return response.tokens.user.id;
  }
  
  return null;
}

/**
 * Determines the navigation route after login based on user ID.
 * 
 * @param userId - The extracted user ID (or null)
 * @returns The route to navigate to: `/user/${userId}` if ID exists, `/user` otherwise
 * 
 * Requirements: 1.1, 1.3
 */
export function getPostLoginRoute(userId: string | null): string {
  if (userId && userId.trim().length > 0) {
    return `/user/${userId}`;
  }
  return '/user';
}

/**
 * Retrieves the current user ID from localStorage.
 * Handles missing/corrupted localStorage gracefully.
 * 
 * @returns The user ID string if found, null otherwise
 * 
 * Requirements: 2.2
 */
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    if (user?.id && typeof user.id === 'string' && user.id.trim().length > 0) {
      return user.id;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Determines the profile navigation route based on stored user ID.
 * 
 * @returns The route to navigate to: `/user-profile/${userId}` if ID exists, `/user-profile` otherwise
 * 
 * Requirements: 2.1, 2.3
 */
export function getProfileRoute(): string {
  const userId = getCurrentUserId();
  if (userId) {
    return `/user-profile/${userId}`;
  }
  return '/user-profile';
}

/**
 * Checks if the user is authenticated based on the presence of access token and user data in localStorage.
 * 
 * @returns True if authenticated, false otherwise
 * 
 * Requirements: 2.4
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  return !!(token && user);
}

/**
 * Clears the user session by removing access token, refresh token, and user data from localStorage.
 * Safe to call even if no items are present.
 * 
 * Requirements: 2.5
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}
