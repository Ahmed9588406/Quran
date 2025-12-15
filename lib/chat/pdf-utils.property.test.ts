/**
 * Property-Based Tests for PDF Utility Functions
 * 
 * Uses fast-check to verify correctness properties hold across all valid inputs.
 * **Feature: pdf-chat-preview**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { truncateFilename } from './pdf-utils';

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

/**
 * Generates a valid file extension (e.g., ".pdf", ".txt", ".docx")
 */
const extensionArb = fc.string({ minLength: 1, maxLength: 5, unit: 'grapheme' })
  .filter(s => /^[a-z0-9]+$/i.test(s))
  .map(ext => `.${ext.toLowerCase()}`);

/**
 * Generates a valid base filename (without extension)
 * Excludes dots to ensure clean separation between name and extension
 */
const baseNameArb = fc.string({ minLength: 1, maxLength: 100, unit: 'grapheme' })
  .filter(s => !s.includes('.') && s.trim().length > 0);

/**
 * Generates a filename with extension
 */
const filenameWithExtensionArb = fc.tuple(baseNameArb, extensionArb)
  .map(([base, ext]) => base + ext);

/**
 * Generates a long filename that will definitely need truncation
 */
const longFilenameArb = fc.tuple(
  fc.string({ minLength: 30, maxLength: 100, unit: 'grapheme' })
    .filter(s => !s.includes('.') && s.trim().length >= 30),
  extensionArb
).map(([base, ext]) => base + ext);

// ============================================================================
// Property Tests
// ============================================================================

describe('PDF Utility Property Tests', () => {
  /**
   * **Feature: pdf-chat-preview, Property 2: Filename truncation preserves extension**
   * 
   * *For any* filename string with an extension, the truncateFilename function SHALL 
   * preserve the file extension in the output, regardless of truncation.
   * 
   * **Validates: Requirements 1.3**
   */
  describe('Property 2: Filename truncation preserves extension', () => {
    it('should preserve the file extension in the output for any filename with extension', () => {
      fc.assert(
        fc.property(
          filenameWithExtensionArb,
          fc.integer({ min: 10, max: 50 }),
          (filename, maxLength) => {
            const result = truncateFilename(filename, maxLength);
            
            // Extract the original extension
            const lastDotIndex = filename.lastIndexOf('.');
            const originalExtension = filename.slice(lastDotIndex);
            
            // Property: the result should end with the original extension
            expect(result.endsWith(originalExtension)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve extension even for very long filenames', () => {
      fc.assert(
        fc.property(
          longFilenameArb,
          fc.integer({ min: 10, max: 30 }),
          (filename, maxLength) => {
            const result = truncateFilename(filename, maxLength);
            
            // Extract the original extension
            const lastDotIndex = filename.lastIndexOf('.');
            const originalExtension = filename.slice(lastDotIndex);
            
            // Property: the result should end with the original extension
            expect(result.endsWith(originalExtension)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve extension for common file types', () => {
      const commonExtensions = ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.pptx', '.jpg', '.png'];
      
      fc.assert(
        fc.property(
          baseNameArb,
          fc.constantFrom(...commonExtensions),
          fc.integer({ min: 10, max: 50 }),
          (baseName, extension, maxLength) => {
            const filename = baseName + extension;
            const result = truncateFilename(filename, maxLength);
            
            // Property: the result should end with the original extension
            expect(result.endsWith(extension)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: pdf-chat-preview, Property 4: Truncated filename length constraint**
   * 
   * *For any* filename longer than the maximum length, the truncateFilename function SHALL 
   * return a string that does not exceed the maximum length plus the extension length.
   * 
   * **Validates: Requirements 1.3**
   */
  describe('Property 4: Truncated filename length constraint', () => {
    it('should not exceed maxLength for filenames that need truncation', () => {
      fc.assert(
        fc.property(
          longFilenameArb,
          fc.integer({ min: 15, max: 40 }),
          (filename, maxLength) => {
            const result = truncateFilename(filename, maxLength);
            
            // Extract the original extension
            const lastDotIndex = filename.lastIndexOf('.');
            const originalExtension = filename.slice(lastDotIndex);
            
            // Property: result length should not exceed maxLength + extension length
            // (since extension is preserved outside the maxLength budget)
            const maxAllowedLength = maxLength + originalExtension.length;
            
            // If filename was longer than maxLength, result should be constrained
            if (filename.length > maxLength) {
              expect(result.length).toBeLessThanOrEqual(maxAllowedLength);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return original filename when it fits within maxLength', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 10, unit: 'grapheme' })
              .filter(s => !s.includes('.') && s.trim().length > 0),
            extensionArb
          ).map(([base, ext]) => base + ext),
          fc.integer({ min: 30, max: 50 }),
          (shortFilename, maxLength) => {
            // Only test when filename is shorter than maxLength
            fc.pre(shortFilename.length <= maxLength);
            
            const result = truncateFilename(shortFilename, maxLength);
            
            // Property: short filenames should be returned unchanged
            expect(result).toBe(shortFilename);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include ellipsis when truncation occurs', () => {
      fc.assert(
        fc.property(
          longFilenameArb,
          fc.integer({ min: 15, max: 25 }),
          (filename, maxLength) => {
            // Only test when filename is longer than maxLength
            fc.pre(filename.length > maxLength);
            
            const result = truncateFilename(filename, maxLength);
            
            // Property: truncated filenames should contain ellipsis
            expect(result.includes('...')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce non-empty result for any valid filename', () => {
      fc.assert(
        fc.property(
          filenameWithExtensionArb,
          fc.integer({ min: 10, max: 50 }),
          (filename, maxLength) => {
            const result = truncateFilename(filename, maxLength);
            
            // Property: result should never be empty for valid input
            expect(result.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
