"use client";

/**
 * Khateb Studio Reels Page
 * 
 * Main page for browsing and creating reels in the Khateb Studio.
 * Uses ReelsFeed component for video feed and CreateReelModal for reel creation.
 * Styled to match the Khateb Studio design system.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Plus, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import KhatebNavbar from '../KhatebNavbar';
import Sidebar from '../../khateeb_Profile/Sidebar';
import MessagesModal from '../../user/messages';
import KhatebProfileModal from '../KhatebProfileModal';
import CreateModal from '../CreateModal';
import { KhatebReelsFeed } from './KhatebReelsFeed';
import { CreateReelModal } from '../../reels/CreateReelModal';
import { Reel } from '@/lib/reels/types';

const StartNewMessage = dynamic(() => import('../../user/start_new_message'), { ssr: false });

type User = { id: string; name: string; avatar: string };

// Sample users for Start New Message
const sampleUsers: User[] = [
  { id: "u1", name: "Ahmed Abdullah", avatar: "https://i.pravatar.cc/80?img=1" },
  { id: "u2", name: "Mohammed Ali", avatar: "https://i.pravatar.cc/80?img=2" },
  { id: "u3", name: "Fatima Hassan", avatar: "https://i.pravatar.cc/80?img=3" },
  { id: "u4", name: "Sara Omar", avatar: "https://i.pravatar.cc/80?img=4" },
  { id: "u5", name: "Yusuf Ibrahim", avatar: "https://i.pravatar.cc/80?img=5" },
];

/**
 * KhatebReelsPage - Main reels page for Khateb Studio
 */
export default function KhatebReelsPage() {
  // Sidebar and navigation state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Messages state
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isStartMsgOpen, setIsStartMsgOpen] = useState(false);
  
  // Profile modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<DOMRect | null>(null);
  
  // Create modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createAnchor, setCreateAnchor] = useState<DOMRect | null>(null);
  
  // Create reel modal state
  const [isCreateReelModalOpen, setIsCreateReelModalOpen] = useState(false);
  
  // Current user ID
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  
  // Authorization state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authorization on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem("user");
        const userId = localStorage.getItem("user_id");

        if (!userStr || !userId) {
          window.location.href = "/login";
          return;
        }

        const user = JSON.parse(userStr);
        const userRole = user.role?.toLowerCase();

        if (userRole !== "preacher") {
          window.location.href = `/user/${userId}`;
          return;
        }

        setCurrentUserId(userId);
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        window.location.href = "/login";
      }
    };

    checkAuth();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  /**
   * Handle successful reel creation
   */
  const handleReelCreated = useCallback((reel: Reel) => {
    console.log('Reel created successfully:', reel?.id || 'unknown');
  }, []);

  /**
   * Open create reel modal
   */
  const handleOpenCreateReelModal = useCallback(() => {
    setIsCreateReelModalOpen(true);
  }, []);

  /**
   * Close create reel modal
   */
  const handleCloseCreateReelModal = useCallback(() => {
    setIsCreateReelModalOpen(false);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8A1538] font-medium">Loading Reels...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="h-screen bg-[#fff6f3] flex flex-col overflow-hidden">
      {/* Khateb Navbar */}
      <KhatebNavbar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onOpenMessages={() => setIsMessagesOpen(true)}
        onProfileClick={(e) => {
          const btn = document.getElementById("khateb-avatar-btn");
          const rect = btn
            ? btn.getBoundingClientRect()
            : (e.currentTarget as HTMLElement).getBoundingClientRect();
          setProfileAnchor(rect);
          setIsProfileOpen(true);
        }}
        onCreateClick={(e) => {
          const btn = document.getElementById("khateb-create-btn");
          const rect = btn
            ? btn.getBoundingClientRect()
            : (e.currentTarget as HTMLElement).getBoundingClientRect();
          setCreateAnchor(rect);
          setIsCreateOpen(true);
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          activeView="reels" 
        />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "ml-72" : "ml-16"
          } overflow-hidden`}
        >
          {/* Reels Feed */}
          <KhatebReelsFeed currentUserId={currentUserId} />
        </main>
      </div>

      {/* Create Reel Button */}
      <div className="fixed left-24 bottom-8 z-50">
        <Button
          aria-label="Create new reel"
          className="w-14 h-14 bg-[#C9A96E] hover:bg-[#b8985d] text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          type="button"
          onClick={handleOpenCreateReelModal}
          data-testid="create-reel-button"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Messages Button (floating) */}
      <button
        onClick={() => setIsMessagesOpen(true)}
        className="fixed bottom-6 right-6 bg-[#7A1233] text-white px-4 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:bg-[#6d1029] transition-colors z-40"
      >
        <span className="text-base font-medium">Messages</span>
        <ChevronUp className="w-4 h-4" />
      </button>

      {/* Create Reel Modal */}
      <CreateReelModal
        isOpen={isCreateReelModalOpen}
        onClose={handleCloseCreateReelModal}
        onSuccess={handleReelCreated}
      />

      {/* Messages Modal */}
      <MessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        onOpenStart={() => setIsStartMsgOpen(true)}
      />

      {/* Start New Message Modal */}
      {isStartMsgOpen && (
        <StartNewMessage
          isOpen={isStartMsgOpen}
          onClose={() => setIsStartMsgOpen(false)}
          users={sampleUsers}
          onSelect={(user) => {
            console.log("Selected user:", user);
            setIsStartMsgOpen(false);
          }}
        />
      )}

      {/* Khateb Profile Modal */}
      <KhatebProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        anchorRect={profileAnchor}
      />

      {/* Create Modal */}
      <CreateModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        anchorRect={createAnchor}
        onOpenUpload={() => {
          setIsCreateOpen(false);
        }}
        onOpenGoLive={() => {
          setIsCreateOpen(false);
        }}
      />
    </div>
  );
}
