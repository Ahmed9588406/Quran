"use client";
import React, { useEffect } from "react";
import { X, Mic } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onStartLive?: () => void; // NEW: notify parent to open audio/live-room UI
};

export default function GoLiveModal({ open, onClose, onStartLive }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* modal */}
      <div className="relative z-70 w-[720px] max-w-[92vw] bg-[#FFF9F3] rounded-2xl shadow-xl p-8">
        {/* close button */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50"
        >
          <X className="w-5 h-5 text-[#231217]" />
        </button>

        {/* mic icon centered */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
            <Mic className="w-7 h-7 text-[#8A1538]" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-[#231217] text-center mb-4">Create your khotba room</h2>

        {/* Who can speak select */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-2">Who can speak?</label>
          <div className="relative">
            <select className="w-full h-12 rounded-lg border border-[#E7D9D2] bg-white px-4 text-sm text-[#231217]">
              <option>Only people you invite to speak</option>
              <option>People you follow</option>
              <option>Everyone</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
          </div>
        </div>

        {/* Topic input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="What do you want to talk about ?"
            className="w-full h-12 rounded-lg border-2 border-[#8A1538] px-4 text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Record Space toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-[#231217]">Record Space</div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-[#8A1538] transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full border transform peer-checked:translate-x-4 transition-transform" />
            </label>
          </div>
        </div>

        {/* Start live button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              // notify parent to open audio/live-room UI and let parent close this modal
              onStartLive?.();
            }}
            className="w-64 h-12 bg-[#7A1233] hover:bg-[#6d1029] text-white rounded-full font-medium"
          >
            Start live
          </button>
        </div>
      </div>
    </div>
  );
}
