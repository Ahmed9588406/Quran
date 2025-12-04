"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";

type LiveItem = {
  id: string;
  title: string;
  author: string;
  avatar?: string;
  src?: string;
  duration: string;
  playedPercent?: number; // 0-100
  time?: string;
};

const SAMPLE_LIVES: LiveItem[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `l${i + 1}`,
  title: "Principles of Fiqh",
  author: "Imam mohamed elshiekh",
  avatar: "/icons/settings/profile.png",
  duration: "47:32",
  time: "12:15",
  playedPercent: Math.round(Math.random() * 60),
}));

export default function KhOldLive() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const togglePlay = (item: LiveItem) => {
    const current = audioRefs.current[item.id];
    if (!current) return;
    if (playingId && playingId !== item.id) {
      // pause other audio
      const prev = audioRefs.current[playingId];
      prev?.pause();
    }
    if (current.paused) {
      current.play();
      setPlayingId(item.id);
    } else {
      current.pause();
      setPlayingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="mt-4 space-y-4">
        {SAMPLE_LIVES.map((item) => (
          <div
            key={item.id}
            className="bg-[#F7E9CF] border border-[#f0e6e5] rounded-lg p-3 flex items-center gap-4"
          >
            {/* play button + hidden audio */}
            <div className="flex flex-col items-center w-16">
              <button
                onClick={() => togglePlay(item)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#7b2030]"
                aria-label={playingId === item.id ? "Pause" : "Play"}
              >
                {playingId === item.id ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
                  </svg>
                )}
              </button>

              {/* small time under button */}
              <div className="text-[12px] text-gray-600 mt-2">{item.time}</div>

              {/* hidden audio element for simple playback - only render when src exists */}
              {item.src ? (
                <audio
                  ref={(el) => {
                    audioRefs.current[item.id] = el;
                  }}
                  src={item.src}
                />
              ) : null}
            </div>

            {/* main info + progress */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.author}</div>
                </div>
                <div className="text-xs text-gray-600">{item.duration}</div>
              </div>

              {/* progress bar */}
              <div className="mt-3">
                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#f0e6e5]">
                  <div
                    className="h-full bg-[#7b2030]"
                    style={{ width: `${item.playedPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* bookmark icon */}
            <div className="w-10 flex justify-end">
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 2h10a1 1 0 011 1v18l-6-3-6 3V3a1 1 0 011-1z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
