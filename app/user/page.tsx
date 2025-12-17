/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import NavBar from "./navbar";
import StoriesBar from "./storybar";
import Feed from "../../components/ui/Feed";
import RightSide from "./rightside";
import Leaderboard from "./leaderboard";
import { Button } from "@/components/ui/button";
import StartNewMessage from "./start_new_message";
import LeftSide from "./leftside";
import QRScanModal from "../qr/qr_scan"; // import modal
import CreatePostCard from "@/app/user-profile/CreatePostCard";
import { useRouter } from "next/navigation";
import { isAuthenticated, clearSession } from "@/lib/auth-helpers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MessagesModal = dynamic(() => import("./messages"), { ssr: false });

export default function UserPage() {
  const [isLeftOpen, setIsLeftOpen] = useState(false); // mobile drawer state (default closed)
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [activeView, setActiveView] = useState<string>('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false); // for larger screens toggling (if used)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const startUsers = [
    { id: "u1", name: "Aisha Noor", avatar: "https://i.pravatar.cc/80?img=21" },
    { id: "u2", name: "Bilal Y", avatar: "https://i.pravatar.cc/80?img=17" },
    { id: "u3", name: "Sara Ali", avatar: "https://i.pravatar.cc/80?img=11" },
    { id: "u4", name: "Omar Faruk", avatar: "https://i.pravatar.cc/80?img=12" },
    { id: "u5", name: "Layla Noor", avatar: "https://i.pravatar.cc/80?img=13" },
  ];

  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    // helper: call local refresh proxy and store tokens/user if returned
    const tryRefresh = async (refreshToken: string) => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json) return false;

        // handle shapes: { access_token, refresh_token, user } or { data: { ... } }
        const data = json.data ?? json;
        const access = data.access_token ?? data.token ?? data.accessToken;
        const refresh = data.refresh_token ?? data.refreshToken;
        const user = data.user ?? (data.data && data.data.user) ?? null;

        if (access) {
          localStorage.setItem("access_token", access);
          if (refresh) localStorage.setItem("refresh_token", refresh);
          if (user) localStorage.setItem("user", JSON.stringify(user));
          return true;
        }
      } catch (e) {
        // ignore
      }
      return false;
    };

    // fetch profile by calling local proxy /api/auth/profile
    const fetchProfile = async (retryAfterRefresh = true) => {
      try {
        let token = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");

        // if no token but refresh exists, try refresh first
        if (!token && refreshToken) {
          const ok = await tryRefresh(refreshToken);
          if (!ok) {
            // refresh failed -> send user to login
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            router.replace("/login");
            return;
          }
          token = localStorage.getItem("access_token");
        }

        if (!token) {
          // no tokens at all -> go to login
          router.replace("/login");
          return;
        }

        // Call local profile proxy which will try backend endpoints
        const res = await fetch("/api/auth/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        // Handle unauthorized from proxy (backend returned 401/403)
        if (res.status === 401 || res.status === 403) {
          if (retryAfterRefresh && refreshToken) {
            const refreshed = await tryRefresh(refreshToken);
            if (refreshed) {
              await fetchProfile(false);
              return;
            }
          }
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        if (!res.ok) {
          // fallback to localStorage user if available
          const raw = localStorage.getItem("user");
          if (raw) setCurrentUser(JSON.parse(raw));
          return;
        }

        const data = await res.json().catch(() => null);
        // normalize user object from possible shapes
        let user: any = null;
        if (data?.user) user = data.user;
        else if (data?.data && data.data.user) user = data.data.user;
        else if (data?.data && typeof data.data === "object" && data.data.id) user = data.data;
        else if (data?.id) user = data;

        // If proxy returned tokens too, store them
        if (data?.data && (data.data.access_token || data.data.refresh_token)) {
          const d = data.data;
          if (d.access_token) localStorage.setItem("access_token", d.access_token);
          if (d.refresh_token) localStorage.setItem("refresh_token", d.refresh_token);
          if (d.user) {
            user = d.user;
            localStorage.setItem("user", JSON.stringify(user));
          }
        }

        // normalize avatar to absolute if needed (proxy may already have normalized)
        if (user && typeof user.avatar_url === "string" && user.avatar_url.startsWith("/")) {
          // keep backend base if available in env or fallback to same host
          const base = (window as any).__BACKEND_BASE__ ?? "http://apisoapp.twingroups.com";
          user.avatar_url = `${base}${user.avatar_url}`;
        }

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          setCurrentUser(user);
        }
      } catch {
        // fallback to localStorage user
        const raw = localStorage.getItem("user");
        if (raw) setCurrentUser(JSON.parse(raw));
      }
    };

    // run it
    fetchProfile();
    setIsLoaded(true);
  }, [router]);

  // helper to render the main view based on activeView
  function renderMainView() {
    // Default to home view if activeView is empty or not set
    const view = activeView || 'home';
    
    switch (view) {
      case "home":
        return (
          <>
            <div className="w-full mb-0">
              <StoriesBar />
            </div>
            <div className="flex flex-col items-center space-y-6 mt-0 w-full">
              <div className="w-full">
                <CreatePostCard
                  currentUserAvatar={currentUser?.avatar_url || "/icons/settings/profile.png"}
                  currentUserName={currentUser?.display_name || currentUser?.username || "You"}
                  onPostCreated={() => {
                    // Optionally refresh feed after post creation
                    window.location.reload();
                  }}
                />
              </div>
              <Feed perPage={10} />
            </div>
          </>
        );
      case "reels":
        return (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">Reels</h2>
            {/* If you have a Reels component, replace the placeholder below */}
            <div className="rounded-lg p-4 bg-white shadow-sm text-center">Reels view — replace with your Reels component</div>
          </div>
        );
      case "pray":
        return (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">Pray</h2>
            <div className="rounded-lg p-4 bg-white shadow-sm">
              {/* Replace with your prayer times / features */}
              Prayer times and related features will appear here.
            </div>
          </div>
        );
      case "profile":
        {
          const user = currentUser ?? (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null);
          if (!user) return <div className="p-6">No profile available.</div>;
          return (
            <div className="w-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <img src={user.avatar_url || "/figma-assets/avatar.png"} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{user.display_name ?? user.username}</h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="rounded-lg p-4 bg-white shadow-sm">
                User profile content — settings, posts, etc.
              </div>
            </div>
          );
        }
      default:
        // Fallback to home view
        return (
          <>
            <div className="w-full mb-0">
              <StoriesBar />
            </div>
            <div className="flex flex-col items-center space-y-6 mt-0 w-full">
              <div className="w-full">
                <CreatePostCard
                  currentUserAvatar={currentUser?.avatar_url || "/icons/settings/profile.png"}
                  currentUserName={currentUser?.display_name || currentUser?.username || "You"}
                  onPostCreated={() => {
                    window.location.reload();
                  }}
                />
              </div>
              <Feed perPage={10} />
            </div>
          </>
        );
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f6] text-gray-900">
      {/* Navbar (fixed) */}
      <NavBar
        onToggleSidebar={() => setIsLeftOpen((s) => !s)}
        isSidebarOpen={isLeftOpen}
        currentUser={currentUser}
        onOpenMessages={() => setIsMessagesOpen(true)}
      />

      {/* LeftSide:
          - on small screens it becomes a drawer/overlay controlled by isLeftOpen
          - on lg+ we show a collapsed rail via LeftSide with isOpen=false (or let LeftSide handle)
      */}
      <LeftSide
        isOpen={isLeftOpen}
        onClose={() => setIsLeftOpen(false)}
        onNavigate={(view) => {
          setActiveView(view || '');
          setIsLeftOpen(false);
        }}
        activeView={activeView}
        onOpenScan={() => setIsScanOpen(true)}
        permanent={false}
      />

      {/* Desktop collapsed rail (space reserved via lg:ml-14 below) is handled by LeftSide's lg styles */}

      {/* Leaderboard - visible on lg+ */}
      <div className="hidden lg:block fixed left-[56px] top-20 z-30 pointer-events-auto">
        <Leaderboard />
      </div>

      {/* RightSide - visible on lg+ as fixed column */}
      <aside className="hidden lg:block fixed right-4 top-20 z-30 pointer-events-auto">
        <div className="w-[320px] max-h-[calc(100vh-100px)] rounded-lg overflow-auto shadow-sm">
          <RightSide />
        </div>
      </aside>

      {/* Main content area
          - padding-top to account for fixed navbar (h-16)
          - ml on lg to avoid overlapping left rail (14)
          - px responsive
      */}
      <main className="pt-16 w-full">
        <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 lg:ml-14">
          <div className="mx-auto w-full max-w-3xl lg:max-w-3xl">
            {/* Render the selected view */}
            {renderMainView()}
          </div>
        </div>
      </main>

      {/* Floating Messages button
          - small circular icon on very small screens
          - expanded label on sm+ screens
      */}
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

      {/* Messages modal - chat opens inline within the modal */}
      <MessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        onOpenChat={() => {
          // Chat opens inline within MessagesModal, no separate ChatPanel needed
        }}
        onOpenStart={() => {
          setIsMessagesOpen(false);
          setIsStartOpen(true);
        }}
      />

      {/* StartNewMessage modal */}
      <StartNewMessage
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        users={startUsers}
        onSelect={() => {
          // After selecting a user, open messages modal to start the chat
          setIsStartOpen(false);
          setIsMessagesOpen(true);
        }}
      />

      {/* QR Scan modal */}
      <QRScanModal isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} />

      {/* Toast notifications */}
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
