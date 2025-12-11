/**
 * useVideoPlayer Hook
 * 
 * Manages video playback state including play/pause and mute controls.
 * 
 * Requirements: 8.2, 8.3
 */

import { useState, useCallback, useEffect, RefObject } from 'react';
import { VideoPlayerState } from './types';

interface UseVideoPlayerOptions {
  autoPlay?: boolean;
  initialMuted?: boolean;
}

interface UseVideoPlayerReturn {
  isPlaying: boolean;
  isMuted: boolean;
  isBuffering: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  play: () => void;
  pause: () => void;
  mute: () => void;
  unmute: () => void;
}

/**
 * Toggles a play state
 * This is a pure function for testing purposes
 */
export function togglePlayState(currentIsPlaying: boolean): boolean {
  return !currentIsPlaying;
}

/**
 * Toggles a mute state
 * This is a pure function for testing purposes
 */
export function toggleMuteState(currentIsMuted: boolean): boolean {
  return !currentIsMuted;
}

/**
 * Custom hook for managing video playback controls
 * 
 * @param videoRef - Reference to the HTML video element
 * @param options - Configuration options
 * @returns Playback state and control functions
 */
export function useVideoPlayer(
  videoRef: RefObject<HTMLVideoElement | null>,
  options: UseVideoPlayerOptions = {}
): UseVideoPlayerReturn {
  const { autoPlay = true, initialMuted = false } = options;

  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: autoPlay,
    isMuted: initialMuted,
    isBuffering: false,
  });

  /**
   * Plays the video
   */
  const play = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(err => {
        console.error('Failed to play video:', err);
        setState(prev => ({ ...prev, isPlaying: false }));
      });
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [videoRef]);

  /**
   * Pauses the video
   */
  const pause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [videoRef]);

  /**
   * Toggles play/pause state
   * Requirements: 8.2 - Tap to toggle play/pause
   */
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        play();
      } else {
        pause();
      }
    } else {
      // If no video ref, just toggle state
      setState(prev => ({ ...prev, isPlaying: togglePlayState(prev.isPlaying) }));
    }
  }, [videoRef, play, pause]);

  /**
   * Mutes the video
   */
  const mute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
    }
    setState(prev => ({ ...prev, isMuted: true }));
  }, [videoRef]);

  /**
   * Unmutes the video
   */
  const unmute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
    }
    setState(prev => ({ ...prev, isMuted: false }));
  }, [videoRef]);

  /**
   * Toggles mute state
   * Requirements: 8.3 - Tap to toggle mute
   */
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      if (video.muted) {
        unmute();
      } else {
        mute();
      }
    } else {
      // If no video ref, just toggle state
      setState(prev => ({ ...prev, isMuted: toggleMuteState(prev.isMuted) }));
    }
  }, [videoRef, mute, unmute]);

  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleWaiting = () => setState(prev => ({ ...prev, isBuffering: true }));
    const handlePlaying = () => setState(prev => ({ ...prev, isBuffering: false }));
    const handleEnded = () => {
      // Loop the video (Requirements: 8.4)
      video.currentTime = 0;
      video.play().catch(console.error);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', handleEnded);

    // Set initial muted state
    video.muted = initialMuted;

    // Auto-play if enabled
    if (autoPlay) {
      video.play().catch(err => {
        console.error('Auto-play failed:', err);
        setState(prev => ({ ...prev, isPlaying: false }));
      });
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoRef, autoPlay, initialMuted]);

  return {
    isPlaying: state.isPlaying,
    isMuted: state.isMuted,
    isBuffering: state.isBuffering,
    togglePlay,
    toggleMute,
    play,
    pause,
    mute,
    unmute,
  };
}

export default useVideoPlayer;
