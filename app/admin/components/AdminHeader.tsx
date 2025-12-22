"use client";

import React from "react";

interface AdminHeaderProps {
  onLogout: () => void;
}

export function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🕌</span>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-indigo-200 text-sm">Mosque Live Streaming Management</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all border border-white/30"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
