"use client";
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Share2, MoreVertical } from 'lucide-react';
import Image from 'next/image';

interface Story {
  id: string;
  media_url: string;
  caption?: string;
  created_at: string;
  expires_at: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onDelete?: (storyId: string) => Promise<void>;
}

export default function StoryViewer({ stories, initialIndex, onClose, onDelete }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentStory = stories[currentIndex];

  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Use setTimeout to defer the state update to parent
          setTimeout(() => {
            if (currentIndex < stories.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setProgress(0);
            } else {
              onClose();
            }
          }, 0);
          return 0;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, stories.length, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      setTimeout(() => onClose(), 0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !currentStory) return;
    
    try {
      setIsDeleting(true);
      await onDelete(currentStory.id);
      
      setTimeout(() => {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        } else {
          onClose();
        }
        setShowMenu(false);
      }, 0);
    } catch (error) {
      console.error('Failed to delete story:', error);
    } finally {
      setIsDeleting(false);
    }
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

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://apisoapp.twingroups.com${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Progress bars */}
      <div className="absolute top-4 right-4 left-4 flex gap-1 z-10">
        {stories.map((_, idx) => (
          <div
            key={idx}
            className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden"
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
      <div className="relative w-full h-full max-w-2xl max-h-screen flex items-center justify-center">
        {/* Story image */}
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          <img
            src={getFullImageUrl(currentStory.media_url)}
            alt="Story"
            className="w-full h-full object-contain"
          />

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

          {/* Caption at bottom */}
          {currentStory.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-lg font-medium">{currentStory.caption}</p>
              <p className="text-sm text-gray-300 mt-2">{formatDate(currentStory.created_at)}</p>
            </div>
          )}

          {/* Story counter */}
          <div className="absolute top-20 left-4 text-white text-sm font-medium">
            {currentIndex + 1} / {stories.length}
          </div>
        </div>

        {/* Navigation buttons */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 hover:bg-white hover:bg-opacity-20 rounded-full transition z-20"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 hover:bg-white hover:bg-opacity-20 rounded-full transition z-20"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Action buttons */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-4 z-20">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-3 rounded-full transition ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          <button className="p-3 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition">
            <Share2 className="w-6 h-6" />
          </button>

          {onDelete && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-3 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition"
              >
                <MoreVertical className="w-6 h-6" />
              </button>

              {showMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full px-4 py-2 text-red-400 hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Story'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click areas for navigation */}
      <div
        className="absolute left-0 top-0 w-1/3 h-full cursor-pointer z-10"
        onClick={handlePrev}
      />
      <div
        className="absolute right-0 top-0 w-1/3 h-full cursor-pointer z-10"
        onClick={handleNext}
      />
    </div>
  );
}
