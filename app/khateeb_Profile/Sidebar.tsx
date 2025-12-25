/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Settings, Users, Monitor, Video, FileText, BookOpen, BarChart2, Archive, MessageCircle, User, LogOut, Film } from "lucide-react";
import Link from "next/link";

interface PreacherInfo {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export default function Sidebar({
  isOpen = false,
  onClose,
  onNavigate,
  activeView,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (view: string) => void;
  activeView?: string;
  onOpenScan?: () => void;
}) {
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
      console.error("[Sidebar] Error parsing user data:", e);
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
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("preacher_credentials");
    router.push("/login");
  };

  // Handle view profile
  const handleViewProfile = () => {
    setShowProfileModal(false);
    onClose?.();
    if (preacherInfo.id) {
      router.push(`/khateeb_Profile/${preacherInfo.id}`);
    } else {
      router.push("/khateeb_Profile");
    }
  };

  // menu items
  const menuItems = [
    { id: "community", label: "Community", icon: <Users className="w-5 h-5" />, href: "/khateb_Studio/community" },
    { id: "studio", label: "Khateeb Studio", icon: <Monitor className="w-5 h-5" />, href: "/khateb_Studio", highlight: true },
    { id: "reels", label: "Reels", icon: <Film className="w-5 h-5" />, href: "/khateb_Studio/reels" },
    { id: "go_live", label: "Go Live", icon: <Video className="w-5 h-5" />, href: "/go-live" },
    { id: "content", label: "Content", icon: <FileText className="w-5 h-5" />, href: "/Schedual/previous_khotbas" },
    { id: "fatwas", label: "Fatwas", icon: <BookOpen className="w-5 h-5" />, href: "/khateb_Studio/fatwas" },
    { id: "archive", label: "Archive", icon: <Archive className="w-5 h-5" />, href: "/archive" },
  ];

  return (
    <>
      {/* Overlay when expanded */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed left-0 right-0 top-14 bottom-0 bg-black/40 z-30"
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={`fixed top-14 left-0 bottom-0 z-40 bg-[#FFF9F3] border-r border-[#F7E9CF] flex flex-col justify-between py-4 transition-all duration-300 ${isOpen ? "w-72" : "w-16"}`}
      >
        {/* Preacher Profile Section at Top */}
        {isOpen && (
          <div className="px-4 pb-4 border-b border-[#F7E9CF]" ref={modalRef}>
            <button
              onClick={() => setShowProfileModal(!showProfileModal)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F7E9CF] transition-colors"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#8A1538]/20 flex-shrink-0">
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
                  <div className="w-full h-full bg-[#8A1538] flex items-center justify-center text-white font-semibold">
                    {preacherInfo.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-gray-900 truncate text-sm">{preacherInfo.name}</p>
                <p className="text-xs text-[#8A1538] capitalize">{preacherInfo.role}</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showProfileModal ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {showProfileModal && (
              <div className="mt-2 bg-white rounded-lg shadow-lg border border-[#f0e6e5] overflow-hidden">
                <button
                  onClick={handleViewProfile}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-gray-700 hover:bg-[#FFF9F3] transition-colors"
                >
                  <User className="w-5 h-5 text-[#8A1538]" />
                  <span className="text-sm font-medium">View Profile</span>
                </button>
                <div className="border-t border-[#f0e6e5]" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Log Out</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Collapsed state - show avatar only */}
        {!isOpen && (
          <div className="flex justify-center pb-4 border-b border-[#F7E9CF]">
            <button
              onClick={() => {
                if (preacherInfo.id) {
                  router.push(`/khateeb_Profile/${preacherInfo.id}`);
                }
              }}
              className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#8A1538]/20 hover:ring-[#8A1538]/40 transition-all"
              title={preacherInfo.name}
            >
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
                <div className="w-full h-full bg-[#8A1538] flex items-center justify-center text-white font-semibold text-sm">
                  {preacherInfo.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          </div>
        )}

        {/* Nav menu */}
        <nav className={`flex-1 flex flex-col gap-3 mt-4 ${isOpen ? "w-full px-4" : "items-center"}`}>
          {menuItems.map((item) => {
            const active = activeView === item.id || activeView === item.href?.replace("/", "") || (item.id === "studio" && activeView === "khateb_Studio");
            const isHighlighted = item.highlight || active;
            const base = isOpen
              ? `flex items-center justify-between w-full p-4 rounded-lg ${isHighlighted ? "bg-[#F7E9CF] text-[#8A1538]" : "text-[#4D4D4D] hover:bg-gray-100"}`
              : `w-12 h-12 flex items-center justify-center rounded-lg ${isHighlighted ? "bg-[#F7E9CF] text-[#8A1538]" : "text-gray-600 hover:bg-gray-100"}`;

            return item.href ? (
              <Link key={item.id} href={item.href} onClick={() => { onNavigate?.(item.id); if (!isOpen) onClose?.(); }}>
                <div className={base}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6">{item.icon}</div>
                    {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </div>
                </div>
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => { onNavigate?.(item.id); onClose?.(); }}
                className={base}
                aria-current={active ? "page" : undefined}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6">{item.icon}</div>
                  {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom: settings + feedback */}
        <div className={`flex flex-col gap-3 mb-3 ${isOpen ? "w-full px-4" : "items-center"}`}>
          <Link href="/settings">
            <div className={`flex items-center gap-3 rounded-lg transition-colors ${isOpen ? "w-full p-3" : "w-10 h-10 justify-center"} text-gray-600 hover:bg-gray-100`}>
              <Settings className="w-6 h-6" />
              {isOpen && <span className="text-sm">Settings</span>}
            </div>
          </Link>

          
        </div>
      </aside>
    </>
  );
}
