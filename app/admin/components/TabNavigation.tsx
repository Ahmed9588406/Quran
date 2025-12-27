"use client";

import React from "react";

interface TabNavigationProps {
  activeTab: "mosques" | "rooms" | "preachers";
  onTabChange: (tab: "mosques" | "rooms" | "preachers") => void;
}

const tabs = [
  { 
    id: "mosques" as const, 
    label: "Mosques", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: "burgundy"
  },
  { 
    id: "rooms" as const, 
    label: "Rooms", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
    color: "burgundy"
  },
  { 
    id: "preachers" as const, 
    label: "Preachers", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: "burgundy"
  },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-2 p-1 bg-white rounded-2xl border border-gray-200 shadow-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const colorClasses = {
          burgundy: isActive ? "bg-[#8A1538] text-white shadow-md" : "",
          emerald: isActive ? "bg-emerald-500 text-white shadow-md" : "",
          cyan: isActive ? "bg-cyan-500 text-white shadow-md" : "",
          violet: isActive ? "bg-violet-500 text-white shadow-md" : "",
        }[tab.color] || "";

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              isActive
                ? colorClasses
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
