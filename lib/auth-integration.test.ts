/**
 * Integration tests for dynamic user routing
 * Feature: dynamic-user-routing
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { extractUserId, getPostLoginRoute, getCurrentUserId, getProfileRoute } from './auth-helpers';

// Mock localStorage and window for Node environment
let mockStorage: Record<string, string> = {};

function setupMocks() {
  mockStorage = {};
  const mockLocalStorage = {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { mockStorage = {}; },
  };
  
  // @ts-expect-error - mocking window for tests
  global.window = { localStorage: mockLocalStorage };
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  });
}

function cleanupMocks() {
  mockStorage = {};
  // @ts-expect-error - cleaning up mock
  delete global.window;
}

/**
 * Integration test for login → navigation flow
 * Requirements: 1.1, 1.3
 */
describe('Integration: Login → Navigation Flow', () => {
  beforeEach(setupMocks);
  afterEach(cleanupMocks);

  it('should navigate to /user/{userId} after successful login with valid user ID', () => {
    // Simulate auth response from backend
    const authResponse = {
      success: true,
      user_id: 'user-123',
      tokens: {
        access_token: 'token-abc',
        refresh_token: 'refresh-xyz',
        user: { id: 'user-123', name: 'Test User' }
      }
    };

    // Extract user ID (as done in login page)
    const userId = extractUserId(authResponse);
    expect(userId).toBe('user-123');

    // Store user in localStorage (as done in login page)
    const user = authResponse.tokens.user;
    const userWithId = { ...user, id: userId || user.id };
    mockStorage['user'] = JSON.stringify(userWithId);
    mockStorage['access_token'] = authResponse.tokens.access_token;

    // Get navigation route (as done in login page)
    const targetRoute = getPostLoginRoute(userId);
    expect(targetRoute).toBe('/user/user-123');

    // Verify user ID is persisted and retrievable
    const storedUserId = getCurrentUserId();
    expect(storedUserId).toBe('user-123');
  });

  it('should navigate to /user fallback when auth response has no user ID', () => {
    // Simulate auth response without user ID
    const authResponse = {
      success: true,
      tokens: {
        access_token: 'token-abc',
        refresh_token: 'refresh-xyz'
      }
    };

    // Extract user ID (should be null)
    const userId = extractUserId(authResponse);
    expect(userId).toBeNull();

    // Get navigation route (should fallback)
    const targetRoute = getPostLoginRoute(userId);
    expect(targetRoute).toBe('/user');
  });

  it('should handle various auth response shapes correctly', () => {
    const testCases = [
      { response: { user_id: 'id1' }, expectedId: 'id1' },
      { response: { data: { user: { id: 'id2' } } }, expectedId: 'id2' },
      { response: { user: { id: 'id3' } }, expectedId: 'id3' },
      { response: { tokens: { user: { id: 'id4' } } }, expectedId: 'id4' },
    ];

    for (const { response, expectedId } of testCases) {
      const userId = extractUserId(response);
      expect(userId).toBe(expectedId);
      
      const route = getPostLoginRoute(userId);
      expect(route).toBe(`/user/${expectedId}`);
    }
  });
});

/**
 * Integration test for profile modal navigation
 * Requirements: 2.1, 2.3
 */
describe('Integration: Profile Modal Navigation', () => {
  beforeEach(setupMocks);
  afterEach(cleanupMocks);

  it('should navigate to /user-profile/{userId} when user is logged in', () => {
    // Simulate logged-in user
    mockStorage['user'] = JSON.stringify({ id: 'user-456', name: 'Test User' });
    mockStorage['access_token'] = 'valid-token';

    // Get profile route (as done in profile modal)
    const profileRoute = getProfileRoute();
    expect(profileRoute).toBe('/user-profile/user-456');
  });

  it('should navigate to /user-profile fallback when not logged in', () => {
    // No user in localStorage
    mockStorage = {};

    // Get profile route (should fallback)
    const profileRoute = getProfileRoute();
    expect(profileRoute).toBe('/user-profile');
  });

  it('should navigate to /user-profile fallback when user object is corrupted', () => {
    // Corrupted user data
    mockStorage['user'] = 'not-valid-json';

    const profileRoute = getProfileRoute();
    expect(profileRoute).toBe('/user-profile');
  });

  it('should navigate to /user-profile fallback when user has no ID', () => {
    // User object without ID
    mockStorage['user'] = JSON.stringify({ name: 'Test User', email: 'test@example.com' });

    const profileRoute = getProfileRoute();
    expect(profileRoute).toBe('/user-profile');
  });
});

/**
 * Integration test for own profile detection
 * Requirements: 3.4, 4.3
 */
describe('Integration: Own Profile Detection', () => {
  beforeEach(setupMocks);
  afterEach(cleanupMocks);

  it('should detect own profile when route ID matches stored user ID', () => {
    // Simulate logged-in user
    mockStorage['user'] = JSON.stringify({ id: 'user-789' });

    // Simulate route parameter
    const routeUserId = 'user-789';
    const storedUserId = getCurrentUserId();

    // Check if own profile
    const isOwnProfile = storedUserId !== null && storedUserId === routeUserId;
    expect(isOwnProfile).toBe(true);
  });

  it('should detect other profile when route ID differs from stored user ID', () => {
    // Simulate logged-in user
    mockStorage['user'] = JSON.stringify({ id: 'user-789' });

    // Simulate viewing another user's profile
    const routeUserId = 'other-user-123';
    const storedUserId = getCurrentUserId();

    // Check if own profile
    const isOwnProfile = storedUserId !== null && storedUserId === routeUserId;
    expect(isOwnProfile).toBe(false);
  });

  it('should handle not logged in state when viewing profiles', () => {
    // No user logged in
    mockStorage = {};

    const routeUserId = 'any-user-id';
    const storedUserId = getCurrentUserId();

    // Should not be own profile when not logged in
    const isOwnProfile = storedUserId !== null && storedUserId === routeUserId;
    expect(isOwnProfile).toBe(false);
    expect(storedUserId).toBeNull();
  });
});

/**
 * End-to-end flow test
 * Requirements: 1.1, 1.2, 1.3, 2.1, 2.3, 3.4, 4.3
 */
describe('Integration: End-to-End User Flow', () => {
  beforeEach(setupMocks);
  afterEach(cleanupMocks);

  it('should complete full user journey: login → view own profile → view other profile', () => {
    // Step 1: User logs in
    const authResponse = {
      user_id: 'current-user-id',
      tokens: {
        access_token: 'token',
        user: { id: 'current-user-id', name: 'Current User' }
      }
    };

    const userId = extractUserId(authResponse);
    expect(userId).toBe('current-user-id');

    // Store user data
    mockStorage['user'] = JSON.stringify({ id: userId, name: 'Current User' });
    mockStorage['access_token'] = authResponse.tokens.access_token;

    // Navigate to user page
    const loginRoute = getPostLoginRoute(userId);
    expect(loginRoute).toBe('/user/current-user-id');

    // Step 2: User clicks "View your profile" in modal
    const profileRoute = getProfileRoute();
    expect(profileRoute).toBe('/user-profile/current-user-id');

    // Verify it's detected as own profile
    const storedUserId = getCurrentUserId();
    const isOwnProfile = storedUserId === 'current-user-id';
    expect(isOwnProfile).toBe(true);

    // Step 3: User views another user's profile
    const otherUserId = 'other-user-id';
    const isOtherOwnProfile = storedUserId === otherUserId;
    expect(isOtherOwnProfile).toBe(false);
  });
});
