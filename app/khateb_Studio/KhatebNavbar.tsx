"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Menu, Moon, MessageCircle, Search as SearchIcon } from "lucide-react";

type Props = {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenMessages?: () => void;
  onProfileClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onCreateClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // changed: pass event to parent
};

export default function KhatebNavbar({ onToggleSidebar, isSidebarOpen, onOpenMessages, onProfileClick, onCreateClick }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#fff6f3] border-b border-[#f0e6e5]">
      <div className="w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => onToggleSidebar?.()}
              aria-expanded={!!isSidebarOpen}
              className="p-3 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="block w-12 h-12 relative">
              <Image src="/figma-assets/logo_wesal.png" alt="WESAL" fill style={{ objectFit: "contain" }} priority />
            </Link>
          </div>

          <div className="flex-1 flex justify-center px-6 max-w-2xl mx-auto">
            <div className="w-full">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <SearchIcon className="w-5 h-5" />
                </span>
                <input
                  aria-label="Search"
                  placeholder="Search"
                  className="w-full h-11 rounded-full pl-12 pr-12 bg-gray-50 text-base text-gray-700 placeholder-gray-400 border border-transparent focus:outline-none focus:ring-0"
                />
                <button aria-hidden className="absolute inset-y-0 right-2 flex items-center px-3 text-gray-400">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-2 shrink-0 relative">
            <button
              id="khateb-create-btn" // added id for measurement
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#f0e6e5] bg-[#EFDEBC] text-[#7b2030] text-sm font-medium hover:bg-gray-50"
              type="button"
              onClick={(e) => onCreateClick?.(e)} // forward event
            >
              <span>Create</span>
              <span className="flex items-center justify-center w-6 h-6   text-[#7b2030]">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            <button aria-label="Toggle theme" className="p-3 rounded-full text-gray-600 hover:bg-gray-100">
              <Moon className="w-6 h-6" />
            </button>

            <button aria-label="Messages" className="p-3 rounded-full text-gray-600 hover:bg-gray-100" onClick={() => onOpenMessages?.()}>
              <MessageCircle className="w-6 h-6" />
            </button>

            <button aria-label="Notifications" className="relative p-3 rounded-full text-gray-600 hover:bg-gray-100" type="button">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-[7px] py-0.5 text-[11px] font-semibold leading-none text-white bg-[#ff6b6b] rounded-full">3</span>
            </button>

            <button id="khateb-avatar-btn" type="button" onClick={(e) => onProfileClick?.(e)} className="ml-2 w-10 h-10 rounded-full overflow-hidden relative shadow-sm ring-1 ring-[#f0e6e5]" aria-label="Open profile">
              <Image src="/icons/settings/profile.png" alt="Profile" fill style={{ objectFit: "cover" }} />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
