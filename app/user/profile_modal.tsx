/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, LogOut, X } from "lucide-react";
import { getProfileRoute } from "@/lib/auth-helpers";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user?: { name?: string; handle?: string; avatar?: string };
};

export default function ProfileModal({ isOpen, onClose, user }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [profileHref, setProfileHref] = useState("/user-profile");

  const u = user ?? {
    name: "Omar Al-Fakhroo",
    handle: "@Al-Fakhroo-22",
    avatar: "/figma-assets/avatar.png",
  };

  // Get dynamic profile route on mount (client-side only)
  // Requirements: 2.1, 2.2, 2.3
  useEffect(() => {
    setProfileHref(getProfileRoute());
  }, []);

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

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="w-[320px] max-w-[92vw] bg-[#fff6f3] border border-[#f0e6e5] rounded-2xl shadow-xl text-gray-900 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden relative flex-shrink-0">
              <Image
                src="/icons/settings/profile.png"
                alt="User profile"
                width={48}
                height={48}
                className="object-cover"
                draggable={false}
              />
            </div>
            <div>
              <div className="text-sm font-semibold truncate">{u.name}</div>
              <div className="text-xs text-gray-600 mt-0.5">{u.handle}</div>
            </div>
          </div>

          <button
            aria-label="Close"
            onClick={onClose}
            className="p-1 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3">
          <Link
            href={profileHref}
            onClick={() => onClose()}
            className="block w-full text-center text-[#7b2030] text-sm font-medium py-2 rounded-md hover:bg-gray-50"
          >
            View your profile
          </Link>
        </div>
      </div>

      <div className="h-px bg-[#e7d9d2]" />

      <div className="p-3 space-y-2">
        <button className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/60">
            <Globe className="w-4 h-4 text-gray-700" />
          </span>
          <span className="text-sm text-gray-800">Language · English</span>
        </button>

        <button
          onClick={() => {
            onClose();
            // add sign-out logic here if needed
          }}
          className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/60">
            <LogOut className="w-4 h-4 text-gray-700" />
          </span>
          <span className="text-sm text-gray-800">Sign out</span>
        </button>
      </div>
    </div>
  );
}
