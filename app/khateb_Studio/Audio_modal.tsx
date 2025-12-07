/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronDown, Mic, MicOff, User, Edit2, MoreVertical, ExternalLink, Share2, ChevronUp } from "lucide-react";
import ShareModal from "./share_modal"; // added
import AudioSettingsModal from "./Audio_settings_modal"; // added
import LiveSettings from "./Live_settings"; // new import

type Props = {
  open: boolean;
  onClose: () => void;
  participantsCount?: number;
};

export default function AudioModal({ open, onClose, participantsCount = 1 }: Props) {
  const [muted, setMuted] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ top: 240, left: 1007 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isShareOpen, setIsShareOpen] = useState(false); // existing
  const [shareAnchor, setShareAnchor] = useState<DOMRect | null>(null); // existing
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false); // new
  const [audioSettingsAnchor, setAudioSettingsAnchor] = useState<DOMRect | null>(null); // new
  const [isLiveSettingsOpen, setIsLiveSettingsOpen] = useState(false); // new
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setMuted(true);
      setIsMinimized(false);
      setPosition({ top: 240, left: 1007 });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Drag handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newLeft = e.clientX - dragOffset.x;
      const newTop = e.clientY - dragOffset.y;

      const modalWidth = 400;
      const modalHeight = isMinimized ? 64 : 577;
      const maxLeft = window.innerWidth - modalWidth;
      const maxTop = window.innerHeight - modalHeight;

      setPosition({
        left: Math.max(0, Math.min(newLeft, maxLeft)),
        top: Math.max(0, Math.min(newTop, maxTop)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, isMinimized]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start drag if clicking on header area (not on buttons)
    if ((e.target as HTMLElement).closest("button")) return;

    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  if (!open) return null;

  const modalStyle: React.CSSProperties = {
    position: "fixed",
    width: "400px",
    height: isMinimized ? "64px" : "577px",
    top: position.top,
    left: position.left,
    borderRadius: "8px",
    zIndex: 60,
    cursor: isDragging ? "grabbing" : "default",
  };

  // Minimized state
  if (isMinimized) {
    return (
      <div ref={modalRef} id="audio-modal-root" style={modalStyle} className="bg-white shadow-2xl overflow-hidden">
        <div
          className="flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8A1538] flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#231217]">Khotba NAME</div>
              <div className="text-xs text-gray-500">Live now</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 hover:bg-gray-50 rounded"
              aria-label="Expand"
            >
              <ChevronDown className="w-4 h-4 text-gray-600 transform rotate-180" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/10" onClick={() => setIsMinimized(true)} />

      {/* Modal */}
      <div ref={modalRef} id="audio-modal-root" style={modalStyle} className="bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header - End button on the LEFT, icons on the RIGHT */}
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            {/* Left side: End button */}
            <div className="flex items-center gap-1">
              <button
                onClick={onClose}
                className="px-3 py-1 text-sm font-medium text-[#DC2626] hover:bg-red-50 rounded"
                aria-label="End"
              >
                End
              </button>
            </div>

            {/* Right side: icons (More -> opens audio settings, Share, External, Minimize) */}
            <div className="flex items-center gap-2">
              <button
                className="p-1.5 hover:bg-gray-50 rounded"
                aria-label="Audio settings"
                onClick={(e) => {
                  const btn = e.currentTarget as HTMLElement;
                  const rect = btn.getBoundingClientRect();
                  setAudioSettingsAnchor(rect);
                  setIsAudioSettingsOpen(true);
                }}
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              <button
                className="p-1.5 hover:bg-gray-50 rounded"
                aria-label="Share"
                onClick={(e) => {
                  const btn = e.currentTarget as HTMLElement;
                  const rect = btn.getBoundingClientRect();
                  setShareAnchor(rect);
                  setIsShareOpen(true);
                }}
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>

              <button className="p-1.5 hover:bg-gray-50 rounded" aria-label="Open in new window">
                <ExternalLink className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-gray-50 rounded"
                aria-label="Minimize"
              >
                <ChevronDown className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Second row: Khotba NAME with edit icon aligned left */}
          <div className="flex items-center justify-start gap-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 font-medium">Khotba NAME</span>
              <button className="p-1 hover:bg-gray-50 rounded" aria-label="Edit name">
                <Edit2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Host Section */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden relative bg-gray-100 shrink-0">
              <Image src="/icons/settings/profile.png" alt="Host" fill style={{ objectFit: "cover" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#231217] truncate">Mazen Mo...</div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MicOff className="w-3 h-3 text-rose-500" />
                <span>Host</span>
              </div>
            </div>
          </div>
        </div>

        {/* Participants Section - Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">No participants yet</div>
            <div className="text-xs text-gray-400">Invite people to join</div>
          </div>
        </div>

        {/* Bottom Controls - unchanged */}
        <div className="px-4 py-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Mic Button with circular maroon background */}
            <button
              onClick={() => setMuted((m) => !m)}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-[#7A1233]"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              <Mic className="w-6 h-6 text-white" />
            </button>

            {/* Center placeholder (kept minimal) */}
            <div className="flex-1" />

            {/* Right side: User icon with count */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-[#231217]">{participantsCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio settings popup anchored to the three-dots (MoreVertical) */}
      <AudioSettingsModal
        open={isAudioSettingsOpen}
        onClose={() => setIsAudioSettingsOpen(false)}
        anchorRect={audioSettingsAnchor}
        onOpenAudioModal={() => {
          // close the small popup and open the Live settings page/modal
          setIsAudioSettingsOpen(false);
          setIsLiveSettingsOpen(true);
        }}
      />

      {/* Live settings full screen modal */}
      <LiveSettings
        open={isLiveSettingsOpen}
        onClose={() => setIsLiveSettingsOpen(false)}
      />

      {/* Share popup anchored to the share icon */}
      <ShareModal open={isShareOpen} onClose={() => setIsShareOpen(false)} anchorRect={shareAnchor} />
    </>
  );
}
