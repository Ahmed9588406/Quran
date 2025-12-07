/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Settings, Mic } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorRect?: DOMRect | null;
  onOpenAudioModal?: () => void; // new optional callback
  onOpenMicModal?: () => void;   // NEW: optional callback to open mic settings
};

export default function AudioSettingsModal({ open, onClose, anchorRect = null, onOpenAudioModal, onOpenMicModal }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [open, onClose]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const compute = () => {
      const width = 200;
      const height = 96;
      const margin = 8;
      if (anchorRect) {
        let left = Math.round(anchorRect.left + anchorRect.width / 2 - width / 2);
        let top = Math.round(anchorRect.bottom + 8);
        left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
        top = Math.max(margin, Math.min(top, window.innerHeight - height - margin));
        setPos({ left, top });
      } else {
        setPos({ left: window.innerWidth - width - 24, top: 80 });
      }
    };
    compute();
    const raf = requestAnimationFrame(() => compute());
    window.addEventListener("resize", compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", compute);
    };
  }, [open, anchorRect]);

  if (!open) return null;

  const style: React.CSSProperties = pos
    ? { position: "fixed", top: pos.top, left: pos.left, zIndex: 70 }
    : { position: "fixed", top: 80, right: 24, zIndex: 70 };

  return (
    <div style={style}>
      <div ref={ref} className="w-[200px] bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="p-3">
          <button
            className="w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50 text-sm text-gray-700"
            onClick={() => {
              // open the full audio settings view (if provided), then close this popup
              if (typeof onOpenAudioModal === "function") {
                onOpenAudioModal();
              } else {
                // fallback: dispatch a global event so other parts of the app can open the audio modal
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-audio-modal"));
                }
              }
              onClose();
            }}
          >
            <div className="w-6 flex items-center justify-center"><Settings className="w-5 h-5 text-gray-600" /></div>
            <span className="truncate whitespace-nowrap">Audio setting</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50 text-sm text-gray-700"
            onClick={() => {
              // open the Microphone settings modal (via callback if provided), then close this popup
              if (typeof onOpenMicModal === "function") {
                onOpenMicModal();
              } else {
                // fallback: dispatch a global event so other parts of the app can open the mic settings modal
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-mic-settings"));
                }
              }
              onClose();
            }}
          >
            <div className="w-6 flex items-center justify-center"><Mic className="w-5 h-5 text-gray-600" /></div>
            <span className="truncate whitespace-nowrap">Microphone settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
