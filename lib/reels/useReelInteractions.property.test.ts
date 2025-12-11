/**
 * Property-Based Tests for Reel Interactions
 * 
 * These tests use fast-check to verify correctness properties
 * for like and save toggle operations.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { toggleLikeState, toggleSaveState } from './useReelInteractions';

describe('Reel Interactions Property Tests', () => {
  /**
   * **Feature: instagram-reels, Property 5: Like toggle consistency**
   * 
   * *For any* reel, toggling the like state SHALL flip the isLiked boolean
   * and adjust the like count by +1 (if liking) or -1 (if unliking).
   * 
   * **Validates: Requirements 5.1, 5.2**
   */
  describe('Property 5: Like toggle consistency', () => {
    it('should flip isLiked and adjust likeCount correctly', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // currentIsLiked
          fc.integer({ min: 0, max: 1000000 }), // currentLikeCount
          (currentIsLiked, currentLikeCount) => {
            const result = toggleLikeState(currentIsLiked, currentLikeCount);
            
            // isLiked should be flipped
            expect(result.isLiked).toBe(!currentIsLiked);
            
            // likeCount should be adjusted correctly
            if (currentIsLiked) {
              // Was liked, now unliked -> count decreases by 1 (min 0)
              expect(result.likeCount).toBe(Math.max(0, currentLikeCount - 1));
            } else {
              // Was not liked, now liked -> count increases by 1
              expect(result.likeCount).toBe(currentLikeCount + 1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never produce negative like counts', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.integer({ min: 0, max: 1000000 }),
          (currentIsLiked, currentLikeCount) => {
            const result = toggleLikeState(currentIsLiked, currentLikeCount);
            expect(result.likeCount).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be reversible (double toggle returns to original state)', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.integer({ min: 1, max: 1000000 }), // min 1 to avoid edge case with 0
          (initialIsLiked, initialLikeCount) => {
            // First toggle
            const afterFirst = toggleLikeState(initialIsLiked, initialLikeCount);
            // Second toggle (reverse)
            const afterSecond = toggleLikeState(afterFirst.isLiked, afterFirst.likeCount);
            
            // Should return to original state
            expect(afterSecond.isLiked).toBe(initialIsLiked);
            expect(afterSecond.likeCount).toBe(initialLikeCount);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: instagram-reels, Property 6: Save toggle consistency**
   * 
   * *For any* reel, toggling the save state SHALL flip the isSaved boolean.
   * 
   * **Validates: Requirements 6.1, 6.2**
   */
  describe('Property 6: Save toggle consistency', () => {
    it('should flip isSaved boolean', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // currentIsSaved
          (currentIsSaved) => {
            const result = toggleSaveState(currentIsSaved);
            expect(result).toBe(!currentIsSaved);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be reversible (double toggle returns to original state)', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (initialIsSaved) => {
            const afterFirst = toggleSaveState(initialIsSaved);
            const afterSecond = toggleSaveState(afterFirst);
            expect(afterSecond).toBe(initialIsSaved);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always produce a boolean result', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (currentIsSaved) => {
            const result = toggleSaveState(currentIsSaved);
            expect(typeof result).toBe('boolean');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
