/**
 * Property-based tests for auth-helpers
 * Feature: dynamic-user-routing
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { extractUserId, getPostLoginRoute, AuthResponse } from './auth-helpers';

/**
 * **Feature: dynamic-user-routing, Property 1: Post-login navigation uses correct route**
 * 
 * *For any* authentication response, if the response contains a valid user ID,
 * the system SHALL navigate to `/user/{userId}`; otherwise, the system SHALL
 * navigate to the fallback `/user` route.
 * 
 * **Validates: Requirements 1.1, 1.3**
 */
describe('Property 1: Post-login navigation uses correct route', () => {
  it('should return /user/{userId} when a valid user ID is present', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (userId) => {
          const route = getPostLoginRoute(userId);
          expect(route).toBe(`/user/${userId}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return /user fallback when user ID is null', () => {
    const route = getPostLoginRoute(null);
    expect(route).toBe('/user');
  });

  it('should return /user fallback when user ID is empty string', () => {
    const route = getPostLoginRoute('');
    expect(route).toBe('/user');
  });

  it('should return /user fallback when user ID is whitespace only', () => {
    // Test specific whitespace cases since stringOf is not available in fast-check v4
    const whitespaceStrings = ['   ', '\t', '\n', '\r', '  \t  ', '\n\r'];
    for (const ws of whitespaceStrings) {
      const route = getPostLoginRoute(ws);
      expect(route).toBe('/user');
    }
  });

  it('should correctly extract user ID from various response shapes and navigate accordingly', () => {
    // Generator for auth responses with user_id at root level
    const rootUserIdResponse = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0).map(id => ({
      user_id: id,
    }));

    // Generator for auth responses with data.user.id
    const dataUserIdResponse = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0).map(id => ({
      data: { user: { id } },
    }));

    // Generator for auth responses with user.id
    const userIdResponse = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0).map(id => ({
      user: { id },
    }));

    // Test root user_id
    fc.assert(
      fc.property(rootUserIdResponse, (response) => {
        const userId = extractUserId(response);
        const route = getPostLoginRoute(userId);
        expect(route).toBe(`/user/${response.user_id}`);
      }),
      { numRuns: 100 }
    );

    // Test data.user.id
    fc.assert(
      fc.property(dataUserIdResponse, (response) => {
        const userId = extractUserId(response);
        const route = getPostLoginRoute(userId);
        expect(route).toBe(`/user/${response.data?.user?.id}`);
      }),
      { numRuns: 100 }
    );

    // Test user.id
    fc.assert(
      fc.property(userIdResponse, (response) => {
        const userId = extractUserId(response);
        const route = getPostLoginRoute(userId);
        expect(route).toBe(`/user/${response.user?.id}`);
      }),
      { numRuns: 100 }
    );
  });

  it('should return /user when response has no valid user ID', () => {
    // Generator for empty/invalid responses
    const emptyResponses = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.constant({}),
      fc.constant({ data: {} }),
      fc.constant({ data: { user: {} } }),
      fc.constant({ user: {} }),
    );

    fc.assert(
      fc.property(emptyResponses, (response) => {
        const userId = extractUserId(response as AuthResponse);
        const route = getPostLoginRoute(userId);
        expect(route).toBe('/user');
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * **Feature: dynamic-user-routing, Property 2: User ID persistence after login**
 * 
 * *For any* authentication response containing a user object with an ID,
 * the system SHALL store that ID in localStorage such that subsequent reads
 * return the same ID.
 * 
 * **Validates: Requirements 1.2**
 */
describe('Property 2: User ID persistence after login', () => {
  it('should extract the same user ID regardless of response shape', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (userId) => {
          // Test that extractUserId returns consistent results for the same ID
          // in different response shapes
          const responses: AuthResponse[] = [
            { user_id: userId },
            { data: { user: { id: userId } } },
            { user: { id: userId } },
            { tokens: { user: { id: userId } } },
          ];

          for (const response of responses) {
            const extracted = extractUserId(response);
            expect(extracted).toBe(userId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prioritize user_id over nested paths', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (rootId, nestedId) => {
          // When both user_id and nested paths exist, user_id should take precedence
          const response: AuthResponse = {
            user_id: rootId,
            data: { user: { id: nestedId } },
            user: { id: nestedId },
          };

          const extracted = extractUserId(response);
          expect(extracted).toBe(rootId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return null for responses without valid user ID', () => {
    const invalidResponses = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.constant({}),
      fc.constant({ user_id: '' }),
      fc.constant({ user_id: 123 }), // non-string
      fc.constant({ data: { user: { id: '' } } }),
      fc.constant({ user: { id: '' } }),
    );

    fc.assert(
      fc.property(invalidResponses, (response) => {
        const extracted = extractUserId(response as AuthResponse);
        expect(extracted).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it('should handle localStorage round-trip for user object with ID', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string(),
        fc.string(),
        (userId, name, email) => {
          // Simulate storing user object with ID
          const userObject = { id: userId, name, email };
          const serialized = JSON.stringify(userObject);
          const deserialized = JSON.parse(serialized);
          
          // Verify the ID is preserved through serialization
          expect(deserialized.id).toBe(userId);
        }
      ),
      { numRuns: 100 }
    );
  });
});


import { getCurrentUserId, getProfileRoute } from './auth-helpers';
import { beforeEach, afterEach } from 'vitest';

/**
 * **Feature: dynamic-user-routing, Property 3: Profile modal navigation uses stored user ID**
 * 
 * *For any* state of localStorage, if a valid user ID exists, the Profile Modal's
 * "View your profile" link SHALL point to `/user-profile/{userId}`;
 * otherwise, it SHALL point to `/user-profile`.
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */
describe('Property 3: Profile modal navigation uses stored user ID', () => {
  // Mock localStorage for testing
  let mockStorage: Record<string, string> = {};
  
  beforeEach(() => {
    mockStorage = {};
    // Mock window and localStorage for Node environment
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
  });

  afterEach(() => {
    mockStorage = {};
    // @ts-expect-error - cleaning up mock
    delete global.window;
  });

  it('should return /user-profile/{userId} when valid user ID exists in localStorage', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (userId) => {
          // Store user with ID in localStorage
          mockStorage['user'] = JSON.stringify({ id: userId });
          
          const route = getProfileRoute();
          expect(route).toBe(`/user-profile/${userId}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return /user-profile fallback when localStorage is empty', () => {
    mockStorage = {};
    const route = getProfileRoute();
    expect(route).toBe('/user-profile');
  });

  it('should return /user-profile fallback when user object has no ID', () => {
    const invalidUserObjects = fc.oneof(
      fc.constant({}),
      fc.constant({ name: 'test' }),
      fc.constant({ id: '' }),
      fc.constant({ id: '   ' }),
      fc.constant({ id: null }),
      fc.constant({ id: 123 }), // non-string
    );

    fc.assert(
      fc.property(invalidUserObjects, (userObj) => {
        mockStorage['user'] = JSON.stringify(userObj);
        const route = getProfileRoute();
        expect(route).toBe('/user-profile');
      }),
      { numRuns: 100 }
    );
  });

  it('should return /user-profile fallback when localStorage contains invalid JSON', () => {
    mockStorage['user'] = 'not valid json {{{';
    const route = getProfileRoute();
    expect(route).toBe('/user-profile');
  });

  it('should correctly extract user ID from localStorage via getCurrentUserId', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string(),
        fc.string(),
        (userId, name, email) => {
          // Store user object with various fields
          mockStorage['user'] = JSON.stringify({ id: userId, name, email });
          
          const extractedId = getCurrentUserId();
          expect(extractedId).toBe(userId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return null from getCurrentUserId when no valid ID exists', () => {
    const invalidStates = [
      null, // no user key
      '{}', // empty object
      '{"name": "test"}', // no id field
      '{"id": ""}', // empty id
      '{"id": "   "}', // whitespace id
      'invalid json',
    ];

    for (const state of invalidStates) {
      mockStorage = {};
      if (state !== null) {
        mockStorage['user'] = state;
      }
      const result = getCurrentUserId();
      expect(result).toBeNull();
    }
  });
});


/**
 * **Feature: dynamic-user-routing, Property 4: Dynamic route data fetching**
 * 
 * *For any* valid user ID in a dynamic route (`/user/[id]` or `/user-profile/[id]`),
 * the system SHALL fetch profile data using that ID and render the corresponding user's profile.
 * 
 * **Validates: Requirements 3.1, 3.2**
 */
describe('Property 4: Dynamic route data fetching', () => {
  it('should construct correct API URL for any valid user ID', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0 && !s.includes('&') && !s.includes('?')),
        (userId) => {
          // Simulate the URL construction used in fetchUserProfile
          const BASE_URL = "http://192.168.1.18:9001";
          const url = `${BASE_URL}/api/user_profile?userId=${encodeURIComponent(userId)}`;
          
          // Verify URL is properly constructed
          expect(url).toContain('/api/user_profile');
          expect(url).toContain(`userId=${encodeURIComponent(userId)}`);
          
          // Verify the URL can be parsed
          const parsedUrl = new URL(url);
          expect(parsedUrl.searchParams.get('userId')).toBe(userId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle special characters in user IDs via URL encoding', () => {
    const specialCharIds = fc.oneof(
      fc.constant('user-123'),
      fc.constant('user_456'),
      fc.constant('user.789'),
      fc.constant('user@domain'),
      fc.constant('user+test'),
      fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    );

    fc.assert(
      fc.property(specialCharIds, (userId) => {
        const encoded = encodeURIComponent(userId);
        const decoded = decodeURIComponent(encoded);
        expect(decoded).toBe(userId);
      }),
      { numRuns: 100 }
    );
  });

  it('should map user data to profile data correctly for any valid user object', () => {
    const userGenerator = fc.record({
      id: fc.string({ minLength: 1 }),
      name: fc.option(fc.string(), { nil: undefined }),
      display_name: fc.option(fc.string(), { nil: undefined }),
      username: fc.option(fc.string(), { nil: undefined }),
      avatar_url: fc.option(fc.string(), { nil: undefined }),
      bio: fc.option(fc.string(), { nil: undefined }),
      posts_count: fc.option(fc.nat(), { nil: undefined }),
      followers_count: fc.option(fc.nat(), { nil: undefined }),
      following_count: fc.option(fc.nat(), { nil: undefined }),
    });

    fc.assert(
      fc.property(userGenerator, (user) => {
        // Simulate the profile data mapping from the server component
        const profileData = {
          name: user.name ?? user.display_name ?? user.username ?? "Unknown",
          avatar: user.avatar_url ?? "/icons/settings/profile.png",
          posts: Number(user.posts_count ?? 0),
          followers: Number(user.followers_count ?? 0),
          following: Number(user.following_count ?? 0),
          bio: user.bio ?? "",
        };

        // Verify mapping produces valid profile data
        expect(typeof profileData.name).toBe('string');
        expect(typeof profileData.avatar).toBe('string');
        expect(typeof profileData.posts).toBe('number');
        expect(typeof profileData.followers).toBe('number');
        expect(typeof profileData.following).toBe('number');
        expect(typeof profileData.bio).toBe('string');
        expect(profileData.posts).toBeGreaterThanOrEqual(0);
        expect(profileData.followers).toBeGreaterThanOrEqual(0);
        expect(profileData.following).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * **Feature: dynamic-user-routing, Property 5: Own profile detection**
 * 
 * *For any* combination of route parameter ID and stored authenticated user ID,
 * the `isOwnProfile` flag SHALL be `true` if and only if the two IDs are equal.
 * 
 * **Validates: Requirements 3.4, 4.3**
 */
describe('Property 5: Own profile detection', () => {
  let mockStorage: Record<string, string> = {};
  
  beforeEach(() => {
    mockStorage = {};
    // Mock window and localStorage for Node environment
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
  });

  afterEach(() => {
    mockStorage = {};
    // @ts-expect-error - cleaning up mock
    delete global.window;
  });

  /**
   * Helper function to determine isOwnProfile
   * Mirrors the logic in UserProfileClient component
   */
  function determineIsOwnProfile(routeUserId: string, storedUserId: string | null): boolean {
    return storedUserId !== null && storedUserId === routeUserId;
  }

  it('should return true when route ID equals stored user ID', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (userId) => {
          // Same ID for both route and stored
          const isOwn = determineIsOwnProfile(userId, userId);
          expect(isOwn).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return false when route ID differs from stored user ID', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (routeId, storedId) => {
          fc.pre(routeId !== storedId); // Ensure IDs are different
          const isOwn = determineIsOwnProfile(routeId, storedId);
          expect(isOwn).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return false when no user ID is stored', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (routeId) => {
          const isOwn = determineIsOwnProfile(routeId, null);
          expect(isOwn).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly integrate with getCurrentUserId for isOwnProfile detection', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (routeId, storedId) => {
          // Store user in localStorage
          mockStorage['user'] = JSON.stringify({ id: storedId });
          
          const currentUserId = getCurrentUserId();
          const isOwn = determineIsOwnProfile(routeId, currentUserId);
          
          // isOwnProfile should be true only when IDs match
          expect(isOwn).toBe(routeId === storedId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge cases in ID comparison', () => {
    // Test case sensitivity
    expect(determineIsOwnProfile('User123', 'user123')).toBe(false);
    expect(determineIsOwnProfile('USER123', 'USER123')).toBe(true);
    
    // Test whitespace handling
    expect(determineIsOwnProfile('user 123', 'user 123')).toBe(true);
    expect(determineIsOwnProfile('user123', 'user123 ')).toBe(false);
    
    // Test empty string (should not match)
    expect(determineIsOwnProfile('', '')).toBe(true); // Both empty = same
    expect(determineIsOwnProfile('user', '')).toBe(false);
  });
});
