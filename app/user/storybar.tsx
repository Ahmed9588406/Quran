"use client";
import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, Plus, Eye, PlusCircle } from 'lucide-react';
import CreateStoryModal from './CreateStoryModal';
import StoryViewer from './StoryViewer';

interface ApiStory {
  id: string;
  user_id: string;
  username: string;
  user_avatar?: string;
  avatar?: string;
  media_url: string;
  caption?: string;
  created_at: string;
  expires_at: string;
  viewed?: boolean;
}

interface Story {
  id: string;
  username: string;
  avatar: string;
  hasUnseenStory: boolean;
  isYourStory?: boolean;
  mediaUrl?: string;
  caption?: string;
  stories?: ApiStory[];
}

interface StoriesBarProps {
  onStoryClick?: (storyId: string, username: string) => void;
  onCreateStory?: () => void;
}

// Story Action Menu Component
function StoryActionMenu({ 
  isOpen, 
  onClose, 
  onViewStories, 
  onCreateNew,
  hasStories,
  position 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onViewStories: () => void; 
  onCreateNew: () => void;
  hasStories: boolean;
  position: { x: number; y: number };
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <div 
        className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-200"
        style={{ 
          top: position.y + 10,
          left: Math.max(10, position.x - 100),
        }}
      >
        <div className="px-4 py-2 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">Your Story</p>
        </div>
        
        {hasStories && (
          <button
            onClick={() => {
              onViewStories();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">View My Stories</p>
              <p className="text-xs text-gray-500">See your current stories</p>
            </div>
          </button>
        )}
        
        <button
          onClick={() => {
            onCreateNew();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Create New Story</p>
            <p className="text-xs text-gray-500">Share a new moment</p>
          </div>
        </button>
      </div>
    </>
  );
}

export default function StoriesBar({ onStoryClick, onCreateStory }: StoriesBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // My stories state
  const [myStories, setMyStories] = useState<ApiStory[]>([]);
  
  // Story viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStories, setViewerStories] = useState<ApiStory[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const [canDeleteViewer, setCanDeleteViewer] = useState(false);
  
  // Action menu state
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

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

  const fetchMyStories = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id') || currentUser?.id;
      
      if (!accessToken || !userId) return;

      const response = await fetch(`/api/stories/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const storiesArray = Array.isArray(data) ? data : data.stories || [];
        console.log('My stories:', storiesArray.length);
        setMyStories(storiesArray);
      }
    } catch (error) {
      console.error('Error fetching my stories:', error);
    }
  };

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem('access_token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      // Use proxy API to avoid CORS issues
      const response = await fetch('/api/stories/following?limit=20', {
        method: 'GET',
        headers,
      });
      
      console.log('Stories API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch stories:', response.status, errorText);
        throw new Error('Failed to fetch stories');
      }

      const data = await response.json();
      console.log('Stories API response data:', data);

      // The API returns: { success: true, users: [...], total_users: 20 }
      // Each user has: { user_id, username, display_name, avatar_url, stories: [...], has_unviewed }
      
      let usersWithStories: any[] = [];
      
      if (data.users && Array.isArray(data.users)) {
        usersWithStories = data.users;
        console.log('Found', usersWithStories.length, 'users with stories');
      }

      // Transform users to Story format
      const transformedStories: Story[] = usersWithStories.map((user: any) => {
        // Normalize avatar URL
        let avatarUrl = user.avatar_url || '';
        if (avatarUrl && !avatarUrl.startsWith('http')) {
          avatarUrl = `https://apisoapp.twingroups.com${avatarUrl}`;
        }
        if (!avatarUrl) {
          avatarUrl = '/icons/settings/profile.png';
        }

        // Transform user's stories to ApiStory format
        const userStories: ApiStory[] = (user.stories || []).map((story: any) => ({
          id: story.id,
          user_id: user.user_id,
          username: user.username,
          user_avatar: avatarUrl,
          media_url: story.media_url?.startsWith('http') 
            ? story.media_url 
            : `https://apisoapp.twingroups.com${story.media_url}`,
          caption: story.caption,
          created_at: story.created_at,
          expires_at: story.expires_at,
          viewed: story.viewed_by_me || false,
        }));

        return {
          id: user.user_id,
          username: user.username || user.display_name || 'User',
          avatar: avatarUrl,
          hasUnseenStory: user.has_unviewed || userStories.some(s => !s.viewed),
          mediaUrl: userStories[0]?.media_url,
          caption: userStories[0]?.caption,
          stories: userStories,
        };
      });

      // Sort stories: unseen stories first, viewed stories at the end
      const sortedStories = transformedStories.sort((a, b) => {
        // Unseen stories come first
        if (a.hasUnseenStory && !b.hasUnseenStory) return -1;
        if (!a.hasUnseenStory && b.hasUnseenStory) return 1;
        return 0;
      });

      console.log('Transformed stories:', sortedStories.length, 'users with stories');

      // Get current user avatar
      let currentUserAvatar = currentUser?.avatar_url || currentUser?.profile_picture_url || '';
      if (currentUserAvatar && !currentUserAvatar.startsWith('http')) {
        currentUserAvatar = `https://apisoapp.twingroups.com${currentUserAvatar}`;
      }
      if (!currentUserAvatar) {
        currentUserAvatar = '/icons/settings/profile.png';
      }

      // Add "Your story" at the beginning, then all following stories (sorted: unseen first, viewed last)
      const allStories: Story[] = [
        {
          id: '0',
          username: 'Your story',
          avatar: currentUserAvatar,
          hasUnseenStory: false,
          isYourStory: true,
        },
        ...sortedStories,
      ];

      console.log('Total stories to display:', allStories.length);
      setStories(allStories);
      
      // Also fetch my own stories
      await fetchMyStories();
    } catch (error) {
      console.error('Error fetching stories:', error);
      
      // Get current user avatar for fallback
      let currentUserAvatar = currentUser?.avatar_url || currentUser?.profile_picture_url || '';
      if (currentUserAvatar && !currentUserAvatar.startsWith('http')) {
        currentUserAvatar = `https://apisoapp.twingroups.com${currentUserAvatar}`;
      }
      if (!currentUserAvatar) {
        currentUserAvatar = '/icons/settings/profile.png';
      }

      setStories([
        {
          id: '0',
          username: 'Your story',
          avatar: currentUserAvatar,
          hasUnseenStory: false,
          isYourStory: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchStories();
    }
  }, [currentUser]);

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

  const handleYourStoryClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    // If user has stories, show the action menu
    if (myStories.length > 0) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setMenuPosition({ x: rect.left + rect.width / 2, y: rect.bottom });
      setActionMenuOpen(true);
    } else {
      // No stories, directly open create modal
      setIsCreateStoryOpen(true);
      if (onCreateStory) {
        onCreateStory();
      }
    }
  };

  const handleViewMyStories = () => {
    setViewerStories(myStories);
    setViewerInitialIndex(0);
    setCanDeleteViewer(true);
    setViewerOpen(true);
  };

  const handleCreateNewStory = () => {
    setIsCreateStoryOpen(true);
    if (onCreateStory) {
      onCreateStory();
    }
  };

  const handleStoryClick = (story: Story) => {
    if (isDragging) return;
    
    if (story.isYourStory) {
      // This is handled by handleYourStoryClick
      return;
    } else if (story.stories && story.stories.length > 0) {
      // Open story viewer with this user's stories
      setViewerStories(story.stories);
      setViewerInitialIndex(0);
      setCanDeleteViewer(false);
      setViewerOpen(true);
    } else if (onStoryClick) {
      onStoryClick(story.id, story.username);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) return;

      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setMyStories(prev => prev.filter(s => s.id !== storyId));
        setViewerStories(prev => prev.filter(s => s.id !== storyId));
      }
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const handleStoryCreated = () => {
    fetchStories();
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

  // Check if "Your story" has active stories (show ring indicator)
  const yourStoryHasContent = myStories.length > 0;

  return (
    <>
      <CreateStoryModal 
        isOpen={isCreateStoryOpen} 
        onClose={() => setIsCreateStoryOpen(false)}
        onStoryCreated={handleStoryCreated}
      />
      
      {viewerOpen && viewerStories.length > 0 && (
        <StoryViewer
          stories={viewerStories}
          initialIndex={viewerInitialIndex}
          onClose={() => {
            setViewerOpen(false);
            setViewerStories([]);
            setCanDeleteViewer(false);
          }}
          onDelete={canDeleteViewer ? handleDeleteStory : undefined}
          canDelete={canDeleteViewer}
        />
      )}

      <StoryActionMenu
        isOpen={actionMenuOpen}
        onClose={() => setActionMenuOpen(false)}
        onViewStories={handleViewMyStories}
        onCreateNew={handleCreateNewStory}
        hasStories={myStories.length > 0}
        position={menuPosition}
      />

      <div className="w-full flex justify-center py-4 px-2">
        <div className="w-full max-w-2xl">
          <div className="relative bg-[#fff6f3] border border-[#f0e6e5] rounded-lg p-0 shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center h-24 px-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            ) : (
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
                    onClick={(e) => story.isYourStory ? handleYourStoryClick(e) : handleStoryClick(story)}
                    className="flex flex-col items-center flex-shrink-0 group p-1"
                    aria-label={story.isYourStory ? 'Your story options' : `${story.username} story`}
                  >
                    <div className="relative">
                      {/* Ring for unseen stories OR for your story if you have content */}
                      {((story.hasUnseenStory && !story.isYourStory) || (story.isYourStory && yourStoryHasContent)) && (
                        <div className={`absolute inset-0 rounded-full p-[2.5px] ${
                          story.isYourStory 
                            ? 'bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500' 
                            : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-fuchsia-500'
                        }`}>
                          <div className="w-full h-full bg-white rounded-full" />
                        </div>
                      )}
                      
                      <div className={`relative ${
                        ((story.hasUnseenStory && !story.isYourStory) || (story.isYourStory && yourStoryHasContent)) 
                          ? 'p-[2.5px]' 
                          : ''
                      } ${
                        ((story.hasUnseenStory && !story.isYourStory) || (story.isYourStory && yourStoryHasContent))
                          ? story.isYourStory 
                            ? 'bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500'
                            : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-fuchsia-500' 
                          : 'bg-gray-200'
                      } rounded-full`}>
                        <div className="bg-white p-[3px] rounded-full">
                          <img
                            src={story.avatar}
                            alt={story.username}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-white group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      </div>

                      {/* Plus icon for Your Story */}
                      {story.isYourStory && (
                        <div className={`absolute bottom-0 right-0 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg transition-colors ${
                          yourStoryHasContent 
                            ? 'bg-purple-500 group-hover:bg-purple-600' 
                            : 'bg-blue-500 group-hover:bg-blue-600'
                        }`}>
                          <Plus className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>
                    
                    {/* Username label */}
                    <span className="text-xs text-gray-600 mt-1 max-w-[70px] truncate">
                      {story.isYourStory ? 'Your story' : story.username}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!isLoading && showLeftArrow && (
              <button
                onClick={scrollLeft}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#fff6f3] rounded-full shadow-lg p-2 hover:bg-[#fff6f3] transition-all hover:scale-110 border border-[#f0e6e5] z-10"
                aria-label="Scroll left"
              >
                <ChevronRight className="w-5 h-5 text-gray-700 rotate-180" />
              </button>
            )}

            {!isLoading && showRightArrow && (
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
      </div>
    </>
  );
}
