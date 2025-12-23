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
    color: "emerald"
  },
  { 
    id: "rooms" as const, 
    label: "Rooms", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
    color: "cyan"
  },
  { 
    id: "preachers" as const, 
    label: "Preachers", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: "violet"
  },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const colorClasses = {
          emerald: isActive ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10" : "",
          cyan: isActive ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10" : "",
          violet: isActive ? "bg-violet-500/20 text-violet-400 border-violet-500/30 shadow-violet-500/10" : "",
        }[tab.color] || "";

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              isActive
                ? `${colorClasses} border shadow-lg`
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
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
