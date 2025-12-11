"use client";
import React from "react";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "posts", label: "Posts" },
  { id: "photos", label: "Photos" },
  { id: "reels", label: "Reels" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "about", label: "About" },
];

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="border-b border-[#f0e6e5] bg-white sticky top-16 z-20">
      <div className="max-w-4xl mx-auto px-6">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#7b2030] text-[#7b2030]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
