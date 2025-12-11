/**
 * useReelsFeed Hook
 * 
 * Manages reels feed state including navigation, pagination, and loading states.
 * 
 * Requirements: 1.1, 1.3, 1.4, 1.5
 */

import { useState, useCallback, useEffect } from 'react';
import { Reel, ReelsFeedState } from './types';
import { reelsAPI } from './api';
import { getNextIndex, getPreviousIndex, shouldLoadMore } from './utils';

const DEFAULT_LIMIT = 10;

interface UseReelsFeedOptions {
  initialPage?: number;
  limit?: number;
  autoLoad?: boolean;
}

interface UseReelsFeedReturn {
  reels: Reel[];
  currentIndex: number;
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setCurrentIndex: (index: number) => void;
}

/**
 * Custom hook for managing reels feed state and navigation
 * 
 * @param options - Configuration options for the feed
 * @returns Feed state and control functions
 */
export function useReelsFeed(options: UseReelsFeedOptions = {}): UseReelsFeedReturn {
  const { initialPage = 1, limit = DEFAULT_LIMIT, autoLoad = true } = options;

  const [state, setState] = useState<ReelsFeedState>({
    reels: [],
    currentIndex: 0,
    page: initialPage,
    hasMore: true,
    isLoading: false,
    error: null,
  });

  /**
   * Fetches reels from the API
   */
  const fetchReels = useCallback(async (page: number, append: boolean = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await reelsAPI.getFeed(page, limit);
      
      setState(prev => ({
        ...prev,
        reels: append ? [...prev.reels, ...response.reels] : response.reels,
        page: response.page,
        hasMore: response.has_more,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Failed to fetch reels'),
      }));
    }
  }, [limit]);

  /**
   * Loads more reels (next page)
   * Requirements: 1.5 - Auto-load when reaching end
   */
  const loadMore = useCallback(async () => {
    if (state.isLoading || !state.hasMore) return;
    await fetchReels(state.page + 1, true);
  }, [state.isLoading, state.hasMore, state.page, fetchReels]);

  /**
   * Refreshes the feed from the beginning
   */
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, currentIndex: 0 }));
    await fetchReels(1, false);
  }, [fetchReels]);

  /**
   * Navigates to the next reel
   * Requirements: 1.3 - Swipe up navigation
   */
  const goToNext = useCallback(() => {
    setState(prev => {
      const reelsLength = prev.reels?.length ?? 0;
      if (reelsLength === 0) return prev;
      
      const nextIndex = getNextIndex(prev.currentIndex ?? 0, reelsLength);
      
      // Check if we should load more reels
      if (shouldLoadMore(nextIndex, reelsLength) && prev.hasMore && !prev.isLoading) {
        // Trigger load more asynchronously
        loadMore();
      }
      
      return { ...prev, currentIndex: nextIndex };
    });
  }, [loadMore]);

  /**
   * Navigates to the previous reel
   * Requirements: 1.4 - Swipe down navigation
   */
  const goToPrevious = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: getPreviousIndex(prev.currentIndex ?? 0),
    }));
  }, []);

  /**
   * Sets the current index directly
   */
  const setCurrentIndex = useCallback((index: number) => {
    setState(prev => {
      const reelsLength = prev.reels?.length ?? 0;
      if (reelsLength === 0) return prev;
      const validIndex = Math.max(0, Math.min(index, reelsLength - 1));
      return { ...prev, currentIndex: validIndex };
    });
  }, []);

  // Initial load
  useEffect(() => {
    if (autoLoad && (!state.reels || state.reels.length === 0)) {
      fetchReels(initialPage, false);
    }
  }, [autoLoad, initialPage, fetchReels, state.reels?.length]);

  return {
    reels: state.reels ?? [],
    currentIndex: state.currentIndex ?? 0,
    isLoading: state.isLoading ?? false,
    error: state.error ?? null,
    hasMore: state.hasMore ?? true,
    goToNext,
    goToPrevious,
    loadMore,
    refresh,
    setCurrentIndex,
  };
}

export default useReelsFeed;
