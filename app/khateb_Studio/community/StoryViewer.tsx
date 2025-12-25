"use client";
import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Story {
  id: string;
  user_id?: string;
  media_url: string;
  media_type?: string;
  caption?: string;
  created_at: string;
  expires_at: string;
  username?: string;
  user_avatar?: string;
  viewed?: boolean;
}

interface Viewer {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  viewed_at: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onDelete?: (storyId: string) => Promise<void>;
  canDelete?: boolean;
}

export default function StoryViewer({ stories, initialIndex, onClose, onDelete, canDelete = false }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [viewersLoading, setViewersLoading] = useState(false);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  const currentStory = stories[currentIndex];

  // Mark story as viewed
  const markAsViewed = useCallback(async (storyId: string) => {
    if (viewedStories.has(storyId)) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`/api/stories/${storyId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setViewedStories(prev => new Set([...prev, storyId]));
        console.log('Story marked as viewed:', storyId);
      }
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  }, [viewedStories]);

  // Mark current story as viewed when it changes
  useEffect(() => {
    if (currentStory && !canDelete) {
      markAsViewed(currentStory.id);
    }
  }, [currentStory, canDelete, markAsViewed]);

  // Fetch viewers for current story (only for own stories)
  const fetchViewers = useCallback(async () => {
    if (!currentStory || !canDelete) return;

    try {
      setViewersLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`/api/stories/${currentStory.id}/viewers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const viewersList = Array.isArray(data) ? data : data.viewers || data.data || [];
        setViewers(viewersList);
      }
    } catch (error) {
      console.error('Error fetching viewers:', error);
    } finally {
      setViewersLoading(false);
    }
  }, [currentStory, canDelete]);

  // Progress bar animation
  useEffect(() => {
    if (isPaused || showViewers) return;

    const duration = currentStory?.media_type === 'video' ? 15000 : 5000;
    const increment = 100 / (duration / 50);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + increment;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, stories.length, onClose, isPaused, showViewers, currentStory?.media_type]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    setShowViewers(false);
    setViewers([]);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !currentStory) return;
    
    try {
      setIsDeleting(true);
      await onDelete(currentStory.id);
      
      if (stories.length <= 1) {
        onClose();
      } else if (currentIndex < stories.length - 1) {
        // Stay at same index
      } else if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (error) {
      console.error('Failed to delete story:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleViewers = () => {
    if (!showViewers) {
      fetchViewers();
    }
    setShowViewers(!showViewers);
    setIsPaused(!showViewers);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getFullUrl = (url: string) => {
    if (!url) return '/icons/settings/profile.png';
    if (url.startsWith('http')) return url;
    return `http://apisoapp.twingroups.com${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const isVideo = currentStory?.media_type === 'video' || currentStory?.media_url?.endsWith('.mp4');

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-30 p-2 hover:bg-white/20 rounded-full transition"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Delete button - only show if canDelete */}
      {canDelete && onDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-4 right-4 z-30 p-2 hover:bg-white/20 rounded-full transition disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Trash2 className="w-6 h-6 text-white" />
          )}
        </button>
      )}

      {/* Progress bars */}
      <div className="absolute top-4 right-16 left-16 flex gap-1 z-20">
        {stories.map((_, idx) => (
          <div
            key={idx}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Main story container */}
      <div className="relative w-full h-full max-w-lg flex items-center justify-center">
        {/* Story media */}
        <div 
          className="relative w-full h-full bg-black overflow-hidden"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => !showViewers && setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => !showViewers && setIsPaused(false)}
        >
          {isVideo ? (
            <video
              key={currentStory?.id}
              src={getFullUrl(currentStory?.media_url || '')}
              className="w-full h-full object-contain"
              autoPlay
              muted
              playsInline
              loop={false}
            />
          ) : (
            <img
              src={getFullUrl(currentStory?.media_url || '')}
              alt="Story"
              className="w-full h-full object-contain"
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />

          {/* User info at top */}
          <div className="absolute top-16 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <img
                src={getFullUrl(currentStory?.user_avatar || '')}
                alt={currentStory?.username || 'User'}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
              <div>
                <p className="text-white font-semibold text-sm">{currentStory?.username || 'User'}</p>
                <p className="text-white/70 text-xs">{formatDate(currentStory?.created_at || '')}</p>
              </div>
            </div>

            {/* Story counter */}
            <div className="text-white/80 text-sm font-medium bg-black/30 px-2 py-1 rounded-full">
              {currentIndex + 1} / {stories.length}
            </div>
          </div>

          {/* Caption at bottom */}
          {currentStory?.caption && (
            <div className="absolute bottom-20 left-4 right-4 z-20">
              <p className="text-white text-base font-medium drop-shadow-lg">{currentStory.caption}</p>
            </div>
          )}

          {/* Viewers button - only for own stories */}
          {canDelete && (
            <button
              onClick={toggleViewers}
              className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white px-4 py-2 rounded-full transition"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">
                {viewers.length > 0 ? `${viewers.length} viewers` : 'Viewers'}
              </span>
            </button>
          )}
        </div>

        {/* Navigation buttons */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition z-20"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition z-20"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}
      </div>

      {/* Click areas for navigation */}
      <div
        className="absolute left-0 top-0 w-1/4 h-full cursor-pointer z-10"
        onClick={handlePrev}
      />
      <div
        className="absolute right-0 top-0 w-1/4 h-full cursor-pointer z-10"
        onClick={handleNext}
      />

      {/* Viewers Modal */}
      {showViewers && canDelete && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-40 max-h-[60vh] overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Viewers ({viewers.length})
              </h3>
              <button
                onClick={() => {
                  setShowViewers(false);
                  setIsPaused(false);
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(60vh-60px)]">
            {viewersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#7b2030] animate-spin" />
              </div>
            ) : viewers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Eye className="w-12 h-12 text-gray-300 mb-2" />
                <p>No viewers yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {viewers.map((viewer) => (
                  <Link
                    key={viewer.id || viewer.user_id}
                    href={`/other_user/${viewer.user_id}`}
                    onClick={() => onClose()}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition"
                  >
                    <img
                      src={getFullUrl(viewer.avatar_url || '')}
                      alt={viewer.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {viewer.display_name || viewer.username}
                      </p>
                      <p className="text-xs text-gray-500">@{viewer.username}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDate(viewer.viewed_at)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
