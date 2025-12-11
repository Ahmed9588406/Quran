/**
 * Property-Based Tests for Reels API Service
 * 
 * These tests use fast-check to verify correctness properties
 * for API request structure and authorization.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  createHeaders,
  buildReelFormData,
  getAuthToken,
} from './api';
import { CreateReelData, ReelVisibility } from './types';
import { createMockFile } from './utils';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

describe('Reels API Property Tests', () => {
  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(global, 'window', {
      value: { localStorage: localStorageMock },
      writable: true,
    });
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  /**
   * **Feature: instagram-reels, Property 11: Authorization header inclusion**
   * 
   * *For any* API request to the reels endpoints, the request SHALL include
   * an Authorization header with the user's token.
   * 
   * **Validates: Requirements 11.2**
   */
  describe('Property 11: Authorization header inclusion', () => {
    it('should include Authorization header when token exists', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 200 }), // token
          (token) => {
            localStorageMock.setItem('access_token', token);
            
            const headers = createHeaders('application/json');
            
            expect(headers['Authorization']).toBe(`Bearer ${token}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not include Authorization header when no token exists', () => {
      localStorageMock.clear();
      
      const headers = createHeaders('application/json');
      
      expect(headers['Authorization']).toBeUndefined();
    });

    it('should include Content-Type when provided', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('application/json', 'multipart/form-data', 'text/plain'),
          (contentType) => {
            const headers = createHeaders(contentType);
            
            expect(headers['Content-Type']).toBe(contentType);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not include Content-Type when not provided', () => {
      const headers = createHeaders();
      
      expect(headers['Content-Type']).toBeUndefined();
    });

    it('should include both Authorization and Content-Type when both are present', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 200 }), // token
          fc.constantFrom('application/json', 'multipart/form-data'),
          (token, contentType) => {
            localStorageMock.setItem('access_token', token);
            
            const headers = createHeaders(contentType);
            
            expect(headers['Authorization']).toBe(`Bearer ${token}`);
            expect(headers['Content-Type']).toBe(contentType);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * **Feature: instagram-reels, Property 12: Form data structure for reel creation**
   * 
   * *For any* reel creation submission, the form data SHALL contain 'video', 'content',
   * and 'visibility' fields, with optional 'thumbnail' field.
   * 
   * **Validates: Requirements 4.6**
   */
  describe('Property 12: Form data structure for reel creation', () => {
    // Arbitrary for valid visibility values
    const visibilityArb = fc.constantFrom<ReelVisibility>('public', 'private', 'followers');
    
    // Arbitrary for valid video MIME types
    const videoMimeArb = fc.constantFrom('video/mp4', 'video/quicktime', 'video/webm');
    
    // Arbitrary for valid image MIME types
    const imageMimeArb = fc.constantFrom('image/jpeg', 'image/png');

    it('should always include video, content, and visibility fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }), // fileName
          videoMimeArb,
          fc.string({ minLength: 0, maxLength: 500 }), // content/caption
          visibilityArb,
          (fileName, mimeType, content, visibility) => {
            const videoFile = createMockFile(`${fileName}.mp4`, mimeType);
            
            const data: CreateReelData = {
              video: videoFile,
              content,
              visibility,
            };
            
            const formData = buildReelFormData(data);
            
            // Check required fields exist
            expect(formData.get('video')).not.toBeNull();
            expect(formData.get('content')).toBe(content);
            expect(formData.get('visibility')).toBe(visibility);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include thumbnail when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }), // videoFileName
          videoMimeArb,
          fc.string({ minLength: 1, maxLength: 100 }), // thumbnailFileName
          imageMimeArb,
          fc.string({ minLength: 0, maxLength: 500 }), // content
          visibilityArb,
          (videoFileName, videoMime, thumbFileName, thumbMime, content, visibility) => {
            const videoFile = createMockFile(`${videoFileName}.mp4`, videoMime);
            const thumbnailFile = createMockFile(`${thumbFileName}.jpg`, thumbMime);
            
            const data: CreateReelData = {
              video: videoFile,
              content,
              visibility,
              thumbnail: thumbnailFile,
            };
            
            const formData = buildReelFormData(data);
            
            // Check all fields including optional thumbnail
            expect(formData.get('video')).not.toBeNull();
            expect(formData.get('content')).toBe(content);
            expect(formData.get('visibility')).toBe(visibility);
            expect(formData.get('thumbnail')).not.toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not include thumbnail when not provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }), // fileName
          videoMimeArb,
          fc.string({ minLength: 0, maxLength: 500 }), // content
          visibilityArb,
          (fileName, mimeType, content, visibility) => {
            const videoFile = createMockFile(`${fileName}.mp4`, mimeType);
            
            const data: CreateReelData = {
              video: videoFile,
              content,
              visibility,
              // No thumbnail
            };
            
            const formData = buildReelFormData(data);
            
            // Thumbnail should be null when not provided
            expect(formData.get('thumbnail')).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve video file in form data', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }), // fileName
          videoMimeArb,
          fc.string({ minLength: 0, maxLength: 500 }), // content
          visibilityArb,
          (fileName, mimeType, content, visibility) => {
            const videoFile = createMockFile(`${fileName}.mp4`, mimeType);
            
            const data: CreateReelData = {
              video: videoFile,
              content,
              visibility,
            };
            
            const formData = buildReelFormData(data);
            const retrievedVideo = formData.get('video') as File;
            
            // Video file should be preserved
            expect(retrievedVideo).toBeInstanceOf(File);
            expect(retrievedVideo.type).toBe(mimeType);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle all visibility options correctly', () => {
      const visibilities: ReelVisibility[] = ['public', 'private', 'followers'];
      
      visibilities.forEach((visibility) => {
        const videoFile = createMockFile('test.mp4', 'video/mp4');
        
        const data: CreateReelData = {
          video: videoFile,
          content: 'Test caption',
          visibility,
        };
        
        const formData = buildReelFormData(data);
        
        expect(formData.get('visibility')).toBe(visibility);
      });
    });
  });
});
