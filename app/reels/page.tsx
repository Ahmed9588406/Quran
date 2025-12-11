"use client";

/**
 * Reels Page
 * 
 * Main page for browsing and creating reels.
 * Uses ReelsFeed component for video feed and CreateReelModal for reel creation.
 * 
 * Requirements: 1.1, 4.1
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import NavBar from '../user/navbar';
import LeftSide from '../user/leftside';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import StartNewMessage from '../user/start_new_message';
import { ReelsFeed } from './ReelsFeed';
import { CreateReelModal } from './CreateReelModal';
import { Reel } from '@/lib/reels/types';

const MessagesModal = dynamic(() => import('../user/messages'), { ssr: false });
const ChatPanel = dynamic(() => import('../user/chat'), { ssr: false });

/**
 * ReelsPage - Main page wrapper with NavBar, LeftSide, and ReelsFeed
 * 
 * - Fetches reels from API (Requirements: 1.1)
 * - Displays create reel button (Requirements: 4.1)
 * - Integrates ReelsFeed component for video browsing
 */
export default function ReelsPage() {
  // Sidebar and navigation state
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [activeView, setActiveView] = useState<string>('reels');
  
  // Messages state
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{ id: string; name: string; avatar: string } | null>(null);
  
  // Create reel modal state - Requirements: 4.1
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Current user ID (would come from auth context in production)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  // Get current user ID from localStorage on mount
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      setCurrentUserId(userId);
    }
  }, []);

  // Sample users for start new message modal
  const startUsers = [
    { id: "u1", name: "Aisha Noor", avatar: "https://i.pravatar.cc/80?img=21" },
    { id: "u2", name: "Bilal Y", avatar: "https://i.pravatar.cc/80?img=17" },
    { id: "u3", name: "Sara Ali", avatar: "https://i.pravatar.cc/80?img=11" },
    { id: "u4", name: "Omar Faruk", avatar: "https://i.pravatar.cc/80?img=12" },
    { id: "u5", name: "Layla Noor", avatar: "https://i.pravatar.cc/80?img=13" },
  ];

  /**
   * Handle successful reel creation
   * Requirements: 4.7 - Display success and add to list
   */
  const handleReelCreated = useCallback((reel: Reel) => {
    // The ReelsFeed will refresh automatically or we can trigger a refresh
    console.log('Reel created successfully:', reel?.id || 'unknown');
  }, []);

  /**
   * Open create reel modal
   * Requirements: 4.1 - Display modal with video upload functionality
   */
  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  /**
   * Close create reel modal
   */
  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#fff6f3] border-l border-r border-[#f0e6e5]">
      {/* NavBar */}
      <NavBar
        onToggleSidebar={() => setIsLeftOpen((s) => !s)}
        isSidebarOpen={isLeftOpen}
      />

      {/* LeftSide */}
      <LeftSide
        isOpen={isLeftOpen}
        onClose={() => setIsLeftOpen(false)}
        onNavigate={(view) => {
          setActiveView(view || '');
        }}
        activeView={activeView}
      />

      {/* Main content: ReelsFeed - Requirements: 1.1 */}
      <main className="w-full">
        <ReelsFeed currentUserId={currentUserId} />
      </main>

      {/* Create Reel Button - Requirements: 4.1 */}
      <div className="fixed left-8 bottom-8 z-50">
        <Button
          aria-label="Create new reel"
          className="w-14 h-14 bg-[#8A1538] hover:bg-[#6d1029] text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          type="button"
          onClick={handleOpenCreateModal}
          data-testid="create-reel-button"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Floating Messages button */}
      <div className="fixed right-8 bottom-8 z-50">
        <Button
          aria-label="Open messages"
          className="w-[143px] h-[56px] bg-[#7a1233] text-white rounded-[16px] inline-flex items-center justify-center gap-2 px-4 py-2 shadow-lg"
          type="button"
          onClick={() => setIsMessagesOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="opacity-90">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium">Messages</span>
        </Button>
      </div>

      {/* Create Reel Modal - Requirements: 4.1 */}
      <CreateReelModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleReelCreated}
      />

      {/* Messages modal */}
      <MessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        onOpenChat={(item) => {
          setSelectedContact({ id: item.id, name: item.name, avatar: item.avatar });
          setIsChatOpen(true);
        }}
        onOpenStart={() => {
          setIsMessagesOpen(false);
          setIsStartOpen(true);
        }}
      />

      {/* StartNewMessage */}
      <StartNewMessage
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        users={startUsers}
        onSelect={(u) => {
          setSelectedContact({ id: u.id, name: u.name, avatar: u.avatar });
          setIsChatOpen(true);
          setIsStartOpen(false);
        }}
      />

      {/* ChatPanel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        contact={selectedContact}
      />
    </div>
  );
}
