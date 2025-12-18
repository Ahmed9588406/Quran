"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Menu, Moon, MessageCircle, Search as SearchIcon, User, LogOut } from "lucide-react";

type Props = {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenMessages?: () => void;
  onProfileClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onCreateClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

interface PreacherInfo {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export default function KhatebNavbar({ onToggleSidebar, isSidebarOpen, onOpenMessages, onCreateClick }: Props) {
  const router = useRouter();
  const [preacherInfo, setPreacherInfo] = useState<PreacherInfo>({
    id: "",
    name: "Preacher",
    avatar: "",
    role: "preacher",
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load preacher info from localStorage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      const userId = localStorage.getItem("user_id");
      
      if (userStr) {
        const user = JSON.parse(userStr);
        const firstName = user.firstName || user.first_name || user.name?.split(' ')[0] || '';
        const lastName = user.lastName || user.last_name || user.name?.split(' ').slice(1).join(' ') || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const avatar = user.profilePictureUrl || user.profile_picture_url || user.avatar || user.avatar_url || '';
        const role = user.role || 'preacher';
        
        setPreacherInfo({
          id: userId || user.id || '',
          name: fullName || user.username || "Preacher",
          avatar: avatar,
          role: role,
        });
      }
    } catch (e) {
      console.error("[KhatebNavbar] Error parsing user data:", e);
    }
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowProfileModal(false);
      }
    };

    if (showProfileModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileModal]);

  // Handle logout
  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("preacher_credentials");
    
    // Redirect to login
    router.push("/login");
  };

  // Handle view profile
  const handleViewProfile = () => {
    setShowProfileModal(false);
    if (preacherInfo.id) {
      router.push(`/khateeb_Profile/${preacherInfo.id}`);
    } else {
      router.push("/khateeb_Profile");
    }
  };

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
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-2 shrink-0 relative">
            <button
              id="khateb-create-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#f0e6e5] bg-[#EFDEBC] text-[#7b2030] text-sm font-medium hover:bg-gray-50"
              type="button"
              onClick={(e) => onCreateClick?.(e)}
            >
              <span>Create</span>
              <span className="flex items-center justify-center w-6 h-6 text-[#7b2030]">
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

            {/* Profile Section with Name */}
            <div className="relative ml-2" ref={modalRef}>
              <button
                id="khateb-avatar-btn"
                type="button"
                onClick={() => setShowProfileModal(!showProfileModal)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Open profile menu"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden relative shadow-sm ring-1 ring-[#f0e6e5]">
                  {preacherInfo.avatar ? (
                    <img
                      src={preacherInfo.avatar}
                      alt={preacherInfo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/icons/settings/profile.png";
                      }}
                    />
                  ) : (
                    <Image src="/icons/settings/profile.png" alt="Profile" fill style={{ objectFit: "cover" }} />
                  )}
                </div>
                <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {preacherInfo.name}
                </span>
              </button>

              {/* Profile Dropdown Modal */}
              {showProfileModal && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#f0e6e5] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info Header */}
                  <div className="p-4 bg-gradient-to-r from-[#FFF9F3] to-[#fff6f3] border-b border-[#f0e6e5]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#8A1538]/20">
                        {preacherInfo.avatar ? (
                          <img
                            src={preacherInfo.avatar}
                            alt={preacherInfo.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/icons/settings/profile.png";
                            }}
                          />
                        ) : (
                          <Image src="/icons/settings/profile.png" alt="Profile" width={48} height={48} style={{ objectFit: "cover" }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{preacherInfo.name}</p>
                        <p className="text-xs text-[#8A1538] capitalize">{preacherInfo.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="p-2">
                    <button
                      onClick={handleViewProfile}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-gray-700 hover:bg-[#FFF9F3] rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5 text-[#8A1538]" />
                      <span className="text-sm font-medium">View Profile</span>
                    </button>
                    
                    <div className="my-1 border-t border-[#f0e6e5]" />
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="text-sm font-medium">Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
