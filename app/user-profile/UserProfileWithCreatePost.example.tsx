/**
 * Example: User Profile Page with Create Post Feature
 * 
 * This file shows how to integrate CreatePostCard into your existing
 * user profile page. Copy and adapt this to your actual page.
 */

"use client";
import { useState, useEffect } from "react";
import CreatePostCard from "./CreatePostCard";
import PostCard from "./PostCard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Post {
  id: string;
  content: string;
  created_at: string;
  username: string;
  display_name: string;
  avatar_url: string;
  media?: Array<{ url: string; media_type: string }>;
  likes_count: number;
  liked_by_current_user: boolean;
  saved_by_current_user: boolean;
  user_id: string;
}

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
}

export default function UserProfileWithCreatePost() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch("http://apisoapp.twingroups.com/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setIsOwnProfile(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch user posts
  const fetchPosts = async () => {
    if (!profile) return;

    setIsLoadingPosts(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://apisoapp.twingroups.com/users/${profile.id}/posts`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Fetch posts when profile loads
  useEffect(() => {
    if (profile) {
      fetchPosts();
    }
  }, [profile]);

  const handlePostCreated = () => {
    // Refresh posts after creating a new one
    fetchPosts();
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              <img
                src={profile.avatar_url || "/icons/settings/profile.png"}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.display_name}
              </h1>
              <p className="text-gray-600">@{profile.username}</p>
              {profile.bio && (
                <p className="text-gray-700 mt-2">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div>
                  <span className="font-bold text-gray-900">
                    {posts.length}
                  </span>
                  <span className="text-gray-600 ml-2">Posts</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">
                    {profile.followers_count || 0}
                  </span>
                  <span className="text-gray-600 ml-2">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">
                    {profile.following_count || 0}
                  </span>
                  <span className="text-gray-600 ml-2">Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Create Post Card - Only show on own profile */}
        {isOwnProfile && (
          <div className="mb-8">
            <CreatePostCard
              currentUserAvatar={profile.avatar_url}
              currentUserName={profile.display_name}
              onPostCreated={handlePostCreated}
            />
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {isLoadingPosts ? (
            <div className="text-center text-gray-500 py-8">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No posts yet
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                content={post.content}
                created_at={post.created_at}
                username={post.username}
                display_name={post.display_name}
                avatar_url={post.avatar_url}
                media={post.media}
                likes_count={post.likes_count}
                liked_by_current_user={post.liked_by_current_user}
                saved_by_current_user={post.saved_by_current_user}
                isOwnProfile={isOwnProfile}
                currentUserAvatar={profile.avatar_url}
                currentUserName={profile.display_name}
                user_id={post.user_id}
                onLike={() => {
                  // Handle like
                }}
                onComment={() => {
                  // Handle comment
                }}
                onShare={() => {
                  // Handle share
                }}
                onRepost={() => {
                  // Handle repost
                }}
                onUnsave={() => {
                  // Handle unsave
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
