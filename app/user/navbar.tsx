"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home, Rss, QrCode, Film, BookOpen, Bell, Menu, Moon, MessageCircle, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
const NotificationPanel = dynamic(() => import("./notification"), { ssr: false });

export default function NavBar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [isNotifOpen, setNotifOpen] = useState(false);

  return (
    <header className="w-full bg-[#fff6f3] border-b border-[#f0e6e5]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center h-12">
          {/* Left: menu button + logo */}
          <div className="flex items-center mr-4">
            <button
              aria-label="Toggle menu"
              onClick={() => onToggleSidebar?.()}
              className="p-2 rounded-md mr-2 text-gray-600 hover:bg-gray-100" /* visible on all sizes to toggle LeftSide */
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/app/user" className="block w-10 h-10 relative">
              
                <Image
                  src="/figma-assets/logo_wesal.png"
                  alt="WESAL"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
            
            </Link>
          </div>

          {/* Center: search */}
          <div className="flex-1 flex justify-center px-4">
            <div className="w-full max-w-lg">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </span>
                <input
                  aria-label="Search"
                  placeholder="Search"
                  className="w-full h-9 rounded-full pl-10 pr-10 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 border border-transparent focus:outline-none focus:ring-0"
                />
                <button
                  aria-hidden
                  className="absolute inset-y-0 right-1 flex items-center px-2 text-gray-400"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right: icons - replaced to match reference */}
          <nav className="flex items-center gap-3 ml-4 relative">
             {/* Language pill */}
             <button className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#f0e6e5] bg-[#fff6f3] text-[#7b2030] text-sm font-medium">
               <span>English</span>
               <ChevronRight className="w-4 h-4" />
             </button>

             {/* Dark mode toggle (icon only) */}
             <button aria-label="Toggle theme" className="p-2 rounded-full text-gray-600 hover:bg-gray-50">
               <Moon className="w-5 h-5" />
             </button>

             {/* Messages / chat */}
             <button aria-label="Messages" className="p-2 rounded-full text-gray-600 hover:bg-gray-50">
               <MessageCircle className="w-5 h-5" />
             </button>

            {/* Notifications with small badge */}
            <button
              aria-label="Notifications"
              onClick={() => setNotifOpen((s) => !s)}
              className="relative p-2 rounded-full text-gray-600 hover:bg-gray-50"
              type="button"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-[5px] py-[1px] text-[10px] font-semibold leading-none text-white bg-[#ff6b6b] rounded-full">3</span>
            </button>
            
            {/* Notification panel - positioned under the bell icon */}
            <div className="absolute right-0 top-12 z-50">
              <NotificationPanel isOpen={isNotifOpen} onClose={() => setNotifOpen(false)} />
            </div>

             {/* Profile avatar with subtle ring */}
             <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden relative shadow-sm ring-1 ring-[#f0e6e5]">
                 <Image
                   src="/figma-assets/avatar.png"
                   alt="Profile"
                   fill
                   style={{ objectFit: "cover" }}
                 />
             </Link>
          </nav>

        </div>
      </div>
    </header>
  );
}
