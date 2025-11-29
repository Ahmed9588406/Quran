"use client";
import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2, VolumeX, Music } from 'lucide-react';
import NavBar from '../user/navbar';
import LeftSide from '../user/leftside';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import StartNewMessage from '../user/start_new_message';

const MessagesModal = dynamic(() => import('../user/messages'), { ssr: false });
const ChatPanel = dynamic(() => import('../user/chat'), { ssr: false });

// Sample reels data
const REELS_DATA = [
  {
    id: 1,
    username: "Mazen Mohamed",
    avatar: "https://i.pravatar.cc/150?img=33",
    caption: "Surat Al-Nasr • Surat Al-Naqara • Surat Al",
    audioText: "another awesome and relaxs and relaxs and",
    likes: "834",
    comments: "12k",
    location: "Follow",
    image: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=500&h=900&fit=crop"
  },
  {
    id: 2,
    username: "Mazen Mohamed",
    avatar: "https://i.pravatar.cc/150?img=33",
    caption: "Beautiful Quran recitation",
    audioText: "peaceful recitation and reflection",
    likes: "1.2k",
    comments: "15k",
    location: "Follow",
    image: "https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=500&h=900&fit=crop"
  },
  {
    id: 3,
    username: "Mazen Mohamed",
    avatar: "https://i.pravatar.cc/150?img=33",
    caption: "Islamic calligraphy art",
    audioText: "inspiring and beautiful art",
    likes: "956",
    comments: "8k",
    location: "Follow",
    image: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=500&h=900&fit=crop"
  }
];

