/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import NavBar from "../user/navbar";
import LeftSide from "../user/leftside";
import ProfileHeader from "./ProfileHeader";
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

interface OtherUserClientProps {
  userId: string;
}

function normalizeUrl(url?: string | null): string {
  if (!url) return DEFAULT_AVATAR;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

export default function OtherUserClient({ userId }: OtherUserClientProps) {
  const router = useRouter();
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [activeView, setActiveView] = useState("home");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
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

  // Fetch user profile - using same endpoint as UserProfileClient
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

        // Use the same API endpoint as UserProfileClient
        const res = await fetch(`/api/user_profile?userId=${encodeURIComponent(userId)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error(`Profile fetch failed: ${res.status}`);
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

  // Fetch user posts - using same endpoint pattern as UserProfileClient
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

        // Use the same API endpoint as UserProfileClient for posts
        const res = await fetch(`/api/user_profile?userId=${encodeURIComponent(userId)}&type=posts&limit=20&page=1`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error(`Posts fetch failed: ${res.status}`);
          setPosts([]);
          return;
        }

        const data = await res.json();
        let postsArray: any[] = [];
        
        // Handle various response shapes
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
  }, [userId, profile?.username, profile?.display_name, profile?.avatar_url]);

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
    <div className="min-h-screen bg-[#faf8f6] text-gray-900">
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

      <main className="pt-16 w-full">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
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

          {/* Posts */}
          <div className="space-y-6 mt-6">
            {loadingPosts ? (
              <div className="text-center text-gray-500 py-8">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No posts yet</div>
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
                  liked_by_current_user={post.liked_by_me}
                  isOwnProfile={false}
                  currentUserAvatar={currentUser?.avatar_url || DEFAULT_AVATAR}
                  currentUserName={currentUser?.display_name || currentUser?.username || "You"}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Floating Messages button */}
      <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-50">
        <Button
          aria-label="Messages"
          className="flex items-center justify-center gap-2 shadow-lg bg-[#7a1233] text-white rounded-full sm:rounded-2xl h-12 px-3 sm:px-4"
          onClick={() => setIsMessagesOpen(true)}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="opacity-90">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium hidden sm:inline">Messages</span>
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

      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        contact={selectedContact}
      />
    </div>
  );
}
