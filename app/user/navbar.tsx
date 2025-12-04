"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Menu, Moon, MessageCircle, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
const NotificationPanel = dynamic(() => import("./notification"), { ssr: false });
const ProfileModal = dynamic(() => import("./profile_modal"), { ssr: false });
const AskImamModal = dynamic(() => import("./askimam"), { ssr: false });
const SheikhModal = dynamic(() => import("./sheikh_modal"), { ssr: false });

export default function NavBar({
  onToggleSidebar,
  isSidebarOpen,
  onOpenMessages, // added optional prop
}: {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenMessages?: () => void; // new type
}) {
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isAskOpen, setAskOpen] = useState(false);

  // simple theme toggle that adds/removes `dark` on <html> and persists to localStorage
  const toggleTheme = () => {
    try {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch (e) {
      // ignore (SSR or security)
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#fff6f3] border-b border-[#f0e6e5]">
      <div className="w-full px-6 lg:px-8"> {/* increased horizontal padding */}
        <div className="flex items-center justify-between h-16"> {/* increased header height */}
          {/* Left: menu button + logo - pushed to extreme left */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => onToggleSidebar?.()}
              aria-expanded={!!isSidebarOpen}
              className="p-3 rounded-md text-gray-600 hover:bg-gray-100" /* larger hit area */
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/app/user" className="block w-12 h-12 relative"> {/* bigger logo */}
              <Image
                src="/figma-assets/logo_wesal.png"
                alt="WESAL"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </Link>
          </div>

          {/* Center: search - takes available space */}
          <div className="flex-1 flex justify-center px-6 max-w-2xl mx-auto">
            <div className="w-full">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </span>
                <input
                  aria-label="Search"
                  placeholder="Search"
                  className="w-full h-11 rounded-full pl-12 pr-12 bg-gray-50 text-base text-gray-700 placeholder-gray-400 border border-transparent focus:outline-none focus:ring-0" /* taller input & larger text */
                />
                <button
                  aria-hidden
                  className="absolute inset-y-0 right-2 flex items-center px-3 text-gray-400"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right: icons - pushed to extreme right */}
          <nav className="flex items-center gap-2 flex-shrink-0 relative">
            {/* Language pill */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#f0e6e5] bg-[#fff6f3] text-[#7b2030] text-sm font-medium hover:bg-gray-50"
              onClick={() => setAskOpen(true)}
            >
              <span>Ask Imam ?</span>
            </button>

            {/* Dark mode toggle */}
            <button
              aria-label="Toggle theme"
              className="p-3 rounded-full text-gray-600 hover:bg-gray-100"
              onClick={toggleTheme}
            >
              <Moon className="w-6 h-6" />
            </button>

            {/* Messages / chat */}
            <button aria-label="Messages" className="p-3 rounded-full text-gray-600 hover:bg-gray-100"
              onClick={() => onOpenMessages?.()}
            >
              <MessageCircle className="w-6 h-6" />
            </button>

            {/* Notifications with small badge */}
            <button
              aria-label="Notifications"
              onClick={() => setNotifOpen((s) => !s)}
              className="relative p-3 rounded-full text-gray-600 hover:bg-gray-100"
              type="button"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-[7px] py-[2px] text-[11px] font-semibold leading-none text-white bg-[#ff6b6b] rounded-full">3</span>
            </button>

            {/* Notification panel */}
            <div className="absolute right-0 top-14 z-50">
              <NotificationPanel isOpen={isNotifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            {/* Profile avatar (opens modal on click) */}
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="ml-2 w-10 h-10 rounded-full overflow-hidden relative shadow-sm ring-1 ring-[#f0e6e5]"
              aria-label="Open profile"
            >
              <Image
                src="/icons/settings/profile.png"
                alt="Profile"
                fill
                style={{ objectFit: "cover" }}
              />
            </button>

            {/* Profile modal - positioned like notifications (dropdown) */}
            <div className="absolute right-0 top-14 z-50">
              <ProfileModal isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} />
            </div>
          </nav>
        </div>
      </div>

      {/* Ask Imam modal (global trigger) */}
      <AskImamModal isOpen={isAskOpen} onClose={() => setAskOpen(false)} />
      {/* Sheikh chooser modal (opened via event or global fn) */}
      <SheikhModal />
    </header>
  );
}
