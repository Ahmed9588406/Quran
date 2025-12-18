"use client";
import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import Image from 'next/image';

interface Story {
  id: string;
  username: string;
  avatar: string;
  hasUnseenStory: boolean;
  isYourStory?: boolean;
}

interface StoriesBarProps {
  onStoryClick?: (storyId: string, username: string) => void;
  onCreateStory?: () => void;
}

export default function StoriesBar({ onStoryClick, onCreateStory }: StoriesBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch (e) {
      console.error("Error loading user:", e);
    }
  }, []);

  // Mock stories - in production, fetch from API
  const stories: Story[] = [
    { 
      id: '0', 
      username: 'Your story', 
      avatar: currentUser?.avatar_url || currentUser?.profile_picture_url || 'https://i.pravatar.cc/150?img=1', 
      hasUnseenStory: false, 
      isYourStory: true 
    },
    { id: '1', username: 'Sheikh Ahmad', avatar: 'https://i.pravatar.cc/150?img=47', hasUnseenStory: true },
    { id: '2', username: 'Imam Hassan', avatar: 'https://i.pravatar.cc/150?img=27', hasUnseenStory: true },
    { id: '3', username: 'Dr. Fatima', avatar: 'https://i.pravatar.cc/150?img=45', hasUnseenStory: true },
    { id: '4', username: 'Sheikh Omar', avatar: 'https://i.pravatar.cc/150?img=33', hasUnseenStory: true },
    { id: '5', username: 'Ustadh Ali', avatar: 'https://i.pravatar.cc/150?img=15', hasUnseenStory: true },
    { id: '6', username: 'Dr. Aisha', avatar: 'https://i.pravatar.cc/150?img=44', hasUnseenStory: true },
    { id: '7', username: 'Sheikh Yusuf', avatar: 'https://i.pravatar.cc/150?img=60', hasUnseenStory: true },
  ];

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const handleStoryClick = (story: Story) => {
    if (isDragging) return;
    if (story.isYourStory && onCreateStory) {
      onCreateStory();
    } else if (onStoryClick) {
      onStoryClick(story.id, story.username);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeftPos(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeftPos - walk;
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  return (
    <div className="w-full">
      <div className="relative bg-[#fff6f3] border border-[#f0e6e5] rounded-lg p-0 shadow-sm">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`flex gap-0 overflow-x-scroll scroll-smooth pb-1 px-1 scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', userSelect: 'none' }}
        >
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => handleStoryClick(story)}
              className="flex flex-col items-center flex-shrink-0 group p-1"
              aria-label={story.isYourStory ? 'Create story' : `${story.username} story`}
            >
              <div className="relative">
                {story.hasUnseenStory && !story.isYourStory && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-fuchsia-500 p-[2.5px]">
                    <div className="w-full h-full bg-white rounded-full" />
                  </div>
                )}
                
                <div className={`relative ${story.hasUnseenStory && !story.isYourStory ? 'p-[2.5px]' : ''} ${story.hasUnseenStory && !story.isYourStory ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-fuchsia-500' : 'bg-gray-200'} rounded-full`}>
                  <div className="bg-white p-[3px] rounded-full">
                    <Image
                      src={story.avatar}
                      alt={story.username}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-white group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                </div>

                {story.isYourStory && (
                  <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg group-hover:bg-blue-600 transition-colors">
                    <Plus className="w-4 h-4 text-white stroke-[3]" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#fff6f3] rounded-full shadow-lg p-2 hover:bg-[#fff6f3] transition-all hover:scale-110 border border-[#f0e6e5] z-10"
            aria-label="Scroll left"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 rotate-180" />
          </button>
        )}

        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#fff6f3] rounded-full shadow-lg p-2 hover:bg-[#fff6f3] transition-all hover:scale-110 border border-[#f0e6e5] z-10"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
}
