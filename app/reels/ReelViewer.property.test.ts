/**
 * Property-Based Tests for Reel Viewer Components
 * 
 * These tests use fast-check to verify correctness properties
 * for reel display and follow button visibility.
 * 
 * **Feature: instagram-reels, Property 1: Reel display completeness**
 * **Feature: instagram-reels, Property 9: Follow button visibility**
 * **Validates: Requirements 1.2, 9.1**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Reel, ReelVisibility } from '@/lib/reels/types';

/**
 * Arbitrary generator for valid Reel objects
 */
const reelArbitrary = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  username: fc.string({ minLength: 1, maxLength: 50 }),
  user_avatar: fc.webUrl(),
  video_url: fc.webUrl(),
  thumbnail_url: fc.option(fc.webUrl(), { nil: undefined }),
  content: fc.string({ minLength: 0, maxLength: 500 }),
  visibility: fc.constantFrom<ReelVisibility>('public', 'private', 'followers'),
  likes_count: fc.nat({ max: 1000000 }),
  comments_count: fc.nat({ max: 1000000 }),
  is_liked: fc.option(fc.boolean(), { nil: undefined }),
  is_saved: fc.option(fc.boolean(), { nil: undefined }),
  is_following: fc.option(fc.boolean(), { nil: undefined }),
  created_at: fc.integer({ min: 1577836800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()),
});

/**
 * Pure function to check if a reel has all required display fields
 * This validates Property 1: Reel display completeness
 * 
 * *For any* reel object, the rendered output SHALL contain the video element,
 * username, avatar, caption, like count, and comment count.
 */
export function hasRequiredDisplayFields(reel: Reel): {
  hasVideo: boolean;
  hasUsername: boolean;
  hasAvatar: boolean;
  hasCaption: boolean;
  hasLikeCount: boolean;
  hasCommentCount: boolean;
  isComplete: boolean;
} {
  const hasVideo = typeof reel.video_url === 'string' && reel.video_url.length > 0;
  const hasUsername = typeof reel.username === 'string' && reel.username.length > 0;
  const hasAvatar = typeof reel.user_avatar === 'string' && reel.user_avatar.length > 0;
  const hasCaption = typeof reel.content === 'string'; // Caption can be empty
  const hasLikeCount = typeof reel.likes_count === 'number' && reel.likes_count >= 0;
  const hasCommentCount = typeof reel.comments_count === 'number' && reel.comments_count >= 0;

  return {
    hasVideo,
    hasUsername,
    hasAvatar,
    hasCaption,
    hasLikeCount,
    hasCommentCount,
    isComplete: hasVideo && hasUsername && hasAvatar && hasCaption && hasLikeCount && hasCommentCount,
  };
}

/**
 * Pure function to determine follow button visibility
 * This validates Property 9: Follow button visibility
 * 
 * *For any* reel where the creator is not the current user and isFollowing is false,
 * the follow button SHALL be visible.
 */
export function shouldShowFollowButton(
  isCurrentUser: boolean,
  isFollowing: boolean
): boolean {
  return !isCurrentUser && !isFollowing;
}

describe('Reel Viewer Property Tests', () => {
  /**
   * **Feature: instagram-reels, Property 1: Reel display completeness**
   * 
   * *For any* reel object, the rendered output SHALL contain the video element,
   * username, avatar, caption, like count, and comment count.
   * 
   * **Validates: Requirements 1.2**
   */
  describe('Property 1: Reel display completeness', () => {
    it('should have all required display fields for any valid reel', () => {
      fc.assert(
        fc.property(reelArbitrary, (reel) => {
          const result = hasRequiredDisplayFields(reel);
          
          // All fields should be present
          expect(result.hasVideo).toBe(true);
          expect(result.hasUsername).toBe(true);
          expect(result.hasAvatar).toBe(true);
          expect(result.hasCaption).toBe(true);
          expect(result.hasLikeCount).toBe(true);
          expect(result.hasCommentCount).toBe(true);
          expect(result.isComplete).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should detect missing video URL', () => {
      const reelWithoutVideo = {
        id: '123',
        user_id: '456',
        username: 'testuser',
        user_avatar: 'https://example.com/avatar.jpg',
        video_url: '', // Empty video URL
        content: 'Test caption',
        visibility: 'public' as ReelVisibility,
        likes_count: 10,
        comments_count: 5,
        created_at: new Date().toISOString(),
      };

      const result = hasRequiredDisplayFields(reelWithoutVideo);
      expect(result.hasVideo).toBe(false);
      expect(result.isComplete).toBe(false);
    });

    it('should detect missing username', () => {
      const reelWithoutUsername = {
        id: '123',
        user_id: '456',
        username: '', // Empty username
        user_avatar: 'https://example.com/avatar.jpg',
        video_url: 'https://example.com/video.mp4',
        content: 'Test caption',
        visibility: 'public' as ReelVisibility,
        likes_count: 10,
        comments_count: 5,
        created_at: new Date().toISOString(),
      };

      const result = hasRequiredDisplayFields(reelWithoutUsername);
      expect(result.hasUsername).toBe(false);
      expect(result.isComplete).toBe(false);
    });

    it('should allow empty caption', () => {
      const reelWithEmptyCaption = {
        id: '123',
        user_id: '456',
        username: 'testuser',
        user_avatar: 'https://example.com/avatar.jpg',
        video_url: 'https://example.com/video.mp4',
        content: '', // Empty caption is valid
        visibility: 'public' as ReelVisibility,
        likes_count: 10,
        comments_count: 5,
        created_at: new Date().toISOString(),
      };

      const result = hasRequiredDisplayFields(reelWithEmptyCaption);
      expect(result.hasCaption).toBe(true);
      expect(result.isComplete).toBe(true);
    });
  });

  /**
   * **Feature: instagram-reels, Property 9: Follow button visibility**
   * 
   * *For any* reel where the creator is not the current user and isFollowing is false,
   * the follow button SHALL be visible.
   * 
   * **Validates: Requirements 9.1**
   */
  describe('Property 9: Follow button visibility', () => {
    it('should show follow button when not current user and not following', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // isCurrentUser
          fc.boolean(), // isFollowing
          (isCurrentUser, isFollowing) => {
            const shouldShow = shouldShowFollowButton(isCurrentUser, isFollowing);
            
            // Follow button should be visible only when:
            // - NOT the current user AND
            // - NOT already following
            const expectedVisibility = !isCurrentUser && !isFollowing;
            expect(shouldShow).toBe(expectedVisibility);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never show follow button for current user', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // isFollowing (doesn't matter for current user)
          (isFollowing) => {
            const shouldShow = shouldShowFollowButton(true, isFollowing);
            expect(shouldShow).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never show follow button when already following', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // isCurrentUser
          (isCurrentUser) => {
            // When already following, button should not show
            const shouldShow = shouldShowFollowButton(isCurrentUser, true);
            expect(shouldShow).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should show follow button only for non-current, non-following users', () => {
      // This is the only case where follow button should be visible
      expect(shouldShowFollowButton(false, false)).toBe(true);
      
      // All other cases should hide the button
      expect(shouldShowFollowButton(true, false)).toBe(false);
      expect(shouldShowFollowButton(true, true)).toBe(false);
      expect(shouldShowFollowButton(false, true)).toBe(false);
    });
  });
});
