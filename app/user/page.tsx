"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import NavBar from "./navbar";
import StoriesBar from "./storybar";
import PostView from "./postview";
import RightSide from "./rightside";
import Leaderboard from "./leaderboard";
import { Button } from "@/components/ui/button";
import StartNewMessage from "./start_new_message";
import LeftSide from "./leftside";
import QRScanModal from "../qr/qr_scan"; // import modal

const MessagesModal = dynamic(() => import("./messages"), { ssr: false });
const ChatPanel = dynamic(() => import("./chat"), { ssr: false });

export default function UserPage() {
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [activeView, setActiveView] = useState<string>('home');

  const startUsers = [
    { id: "u1", name: "Aisha Noor", avatar: "https://i.pravatar.cc/80?img=21" },
    { id: "u2", name: "Bilal Y", avatar: "https://i.pravatar.cc/80?img=17" },
    { id: "u3", name: "Sara Ali", avatar: "https://i.pravatar.cc/80?img=11" },
    { id: "u4", name: "Omar Faruk", avatar: "https://i.pravatar.cc/80?img=12" },
    { id: "u5", name: "Layla Noor", avatar: "https://i.pravatar.cc/80?img=13" },
  ];

  return (
    <div className="min-h-screen bg-[#fff6f3]">
      <NavBar
        onToggleSidebar={() => setIsLeftOpen((s) => !s)}
        isSidebarOpen={isLeftOpen}
      />

      {/* LeftSide sidebar */}
      <LeftSide
        isOpen={isLeftOpen}
        onClose={() => setIsLeftOpen(false)}
        onNavigate={(view) => setActiveView(view || '')}
        activeView={activeView}
        onOpenScan={() => setIsScanOpen(true)} // pass handler
      />

      {/* Leaderboard - fixed left, below navbar */}
      <div className="hidden lg:block fixed left-4 top-20 z-30 pointer-events-auto">
        <Leaderboard />
      </div>

      {/* RightSide - fixed right, below navbar */}
      <aside className="hidden lg:block fixed right-4 top-20 z-30 pointer-events-auto">
        <div className="w-[320px] max-h-[calc(100vh-100px)] rounded-lg overflow-auto shadow-sm bg-white">
          <RightSide />
        </div>
      </aside>

      {/* Main content - centered with margins to avoid overlapping fixed sidebars */}
      <main className="pt-0 pb-24 mr-175">
        <div className="mx-auto w-full max-w-2xl px-4 lg:ml-[320px] lg:mr-[360px] lg:max-w-none xl:ml-[380px] xl:mr-[400px]">
          {/* Stories bar */}
          <div className="w-full mb-6">
            <StoriesBar />
          </div>

          {/* Feed / Posts */}
          <div className="flex flex-col items-center space-y-6">
            <PostView />
            <PostView />
          </div>
        </div>
      </main>

      {/* Floating Messages button */}
      <div className="fixed right-8 bottom-8 z-50">
        <Button
          aria-label="Quick action"
          className="w-[143px] h-[56px] bg-[#7a1233] text-white rounded-[16px] inline-flex items-center justify-center gap-2 px-4 py-2 shadow-lg hover:bg-[#5e0e27]"
          type="button"
          onClick={() => setIsMessagesOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="opacity-90">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium">Messages</span>
        </Button>
      </div>

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

      {/* StartNewMessage modal */}
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

      {/* Chat panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        contact={selectedContact}
      />

      {/* QR Scan modal */}
      <QRScanModal isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} />
    </div>
  );
}
