/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React from "react";
import ReactDOM from "react-dom/client";
import Image from "next/image";
import { Home, QrCode, Film, Settings, X, Users, Monitor, Video, FileText, BookOpen, BarChart2, Archive, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Sidebar({
  isOpen = false,
  onClose,
  onNavigate,
  activeView,
  onOpenScan,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (view: string) => void;
  activeView?: string;
  onOpenScan?: () => void;
}) {
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
        try { root!.unmount(); } catch (e) { /* ignore */ }
        try { container?.remove(); } catch (e) { /* ignore */ }
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

  // menu items matching screenshot order
  const menuItems: { id: string; label: string; icon: React.ReactNode; href?: string; highlight?: boolean }[] = [
    { id: "community", label: "Community", icon: <Users className="w-5 h-5" />, href: "/community" },
    { id: "studio", label: "Khateeb Studio", icon: <Monitor className="w-5 h-5" />, href: "/studio" },
    { id: "go_live", label: "Go Live", icon: <Video className="w-5 h-5" />, href: "/go-live", highlight: true },
    { id: "content", label: "Content", icon: <FileText className="w-5 h-5" />, href: "/content" },
    { id: "fatwas", label: "Fatwas", icon: <BookOpen className="w-5 h-5" />, href: "/fatwas" },
    { id: "library", label: "Library", icon: <Archive className="w-5 h-5" />, href: "/library" },
    { id: "analytics", label: "Analytics", icon: <BarChart2 className="w-5 h-5" />, href: "/analytics" },
    { id: "archive", label: "Archive", icon: <Archive className="w-5 h-5" />, href: "/archive" },
  ];

  return (
    <>
      {/* Overlay when expanded */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed left-0 right-0 top-14 bottom-0 bg-black/40 z-30"
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={`fixed top-14 left-0 bottom-0 z-40 bg-[#fff6f3] border-r border-[#f0e6e5] flex flex-col items-center py-4 transition-all duration-300 ${isOpen ? "w-72" : "w-16"}`} /* wider when open and slightly wider collapsed */
      >
        {/* Header with close button (only when expanded) */}
        
        {/* Nav menu */}
        <nav className={`flex flex-col gap-3 ${isOpen ? "w-full px-4" : "items-center"}`}> {/* increased gap and padding */}
          {menuItems.map((item) => {
            const active = activeView === item.id || activeView === item.href?.replace("/", "");
            const base = isOpen
              ? `flex items-center justify-between w-full p-4 rounded-lg ${item.highlight ? "bg-[#f6e9e7] text-[#7b2030]" : "text-gray-700 hover:bg-gray-100"}` /* larger padding */
              : `w-12 h-12 flex items-center justify-center rounded-lg ${item.highlight ? "bg-[#f6e9e7] text-[#7b2030]" : "text-gray-600 hover:bg-gray-100"}`; /* larger collapsed button */

            return item.href ? (
              <Link key={item.id} href={item.href} className={isOpen ? "" : ""} onClick={() => { onNavigate?.(item.id); if (!isOpen) onClose?.(); }}>
                <div className={base}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6">{item.icon}</div> {/* bigger icon container */}
                    {isOpen && <span className="text-base">{item.label}</span>} {/* larger label */}
                  </div>
                </div>
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => { if (item.id === "go_live") { onNavigate?.("go_live"); onClose?.(); } else { onNavigate?.(item.id); onClose?.(); } }}
                className={base}
                aria-current={active ? "page" : undefined}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6">{item.icon}</div>
                  {isOpen && <span className="text-base">{item.label}</span>}
                </div>
              </button>
            );
          })}

          {/* small divider */}
          <div className={`w-full ${isOpen ? "border-t border-[#f0e6e5] mt-4 pt-4" : "mt-4"}`} />

          
        </nav>

        
        {/* Bottom: settings + avatar */}
        <div className={`flex flex-col gap-3 mb-3 ${isOpen ? "w-full px-4" : "items-center"}`}>
          <IconBtn href="/settings" label="Settings">
            <Settings className="w-6 h-6" />
          </IconBtn>

          

          {/* feedback line */}
          {isOpen && (
            <button onClick={() => onNavigate?.("feedback")} className="w-full text-left text-base text-gray-600 px-3 py-3 rounded-lg hover:bg-gray-100"> {/* larger feedback button */}
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6" />
                <span>Send feedback</span>
              </div>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
