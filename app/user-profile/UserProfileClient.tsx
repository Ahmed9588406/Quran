/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import NavBar from "../user/navbar";
import LeftSide from "../user/leftside";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import PhotosGrid from "./PhotosGrid";
import Leaderboard from "./Leaderboard";
import AboutSection from "./AboutSection";
import ProfilePostCard from "./PostCard";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { Bookmark, Grid, Film, Loader2 } from "lucide-react";

const MessagesModal = dynamic(() => import("../user/messages"), { ssr: false });

/**
 * User data interface matching API response
 */
interface UserData {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  cover_url: string | null;
  country: string | null;
  location: string | null;
  education: string | null;
  work: string | null;
  interests: string | null;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  posts_count: number;
  reels_count: number;
}

/**
 * Props for UserProfileClient component
 */
interface UserProfileClientProps {
  userId: string;
}

// Sample data for tabs
const leaderboardData = [
  { rank: 1, name: "Mazen Mohamed", avatar: "/icons/settings/profile.png", points: 265, isCurrentUser: true },
  { rank: 2, name: "Ali Mohamed", avatar: "/icons/settings/profile.png", points: 263 },
  { rank: 3, name: "Mahmoud Mohamed", avatar: "/icons/settings/profile.png", points: 262 },
];

/**
 * Photo interface for user photos (matches backend response)
 */
interface PhotoItem {
  post_id: string;
  photo_url: string;
  media_type: string;
  created_at: string;
}

/**
 * Media interface for post media
 */
interface Media {
  url: string;
  media_type: string;
}

/**
 * Post interface matching API response
 */
interface Post {
  id: string;
  user_id?: string;
  content?: string;
  created_at?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  media?: Media[];
  likes_count?: number;
  shares_count?: number;
  liked_by_current_user?: boolean;
  is_shared?: boolean;
  share_comment?: string;
  original_post?: {
    id: string;
    user_id?: string;
    content?: string;
    created_at?: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    media?: Media[];
  };
}

const workExperiences = [
  { id: "w1", icon: "/icons/profile/briefcase.svg", title: "Add work Experiences", isAddNew: true },
];

const placesLived = [
  { id: "pl1", icon: "/icons/profile/location.svg", title: "Add City", isAddNew: true },
];

const contactInfo = [
  { id: "c1", icon: "/icons/user_profile/info.svg", label: "Add Information", isAddNew: true },
];

/**
 * Client component for user profile page
 * Fetches user data from API and displays profile
 */
