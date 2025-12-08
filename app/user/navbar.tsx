/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Menu, Moon, MessageCircle, Search } from "lucide-react";
import dynamic from "next/dynamic";
const NotificationPanel = dynamic(() => import("./notification"), { ssr: false });
const ProfileModal = dynamic(() => import("./profile_modal"), { ssr: false });
const AskImamModal = dynamic(() => import("./askimam"), { ssr: false });
const SheikhModal = dynamic(() => import("./sheikh_modal"), { ssr: false });

type User = {
  id: string;
  username?: string;
  email?: string;
  role?: string;
  display_name?: string;
  avatar_url?: string;
};

export default function NavBar({
  onToggleSidebar,
  isSidebarOpen,
  onOpenMessages,
  currentUser,
}: {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenMessages?: () => void;
  currentUser?: User | null;
}) {
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isAskOpen, setAskOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string>("/icons/settings/profile.png");

  useEffect(() => {
    if (currentUser && currentUser.avatar_url) {
      setAvatarSrc(currentUser.avatar_url.startsWith("http") ? currentUser.avatar_url : `http://192.168.1.18:9001${currentUser.avatar_url}`);
      return;
    }
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const avatar = parsed?.avatar_url;
      if (!avatar) return;
      const BACKEND_BASE = "http://192.168.1.18:9001";
      const src = avatar.startsWith("http") ? avatar : `${BACKEND_BASE}${avatar}`;
      setAvatarSrc(src);
    } catch (e) { /* ignore */ }
  }, [currentUser]);

  const toggleTheme = () => {
    try {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch (e) { /* ignore */ }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#fff6f3] border-b border-[#f0e6e5]">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: menu button + logo */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => onToggleSidebar?.()}
              aria-expanded={!!isSidebarOpen}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/user" className="block w-8 h-8 sm:w-10 sm:h-10 relative">
              <Image src="/figma-assets/logo_wesal.png" alt="WESAL" fill style={{ objectFit: "contain" }} priority />
            </Link>
          </div>

          {/* Center: search - hidden on mobile, visible on sm+ */}
          <div className="hidden sm:flex flex-1 justify-center px-4 max-w-md lg:max-w-xl mx-auto">
            <div className="w-full">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  aria-label="Search"
                  placeholder="Search"
                  className="w-full h-9 sm:h-10 rounded-full pl-9 pr-4 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 border border-transparent focus:outline-none focus:ring-1 focus:ring-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Right: icons */}
          <nav className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 relative">
            {/* Search icon on mobile */}
            <button aria-label="Search" className="p-2 rounded-full text-gray-600 hover:bg-gray-100 sm:hidden">
              <Search className="w-5 h-5" />
            </button>

            {/* Ask Imam - hidden on small screens */}
            <button
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#f0e6e5] bg-[#fff6f3] text-[#7b2030] text-sm font-medium hover:bg-gray-50"
              onClick={() => setAskOpen(true)}
            >
              <span>Ask Imam ?</span>
            </button>

            {/* Dark mode - hidden on very small screens */}
            <button aria-label="Toggle theme" className="hidden sm:flex p-2 rounded-full text-gray-600 hover:bg-gray-100" onClick={toggleTheme}>
              <Moon className="w-5 h-5" />
            </button>

            {/* Messages - hidden on mobile (use floating button) */}
            <button aria-label="Messages" className="hidden md:flex p-2 rounded-full text-gray-600 hover:bg-gray-100" onClick={() => onOpenMessages?.()}>
              <MessageCircle className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button aria-label="Notifications" onClick={() => setNotifOpen((s) => !s)} className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100" type="button">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-[#ff6b6b] rounded-full">3</span>
            </button>

            <div className="absolute right-0 top-12 sm:top-14 z-50">
              <NotificationPanel isOpen={isNotifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            {/* Profile avatar */}
            <button type="button" onClick={() => setProfileOpen(true)} className="ml-1 w-8 h-8 rounded-full overflow-hidden relative shadow-sm ring-1 ring-[#f0e6e5]" aria-label="Open profile">
              <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
            </button>

            <div className="absolute right-0 top-12 sm:top-14 z-50">
              <ProfileModal isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} />
            </div>
          </nav>
        </div>
      </div>

      <AskImamModal isOpen={isAskOpen} onClose={() => setAskOpen(false)} />
      <SheikhModal />
    </header>
  );
}
