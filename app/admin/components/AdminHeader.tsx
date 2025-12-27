"use client";

import React from "react";

interface AdminHeaderProps {
  onLogout: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  stats?: { mosques: number; rooms: number; preachers: number };
}

export function AdminHeader({ onLogout, onRefresh, refreshing, stats }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8A1538] to-[#6d1029] flex items-center justify-center shadow-lg shadow-[#8A1538]/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Mosque Live Streaming</p>
            </div>
          </div>

          {/* Stats Pills */}
          {stats && (
            <div className="hidden md:flex items-center gap-3">
              <StatPill icon="🕌" value={stats.mosques} label="Mosques" color="burgundy" />
              <StatPill icon="📡" value={stats.rooms} label="Rooms" color="burgundy" />
              <StatPill icon="👤" value={stats.preachers} label="Preachers" color="burgundy" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-sm text-gray-600 hover:text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data"
              >
                <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8A1538] hover:bg-[#6d1029] text-white transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatPill({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  const colorClasses = {
    burgundy: "bg-[#8A1538]/10 text-[#8A1538] border-[#8A1538]/20",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cyan: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    violet: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  }[color] || "bg-gray-500/10 text-gray-600 border-gray-500/20";

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClasses}`}>
      <span className="text-sm">{icon}</span>
      <span className="font-semibold text-sm">{value}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}
