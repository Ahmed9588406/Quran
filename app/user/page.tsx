"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import NavBar from "./navbar";
import StoriesBar from "./storybar"; // default export (StoriesBarDemo) used as StoriesBar
import PostView from "./postview";
import Image from "next/image";
import Link from "next/link";
import RightSide from "./rightside";
import LeftSide from "./leftside";
import { Button } from "@/components/ui/button";
import { ReelsComponent } from "../reels/page"; // <-- import the reusable reels component
const MessagesModal = dynamic(() => import("./messages"), { ssr: false }); // new modal component
const ChatPanel = dynamic(() => import("./chat"), { ssr: false }); // dynamic import to avoid SSR chunk errors

export default function UserPage() {
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false); // NEW: messages modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{ id: string; name: string; avatar: string } | null>(null);

  // NEW: activeView controls current main content: 'home' | 'reels' | ''
  const [activeView, setActiveView] = useState<string>('home');

  const suggestions = [
    { id: "1", name: "lucas", note: "Followed by mark + 2 more", avatar: "https://i.pravatar.cc/40?img=10" },
    { id: "2", name: "laura", note: "Followed by brandon + 6 more", avatar: "https://i.pravatar.cc/40?img=20" },
    { id: "3", name: "rikki", note: "Followed by mik + 1 more", avatar: "https://i.pravatar.cc/40?img=30" },
    { id: "4", name: "elrani", note: "Followed by ednamanz + 1 more", avatar: "https://i.pravatar.cc/40?img=40" },
    { id: "5", name: "tomascka", note: "Followed by katarina + 2 more", avatar: "https://i.pravatar.cc/40?img=50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* pass toggle handler to NavBar */}
      <NavBar onToggleSidebar={() => setIsLeftOpen((s) => !s)} />

      <main className="max-w-6xl mx-auto px-4 lg:px-8 mt-6">
        {/* updated grid: left sidebar + feed + right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar: receive isOpen so it can animate/collapse.
              Also pass onNavigate so clicking Reels can request this page to show reels. */}
          <LeftSide
            isOpen={isLeftOpen}
            onClose={() => setIsLeftOpen(false)}
            onNavigate={(view) => {
              // parent receives view ('' to deselect)
              setActiveView(view || '');
            }}
            activeView={activeView}
          />

          {/* Left / Center column: render reels or feed */}
          <section className="lg:col-start-2 lg:col-span-2 flex flex-col items-center justify-center space-y-6 min-h-[60vh]">
            {activeView === 'reels' ? (
              <div className="w-full max-w-[500px] h-[90vh]">
                <ReelsComponent />
              </div>
            ) : (
              <>
                {/* Home feed */}
                <StoriesBar />
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-6">
                  <PostView />
                  <PostView />
                </div>
              </>
            )}
          </section>

          {/* Right column: place RightSide here so it displays fully and sticks on scroll */}
          <aside className="hidden lg:block">
            <div className="fixed right-4 top-20 w-80 space-y-4">
              <RightSide />
            </div>
          </aside>
        </div>
      </main>

      {/* Permanent floating action button (fixed) */}
      <div className="fixed right-8 bottom-8 z-50">
        <Button
          aria-label="Quick action"
          className="w-[143px] h-[56px] bg-[#7a1233] text-white rounded-[16px] inline-flex items-center justify-center gap-2 px-4 py-2 shadow-lg"
          type="button"
          onClick={() => setIsMessagesOpen(true)}
        >
          {/* optional icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="opacity-90">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium">Messages</span>
        </Button>
      </div>

      {/* Messages modal (toggles when Messages button clicked) */}
      <MessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        onOpenChat={(item) => {
          setSelectedContact({ id: item.id, name: item.name, avatar: item.avatar });
          setIsChatOpen(true);
        }}
      />

      {/* Chat panel: appears beside Messages modal for selected contact */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        contact={selectedContact}
      />
    </div>
  );
}
