"use client";
import React from "react";
import { MoreHorizontal } from "lucide-react";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "posts", label: "Posts" },
  { id: "photos", label: "Photos" },
  { id: "reels", label: "Reels" },
  { id: "favorites", label: "Favorites" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "about", label: "About" },
  
];

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="border-b border-[#f0e6e5]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-[#7b2030]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7b2030]" />
                )}
              </button>
            ))}
          </nav>

          <button
            aria-label="More options"
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
