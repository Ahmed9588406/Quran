"use client";
import React from "react";

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

export default function Leaderboard({ entries, currentUserRank }: LeaderboardProps) {
  return (
    <div className="bg-white rounded-lg border border-[#f0e6e5] p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Leaderboard</h2>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-4 p-3 rounded-lg ${
              entry.isCurrentUser ? "bg-[#fff5f6]" : "hover:bg-gray-50"
            }`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                entry.rank === 1
                  ? "bg-yellow-400 text-yellow-900"
                  : entry.rank === 2
                  ? "bg-gray-300 text-gray-700"
                  : entry.rank === 3
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {entry.rank}
            </span>

            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              <img
                src={entry.avatar}
                alt={entry.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{entry.name}</p>
            </div>

            <span className="text-sm font-semibold text-[#7b2030]">
              {entry.points} pts
            </span>
          </div>
        ))}
      </div>

      {currentUserRank && currentUserRank > entries.length && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Your rank: #{currentUserRank}
          </p>
        </div>
      )}
    </div>
  );
}
