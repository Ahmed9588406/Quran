/**
 * useReelInteractions Hook
 * 
 * Manages like and save state for a reel, including optimistic updates
 * and API synchronization.
 * 
 * Requirements: 5.1, 5.2, 6.1, 6.2
 */

import { useState, useCallback } from 'react';
import { ReelInteractionState } from './types';
import { reelsAPI } from './api';

interface UseReelInteractionsOptions {
  initialIsLiked?: boolean;
  initialIsSaved?: boolean;
  initialLikeCount?: number;
}

interface UseReelInteractionsReturn {
  isLiked: boolean;
  isSaved: boolean;
  likeCount: number;
  isLikeLoading: boolean;
  isSaveLoading: boolean;
  toggleLike: () => Promise<void>;
  toggleSave: () => Promise<void>;
}

/**
 * Toggles a boolean value and adjusts count accordingly
 * This is a pure function for testing purposes
 */
export function toggleLikeState(
  currentIsLiked: boolean,
  currentLikeCount: number
): { isLiked: boolean; likeCount: number } {
  const newIsLiked = !currentIsLiked;
  const newLikeCount = newIsLiked
    ? currentLikeCount + 1
    : Math.max(0, currentLikeCount - 1);
  
  return { isLiked: newIsLiked, likeCount: newLikeCount };
}

/**
 * Toggles a save state
 * This is a pure function for testing purposes
 */
export function toggleSaveState(currentIsSaved: boolean): boolean {
  return !currentIsSaved;
}

/**
 * Custom hook for managing reel interactions (like/save)
 * 
 * @param reelId - The ID of the reel
 * @param options - Initial state options
 * @returns Interaction state and control functions
 */
export function useReelInteractions(
  reelId: string,
  options: UseReelInteractionsOptions = {}
): UseReelInteractionsReturn {
  const {
    initialIsLiked = false,
    initialIsSaved = false,
    initialLikeCount = 0,
  } = options;

  const [state, setState] = useState<ReelInteractionState>({
    isLiked: initialIsLiked,
    isSaved: initialIsSaved,
    likeCount: initialLikeCount,
  });

  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  /**
   * Toggles the like state with optimistic update
   * Requirements: 5.1, 5.2 - Toggle like state and update count
   */
  const toggleLike = useCallback(async () => {
    if (isLikeLoading) return;

    // Optimistic update
    const previousState = { ...state };
    const newState = toggleLikeState(state.isLiked, state.likeCount);
    setState(prev => ({ ...prev, ...newState }));
    setIsLikeLoading(true);

    try {
      if (previousState.isLiked) {
        await reelsAPI.unlikeReel(reelId);
      } else {
        await reelsAPI.likeReel(reelId);
      }
    } catch (error) {
      // Revert on error
      setState(prev => ({
        ...prev,
        isLiked: previousState.isLiked,
        likeCount: previousState.likeCount,
      }));
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLikeLoading(false);
    }
  }, [reelId, state, isLikeLoading]);

  /**
   * Toggles the save state with optimistic update
   * Requirements: 6.1, 6.2 - Toggle save state
   */
  const toggleSave = useCallback(async () => {
    if (isSaveLoading) return;

    // Optimistic update
    const previousIsSaved = state.isSaved;
    const newIsSaved = toggleSaveState(state.isSaved);
    setState(prev => ({ ...prev, isSaved: newIsSaved }));
    setIsSaveLoading(true);

    try {
      if (previousIsSaved) {
        await reelsAPI.unsaveReel(reelId);
      } else {
        await reelsAPI.saveReel(reelId);
      }
    } catch (error) {
      // Revert on error
      setState(prev => ({ ...prev, isSaved: previousIsSaved }));
      console.error('Failed to toggle save:', error);
    } finally {
      setIsSaveLoading(false);
    }
  }, [reelId, state.isSaved, isSaveLoading]);

  return {
    isLiked: state.isLiked,
    isSaved: state.isSaved,
    likeCount: state.likeCount,
    isLikeLoading,
    isSaveLoading,
    toggleLike,
    toggleSave,
  };
}

export default useReelInteractions;
