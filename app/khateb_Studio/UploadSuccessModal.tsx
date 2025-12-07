/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorRect?: DOMRect | null;
};

export default function UploadSuccessModal({ open, onClose, anchorRect = null }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const width = 360;
  const height = 220;
  const margin = 8;

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }

    const compute = () => {
      if (anchorRect) {
        // Prefer showing to the left of audio modal; if not enough space show to the right.
        let left = Math.round(anchorRect.left - width - 12);
        const rightOption = Math.round(anchorRect.right + 12);
        if (left < margin) {
          left = rightOption;
        }
        // align vertically centered to anchorRect
        let top = Math.round(anchorRect.top + (anchorRect.height - height) / 2);
        top = Math.max(margin, Math.min(top, window.innerHeight - height - margin));
        // ensure within viewport horizontally
        left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
        setPos({ left, top });
      } else {
        // center if no anchor
        setPos({ left: Math.round((window.innerWidth - width) / 2), top: Math.round((window.innerHeight - height) / 2) });
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

  // click outside to close
  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onClose]);

  if (!open) return null;

  const style: React.CSSProperties = pos
    ? { position: "fixed", top: pos.top, left: pos.left, width: `${width}px`, zIndex: 90 }
    : { position: "fixed", inset: 0, zIndex: 90 };

  return (
    <>
      {/* optional dim overlay to capture clicks */}
      <div className="fixed inset-0 z-[80] bg-transparent" aria-hidden="true" />
      <div ref={ref} style={style}>
        <div className="bg-[#FFF9F3] rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 text-center flex flex-col items-center">
            <div className="mb-4">
              <Image src="/icons/khateb_studio/clebrate.svg" alt="Success" width={64} height={64} />
            </div>
            <h3 className="text-lg font-semibold text-[#160309] mb-1">Uploaded successfully</h3>
            <p className="text-sm text-gray-600 mb-4">Your reel is being processed and will appear shortly.</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded bg-[#8A1538] text-white text-sm">Done</button>
              <button onClick={onClose} className="px-4 py-2 rounded bg-white border text-sm">View</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
