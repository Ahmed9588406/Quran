/**
 * Auth helper functions for dynamic user routing
 * Feature: dynamic-user-routing
 */

/**
 * Interface for various authentication response shapes
 */
export interface AuthResponse {
  user_id?: string;
  role?: string;
  data?: {
    user?: {
      id?: string;
      role?: string;
    };
  };
  user?: {
    id?: string;
    role?: string;
  };
  tokens?: {
    user?: {
      id?: string;
      role?: string;
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
 * Extracts user role from various authentication response shapes.
 * Handles: role, data.user.role, user.role, tokens.user.role
 * 
 * @param response - The authentication response object
 * @returns The user role string if found, null otherwise
 */
export function extractUserRole(response: AuthResponse | null | undefined): string | null {
  if (!response) return null;
  
  // Check direct role field
  if (response.role && typeof response.role === 'string') {
    return response.role;
  }
  
  // Check data.user.role path
  if (response.data?.user?.role && typeof response.data.user.role === 'string') {
    return response.data.user.role;
  }
  
  // Check user.role path
  if (response.user?.role && typeof response.user.role === 'string') {
    return response.user.role;
  }
  
  // Check tokens.user.role path
  if (response.tokens?.user?.role && typeof response.tokens.user.role === 'string') {
    return response.tokens.user.role;
  }
  
  return null;
}

/**
 * Determines the navigation route after login based on user ID and role.
 * 
 * @param userId - The extracted user ID (or null)
 * @param role - The extracted user role (or null)
 * @returns The route to navigate to based on role and ID
 * 
 * Requirements: 1.1, 1.3
 */
export function getPostLoginRoute(userId: string | null, role?: string | null): string {
  // If user has admin role, navigate to admin dashboard
  if (role && role.toLowerCase() === 'admin') {
    return '/admin';
  }
  
  // If user has preacher role, navigate to dynamic khateb_Studio route with their ID
  if (role && role.toLowerCase() === 'preacher') {
    if (userId && userId.trim().length > 0) {
      return `/khateb_Studio/${userId}`;
    }
    // Fallback to redirect page if no ID
    return '/khateb_Studio';
  }
  
  // Default routing based on user ID
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

/**
 * Extracts preacher credentials (name and avatar) from the stored user object in localStorage.
 * Handles various field name formats from different backend responses.
 * 
 * @returns Object with preacher name and avatar URL
 * 
 * Example return:
 * {
 *   name: "Ahmed Al-Mansouri",
 *   avatar: "https://example.com/avatar.jpg"
 * }
 */
export function getPreacherCredentials(): { name: string; avatar: string } {
  if (typeof window === 'undefined') {
    return { name: 'Preacher', avatar: '' };
  }

  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return { name: 'Preacher', avatar: '' };
    }

    const user = JSON.parse(userStr);
    
    // Extract first name from various possible field names
    const firstName = user.firstName || user.first_name || user.name?.split(' ')[0] || '';
    
    // Extract last name from various possible field names
    const lastName = user.lastName || user.last_name || user.name?.split(' ').slice(1).join(' ') || '';
    
    // Extract avatar URL from various possible field names
    const avatar = user.profilePictureUrl || user.profile_picture_url || user.avatar || user.avatar_url || '';
    
    // Combine first and last name
    const fullName = `${firstName} ${lastName}`.trim() || 'Preacher';
    
    return {
      name: fullName,
      avatar: avatar
    };
  } catch (error) {
    console.error('[Auth] Error extracting preacher credentials:', error);
    return { name: 'Preacher', avatar: '' };
  }
}
