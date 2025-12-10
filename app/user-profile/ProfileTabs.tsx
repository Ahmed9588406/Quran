"use client";
import React from "react";
import { MoreHorizontal } from "lucide-react";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSavedView?: boolean;
}

export default function ProfileTabs({
  activeTab,
  onTabChange,
  isSavedView = false,
}: ProfileTabsProps) {
  const tabs = [
    { id: "posts", label: "Posts", icon: "📝" },
    { id: "photos", label: "Photos", icon: "🖼️" },
    { id: "reels", label: "Reels", icon: "🎬" },
    ...(isSavedView ? [{ id: "saved", label: "Saved", icon: "🔖" }] : []),
  ];

  console.log("ProfileTabs: Rendering with tabs", {
    activeTab,
    tabs: tabs.map((t) => t.id),
    isSavedView,
  });

  return (
    <div className="border-b border-gray-200 sticky top-0 bg-white z-40">
      <div className="max-w-4xl mx-auto px-6 flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              console.log("ProfileTabs: Tab clicked", { tabId: tab.id });
              onTabChange(tab.id);
            }}
            className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#7b2030] text-[#7b2030]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
