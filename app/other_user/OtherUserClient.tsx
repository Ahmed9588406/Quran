/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import NavBar from "../user/navbar";
import LeftSide from "../user/leftside";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import PhotosGrid from "./PhotosGrid";
import AboutSection from "./AboutSection";
import Leaderboard from "./Leaderboard";
import { Button } from "@/components/ui/button";
import PostCard from "../user-profile/PostCard";

const MessagesModal = dynamic(() => import("../user/messages"), { ssr: false });
const ChatPanel = dynamic(() => import("../user/chat"), { ssr: false });

const DEFAULT_AVATAR = "/icons/settings/profile.png";
const BASE_URL = "http://192.168.1.18:9001";

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  cover_url: string | null;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
  country?: string | null;
  location?: string | null;
  education?: string | null;
  work?: string | null;
  interests?: string | null;
  reels_count?: number;
}

interface Post {
  id: string;
  user_id?: string;
  content: string;
  created_at: string;
  username: string;
  display_name: string;
  avatar_url: string;
  media: { url: string; media_type: string }[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  liked_by_me: boolean;
}

interface PhotoItem {
  post_id: string;
  photo_url: string;
  media_type: string;
  created_at: string;
}

interface OtherUserClientProps {
  userId: string;
}

function normalizeUrl(url?: string | null): string {
  if (!url) return DEFAULT_AVATAR;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

// Sample leaderboard data
const leaderboardData = [
  { rank: 1, name: "Mazen Mohamed", avatar: "/icons/settings/profile.png", points: 265, isCurrentUser: false },
  { rank: 2, name: "Ali Mohamed", avatar: "/icons/settings/profile.png", points: 263 },
  { rank: 3, name: "Mahmoud Mohamed", avatar: "/icons/settings/profile.png", points: 262 },
];

export default function OtherUserClient({ userId }: OtherUserClientProps) {
  const router = useRouter();
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [activeView, setActiveView] = useState("home");
  const [activeTab, setActiveTab] = useState("posts");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load current user from localStorage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch (err) {
      console.error("Error reading user:", err);
    }
  }, []);

  // Fetch user profile
  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      setLoadingProfile(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Not authenticated");
          setLoadingProfile(false);
          return;
        }

