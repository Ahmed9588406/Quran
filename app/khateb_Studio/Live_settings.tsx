/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  initialChoice?: "everyone" | "following" | "invite";
  anchorRect?: DOMRect | null; // optional anchor to position beside audio modal
};

export default function LiveSettings({ open, onClose, initialChoice = "following", anchorRect = null }: Props) {
  const [choice, setChoice] = useState<"everyone" | "following" | "invite">(initialChoice);
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (open) setChoice(initialChoice);
  }, [open, initialChoice]);

  // compute position beside anchorRect or center
  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const width = 380;
    const height = 360;
    const margin = 8;

    const compute = () => {
      if (anchorRect) {
        // Prefer to position to the left of anchor; if not enough space use right.
        let left = Math.round(anchorRect.left - width - 12);
        const rightOption = Math.round(anchorRect.right + 12);
        if (left < margin) left = rightOption;
        // vertical center relative to anchor
        let top = Math.round(anchorRect.top + (anchorRect.height - height) / 2);
        top = Math.max(margin, Math.min(top, window.innerHeight - height - margin));
        left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
        setPos({ top, left });
      } else {
        setPos({
          left: Math.round((window.innerWidth - width) / 2),
          top: Math.round((window.innerHeight - height) / 2),
        });
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
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const style: React.CSSProperties = pos
    ? { position: "fixed", top: pos.top, left: pos.left, width: 380, zIndex: 85 }
    : { position: "fixed", inset: 0, zIndex: 85 };

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-transparent" aria-hidden="true" />
      <div ref={ref} style={style}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                aria-label="Back"
                className="p-2 rounded hover:bg-gray-50"
              >
                <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h3 className="text-sm font-medium text-[#231217]">Live settings</h3>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-5">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-[#231217] mb-1">Speakers</h4>
              <p className="text-xs text-gray-500">
                Who can speak? Current speakers will not be affected. Changes may take a few seconds.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent">
                <div>
                  <div className="text-sm font-medium text-[#231217]">Everyone</div>
                  <div className="text-xs text-gray-500">Anyone in the room can speak</div>
                </div>
                <input
                  type="radio"
                  name="speakers"
                  checked={choice === "everyone"}
                  onChange={() => setChoice("everyone")}
                  className="form-radio w-4 h-4 text-[#8A1538] accent-[#8A1538]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent">
                <div>
                  <div className="text-sm font-medium text-[#231217]">People you follow</div>
                  <div className="text-xs text-gray-500">Only people you follow can speak</div>
                </div>
                <input
                  type="radio"
                  name="speakers"
                  checked={choice === "following"}
                  onChange={() => setChoice("following")}
                  className="form-radio w-4 h-4 text-[#8A1538] accent-[#8A1538]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent">
                <div>
                  <div className="text-sm font-medium text-[#231217]">Only people you invite to speak</div>
                  <div className="text-xs text-gray-500">You control who gets to speak</div>
                </div>
                <input
                  type="radio"
                  name="speakers"
                  checked={choice === "invite"}
                  onChange={() => setChoice("invite")}
                  className="form-radio w-4 h-4 text-[#8A1538] accent-[#8A1538]"
                />
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-3 py-2 rounded bg-white border text-sm">Cancel</button>
            <button
              onClick={() => {
                // apply/save changes if needed, then close
                onClose();
              }}
              className="px-4 py-2 rounded bg-[#8A1538] text-white text-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