export default function UserProfileClient({ userId }: UserProfileClientProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [isMessagesOpen, setMessagesOpen] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPhotos, setUserPhotos] = useState<PhotoItem[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>("/icons/settings/profile.png");
  const [currentUserName, setCurrentUserName] = useState<string>("You");
  
  // Saved posts state
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [savedReels, setSavedReels] = useState<Post[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedSubTab, setSavedSubTab] = useState<"posts" | "reels">("posts");
  const [savedPage, setSavedPage] = useState(1);
  const [savedHasMore, setSavedHasMore] = useState(true);

  // Detect if viewing own profile and fetch current user data
  useEffect(() => {
    const storedUserId = getCurrentUserId();
    setIsOwnProfile(storedUserId !== null && storedUserId === userId);
    
    // Fetch current user's avatar from localStorage or API
    const fetchCurrentUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const currentUserId = getCurrentUserId();
        if (!token || !currentUserId) return;

        // If viewing own profile, use the profile data
        if (currentUserId === userId && userData) {
          setCurrentUserAvatar(userData.avatar_url || "/icons/settings/profile.png");
          setCurrentUserName(userData.display_name || userData.username || "You");
          return;
        }

        // Otherwise fetch current user data
        const res = await fetch(`/api/user_profile?userId=${encodeURIComponent(currentUserId)}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setCurrentUserAvatar(data.user.avatar_url || "/icons/settings/profile.png");
            setCurrentUserName(data.user.display_name || data.user.username || "You");
          }
        }
      } catch (err) {
        console.error("Error fetching current user data:", err);
      }
    };

    fetchCurrentUserData();
  }, [userId, userData]);

  // Fetch user profile data from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Fetch user data from /api/user_profile?userId={userId}
        const res = await fetch(`/api/user_profile?userId=${encodeURIComponent(userId)}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Failed to fetch user profile:", res.status);
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        if (data?.user) {
          setUserData(data.user);
          // Log the fetched user data (visible in browser console for client components)
          console.info("Fetched user profile data:", data.user);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Fetch user photos from API
  useEffect(() => {
    const fetchUserPhotos = async () => {
      setPhotosLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setPhotosLoading(false);
          return;
        }

        // Fetch photos from /api/user_photos?userId={userId}&limit=20&page=1
        const res = await fetch(`/api/user_photos?userId=${encodeURIComponent(userId)}&limit=20&page=1`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Failed to fetch user photos:", res.status);
          setPhotosLoading(false);
          return;
        }

        const data = await res.json();
        // Handle response shape: { success: true, photos: [...], pagination: {...} }
        // Photos are already normalized by the API route (photo_url has full URL)
        if (data?.photos && Array.isArray(data.photos)) {
          setUserPhotos(data.photos);
          console.info("Fetched user photos:", data.photos);
        }
      } catch (err) {
        console.error("Error fetching user photos:", err);
      } finally {
        setPhotosLoading(false);
      }
    };

    fetchUserPhotos();
  }, [userId]);

  // Fetch user posts from API
  useEffect(() => {
    const fetchUserPosts = async () => {
      setPostsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setPostsLoading(false);
          return;
        }

        const res = await fetch(`/api/user_profile?userId=${encodeURIComponent(userId)}&type=posts&limit=20&page=1`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Failed to fetch user posts:", res.status);
          setPostsLoading(false);
          return;
        }

        const data = await res.json();
        let items: Post[] = [];
        if (data.success && Array.isArray(data.posts)) {
          items = data.posts;
        } else if (Array.isArray(data.posts)) {
          items = data.posts;
        } else if (Array.isArray(data.data)) {
          items = data.data;
        } else if (Array.isArray(data)) {
          items = data;
        }
        setUserPosts(items);
        console.info("Fetched user posts:", items);
      } catch (err) {
        console.error("Error fetching user posts:", err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  // Fetch saved items
  const fetchSavedItems = useCallback(async (type: "posts" | "reels", pageNum: number, append = false) => {
    try {
      setSavedLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setSavedLoading(false);
        return;
      }

      const res = await fetch(`/api/posts/saved?type=${type}&limit=20&page=${pageNum}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch saved items:", res.status);
        setSavedLoading(false);
        return;
      }

      const data = await res.json();
      const items: Post[] = Array.isArray(data) ? data : data.posts || data.data || [];
      
      // Mark all items as saved
      const normalizedItems = items.map((item: Post) => ({
        ...item,
        saved_by_current_user: true,
      }));

      if (type === "posts") {
        setSavedPosts(prev => append ? [...prev, ...normalizedItems] : normalizedItems);
      } else {
        setSavedReels(prev => append ? [...prev, ...normalizedItems] : normalizedItems);
      }

      // Check if there are more items
      const total = data.total || data.meta?.total;
      const currentCount = append 
        ? (type === "posts" ? savedPosts.length : savedReels.length) + normalizedItems.length 
        : normalizedItems.length;
      setSavedHasMore(total ? currentCount < total : normalizedItems.length === 20);
    } catch (err) {
      console.error("Error fetching saved items:", err);
    } finally {
      setSavedLoading(false);
    }
  }, [savedPosts.length, savedReels.length]);

  // Fetch saved items when saved tab is active
  useEffect(() => {
    if (activeTab === "saved" && isOwnProfile) {
      setSavedPage(1);
      fetchSavedItems(savedSubTab, 1, false);
    }
  }, [activeTab, savedSubTab, isOwnProfile, fetchSavedItems]);

  const handleUnsavePost = (postId: string) => {
    if (savedSubTab === "posts") {
      setSavedPosts(prev => prev.filter(p => p.id !== postId));
    } else {
      setSavedReels(prev => prev.filter(r => r.id !== postId));
    }
  };

  const handleLoadMoreSaved = () => {
    const nextPage = savedPage + 1;
    setSavedPage(nextPage);
    fetchSavedItems(savedSubTab, nextPage, true);
  };

  const handleLike = (postId: string) => {
    console.log("Like post:", postId);
    // TODO: Call API to like post
  };

  const handleComment = (postId: string, content: string) => {
    console.log("Comment on post:", postId, content);
    // TODO: Call API to add comment
  };

  const handleShare = (postId: string) => {
    console.log("Share post:", postId);
    // TODO: Call API to share post
  };

  const handleRepost = (postId: string) => {
    console.log("Repost:", postId);
    // TODO: Call API to repost
  };

  const renderTabContent = () => {

    switch (activeTab) {
      case "posts":
        return (
          <div className="flex gap-6">
            <div className="w-72 flex-shrink-0 hidden md:block">
              <div className="sticky top-6">
                {photosLoading ? (
                  <div className="bg-white rounded-lg border border-[#f0e6e5] p-4 text-center text-gray-500">
                    Loading photos...
                  </div>
                ) : (
                  <PhotosGrid photos={userPhotos} onViewAll={() => setActiveTab("photos")} />
                )}
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {postsLoading ? (
                <div className="bg-white rounded-lg border border-[#f0e6e5] p-8 text-center text-gray-500">
                  Loading posts...
                </div>
              ) : userPosts.length === 0 ? (
                <div className="bg-white rounded-lg border border-[#f0e6e5] p-8 text-center text-gray-500">
                  No posts yet
                </div>
              ) : (
                userPosts.map((post) => {
                  // Normalize media URLs if needed
                  const normalizedMedia = post.media?.map((m) => ({
                    url: m.url.startsWith("http") ? m.url : `http://192.168.1.18:9001${m.url}`,
                    media_type: m.media_type,
                  }));
                  // Normalize avatar URL
                  const normalizedAvatar = post.avatar_url?.startsWith("http")
                    ? post.avatar_url
                    : post.avatar_url
                    ? `http://192.168.1.18:9001${post.avatar_url}`
                    : userData?.avatar_url || "/icons/settings/profile.png";

                  return (
                    <ProfilePostCard
                      key={post.id}
                      id={post.id}
                      user_id={post.user_id || userData?.id}
                      content={post.content}
                      created_at={post.created_at}
                      username={post.username || userData?.username}
                      display_name={post.display_name || userData?.display_name}
                      avatar_url={normalizedAvatar}
                      media={normalizedMedia}
                      likes_count={post.likes_count}
                      shares_count={post.shares_count}
                      liked_by_current_user={post.liked_by_current_user}
                      isOwnProfile={isOwnProfile}
                      currentUserAvatar={currentUserAvatar}
                      currentUserName={currentUserName}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                      onRepost={handleRepost}
                    />
                  );
                })
              )}
            </div>
          </div>
        );
      case "photos":
        return (
          <div className="bg-white rounded-lg border border-[#f0e6e5] p-4">
            <h2 className="text-lg font-semibold mb-4">All Photos</h2>
            {photosLoading ? (
              <div className="text-center text-gray-500 py-8">Loading photos...</div>
            ) : userPhotos.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No photos yet</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {userPhotos.map((photo, idx) => (
                  <div key={photo.post_id || `photo-${idx}`} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={photo.photo_url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "reels":
        return (
          <div className="bg-white rounded-lg border border-[#f0e6e5] p-8 text-center text-gray-500">
            {userData?.reels_count === 0 ? "No reels yet" : `${userData?.reels_count} reels`}
          </div>
        );
      case "favorites":
        return <div className="bg-white rounded-lg border border-[#f0e6e5] p-8 text-center text-gray-500">No favorites yet</div>;
      case "leaderboard":
        return <Leaderboard entries={leaderboardData} currentUserRank={1} />;
      case "about":
        return (
          <AboutSection
            workExperiences={userData?.work ? [{ id: "w1", icon: "/icons/profile/work.svg", title: userData.work }] : workExperiences}
            placesLived={userData?.location || userData?.country ? [{ id: "pl1", icon: "/icons/profile/location.svg", title: userData.location || userData.country || "" }] : placesLived}
            contactInfo={contactInfo}
            isOwnProfile={isOwnProfile}
          />
        );
      case "saved":
        const currentSavedItems = savedSubTab === "posts" ? savedPosts : savedReels;
        return (
          <div>
            {/* Sub-tabs for Posts and Reels */}
            <div className="bg-white rounded-lg border border-[#f0e6e5] mb-4">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setSavedSubTab("posts")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                    savedSubTab === "posts"
                      ? "border-[#7b2030] text-[#7b2030]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  Posts
                </button>
                <button
                  onClick={() => setSavedSubTab("reels")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                    savedSubTab === "reels"
                      ? "border-[#7b2030] text-[#7b2030]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Film className="w-4 h-4" />
                  Reels
                </button>
              </div>
            </div>

            {/* Content */}
            {savedLoading && currentSavedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#7b2030] animate-spin mb-4" />
                <p className="text-gray-500">Loading saved {savedSubTab}...</p>
              </div>
            ) : currentSavedItems.length === 0 ? (
              <div className="bg-white rounded-lg border border-[#f0e6e5] p-8 flex flex-col items-center justify-center">
                <Bookmark className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-lg font-medium text-gray-700 mb-2">
                  No saved {savedSubTab} yet
                </h2>
                <p className="text-gray-500 text-center max-w-sm">
                  {savedSubTab === "posts"
                    ? "Save posts to view them later. Tap the bookmark icon on any post to save it."
                    : "Save reels to watch them later. Tap the bookmark icon on any reel to save it."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedSubTab === "posts" ? (
                  // Posts view - card layout
                  currentSavedItems.map((post) => {
                    const normalizedMedia = post.media?.map((m) => ({
                      url: m.url.startsWith("http") ? m.url : `http://192.168.1.18:9001${m.url}`,
                      media_type: m.media_type,
                    }));
                    const normalizedAvatar = post.avatar_url?.startsWith("http")
                      ? post.avatar_url
                      : post.avatar_url
                      ? `http://192.168.1.18:9001${post.avatar_url}`
                      : "/icons/settings/profile.png";

                    return (
                      <ProfilePostCard
                        key={post.id}
                        id={post.id}
                        user_id={post.user_id}
                        content={post.content}
                        created_at={post.created_at}
                        username={post.username}
                        display_name={post.display_name}
                        avatar_url={normalizedAvatar}
                        media={normalizedMedia}
                        likes_count={post.likes_count}
                        liked_by_current_user={post.liked_by_current_user}
                        saved_by_current_user={true}
                        currentUserAvatar={currentUserAvatar}
                        currentUserName={currentUserName}
                        onUnsave={handleUnsavePost}
                      />
                    );
                  })
                ) : (
                  // Reels view - grid layout
                  <div className="grid grid-cols-3 gap-2">
                    {currentSavedItems.map((reel) => {
                      const videoMedia = reel.media?.find((m) => m.media_type === "video");
                      const thumbnailUrl = videoMedia?.url
                        ? videoMedia.url.startsWith("http")
                          ? videoMedia.url
                          : `http://192.168.1.18:9001${videoMedia.url}`
                        : null;

                      return (
                        <div
                          key={reel.id}
                          className="relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden group cursor-pointer"
                        >
                          {thumbnailUrl ? (
                            <video
                              src={thumbnailUrl}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <Film className="w-8 h-8 text-gray-500" />
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2">
                            <Film className="w-4 h-4 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Load More Button */}
                {savedHasMore && !savedLoading && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleLoadMoreSaved}
                      className="px-6 py-2 bg-[#7b2030] text-white rounded-full text-sm font-medium hover:bg-[#5e0e27] transition-colors"
                    >
                      Load More
                    </button>
                  </div>
                )}

                {savedLoading && currentSavedItems.length > 0 && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 text-[#7b2030] animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar onToggleSidebar={() => setSidebarOpen((s) => !s)} isSidebarOpen={isSidebarOpen} />
      <LeftSide isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} activeView="profile" />
      
      <ProfileHeader
        name={userData.display_name || userData.username}
        username={userData.username}
        avatar={userData.avatar_url || "/icons/settings/profile.png"}
        coverUrl={userData.cover_url}
        posts={userData.posts_count}
        followers={userData.followers_count}
        following={userData.following_count}
        bio={userData.bio || ""}
        tags={[]}
        isOwnProfile={isOwnProfile}
        isFollowing={userData.is_following}
        country={userData.country}
        location={userData.location}
        education={userData.education}
        work={userData.work}
        interests={userData.interests}
        reelsCount={userData.reels_count}
      />
      
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} isOwnProfile={isOwnProfile} />
      <main className="max-w-4xl mx-auto px-6 py-6">{renderTabContent()}</main>
      
      <div className="fixed right-8 bottom-8 z-50">
        <Button
          aria-label="Open messages"
          className="h-[48px] bg-[#7b2030] text-white rounded-2xl inline-flex items-center justify-center gap-2 px-5 py-2 shadow-lg hover:bg-[#5e0e27]"
          type="button"
          onClick={() => setMessagesOpen(true)}
        >
          <span className="text-sm font-medium">Messages</span>
        </Button>
      </div>
      
      {isMessagesOpen && <MessagesModal isOpen={true} onClose={() => setMessagesOpen(false)} onOpenStart={() => setMessagesOpen(false)} />}
    </div>
  );
}
