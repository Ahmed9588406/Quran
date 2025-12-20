"use client";
import React from "react";
import Image from "next/image";
import { Menu, Bell, Search, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  userName: string;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
};

export default function AdminNavbar({ userName, onToggleSidebar, isSidebarOpen }: Props) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    router.replace("/login");
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between shrink-0 z-50">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-[#8A1538]" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 relative">
            <Image
              src="/figma-assets/logo_wesal.png"
              alt="Wesal Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg font-semibold text-[#8A1538]">Admin Dashboard</span>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search streams, mosques..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-[#FFF9F3] text-sm focus:outline-none focus:border-[#8A1538] transition-colors"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-50 rounded-lg relative" aria-label="Notifications">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-[#8A1538] flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-[#231217]">{userName}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5 text-red-600" />
        </button>
      </div>
    </nav>
  );
}
