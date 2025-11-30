"use client";
import React from "react";
import Image from "next/image";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
}

export default function Leaderboard({ entries, currentUserRank = 1 }: LeaderboardProps) {
  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="bg-[#7b2030] text-white rounded-t-lg">
        <div className="grid grid-cols-[80px_1fr_120px] px-4 py-3">
          <div className="text-sm font-semibold">Rank</div>
          <div className="text-sm font-semibold text-center">Name</div>
          <div className="text-sm font-semibold text-right">Points</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="bg-white border border-t-0 border-[#f0e6e5] rounded-b-lg divide-y divide-[#f0e6e5]">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={`grid grid-cols-[80px_1fr_120px] px-4 py-3 items-center ${
              entry.isCurrentUser ? "bg-[#fff0ed]" : "hover:bg-gray-50"
            }`}
          >
            {/* Rank */}
            <div className={`text-sm font-medium ${entry.isCurrentUser ? "text-[#7b2030]" : "text-[#7b2030]"}`}>
              #{entry.rank}
            </div>

            {/* Name with Avatar */}
            <div className="flex items-center justify-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={entry.avatar}
                  alt={entry.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <span className={`text-sm ${entry.isCurrentUser ? "font-semibold text-[#7b2030]" : "text-gray-700"}`}>
                {entry.name}
                {entry.isCurrentUser && " (You)"}
              </span>
            </div>

            {/* Points */}
            <div className={`text-sm text-right ${entry.isCurrentUser ? "font-semibold text-[#7b2030]" : "text-[#c9a227]"}`}>
              {entry.points} Points
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
