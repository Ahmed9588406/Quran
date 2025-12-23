"use client";
import React, { useEffect, useState } from 'react';
import { Loader, Play, Plus } from 'lucide-react';
import CreateStoryModal from '../user/CreateStoryModal';
import StoryViewer from '../user/StoryViewer';

interface Story {
  id: string;
  media_url: string;
  caption?: string;
  created_at: string;
  expires_at: string;
}

interface MyStoriesProps {
  userId: string;
  isOwnProfile?: boolean;
}

export default function MyStories({ userId, isOwnProfile = false }: MyStoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('Authentication token not found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`http://apisoapp.twingroups.com/stories/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stories: ${response.statusText}`);
      }

      const data = await response.json();
      const storiesArray = Array.isArray(data) ? data : data.stories || [];
      setStories(storiesArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories');
      console.error('Error fetching stories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [userId]);

  const handleDeleteStory = async (storyId: string) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(`http://apisoapp.twingroups.com/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete story: ${response.statusText}`);
      }

      setStories(stories.filter(s => s.id !== storyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete story');
      console.error('Error deleting story:', err);
    }
  };

  const handleStoryCreated = () => {
    fetchStories();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-[#7b2030]" />
          <p className="text-gray-500">Loading stories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchStories}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const handleCloseViewer = () => {
    setTimeout(() => {
      setSelectedStoryIndex(null);
    }, 0);
  };

  return (
    <>
      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onStoryCreated={handleStoryCreated}
      />

      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={handleCloseViewer}
          onDelete={isOwnProfile ? handleDeleteStory : undefined}
          canDelete={isOwnProfile}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isOwnProfile ? 'Your Stories' : 'Stories'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'}
            </p>
          </div>
          
          {isOwnProfile && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#7b2030] text-white rounded-lg hover:bg-[#5e0e27] transition font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Story
            </button>
          )}
        </div>

        {stories.length === 0 ? (
          <div className="bg-gradient-to-br from-[#FFF9F3] to-[#fff6f3] rounded-2xl border border-[#f0e6e5] p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-[#7b2030] to-[#c79a4f] rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
            <p className="text-gray-700 text-lg font-semibold">No stories yet</p>
            <p className="text-gray-500 text-sm mt-2">
              {isOwnProfile ? 'Create your first story to get started' : 'This user has no stories'}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-6 py-2 bg-[#7b2030] text-white rounded-lg hover:bg-[#5e0e27] transition font-medium"
              >
                Create Story
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, index) => {
              const fullImageUrl = story.media_url.startsWith('http') 
                ? story.media_url 
                : `http://apisoapp.twingroups.com${story.media_url.startsWith('/') ? '' : '/'}${story.media_url}`;
              
              return (
                <div
                  key={story.id}
                  onClick={() => setSelectedStoryIndex(index)}
                  className="group relative rounded-2xl overflow-hidden bg-gray-100 aspect-video cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <img
                    src={fullImageUrl}
                    alt={story.caption || 'Story'}
                    className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Play icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white bg-opacity-30 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>

                  {/* Caption at bottom */}
                  {story.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm font-medium truncate">{story.caption}</p>
                    </div>
                  )}

                  {/* Date badge */}
                  <div className="absolute top-3 left-3 text-white text-xs font-semibold bg-black bg-opacity-50 backdrop-blur-sm px-3 py-1 rounded-full">
                    {new Date(story.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>

                  {/* Expiry indicator */}
                  <div className="absolute top-3 right-3">
                    <div className="text-white text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full">
                      Expires {new Date(story.expires_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