        const res = await fetch(`/api/user_profile?userId=${encodeURIComponent(userId)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await res.json();
        const user = data.user || data.data?.user || data;

        setProfile({
          id: user.id,
          username: user.username || "",
          display_name: user.display_name || user.username || "",
          avatar_url: normalizeUrl(user.avatar_url),
          bio: user.bio || null,
          cover_url: user.cover_url ? normalizeUrl(user.cover_url) : null,
          followers_count: user.followers_count || 0,
          following_count: user.following_count || 0,
          posts_count: user.posts_count || 0,
          is_following: user.is_following || false,
          country: user.country || null,
          location: user.location || null,
          education: user.education || null,
          work: user.work || null,
          interests: user.interests || null,
          reels_count: user.reels_count || 0,
        });
        setIsFollowing(user.is_following || false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchProfile();
  }, [userId]);

  // Fetch user posts
  useEffect(() => {
    if (!userId) return;

    async function fetchPosts() {
      setLoadingPosts(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setLoadingPosts(false);
          return;
        }

        const res = await fetch(`/api/user_profile?userId=${encodeURIComponent(userId)}&type=posts&limit=20&page=1`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setPosts([]);
          return;
        }

        const data = await res.json();
        let postsArray: any[] = [];

        if (data.success && Array.isArray(data.posts)) {
          postsArray = data.posts;
        } else if (Array.isArray(data.posts)) {
          postsArray = data.posts;
        } else if (Array.isArray(data.data)) {
          postsArray = data.data;
        } else if (Array.isArray(data)) {
          postsArray = data;
        }

        const normalizedPosts: Post[] = postsArray.map((p: any) => ({
          id: p.id,
          user_id: p.user_id || profile?.id || userId,
          content: p.content || "",
          created_at: p.created_at,
          username: p.username || profile?.username || "",
          display_name: p.display_name || profile?.display_name || "",
          avatar_url: normalizeUrl(p.avatar_url || profile?.avatar_url),
          media: (p.media || []).map((m: any) => ({
            url: normalizeUrl(m.url),
            media_type: m.media_type || "image",
          })),
          likes_count: p.likes_count || 0,
          comments_count: p.comments_count || 0,
          shares_count: p.shares_count || 0,
          liked_by_me: p.liked_by_me || p.liked_by_current_user || false,
        }));

        setPosts(normalizedPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    }

    fetchPosts();
  }, [userId, profile?.username, profile?.display_name, profile?.avatar_url, profile?.id]);

  // Fetch user photos
  useEffect(() => {
    if (!userId) return;

    async function fetchPhotos() {
      setLoadingPhotos(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setLoadingPhotos(false);
          return;
        }

        const res = await fetch(`/api/user_photos?userId=${encodeURIComponent(userId)}&limit=20&page=1`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setPhotos([]);
          return;
        }

        const data = await res.json();
        if (data?.photos && Array.isArray(data.photos)) {
          setPhotos(data.photos);
        }
      } catch (err) {
        console.error("Error fetching photos:", err);
        setPhotos([]);
      } finally {
        setLoadingPhotos(false);
      }
    }

    fetchPhotos();
  }, [userId]);

  const handleToggleFollow = async () => {
    if (!userId) return;

    const prev = isFollowing;
    setIsFollowing(!prev);
    setIsTogglingFollow(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/follow", {
        method: prev ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        setIsFollowing(prev);
      } else {
        setProfile((p) =>
          p
            ? {
                ...p,
                followers_count: prev ? p.followers_count - 1 : p.followers_count + 1,
              }
            : p
        );
      }
    } catch (err) {
      console.error("Follow toggle failed:", err);
      setIsFollowing(prev);
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const handleMessage = () => {
    if (profile) {
      setSelectedContact({
        id: profile.id,
        name: profile.display_name || profile.username,
        avatar: profile.avatar_url || DEFAULT_AVATAR,
      });
      setIsChatOpen(true);
    }
  };

  const handleLike = (postId: string) => {
    console.log("Like post:", postId);
  };

  const handleComment = (postId: string, content: string) => {
    console.log("Comment on post:", postId, content);
  };

  const handleShare = (postId: string) => {
    console.log("Share post:", postId);
  };

  const handleRepost = (postId: string) => {
    console.log("Repost:", postId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <div className="flex gap-6">
            {/* Left: Photos sidebar */}
            <div className="w-72 flex-shrink-0 hidden md:block">
              <div className="sticky top-6">
                {loadingPhotos ? (
                  <div className="bg-white rounded-lg border border-[#f0e6e5] p-4 text-center text-gray-500">
                    Loading photos...
                  </div>
                ) : (
                  <PhotosGrid photos={photos} onViewAll={() => setActiveTab("photos")} />
                )}
              </div>
            </div>
            {/* Right: Posts feed */}
            <div className="flex-1 space-y-4">
              {loadingPosts ? (
                <div className="bg-white rounded-lg border border-[#f0e6e5] p-8 text-center text-gray-500">
                  Loading posts...
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-lg border border-[#f0e6e5] p-8 text-center text-gray-500">
                  No posts yet
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    user_id={post.user_id}
                    content={post.content}
                    created_at={post.created_at}
                    username={post.username}
                    display_name={post.display_name}
                    avatar_url={post.avatar_url}
                    media={post.media}
                    likes_count={post.likes_count}
                    liked_by_current_user={post.liked_by_me}
                    isOwnProfile={false}
                    currentUserAvatar={currentUser?.avatar_url || DEFAULT_AVATAR}
                    currentUserName={currentUser?.display_name || currentUser?.username || "You"}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    onRepost={handleRepost}
                  />
                ))
              )}
            </div>
          </div>
        );
      case "photos":
        return (
          <div className="bg-white rounded-lg border border-[#f0e6e5] p-4">
            <h2 className="text-lg font-semibold mb-4">All Photos</h2>
            {loadingPhotos ? (
              <div className="text-center text-gray-500 py-8">Loading photos...</div>
            ) : photos.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No photos yet</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, idx) => (
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
            {profile?.reels_count === 0 ? "No reels yet" : `${profile?.reels_count} reels`}
          </div>
        );
      case "leaderboard":
        return <Leaderboard entries={leaderboardData} currentUserRank={0} />;
      case "about":
        return (
          <AboutSection
            workExperiences={profile?.work ? [{ id: "w1", icon: "/icons/profile/work.svg", title: profile.work }] : []}
            placesLived={
              profile?.location || profile?.country
                ? [{ id: "pl1", icon: "/icons/profile/location.svg", title: profile.location || profile.country || "" }]
                : []
            }
            contactInfo={[]}
            isOwnProfile={false}
          />
        );
      default:
        return null;
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-[#faf8f6] flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#faf8f6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "User not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        onToggleSidebar={() => setIsLeftOpen((s) => !s)}
        isSidebarOpen={isLeftOpen}
        currentUser={currentUser}
        onOpenMessages={() => setIsMessagesOpen(true)}
      />

      <LeftSide
        isOpen={isLeftOpen}
        onClose={() => setIsLeftOpen(false)}
        onNavigate={(view) => {
          setActiveView(view || "");
          setIsLeftOpen(false);
        }}
        activeView={activeView}
        permanent={false}
      />

      {/* Profile Header */}
      <ProfileHeader
        name={profile.display_name}
        username={profile.username}
        avatar={profile.avatar_url || DEFAULT_AVATAR}
        coverUrl={profile.cover_url}
        posts={profile.posts_count}
        followers={profile.followers_count}
        following={profile.following_count}
        bio={profile.bio || ""}
        tags={[]}
        isOwnProfile={false}
        isFollowing={isFollowing}
        isTogglingFollow={isTogglingFollow}
        location={profile.location}
        work={profile.work}
        education={profile.education}
        onFollow={handleToggleFollow}
        onMessage={handleMessage}
      />

      {/* Profile Tabs */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <main className="max-w-4xl mx-auto px-6 py-6">{renderTabContent()}</main>

      {/* Floating Messages button */}
      <div className="fixed right-8 bottom-8 z-50">
        <Button
          aria-label="Open messages"
          className="h-[48px] bg-[#7b2030] text-white rounded-2xl inline-flex items-center justify-center gap-2 px-5 py-2 shadow-lg hover:bg-[#5e0e27]"
          type="button"
          onClick={() => setIsMessagesOpen(true)}
        >
          <span className="text-sm font-medium">Messages</span>
        </Button>
      </div>

      <MessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        onOpenChat={(item) => {
          setSelectedContact({ id: item.id, name: item.name, avatar: item.avatar });
          setIsChatOpen(true);
        }}
        onOpenStart={() => setIsMessagesOpen(false)}
      />

      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} contact={selectedContact} />
    </div>
  );
}
