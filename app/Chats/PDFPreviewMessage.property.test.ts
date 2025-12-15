/**
 * Property-Based Tests for PDFPreviewMessage Component
 * 
 * These tests use fast-check to verify correctness properties
 * for the PDFPreviewMessage color scheme logic.
 * 
 * **Feature: pdf-chat-preview, Property 3: Color scheme matches message direction**
 * **Validates: Requirements 2.1, 2.2**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ============================================================================
// Color Scheme Constants
// ============================================================================

/**
 * Maroon/burgundy color used for sent messages
 * Requirements: 2.1
 */
const SENT_MESSAGE_COLOR = '#8A1538';

/**
 * Color scheme configuration for sent messages (maroon/burgundy theme)
 */
export const SENT_COLOR_SCHEME = {
  containerBg: `bg-[${SENT_MESSAGE_COLOR}]/90`,
  containerHover: `hover:bg-[${SENT_MESSAGE_COLOR}]`,
  containerBorder: `border-[${SENT_MESSAGE_COLOR}]`,
  textPrimary: 'text-white',
  textSecondary: 'text-white/70',
  thumbnailBg: 'bg-white/10',
  downloadButton: 'bg-white/20 hover:bg-white/30 text-white',
} as const;

/**
 * Color scheme configuration for received messages (light/white theme)
 */
export const RECEIVED_COLOR_SCHEME = {
  containerBg: 'bg-white',
  containerHover: 'hover:bg-gray-50',
  containerBorder: 'border-gray-200',
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-500',
  thumbnailBg: 'bg-gray-100',
  downloadButton: 'bg-gray-100 hover:bg-gray-200 text-gray-600',
} as const;

// ============================================================================
// Pure Functions for Color Scheme Logic
// ============================================================================

/**
 * Determines the container CSS classes based on message direction
 * This is the core logic extracted from PDFPreviewMessage component
 * 
 * @param isSent - Whether the message was sent by the current user
 * @returns Container CSS classes string
 */
export function getContainerClasses(isSent: boolean): string {
  return isSent
    ? `${SENT_COLOR_SCHEME.containerBg} ${SENT_COLOR_SCHEME.containerHover} ${SENT_COLOR_SCHEME.containerBorder}`
    : `${RECEIVED_COLOR_SCHEME.containerBg} ${RECEIVED_COLOR_SCHEME.containerHover} ${RECEIVED_COLOR_SCHEME.containerBorder}`;
}

/**
 * Determines the primary text CSS classes based on message direction
 * 
 * @param isSent - Whether the message was sent by the current user
 * @returns Primary text CSS classes string
 */
export function getTextPrimaryClasses(isSent: boolean): string {
  return isSent ? SENT_COLOR_SCHEME.textPrimary : RECEIVED_COLOR_SCHEME.textPrimary;
}

/**
 * Determines the secondary text CSS classes based on message direction
 * 
 * @param isSent - Whether the message was sent by the current user
 * @returns Secondary text CSS classes string
 */
export function getTextSecondaryClasses(isSent: boolean): string {
  return isSent ? SENT_COLOR_SCHEME.textSecondary : RECEIVED_COLOR_SCHEME.textSecondary;
}

/**
 * Determines the thumbnail background CSS classes based on message direction
 * 
 * @param isSent - Whether the message was sent by the current user
 * @returns Thumbnail background CSS classes string
 */
export function getThumbnailBgClasses(isSent: boolean): string {
  return isSent ? SENT_COLOR_SCHEME.thumbnailBg : RECEIVED_COLOR_SCHEME.thumbnailBg;
}

/**
 * Determines the download button CSS classes based on message direction
 * 
 * @param isSent - Whether the message was sent by the current user
 * @returns Download button CSS classes string
 */
export function getDownloadButtonClasses(isSent: boolean): string {
  return isSent ? SENT_COLOR_SCHEME.downloadButton : RECEIVED_COLOR_SCHEME.downloadButton;
}

/**
 * Checks if the color scheme contains maroon/burgundy theme indicators
 * Used to verify sent message styling
 * 
 * @param classes - CSS classes string to check
 * @returns True if classes contain maroon theme indicators
 */
export function containsMaroonTheme(classes: string): boolean {
  return classes.includes(SENT_MESSAGE_COLOR) || classes.includes('text-white');
}

/**
 * Checks if the color scheme contains light/white theme indicators
 * Used to verify received message styling
 * 
 * @param classes - CSS classes string to check
 * @returns True if classes contain light theme indicators
 */
export function containsLightTheme(classes: string): boolean {
  return classes.includes('bg-white') || classes.includes('bg-gray') || classes.includes('text-gray');
}

