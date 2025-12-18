"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import NavBar from "../../user/navbar";
import Sidebar from "../Sidebar";
import ProfileHeader from "../Kh_ProfileHeader";
import ProfileTabs from "../Kh_ProfileTabs";
import PhotosGrid from "../Kh_PhotosGrid";
import PostCard from "../../khateb_Studio/community/PostCard";
import KhReels from "../Kh_Reels";
import Fatwa from "../Kh_Fatwa";
import KhOldLive from "../Kh_old_live";
import AboutSection from "../Kh_AboutSection";
import CreatePostModal from "../Create_Post";
import MyStories from "../Kh_MyStories";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { likePost, unlikePost, savePost, unsavePost } from "@/src/api/postsApi";

const MessagesModal = dynamic(() => import("../../user/messages"), { ssr: false });

type Media = {
  url?: string;
  media_url?: string;
  media_type: string;
};

type Post = {
  id: string;
  user_id?: string;
  author_id?: string;
  content?: string;
  created_at?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  is_following?: number;
  liked_by_me?: boolean;
  saved_by_current_user?: boolean;
  media?: Media[];
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
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  // Fetch user's posts from API
  const fetchUserPosts = async (userId: string) => {
    setLoadingPosts(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.warn("No access token found");
        return;
      }

      console.log(`Fetching posts for user: ${userId}`);
      const res = await fetch(`/api/posts/user/${userId}?page=1&per_page=20`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch posts:", res.status, res.statusText);
        return;
      }

      const data = await res.json();
      console.log("API Response:", data);
      console.log("Posts array:", data?.posts);
      
      const postsArray = data?.posts || (Array.isArray(data) ? data : []);
      console.log("Posts to render:", postsArray.length);
      
      const normalizeMediaUrl = (url?: string): string | null => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `http://apisoapp.twingroups.com${url.startsWith('/') ? '' : '/'}${url}`;
      };

      const fetchedPosts: Post[] = postsArray.map((p: any) => {
        console.log("Processing post:", p.id, "Media:", p.media);
        
        // Normalize media URLs
        const normalizedMedia = (p.media || []).map((m: any) => {
          const mediaUrl = m.url || m.media_url;
          return {
            url: normalizeMediaUrl(mediaUrl),
            media_url: normalizeMediaUrl(mediaUrl),
            media_type: m.media_type || "image",
          };
        });
        
        return {
          id: p.id,
          user_id: p.user_id || p.author_id,
          author_id: p.author_id || p.user_id,
          content: p.content || "",
          created_at: p.created_at,
          username: p.username,
          display_name: p.display_name || p.username,
          avatar_url: p.avatar_url,
          likes_count: p.likes_count || 0,
          comments_count: p.comments_count || 0,
          shares_count: p.shares_count || 0,
          is_following: p.is_following,
          liked_by_me: p.liked_by_me || false,
          saved_by_current_user: p.saved_by_current_user || false,
          media: normalizedMedia,
        };
      });

      console.log("Fetched posts:", fetchedPosts);
      setPosts(fetchedPosts);
      
      // Initialize liked/saved state
      const likedState: Record<string, boolean> = {};
      const savedState: Record<string, boolean> = {};
      fetchedPosts.forEach((p) => {
        likedState[p.id] = p.liked_by_me ?? false;
        savedState[p.id] = p.saved_by_current_user ?? false;
      });
      setLikedIds(likedState);
      setSavedIds(savedState);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Handle like toggle
  const handleToggleLike = useCallback(async (postId: string) => {
    const prevLiked = likedIds[postId];
    setLikedIds((s) => ({ ...s, [postId]: !prevLiked }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes_count: prevLiked
                ? Math.max(0, (p.likes_count ?? 0) - 1)
                : (p.likes_count ?? 0) + 1,
            }
          : p
      )
    );
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || undefined : undefined;
      const result = prevLiked
        ? await unlikePost(postId, token)
        : await likePost(postId, token);
      if (result && result.likesCount !== undefined) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likes_count: result.likesCount } : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
      // Revert on error
      setLikedIds((s) => ({ ...s, [postId]: prevLiked }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes_count: prevLiked
                  ? (p.likes_count ?? 0) + 1
                  : Math.max(0, (p.likes_count ?? 0) - 1),
              }
            : p
        )
      );
    }
  }, [likedIds]);

  // Handle save toggle
  const handleToggleSave = useCallback(async (postId: string) => {
    const prevSaved = savedIds[postId];
    setSavedIds((s) => ({ ...s, [postId]: !prevSaved }));
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || undefined : undefined;
      if (prevSaved) {
        await unsavePost(postId, token);
      } else {
        await savePost(postId, token);
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
      // Revert on error
      setSavedIds((s) => ({ ...s, [postId]: prevSaved }));
    }
  }, [savedIds]);



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
        
        // Fetch posts for this user
        await fetchUserPosts(preacherId);
        
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [preacherId]);

  const handleCreateFromModal = async (payload: { content: string; media?: any; file?: File }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const formData = new FormData();
      formData.append("content", payload.content);
      formData.append("visibility", "public");
      
      if (payload.file) {
        formData.append("file", payload.file);
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        console.error("Failed to create post:", response.status);
        return;
      }

      // Refresh posts from API
      await fetchUserPosts(preacherId);
    } catch (error) {
      console.error("Error creating post:", error);
    }
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
              {loadingPosts ? (
                <div className="text-center py-12 text-gray-500">Loading posts...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No posts yet</div>
              ) : (
                posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    liked={likedIds[post.id] ?? post.liked_by_me ?? false}
                    saved={savedIds[post.id] ?? post.saved_by_current_user ?? false}
                    onToggleLike={() => handleToggleLike(post.id)}
                    onToggleSave={() => handleToggleSave(post.id)}
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
        return <KhReels userId={preacherId} />;
      case "old Live":
        return <KhOldLive />;
      case "fatwa":
        return <Fatwa entries={fatwaPosts} />;
      case "about":
        return <AboutSection workExperiences={workExperiences} placesLived={placesLived} contactInfo={contactInfo} isOwnProfile={isOwnProfile} />;
      case "stories":
        return <MyStories userId={preacherId} />;
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
