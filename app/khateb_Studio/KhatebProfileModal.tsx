/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, LogOut, X, Video, MessageSquare } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  anchorRect?: DOMRect | null;
};

export default function KhatebProfileModal({ isOpen, onClose, anchorRect = null }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, onClose]);

  // position near anchor if provided. Measure modal and clamp to viewport.
  const defaultTop = 64;
  const defaultRight = 24;

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    const compute = () => {
      const modalEl = ref.current;
      const modalWidth = modalEl ? modalEl.offsetWidth : 320;
      const modalHeight = modalEl ? modalEl.offsetHeight : 200;
      const margin = 8;

      if (anchorRect) {
        // center the modal horizontally to the anchor when possible
        let left = Math.round(anchorRect.left + anchorRect.width / 2 - modalWidth / 2);
        let top = Math.round(anchorRect.top + anchorRect.height + 8);

        // clamp to viewport
        left = Math.max(margin, Math.min(left, window.innerWidth - modalWidth - margin));
        top = Math.max(margin, Math.min(top, window.innerHeight - modalHeight - margin));

        setPosition({ top, left });
      } else {
        // default position: top-right
        const left = Math.max(margin, window.innerWidth - modalWidth - defaultRight);
        const top = defaultTop;
        setPosition({ top, left });
      }
    };

    // compute now and again on next frame in case modal size wasn't available yet
    compute();
    const raf = requestAnimationFrame(() => compute());
    window.addEventListener("resize", compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", compute);
    };
  }, [isOpen, anchorRect]);

  if (!isOpen) return null;

  const style: React.CSSProperties = position
    ? { position: "fixed", top: position.top, left: position.left, zIndex: 60 }
    : anchorRect
    ? { position: "fixed", top: anchorRect.top + anchorRect.height + 8, left: Math.max(8, anchorRect.left - 160 + anchorRect.width / 2), zIndex: 60 }
    : { position: "fixed", top: defaultTop, right: defaultRight, zIndex: 60 };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/20" />

      <div style={style} onClick={(e) => e.stopPropagation()}>
        <div ref={ref} className="w-[320px] max-w-[92vw] bg-[#fff6f3] border border-[#f0e6e5] rounded-2xl shadow-xl text-gray-900 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden relative shrink-0">
                  <Image src="/icons/settings/profile.png" alt="User profile" width={48} height={48} className="object-cover" draggable={false} />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-semibold text-[#231217] truncate">Omar Al-Fakhroo</div>
                  <div className="text-sm text-gray-500 mt-0.5 truncate">@Al-Fakhroo-22</div>
                </div>
              </div>

              <button aria-label="Close" onClick={onClose} className="p-1 rounded-md text-gray-600 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3">
              <Link href="/profile" onClick={() => onClose()} className="block w-full text-center text-[#8A1538] text-lg font-medium py-2 rounded-md hover:bg-gray-50">
                View your channel
              </Link>
            </div>
          </div>

          <div className="h-px bg-[#e7d9d2]" />

          <div className="p-2">
            <ul className="space-y-1">
              <li>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50">
                    <Image
                    src="/icons/Khateb_studio/play-square.svg"
                      alt="Upload reel"
                      width={30}
                      height={30}
                    className="w-6 h-6" />
                  <span className="text-sm text-[#231217]">Upload reel</span>
                </button>
              </li>

              <li>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50">
                    <Image
                    src="/icons/Khateb_studio/language.svg"
                      alt="Upload reel"
                      width={30}
                      height={30}
                    className="w-6 h-6" />
                  <span className="text-sm text-gray-700">Language : English</span>
                </button>
              </li>

              <li>
                <button onClick={() => { onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50">
                    <Image
                    src="/icons/Khateb_studio/logout.svg"
                      alt="Upload reel"
                      width={30}
                      height={30}
                    className="w-6 h-6" />
                  
                  <span className="text-sm text-gray-700">Sign out</span>
                </button>
              </li>

              <li>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50">
                    <Image
                    src="/icons/Khateb_studio/alert-square.svg"
                      alt="Upload reel"
                      width={30}
                      height={30}
                    className="w-6 h-6" />
                  <span className="text-sm text-gray-700">Send feedback</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
