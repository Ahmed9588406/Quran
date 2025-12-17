/**
 * Comment Utility Functions
 * 
 * Provides helper functions for posting comments on reels.
 */

import { reelsAPI } from './api';

/**
 * Posts a comment to a reel
 * 
 * @param reelId - The ID of the reel to comment on
 * @param content - The comment content
 * @returns Promise with the created comment response
 * 
 * @example
 * ```typescript
 * const response = await postReelComment('reel-123', 'Great reel!');
 * ```
 */
export async function postReelComment(reelId: string, content: string) {
  if (!content.trim()) {
    throw new Error('Comment content cannot be empty');
  }

  try {
    const response = await reelsAPI.createComment(reelId, {
      content: content.trim(),
    });

    if (!response.success) {
      throw new Error('Failed to post comment');
    }

    return response;
  } catch (error) {
    console.error('[commentUtils] Failed to post comment:', error);
    throw error;
  }
}

/**
 * Posts a comment and returns the comment object
 * 
 * @param reelId - The ID of the reel to comment on
 * @param content - The comment content
 * @returns Promise with the comment object
 */
export async function postReelCommentAndGetData(reelId: string, content: string) {
  const response = await postReelComment(reelId, content);
  return response.comment || response;
}
