"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Reel = {
  id: string;
  src: string; // video file url
  thumbnail?: string;
  title?: string;
  author?: { name: string; avatar?: string };
};

interface KhReelsProps {
  reels: Reel[];
}

export default function KhReels({ reels }: KhReelsProps) {
  const [active, setActive] = useState<Reel | null>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({}); // track load failures

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* hide scrollbar and provide utility classes for video sizing */}
      <style>{`
        .kh-hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .kh-hide-scrollbar::-webkit-scrollbar { display: none; } /* Chrome, Safari, Opera */
        /* ensure modal container doesn't crop video */
        .kh-modal-container { max-width: 95vw; max-height: 95vh; }
        .kh-modal-video { width: 100%; height: 85vh; object-fit: contain; }
        .kh-preview-video { width: auto; height: 100%; object-fit: contain; }

        /* Scroll snap so one reel fills the view per scroll */
        .kh-reels-scroll {
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          scroll-padding-block: 0;
        }
        .kh-reel-item {
          scroll-snap-align: center;
          scroll-snap-stop: always;
          flex: 0 0 100%;
          height: 100%;
        }
      `}</style>

      {/* container with vertical scroll; scrollbar hidden via kh-hide-scrollbar
          changed to fixed viewport area and scroll-snap so one video fully visible */}
      <div className="h-[75vh] overflow-y-auto pr-0 kh-hide-scrollbar kh-reels-scroll">
        {/* Vertical list of reels */}
        {reels.map((r) => (
          <div
            key={r.id}
            className="relative rounded-lg overflow-hidden bg-black/5 flex items-stretch kh-reel-item"
          >
            {/* If src missing or previously failed, show placeholder */}
            {(!r.src || failed[r.id]) ? (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-600">
                No preview available
              </div>
            ) : (
              // video preview: plays on hover (muted & looped) - use <source> to ensure browser detects type
              <div className="w-full h-full flex items-center justify-center bg-gray-100 cursor-pointer">
                    <video
                         poster={r.thumbnail}
                         muted
                         loop
                         playsInline
                         preload="metadata"
                         onMouseEnter={(e) => {
                            try {
                                (e.currentTarget as HTMLVideoElement).play();
                            } catch {}
                        }}
                        onMouseLeave={(e) => {
                            try {
                                (e.currentTarget as HTMLVideoElement).pause();
                            } catch {}
                        }}
                        onError={() => setFailed((p) => ({ ...p, [r.id]: true }))}
                        className="kh-preview-video h-full"
                        onClick={() => setActive(r)}
                        tabIndex={0}
                    >
                        <source src={r.src} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}

            {/* overlay info (at bottom of each reel) */}
            <button
              onClick={() => setActive(r)}
              className="absolute left-0 right-0 bottom-0 flex items-end justify-between p-3 bg-gradient-to-t from-black/40 to-transparent text-white"
              aria-label={`Open reel ${r.title ?? r.id}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-xs text-left pr-3 flex-1">
                  <div className="font-semibold text-sm">{r.title ?? "Reel"}</div>
                  {r.author?.name && (
                    <div className="text-[11px] opacity-90">{r.author.name}</div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {r.author?.avatar && (
                    <div className="relative bg-gray-200 rounded-full">
                      <div className="bg-white p-[3px] rounded-full">
                        <Image
                          src={r.author.avatar}
                          alt={r.author.name ?? "avatar"}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>
        ))}

        {/* Modal player */}
        {active && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setActive(null)} />
            <div className="relative w-full kh-modal-container mx-auto rounded-lg overflow-visible bg-black">
              <button
                onClick={() => setActive(null)}
                className="absolute top-3 right-3 z-20 bg-white/10 text-white rounded-full p-2 hover:bg-white/20"
                aria-label="Close"
              >
                ✕
              </button>

              {/* modal uses source to ensure type is recognized and kh-modal-video to avoid cropping */}
              <div className="flex justify-center items-center bg-black">
                <video
                  controls
                  autoPlay
                  className="kh-modal-video"
                >
                  <source src={active.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="p-4 bg-white">
                <div className="flex items-start gap-3">
                  {active.author?.avatar && (
                    <div className="w-10 h-10 rounded-full overflow-hidden relative">
                      <Image
                        src={active.author.avatar}
                        alt={active.author.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{active.title ?? "Reel"}</div>
                    {active.author?.name && (
                      <div className="text-sm text-gray-600">{active.author.name}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Khateeb • Reel</div>
                </div>

                {active.title && <p className="mt-3 text-sm text-gray-700">{active.title}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
