/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import NavBar from "../user/navbar";
import LeftSide from "../user/leftside";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import PhotosGrid from "./PhotosGrid";
import PostCard from "./PostCard";
import Leaderboard from "./Leaderboard";
import AboutSection from "./AboutSection";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/lib/auth-helpers";

const MessagesModal = dynamic(() => import("../user/messages"), { ssr: false });

interface OtherUserClientProps {
  userId: string;
}

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

// Sample data for tabs
const leaderboardData = [
  { rank: 1, name: "Mazen Mohamed", avatar: "/icons/settings/profile.png", points: 265, isCurrentUser: false },
  { rank: 2, name: "Ali Mohamed", avatar: "/icons/settings/profile.png", points: 263 },
  { rank: 3, name: "Mahmoud Mohamed", avatar: "/icons/settings/profile.png", points: 262 },
];

const photosData = [
  { id: "p1", src: "/figma-assets/mosque1.jpg", alt: "Photo 1" },
  { id: "p2", src: "/figma-assets/mosque2.jpg", alt: "Photo 2" },
  { id: "p3", src: "/figma-assets/mosque3.jpg", alt: "Photo 3" },
];


export default function OtherUserClient({ userId }: OtherUserClientProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [isMessagesOpen, setMessagesOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Check if viewing own profile
  useEffect(() => {
    const storedUserId = getCurrentUserId();
    setIsOwnProfile(storedUserId !== null && storedUserId === userId);
  }, [userId]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const res = await fetch(`/api/user_profile?userId=${encodeURIComponent(userId)}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Failed to fetch user:", res.status);
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        if (data?.user) {
          setUserData(data.user);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleFollow = async () => {
    // TODO: Implement follow/unfollow API call
    console.log("Follow/unfollow user:", userId);
  };

  const handleMessage = () => {
    setMessagesOpen(true);
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <div className="flex gap-6">
            <div className="w-72 flex-shrink-0 hidden md:block">
              <div className="sticky top-6">
                <PhotosGrid photos={photosData} onViewAll={() => setActiveTab("photos")} />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="bg-white rounded-lg border border-[#f0e6e5] p-8 text-center text-gray-500">
                {userData?.posts_count === 0 ? "No posts yet" : "Loading posts..."}
              </div>
            </div>
          </div>
        );
      case "photos":
        return (
          <div className="bg-white rounded-lg border border-[#f0e6e5] p-4">
            <h2 className="text-lg font-semibold mb-4">All Photos</h2>
            <div className="grid grid-cols-3 gap-2">
              {photosData.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        );
      case "reels":
        return (
          <div className="bg-white rounded-lg border border-[#f0e6e5] p-8 text-center text-gray-500">
            {userData?.reels_count === 0 ? "No reels yet" : `${userData?.reels_count} reels`}
          </div>
        );
      case "leaderboard":
        return <Leaderboard entries={leaderboardData} currentUserRank={0} />;
      case "about":
        return (
          <AboutSection
            workExperiences={userData?.work ? [{ id: "w1", icon: "/icons/profile/work.svg", title: userData.work }] : []}
            placesLived={userData?.location || userData?.country ? [{ id: "pl1", icon: "/icons/profile/location.svg", title: userData.location || userData.country || "" }] : []}
            contactInfo={[]}
            isOwnProfile={isOwnProfile}
          />
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
        onFollow={handleFollow}
        onMessage={handleMessage}
      />

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

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

      {isMessagesOpen && (
        <MessagesModal isOpen={true} onClose={() => setMessagesOpen(false)} onOpenStart={() => setMessagesOpen(false)} />
      )}
    </div>
  );
}