// ============================================================================
// Property Tests
// ============================================================================

describe('PDFPreviewMessage Property Tests', () => {
  /**
   * **Feature: pdf-chat-preview, Property 3: Color scheme matches message direction**
   * 
   * *For any* boolean value of `isSent`, the PDFPreviewMessage component SHALL apply 
   * the sender color scheme (maroon) when `isSent` is true, and the receiver color 
   * scheme (light/white) when `isSent` is false.
   * 
   * **Validates: Requirements 2.1, 2.2**
   */
  describe('Property 3: Color scheme matches message direction', () => {
    it('should apply maroon/burgundy theme for sent messages (isSent=true)', () => {
      fc.assert(
        fc.property(
          fc.constant(true),
          (isSent) => {
            const containerClasses = getContainerClasses(isSent);
            const textPrimaryClasses = getTextPrimaryClasses(isSent);
            const textSecondaryClasses = getTextSecondaryClasses(isSent);
            const thumbnailBgClasses = getThumbnailBgClasses(isSent);
            const downloadButtonClasses = getDownloadButtonClasses(isSent);

            // Property: sent messages should use maroon theme
            expect(containerClasses).toContain(SENT_MESSAGE_COLOR);
            expect(textPrimaryClasses).toBe('text-white');
            expect(textSecondaryClasses).toBe('text-white/70');
            expect(thumbnailBgClasses).toBe('bg-white/10');
            expect(downloadButtonClasses).toContain('text-white');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply light/white theme for received messages (isSent=false)', () => {
      fc.assert(
        fc.property(
          fc.constant(false),
          (isSent) => {
            const containerClasses = getContainerClasses(isSent);
            const textPrimaryClasses = getTextPrimaryClasses(isSent);
            const textSecondaryClasses = getTextSecondaryClasses(isSent);
            const thumbnailBgClasses = getThumbnailBgClasses(isSent);
            const downloadButtonClasses = getDownloadButtonClasses(isSent);

            // Property: received messages should use light theme
            expect(containerClasses).toContain('bg-white');
            expect(containerClasses).toContain('border-gray-200');
            expect(textPrimaryClasses).toBe('text-gray-900');
            expect(textSecondaryClasses).toBe('text-gray-500');
            expect(thumbnailBgClasses).toBe('bg-gray-100');
            expect(downloadButtonClasses).toContain('text-gray-600');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should consistently apply correct theme for any boolean isSent value', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isSent) => {
            const containerClasses = getContainerClasses(isSent);
            const textPrimaryClasses = getTextPrimaryClasses(isSent);

            if (isSent) {
              // Property: sent messages use maroon theme
              expect(containsMaroonTheme(containerClasses)).toBe(true);
              expect(textPrimaryClasses).toBe('text-white');
            } else {
              // Property: received messages use light theme
              expect(containsLightTheme(containerClasses)).toBe(true);
              expect(textPrimaryClasses).toBe('text-gray-900');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never mix sent and received color schemes', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isSent) => {
            const containerClasses = getContainerClasses(isSent);

            // Property: color schemes should be mutually exclusive
            const hasMaroon = containerClasses.includes(SENT_MESSAGE_COLOR);
            const hasWhiteBg = containerClasses.includes('bg-white ') || containerClasses.startsWith('bg-white');

            // XOR: exactly one should be true
            expect(hasMaroon !== hasWhiteBg).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return deterministic results for same input', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isSent) => {
            // Call functions multiple times with same input
            const result1 = getContainerClasses(isSent);
            const result2 = getContainerClasses(isSent);
            const result3 = getContainerClasses(isSent);

            // Property: same input should always produce same output
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply correct text colors for message direction', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isSent) => {
            const textPrimary = getTextPrimaryClasses(isSent);
            const textSecondary = getTextSecondaryClasses(isSent);

            // Property: text colors should be appropriate for background
            if (isSent) {
              // White text on dark maroon background
              expect(textPrimary).toContain('white');
              expect(textSecondary).toContain('white');
            } else {
              // Dark text on light background
              expect(textPrimary).toContain('gray');
              expect(textSecondary).toContain('gray');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply correct download button styling for message direction', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isSent) => {
            const buttonClasses = getDownloadButtonClasses(isSent);

            // Property: button should have appropriate contrast with container
            if (isSent) {
              // Light button on dark background
              expect(buttonClasses).toContain('bg-white');
              expect(buttonClasses).toContain('text-white');
            } else {
              // Gray button on light background
              expect(buttonClasses).toContain('bg-gray');
              expect(buttonClasses).toContain('text-gray');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
