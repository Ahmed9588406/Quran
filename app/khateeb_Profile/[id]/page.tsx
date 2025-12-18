"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import NavBar from "../../user/navbar";
import Sidebar from "../Sidebar";
import ProfileHeader from "../Kh_ProfileHeader";
import ProfileTabs from "../Kh_ProfileTabs";
import PhotosGrid from "../Kh_PhotosGrid";
import PostCard from "../Kh_PostCard";
import KhReels from "../Kh_Reels";
import Fatwa from "../Kh_Fatwa";
import KhOldLive from "../Kh_old_live";
import AboutSection from "../Kh_AboutSection";
import CreatePostModal from "../Create_Post";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const MessagesModal = dynamic(() => import("../../user/messages"), { ssr: false });

type Media = { type: "image" | "video"; src: string; thumbnail?: string };
type Post = {
  id: string;
  author: { name: string; avatar: string };
  time: string;
  content: string;
  media?: Media;
};

// Sample data (will be replaced with API data)
const photosData = [
  { id: "p1", src: "/figma-assets/mosque1.jpg", alt: "Mosque interior" },
  { id: "p2", src: "/figma-assets/mosque2.jpg", alt: "Mosque architecture" },
  { id: "p3", src: "/figma-assets/mosque3.jpg", alt: "Blue Mosque" },
  { id: "p4", src: "/figma-assets/mosque4.jpg", alt: "Mosque courtyard" },
  { id: "p5", src: "/figma-assets/mosque5.jpg", alt: "Mosque interior" },
  { id: "p6", src: "/figma-assets/mosque6.jpg", alt: "Mosque dome" },
];

const reelsData = [
  { id: "r1", src: "/figma-assets/reel1.mp4", thumbnail: "/figma-assets/mosque1.jpg", title: "Short prayer", author: { name: "Preacher", avatar: "/icons/settings/profile.png" } },
  { id: "r2", src: "/figma-assets/reel2.mp4", thumbnail: "/figma-assets/mosque2.jpg", title: "Charity", author: { name: "Preacher", avatar: "/icons/settings/profile.png" } },
];

const fatwaPosts = [
  { id: "f1", author: { name: "User", avatar: "/icons/settings/profile.png" }, time: "2d", content: "Sample fatwa question", media: { type: "image" as const, src: "/figma-assets/prayer-rug.jpg" }, points: 265, isCurrentUser: false },
];

const workExperiences = [
  { id: "w1", icon: "/icons/profile/briefcase.svg", title: "Add work Experiences", isAddNew: true },
];
const placesLived = [
  { id: "pl1", icon: "/icons/profile/location.svg", title: "Add City", isAddNew: true },
];
const contactInfo = [
  { id: "c1", icon: "/icons/user_profile/info.svg", label: "Add Information", isAddNew: true },
];

export default function KhateebProfilePage() {
  const params = useParams();
  const preacherId = params.id as string;
  
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [isMessagesOpen, setMessagesOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: "Preacher",
    avatar: "/icons/settings/profile.png",
    posts: 0,
    followers: 0,
    following: 0,
    bio: "",
    tags: [] as string[],
  });
  
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // Check if viewing own profile
        const currentUserId = localStorage.getItem("user_id");
        setIsOwnProfile(currentUserId === preacherId);
        
        // Load from localStorage if own profile
        const userStr = localStorage.getItem("user");
        if (userStr && currentUserId === preacherId) {
          const user = JSON.parse(userStr);
          const firstName = user.firstName || user.first_name || "";
          const lastName = user.lastName || user.last_name || "";
          const fullName = `${firstName} ${lastName}`.trim() || user.username || "Preacher";
          const avatar = user.profilePictureUrl || user.profile_picture_url || user.avatar || "/icons/settings/profile.png";
          
          setProfileData({
            name: fullName,
            avatar: avatar,
            posts: user.postsCount || 0,
            followers: user.followersCount || 0,
            following: user.followingCount || 0,
            bio: user.bio || "",
            tags: user.tags || [],
          });
        }
        
        // TODO: Fetch profile data from API for other users
        // const response = await fetch(`/api/preacher/${preacherId}`);
        
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [preacherId]);

  const handleCreateFromModal = (payload: { content: string; media?: Media }) => {
    const newPost: Post = {
      id: `post${Date.now()}`,
      author: { name: profileData.name, avatar: profileData.avatar },
      time: "Now",
      content: payload.content,
      ...(payload.media ? { media: payload.media } : {}),
    };
    setPosts((p) => [newPost, ...p]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <div className="flex gap-6">
            <div className="w-80 flex-shrink-0 hidden md:block">
              <div className="sticky top-6">
                <PhotosGrid photos={photosData} onViewAll={() => setActiveTab("photos")} />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {isOwnProfile && (
                <div className="bg-[#FFF9F3] rounded-lg border border-[#f0e6e5] p-4 relative">
                  <div className="flex items-start gap-3 cursor-text" onClick={() => setShowCreateModal(true)}>
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image src={profileData.avatar} alt={profileData.name} fill style={{ objectFit: "cover" }} />
                    </div>
                    <div className="flex-1">
                      <div className="w-full h-10 rounded-full border border-transparent bg-[#fffaf7] text-xs text-[#B3B3B3] flex items-center px-4">
                        <span>Write here...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <CreatePostModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateFromModal} authorName={profileData.name} authorAvatar={profileData.avatar} />
              {posts.map((post) => (
                <PostCard key={post.id} id={post.id} author={post.author} time={post.time} content={post.content} media={post.media} />
              ))}
              {posts.length === 0 && (
                <div className="text-center py-12 text-gray-500">No posts yet</div>
              )}
            </div>
          </div>
        );
      case "photos":
        return (
          <div className="bg-white rounded-lg border border-[#f0e6e5] p-4">
            <h2 className="text-lg font-semibold mb-4">All Photos</h2>
            <div className="grid grid-cols-5 gap-2">
              {photosData.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image src={photo.src} alt={photo.alt} fill style={{ objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>
        );
      case "reels":
        return <KhReels reels={reelsData} />;
      case "old Live":
        return <KhOldLive />;
      case "fatwa":
        return <Fatwa entries={fatwaPosts} />;
      case "about":
        return <AboutSection workExperiences={workExperiences} placesLived={placesLived} contactInfo={contactInfo} isOwnProfile={isOwnProfile} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFF9F3]">
        <div className="w-12 h-12 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <NavBar onToggleSidebar={() => setSidebarOpen((s) => !s)} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} activeView="profile" />
      <ProfileHeader name={profileData.name} avatar={profileData.avatar} posts={profileData.posts} followers={profileData.followers} following={profileData.following} bio={profileData.bio} tags={profileData.tags} isOwnProfile={isOwnProfile} />
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-6xl mx-auto px-4 py-6">{renderTabContent()}</main>
      <div className="fixed right-8 bottom-8 z-50">
        <Button aria-label="Open messages" className="h-[48px] bg-[#7b2030] text-white rounded-2xl inline-flex items-center justify-center gap-2 px-5 py-2 shadow-lg hover:bg-[#5e0e27]" type="button" onClick={() => setMessagesOpen(true)}>
          <span className="text-sm font-medium">Messages</span>
        </Button>
      </div>
      {isMessagesOpen && <MessagesModal isOpen={true} onClose={() => setMessagesOpen(false)} onOpenStart={() => setMessagesOpen(false)} />}
    </div>
  );
}
