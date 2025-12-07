/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Upload, Pencil, Radio } from "lucide-react";
import Image from "next/image";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorRect?: DOMRect | null;
  onOpenUpload?: () => void; // new prop
  onOpenGoLive?: () => void; // NEW: parent handler to open Go Live modal
};

export default function CreateModal({ open, onClose, anchorRect = null, onOpenUpload, onOpenGoLive }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    const compute = () => {
      const modalWidth = 200;
      const modalHeight = 180;
      const margin = 12;
      const offsetY = 8;

      if (anchorRect) {
        let left = Math.round(anchorRect.left + anchorRect.width / 2 - modalWidth / 2);
        let top = Math.round(anchorRect.bottom + offsetY);

        left = Math.max(margin, Math.min(left, window.innerWidth - modalWidth - margin));
        top = Math.max(margin, Math.min(top, window.innerHeight - modalHeight - margin));

        setPosition({ top, left });
      } else {
        const left = window.innerWidth - modalWidth - 24;
        const top = 80;
        const clampedLeft = Math.max(margin, Math.min(left, window.innerWidth - modalWidth - margin));
        const clampedTop = Math.max(margin, Math.min(top, window.innerHeight - modalHeight - margin));
        setPosition({ top: clampedTop, left: clampedLeft });
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

  const style: React.CSSProperties = position
    ? { position: "fixed", top: position.top, left: position.left, zIndex: 60 }
    : { position: "fixed", top: 80, right: 24, zIndex: 60 };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/5 backdrop-blur-[0px] animate-in fade-in duration-200" 
        onClick={onClose}
        role="dialog" 
        aria-modal="true"
      />

      {/* Modal */}
      <div 
        style={style} 
        className="z-[60] animate-in slide-in-from-top-2 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={ref}
          className="w-[200px] bg-[#FFF9F3] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          

          {/* Menu Items */}
          <div className="p-2">
            <button
              className="group w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 transition-all duration-200"
              onClick={() => {
                // notify parent to open upload modal, then close the create menu
                onOpenUpload?.();
                onClose();
              }}
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Image 
                  src="/icons/khateb_studio/play-square.svg"
                  alt="Upload reel"
                  width={30}
                  height={30}
                className="w-4 h-4 text-blue-600"
                />
              </div>
              <span className="text-sm font-medium text-[#160309]">Upload Reel</span>
            </button>

            <button
              className="group w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 transition-all duration-200"
              onClick={() => {
                // notify parent to open Go Live UI, then close the Create menu
                onOpenGoLive?.();
                onClose();
              }}
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Radio className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-sm font-medium text-[#160309]">Go Live</span>
            </button>

            <button
              className="group w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 transition-all duration-200"
              onClick={() => {
                console.log("Create post");
                onClose();
              }}
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Pencil className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-[#160309]">Create Post</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}