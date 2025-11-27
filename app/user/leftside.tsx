import React from "react";
import Image from "next/image";
import { Menu, Home, QrCode, Film, Sparkles, Settings, X } from "lucide-react";
import Link from "next/link";

export default function LeftSide({
  isOpen = true,
  onClose,
  onNavigate,
  activeView
}: {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (view: string) => void;
  activeView?: string;
}) {
  return (
    <>
      {/* overlay */}
      <div
        onClick={() => onClose?.()}
        className={`fixed inset-0 bg-black/40 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}
        aria-hidden={!isOpen}
      />

      {/* sliding panel */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 max-w-[80vw] bg-[#fff6f3] border-r border-[#f0e6e5]
                    transform transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    sm:w-56 md:w-48 lg:w-56`}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              
            </div>

            <button
              onClick={() => onClose?.()}
              aria-label="Close menu"
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              <li>
                {/* Home: toggle active state and notify parent */}
                <button
                  onClick={() => { onNavigate?.(activeView === 'home' ? '' : 'home'); onClose?.(); }}
                  className={`flex items-center gap-3 p-3 rounded-lg w-full text-left ${activeView === 'home' ? 'bg-[#f6e9e7] text-[#7b2030] font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Image
                    src={activeView === 'home' ? "/icons/home-11_selectable.svg" : "/icons/home_not_selectable.svg"}
                    alt="Home"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span>Home</span>
                </button>
              </li>

              <li>
                <button className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full text-left">
                  <Image src="/icons/qr.svg" alt="Reels" width={20} height={20} className="w-5 h-5" />
                  <span>Scan QR</span>
                </button>
              </li>

              <li>
                {/* Reels: toggle active state */}
                <button
                  onClick={() => { onNavigate?.(activeView === 'reels' ? '' : 'reels'); onClose?.(); }}
                  className={`flex items-center gap-3 p-3 rounded-lg w-full text-left ${activeView === 'reels' ? 'bg-[#f6e9e7] text-[#7b2030] font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Image src="/icons/reel.svg" alt="Reels" width={20} height={20} className="w-5 h-5" />
                  <span>Reels</span>
                </button>
              </li>

              <li>
                <button className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full text-left">
                    <Image src="/icons/salah.svg" alt="Salah" width={20} height={20} className="w-5 h-5" />
                    <span>Pray</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="mt-auto">
            <div className="border-t border-[#f0e6e5] pt-4">
              <button className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-gray-100 text-gray-700">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>

              <div className="mt-6 flex items-center gap-3">
                <div className="w-9 h-9 relative rounded-full overflow-hidden bg-gray-100">
                  <Image src="/figma-assets/avatar.png" alt="Mazen" fill style={{ objectFit: "cover" }} />
                </div>
                <div>
                  <div className="text-sm font-medium">Mazen Mohamed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
