/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Image from "next/image";
import { Home, QrCode, Film, Settings } from "lucide-react";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth-helpers";

export default function LeftSide({
  isOpen = false,
  onClose,
  onNavigate,
  activeView,
  onOpenScan,
  permanent = false,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (view: string) => void;
  activeView?: string;
  onOpenScan?: () => void;
  permanent?: boolean;
}) {
  // State for dynamic home route
  const [homeHref, setHomeHref] = useState("/user");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get user ID for dynamic home route
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      setHomeHref(`/user/${userId}`);
    } else {
      setHomeHref("/user");
    }

    // Also get user data from localStorage for avatar
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      }
    } catch {
      // ignore
    }
  }, []);

  // QR modal handler
  const openQrModal = async () => {
    onOpenScan?.();
    onClose?.();
    try {
      const { default: QRScanModal } = await import("../qr/qr_scan");
      const containerId = "qr-scan-modal-root";
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        document.body.appendChild(container);
      }
      let root = (container as any).__react_root as ReactDOM.Root | undefined;
      if (!root) {
        root = ReactDOM.createRoot(container);
        (container as any).__react_root = root;
      }
      const unmount = () => {
        try { root!.unmount(); } catch { /* ignore */ }
        try { container?.remove(); } catch { /* ignore */ }
      };
      root.render(<QRScanModal isOpen={true} onClose={unmount} />);
    } catch (err) {
      console.error("Failed to open QR modal", err);
    }
  };

  const iconBtnBase = "flex items-center gap-3 rounded-lg transition-colors";

  const IconBtn = ({
    href,
    onClick,
    active,
    children,
    label,
  }: {
    href?: string;
    onClick?: () => void;
    active?: boolean;
    children: React.ReactNode;
    label: string;
  }) => {
    const cls = `${iconBtnBase} ${isOpen ? "w-full p-3" : "w-10 h-10 justify-center"} ${active ? "bg-[#f6e9e7] text-[#7b2030]" : "text-gray-600 hover:bg-gray-100"}`;
    const btn = (
      <button onClick={onClick} aria-label={label} title={label} className={cls}>
        {children}
        {isOpen && <span className="text-sm">{label}</span>}
      </button>
    );
    return href ? <Link href={href} className={isOpen ? "w-full" : ""}>{btn}</Link> : btn;
  };

  // Get avatar URL
  const avatarUrl = currentUser?.avatar_url || "/figma-assets/avatar.png";
  const userName = currentUser?.display_name || currentUser?.name || currentUser?.username || "User";

  return (
    <>
      {/* Overlay when expanded */}
      {isOpen && !permanent && (
        <div
          onClick={onClose}
          className="fixed left-0 right-0 top-0 bottom-0 bg-black/40 z-30"
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-[#fff6f3] border-r border-[#f0e6e5] flex flex-col items-center py-4 transition-all duration-300 ${
          isOpen ? "w-56" : "w-14"
        }`}
      >
        {/* Header with logo (only when expanded) */}
        {isOpen && (
          <div className="w-full flex items-center justify-start px-4 mb-4">
            <div className="w-8 h-8 relative">
              <Image src="/figma-assets/logo_wesal.png" alt="logo" fill style={{ objectFit: "contain" }} />
            </div>
          </div>
        )}

        {/* Logo (only when collapsed) */}
        {!isOpen && (
          <div className="w-8 h-8 relative mb-4">
            <Image src="/figma-assets/logo_wesal.png" alt="logo" fill style={{ objectFit: "contain" }} />
          </div>
        )}

        {/* Nav icons */}
        <nav className={`flex flex-col gap-2 ${isOpen ? "w-full px-3" : "items-center"}`}>
          {/* Home - navigates to user's dynamic route */}
          <IconBtn
            href={homeHref}
            label="Home"
            active={activeView === "home"}
            onClick={() => { onNavigate?.("home"); onClose?.(); }}
          >
            <Home className="w-5 h-5" />
          </IconBtn>

          <IconBtn label="Scan QR" onClick={openQrModal}>
            <QrCode className="w-5 h-5" />
          </IconBtn>

          <IconBtn
            href="/reels"
            label="Reels"
            active={activeView === "reels"}
            onClick={() => { onNavigate?.("reels"); onClose?.(); }}
          >
            <Film className="w-5 h-5" />
          </IconBtn>

          <IconBtn
            href="/pray"
            label="Pray"
            active={activeView === "pray"}
            onClick={() => { onNavigate?.("pray"); onClose?.(); }}
          >
            <Image src="/icons/salah.svg" alt="Salah" width={20} height={20} className="w-5 h-5" />
          </IconBtn>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom: settings + avatar */}
        <div className={`flex flex-col gap-2 mb-2 ${isOpen ? "w-full px-3" : "items-center"}`}>
          <IconBtn href="/settings" label="Settings">
            <Settings className="w-5 h-5" />
          </IconBtn>

          <Link href={homeHref} className={`flex items-center gap-3 ${isOpen ? "px-3 py-2 hover:bg-gray-100 rounded-lg" : ""}`}>
            <div className="w-8 h-8 relative rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            </div>
            {isOpen && <span className="text-sm font-medium">{userName}</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
