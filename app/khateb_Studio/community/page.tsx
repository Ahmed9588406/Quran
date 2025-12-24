"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import KhatebNavbar from "../KhatebNavbar";
import Sidebar from "../../khateeb_Profile/Sidebar";
import MessagesModal from "../../user/messages";
import KhatebProfileModal from "../KhatebProfileModal";
import CreateModal from "../CreateModal";
import dynamic from "next/dynamic";
import StoriesBar from "./StoriesBar";
import CreatePostCard from "./CreatePostCard";
import CommunityFeed from "./CommunityFeed";

const StartNewMessage = dynamic(() => import("../../user/start_new_message"), { ssr: false });

type User = { 
  id: string; 
  name: string; 
  avatar: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
};

export default function KhatebCommunityPage() {
  const router = useRouter();
  
  // Auth & user state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Following users state
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followingError, setFollowingError] = useState<string | null>(null);
  
  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isStartMsgOpen, setIsStartMsgOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<DOMRect | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createAnchor, setCreateAnchor] = useState<DOMRect | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Authorization check
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem("user");
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("access_token");

        if (!userStr || !userId || !token) {
          router.replace("/login");
          return;
        }

        const user = JSON.parse(userStr);
        const userRole = user.role?.toLowerCase();

        if (userRole !== "preacher") {
          router.replace(`/user/${userId}`);
          return;
        }

        setCurrentUser(user);
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Fetch following users
  const fetchFollowingUsers = async () => {
    try {
      setFollowingLoading(true);
      setFollowingError(null);

      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        setFollowingError("Authentication token not found");
        setFollowingLoading(false);
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      // Fetch following users from API
      const response = await fetch("/api/following?limit=50&page=1", {
        method: "GET",
        headers,
      });

      console.log("Following API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch following users:", response.status, errorText);
        throw new Error("Failed to fetch following users");
      }

      const data = await response.json();
      console.log("Following API response data:", data);

      // Transform API response to User format
      let users: User[] = [];

      if (data.following && Array.isArray(data.following)) {
        users = data.following.map((user: any) => {
          // Normalize avatar URL
          let avatarUrl = user.avatar_url || user.profile_picture_url || "";
          if (avatarUrl && !avatarUrl.startsWith("http")) {
            avatarUrl = `https://apisoapp.twingroups.com${avatarUrl}`;
          }
          if (!avatarUrl) {
            avatarUrl = "/icons/settings/profile.png";
          }

          return {
            id: user.id || user.user_id || "",
            name: user.display_name || user.username || "Unknown",
            avatar: avatarUrl,
            username: user.username,
            display_name: user.display_name,
            avatar_url: avatarUrl,
          };
        });
        console.log("Transformed following users:", users);
      } else if (Array.isArray(data)) {
        // Handle if API returns array directly
        users = data.map((user: any) => {
          let avatarUrl = user.avatar_url || user.profile_picture_url || "";
          if (avatarUrl && !avatarUrl.startsWith("http")) {
            avatarUrl = `https://apisoapp.twingroups.com${avatarUrl}`;
          }
          if (!avatarUrl) {
            avatarUrl = "/icons/settings/profile.png";
          }

          return {
            id: user.id || user.user_id || "",
            name: user.display_name || user.username || "Unknown",
            avatar: avatarUrl,
            username: user.username,
            display_name: user.display_name,
            avatar_url: avatarUrl,
          };
        });
      }

      setFollowingUsers(users);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load following users";
      setFollowingError(errorMessage);
      console.error("Error fetching following users:", err);
    } finally {
      setFollowingLoading(false);
    }
  };

  // Fetch following users on component mount
  useEffect(() => {
    if (isAuthorized) {
      fetchFollowingUsers();
    }
  }, [isAuthorized]);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8A1538] font-medium">Loading Community...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="h-screen bg-[#faf8f6] flex flex-col overflow-hidden">
      {/* Navbar */}
      <KhatebNavbar
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isSidebarOpen={isSidebarOpen}
        onOpenMessages={() => setIsMessagesOpen(true)}
        onProfileClick={(e) => {
          const btn = document.getElementById("khateb-avatar-btn");
          const rect = btn?.getBoundingClientRect() || (e.currentTarget as HTMLElement).getBoundingClientRect();
          setProfileAnchor(rect);
          setIsProfileOpen(true);
        }}
        onCreateClick={(e) => {
          const btn = document.getElementById("khateb-create-btn");
          const rect = btn?.getBoundingClientRect() || (e.currentTarget as HTMLElement).getBoundingClientRect();
          setCreateAnchor(rect);
          setIsCreateOpen(true);
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          activeView="community" 
        />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-16"} overflow-hidden`}>
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex gap-6">
                {/* Left Column - Main Feed */}
                <div className="flex-1 max-w-2xl mt-15 ml-60">
                  {/* Stories Bar */}
                  <StoriesBar />
                  
                  {/* Create Post */}
                  <div className="mt-5">
                    <CreatePostCard
                      currentUserAvatar={currentUser?.avatar_url || currentUser?.profile_picture_url || "/icons/settings/profile.png"}
                      currentUserName={currentUser?.display_name || currentUser?.username || "Preacher"}
                      onPostCreated={handlePostCreated}
                    />
                  </div>
                  
                  {/* Feed */}
                  <div className="mt-4 ">
                    <CommunityFeed refreshTrigger={refreshKey} perPage={10} />
                  </div>
                </div>

                {/* Right Column - Suggestions */}
                
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Messages Button */}
      <button
        onClick={() => setIsMessagesOpen(true)}
        className="fixed bottom-6 right-6 bg-[#7A1233] text-white px-4 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:bg-[#6d1029] transition-colors z-40"
      >
        <span className="text-base font-medium">Messages</span>
        <svg className="w-3 h-3" viewBox="0 0 12 6" fill="none">
          <path d="M1 5l5-4 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Modals */}
      <MessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        onOpenChat={() => {}}
        onOpenStart={() => setIsStartMsgOpen(true)}
      />

      {isStartMsgOpen && (
        <StartNewMessage
          isOpen={isStartMsgOpen}
          onClose={() => setIsStartMsgOpen(false)}
          users={followingUsers.length > 0 ? followingUsers : []}
          onSelect={(user) => {
            console.log("Selected user:", user);
            setIsStartMsgOpen(false);
          }}
        />
      )}

      <KhatebProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        anchorRect={profileAnchor}
      />

      <CreateModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        anchorRect={createAnchor}
        onOpenUpload={() => setIsCreateOpen(false)}
        onOpenGoLive={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
