/**
 * Retrieve the auth token from the logged-in user.
 * Uses the keys set by the login route: access_token, refresh_token
 */
export function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        // Login route stores tokens as 'access_token' and 'refresh_token'
        const token = localStorage.getItem('access_token');
        console.log('[AUTH] Retrieved access_token from localStorage:', token ? 'YES' : 'NO');
        return token;
    }
    return null;
}

/**
 * Retrieve the refresh token
 */
export function getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('refresh_token');
    }
    return null;
}

/**
 * Set the access token (called by login route)
 */
export function setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token);
        console.log('[AUTH] Access token saved to localStorage');
    }
}

/**
 * Set the refresh token (called by login route)
 */
export function setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', token);
        console.log('[AUTH] Refresh token saved to localStorage');
    }
}

/**
 * Clear all auth tokens (call on logout)
 */
export function clearAuthToken(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        console.log('[AUTH] Tokens cleared from localStorage');
    }
}
