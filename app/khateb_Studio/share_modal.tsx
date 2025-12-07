/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Copy, Share2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorRect?: DOMRect | null;
};

export default function ShareModal({ open, onClose, anchorRect = null }: Props) {
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
      const width = 168;
      const height = 92;
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
      <div ref={ref} className="w-[168px] bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="p-3">
          <button
            className="w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50 text-sm text-gray-700"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).catch(() => {});
              onClose();
            }}
          >
            <Copy className="w-4 h-4 text-gray-600" />
            <span>Copy link</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50 text-sm text-gray-700"
            onClick={() => {
              // small native share fallback
              if ((navigator as any).share) {
                (navigator as any).share({ title: document.title, url: window.location.href }).catch(() => {});
              } else {
                // fallback: open native share dialog or just copy
                navigator.clipboard?.writeText(window.location.href).catch(() => {});
              }
              onClose();
            }}
          >
            <Share2 className="w-4 h-4 text-gray-600" />
            <span>Share via...</span>
          </button>
        </div>
      </div>
    </div>
  );
}
