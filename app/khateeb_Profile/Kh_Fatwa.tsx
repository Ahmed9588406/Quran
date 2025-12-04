"use client";
import React from "react";
import Image from "next/image";

interface FatwaEntry {
  id: string;
  author: { name: string; avatar: string };
  time: string;
  content: string;
  media?: { type: "image" | "video"; src: string; thumbnail?: string };
  points?: number;
  isCurrentUser?: boolean;
}

interface FatwaProps {
  entries: FatwaEntry[];
}

export default function Fatwa({ entries }: FatwaProps) {
  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className={`bg-white rounded-lg border border-[#f0e6e5] overflow-hidden shadow-sm ${
            entry.isCurrentUser ? "ring-1 ring-[#7b2030]/20" : ""
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={entry.author.avatar}
                  alt={entry.author.name}
                  width={40}
                  height={40}
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {entry.author.name}
                  </span>
                  <span className="text-xs text-gray-500">• {entry.time}</span>
                </div>
                {entry.points !== undefined && (
                  <div className="text-xs text-[#c9a227] mt-0.5">
                    {entry.points} points
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-full text-sm bg-[#7b2030] text-white hover:bg-[#5e0e27]">
                Follow
              </button>
              <button
                aria-label="More"
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
              {entry.content}
            </p>

            {/* Media */}
            {entry.media?.type === "image" && (
              <div className="w-full rounded-lg overflow-hidden mb-3">
                <Image
                  src={entry.media.src}
                  alt="fatwa media"
                  width={1200}
                  height={700}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 hover:text-[#7b2030]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21l-1-1a7 7 0 01-5-6.5V7a5 5 0 115 5h0"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Like
                </button>
                <button className="flex items-center gap-2 hover:text-[#7b2030]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h12a2 2 0 012 2z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Comment
                </button>
                <button className="flex items-center gap-2 hover:text-[#7b2030]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 12v7a1 1 0 001 1h7M20 4v7a1 1 0 01-1 1h-7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Share
                </button>
              </div>

              <div className="text-xs text-gray-400">Fatwa • Khateeb</div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
