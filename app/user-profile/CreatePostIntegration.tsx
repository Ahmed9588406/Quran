/**
 * Integration Guide for CreatePostCard
 * 
 * This file shows how to integrate the CreatePostCard component
 * into your existing pages.
 */

import CreatePostCard from "./CreatePostCard";

/**
 * Example 1: Basic usage in a feed page
 */
export function FeedWithCreatePost() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Create Post Card at the top */}
      <CreatePostCard
        currentUserAvatar="/icons/settings/profile.png"
        currentUserName="Ahmed"
        onPostCreated={() => {
          // Refresh posts or navigate
          window.location.reload();
        }}
      />

      {/* Your existing posts feed below */}
      <div className="mt-6">
        {/* PostCard components here */}
      </div>
    </div>
  );
}

/**
 * Example 2: Usage in user profile with state management
 */
export function UserProfileWithCreatePost() {
  const handlePostCreated = () => {
    // Trigger a refresh of posts
    // You can use React Query, SWR, or your own state management
    console.log("Post created! Refresh posts here");
  };

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-lg mb-6">
        <h1>User Profile</h1>
      </div>

      {/* Create Post Card */}
      <CreatePostCard
        currentUserAvatar="/path/to/avatar.jpg"
        currentUserName="User Name"
        onPostCreated={handlePostCreated}
      />

      {/* Posts List */}
      <div className="mt-6">
        {/* Your posts here */}
      </div>
    </div>
  );
}

/**
 * Example 3: Standalone create post page
 * See: /app/create-post/page.tsx
 */
