"use client";

import React from "react";

interface TabNavigationProps {
  activeTab: "mosques" | "rooms" | "preachers";
  onTabChange: (tab: "mosques" | "rooms" | "preachers") => void;
}

const tabs = [
  { id: "mosques" as const, label: "Mosques", icon: "🕌" },
  { id: "rooms" as const, label: "Rooms", icon: "📡" },
  { id: "preachers" as const, label: "Preachers", icon: "👤" },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="flex bg-gray-50 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-all border-b-3 ${
            activeTab === tab.id
              ? "text-indigo-600 border-b-2 border-indigo-600 bg-white"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-b-2 border-transparent"
          }`}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