function InstagramReels() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const reelData = REELS_DATA[currentIndex];

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    // Visual feedback: could add translation here if desired
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;
    setIsDragging(false);

    // Swipe threshold: 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < REELS_DATA.length - 1) {
        // Swipe up -> next reel
        setCurrentIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down -> previous reel
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartY(e.clientY);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    // optional visual feedback
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const endY = e.clientY;
    const diff = startY - endY;
    setIsDragging(false);

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < REELS_DATA.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Main Reel Container */}
      <div className="relative w-full max-w-[500px] h-full">
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={reelData.image}
            alt="Quran and prayer beads"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40"></div>
        </div>

        {/* Top navigation dots */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
          <button className="w-10 h-10 bg-[#c9a870] rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
          </button>
          <button className="w-10 h-10 bg-[#c9a870] rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        {/* Bottom Left - User Info */}
        <div className="absolute bottom-0 left-0 right-24 p-4 pb-6 z-20">
          {/* User header */}
          <div className="flex items-center gap-2 mb-3">
            <img 
              src={reelData.avatar}
              alt={reelData.username}
              className="w-8 h-8 rounded-full border-2 border-white"
            />
            <span className="text-white font-semibold text-sm">{reelData.username}</span>
            <button className="px-3 py-1 border border-white rounded-md text-white text-xs font-semibold">
              {reelData.location}
            </button>
          </div>
          
          {/* Caption */}
          <p className="text-white text-sm mb-3 leading-relaxed">
            {reelData.caption}
          </p>
          
          {/* Audio bar */}
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2 max-w-fit">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-sm flex items-center justify-center animate-spin-slow">
              <Music className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1 overflow-hidden max-w-[200px]">
              <div className="text-white text-xs whitespace-nowrap animate-scroll">
                {reelData.audioText}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="absolute bottom-32 right-3 flex flex-col gap-5 z-20">
          {/* Profile picture with plus */}
          <div className="relative flex flex-col items-center mb-2">
            <img 
              src={reelData.avatar}
              alt={reelData.username}
              className="w-11 h-11 rounded-full border-2 border-white"
            />
            <div className="absolute -bottom-2 w-6 h-6 bg-[#7b2030] rounded-full flex items-center justify-center border-2 border-black">
              <span className="text-white text-xs font-bold">+</span>
            </div>
          </div>

          {/* Like */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="mb-1 transform active:scale-110 transition-transform"
            >
              <Heart 
                className={`w-7 h-7 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                strokeWidth={1.5}
              />
            </button>
            <span className="text-white text-xs">{reelData.likes}</span>
          </div>

          {/* Comment */}
          <div className="flex flex-col items-center">
            <button className="mb-1 transform active:scale-110 transition-transform">
              <MessageCircle className="w-7 h-7 text-white" strokeWidth={1.5} />
            </button>
            <span className="text-white text-xs">{reelData.comments}</span>
          </div>

          {/* Share/Send */}
          <div className="flex flex-col items-center">
            <button className="mb-1 transform active:scale-110 transition-transform">
              <Send className="w-7 h-7 text-white" strokeWidth={1.5} />
            </button>
          </div>

          {/* Save/Bookmark */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className="mb-1 transform active:scale-110 transition-transform"
            >
              <Bookmark 
                className={`w-7 h-7 ${isSaved ? 'fill-white text-white' : 'text-white'}`}
                strokeWidth={1.5}
              />
            </button>
          </div>

          {/* More options */}
          <div className="flex flex-col items-center">
            <button className="mb-1">
              <MoreHorizontal className="w-7 h-7 text-white" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Volume Control - Bottom Left */}
        <div className="absolute bottom-6 left-4 z-20">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="bg-black/40 backdrop-blur-sm p-2 rounded-full"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Messages Button - Bottom Right */}
        <button className="absolute bottom-6 right-4 bg-[#7b2030] text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2 z-20 hover:bg-[#5a1820] transition-colors">
          Messages
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Progress bar at top - show current reel index */}
        <div className="absolute top-2 left-4 right-4 flex gap-1 z-20">
          {REELS_DATA.map((_, idx) => (
            <div key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div className={`h-full ${idx === currentIndex ? 'w-full bg-white' : idx < currentIndex ? 'w-full bg-white/60' : 'w-0 bg-white'} transition-all duration-300`} />
            </div>
          ))}
        </div>

        {/* "More from Mazen Mohamed" section - appears at bottom when last reel or on scroll */}
        {currentIndex === REELS_DATA.length - 1 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pb-20 z-10">
            <div className="text-white mb-3">
              <div className="flex items-center gap-2 mb-2">
                <img src={reelData.avatar} alt={reelData.username} className="w-8 h-8 rounded-full" />
                <span className="font-semibold text-sm">More from {reelData.username}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {REELS_DATA.slice(0, 6).map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => setCurrentIndex(i)}
                  className="aspect-[9/16] relative rounded overflow-hidden"
                >
                  <img src={r.image} alt={r.caption} className="w-full h-full object-cover" />
                  <div className="absolute bottom-1 left-1 text-white text-xs flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-white" />
                    <span>{r.likes}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-scroll {
          animation: scroll 10s linear infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Main page wrapper with NavBar, LeftSide, and consistent styling
export default function ReelsPage() {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [activeView, setActiveView] = useState<string>('reels');

  const startUsers = [
    { id: "u1", name: "Aisha Noor", avatar: "https://i.pravatar.cc/80?img=21" },
    { id: "u2", name: "Bilal Y", avatar: "https://i.pravatar.cc/80?img=17" },
    { id: "u3", name: "Sara Ali", avatar: "https://i.pravatar.cc/80?img=11" },
    { id: "u4", name: "Omar Faruk", avatar: "https://i.pravatar.cc/80?img=12" },
    { id: "u5", name: "Layla Noor", avatar: "https://i.pravatar.cc/80?img=13" },
  ];

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

      {/* Main content: Reels */}
      <main className="w-full">
        <InstagramReels />
      </main>

      {/* Floating Messages button */}
      <div className="fixed right-8 bottom-8 z-50">
        <Button
          aria-label="Quick action"
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

// Also export a named component so other pages (user page) can embed it
export const ReelsComponent = InstagramReels;