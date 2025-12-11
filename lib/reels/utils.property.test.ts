/**
 * Property-Based Tests for Reels Utility Functions
 * 
 * These tests use fast-check to verify correctness properties
 * across a wide range of inputs.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  isValidVideoFile,
  isValidThumbnailFile,
  getNextIndex,
  getPreviousIndex,
  createMockFile,
} from './utils';
import {
  SUPPORTED_VIDEO_FORMATS,
  SUPPORTED_IMAGE_FORMATS,
} from './types';

describe('Reels Utils Property Tests', () => {
  /**
   * **Feature: instagram-reels, Property 3: Video file validation**
   * 
   * *For any* file selected for upload, the system SHALL accept only files
   * with MIME types in ['video/mp4', 'video/quicktime', 'video/webm'] and reject all others.
   * 
   * **Validates: Requirements 4.2**
   */
  describe('Property 3: Video file validation', () => {
    it('should accept all supported video formats', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...SUPPORTED_VIDEO_FORMATS),
          fc.string({ minLength: 1, maxLength: 50 }),
          (mimeType, fileName) => {
            const file = createMockFile(`${fileName}.video`, mimeType);
            expect(isValidVideoFile(file)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject all non-video MIME types', () => {
      const invalidMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'audio/mp3',
        'audio/wav',
        'application/pdf',
        'text/plain',
        'application/json',
        'video/avi', // not in supported list
        'video/mkv', // not in supported list
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...invalidMimeTypes),
          fc.string({ minLength: 1, maxLength: 50 }),
          (mimeType, fileName) => {
            const file = createMockFile(`${fileName}.file`, mimeType);
            expect(isValidVideoFile(file)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });


    it('should reject null and undefined files', () => {
      expect(isValidVideoFile(null)).toBe(false);
      expect(isValidVideoFile(undefined)).toBe(false);
    });
  });

  /**
   * **Feature: instagram-reels, Property 4: Thumbnail file validation**
   * 
   * *For any* file selected as thumbnail, the system SHALL accept only files
   * with MIME types in ['image/jpeg', 'image/png'] and reject all others.
   * 
   * **Validates: Requirements 4.5**
   */
  describe('Property 4: Thumbnail file validation', () => {
    it('should accept all supported image formats', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...SUPPORTED_IMAGE_FORMATS),
          fc.string({ minLength: 1, maxLength: 50 }),
          (mimeType, fileName) => {
            const file = createMockFile(`${fileName}.image`, mimeType);
            expect(isValidThumbnailFile(file)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject all non-image MIME types', () => {
      const invalidMimeTypes = [
        'video/mp4',
        'video/quicktime',
        'video/webm',
        'image/gif', // not in supported list
        'image/webp', // not in supported list
        'image/svg+xml', // not in supported list
        'audio/mp3',
        'application/pdf',
        'text/plain',
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...invalidMimeTypes),
          fc.string({ minLength: 1, maxLength: 50 }),
          (mimeType, fileName) => {
            const file = createMockFile(`${fileName}.file`, mimeType);
            expect(isValidThumbnailFile(file)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject null and undefined files', () => {
      expect(isValidThumbnailFile(null)).toBe(false);
      expect(isValidThumbnailFile(undefined)).toBe(false);
    });
  });

  /**
   * **Feature: instagram-reels, Property 2: Navigation index bounds**
   * 
   * *For any* reels feed with N reels, navigating forward from index i (where i < N-1)
   * SHALL result in index i+1, and navigating backward from index i (where i > 0)
   * SHALL result in index i-1.
   * 
   * **Validates: Requirements 1.3, 1.4**
   */
  describe('Property 2: Navigation index bounds', () => {
    it('should increment index when not at end', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }), // totalReels
          fc.integer({ min: 0, max: 999 }),  // currentIndex
          (totalReels, currentIndex) => {
            // Ensure currentIndex is valid for totalReels
            const validIndex = Math.min(currentIndex, totalReels - 1);
            const nextIndex = getNextIndex(validIndex, totalReels);
            
            if (validIndex < totalReels - 1) {
              // Should increment
              expect(nextIndex).toBe(validIndex + 1);
            } else {
              // Should stay at end
              expect(nextIndex).toBe(validIndex);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should decrement index when not at beginning', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }), // currentIndex
          (currentIndex) => {
            const prevIndex = getPreviousIndex(currentIndex);
            
            if (currentIndex > 0) {
              // Should decrement
              expect(prevIndex).toBe(currentIndex - 1);
            } else {
              // Should stay at beginning
              expect(prevIndex).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case of empty feed', () => {
      expect(getNextIndex(0, 0)).toBe(0);
      expect(getPreviousIndex(0)).toBe(0);
    });

    it('should handle single reel feed', () => {
      expect(getNextIndex(0, 1)).toBe(0);
      expect(getPreviousIndex(0)).toBe(0);
    });
  });
});
