"use client";
import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2, VolumeX, Music } from 'lucide-react';

function InstagramReels() {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const reelData = {
    username: "Mazen Mohamed",
    avatar: "https://i.pravatar.cc/150?img=33",
    caption: "Surat Al-NasraSurat Al-Naqara'Surat Al",
    audioText: "another awesome and relaxs and relaxs and",
    likes: "834",
    comments: "12k",
    location: "Follow"
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Main Reel Container */}
      <div className="relative w-full max-w-[500px] h-full">
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=500&h=900&fit=crop" 
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

        {/* Progress bar at top */}
        <div className="absolute top-2 left-4 right-4 h-0.5 bg-white/30 rounded-full z-20">
          <div className="h-full w-1/3 bg-white rounded-full"></div>
        </div>
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

// export default remains for the /reels route
export default InstagramReels;

// Also export a named component so other pages (user page) can embed it
export const ReelsComponent = InstagramReels;