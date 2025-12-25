"use client";
import React from "react";
import { Bookmark, Play } from "lucide-react";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOwnProfile?: boolean;
}

export default function ProfileTabs({
  activeTab,
  onTabChange,
  isOwnProfile = false,
}: ProfileTabsProps) {
  const tabs = [
    { id: "posts", label: "Posts", icon: "📝" },
    { id: "photos", label: "Photos", icon: "🖼️" },
    { id: "reels", label: "Reels", icon: "🎬" },
    { id: "stories", label: "Stories", icon: "⭕" },
  ];

  return (
    <div className="border-b border-gray-200 sticky top-0 bg-white">
      <div className="max-w-4xl mx-auto px-6 flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#7b2030] text-[#7b2030]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        
        {/* Saved tab - only visible on own profile */}
        {isOwnProfile && (
          <button
            onClick={() => onTabChange("saved")}
            className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === "saved"
                ? "border-[#7b2030] text-[#7b2030]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${activeTab === "saved" ? "fill-[#7b2030]" : ""}`} />
            Saved
          </button>
        )}
      </div>
    </div>
  );
}
