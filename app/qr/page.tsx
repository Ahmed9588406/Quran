"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../user/navbar";
import LeftSide from "../user/leftside";
import RightSide from "../user/rightside";
import Leaderboard from "../user/leaderboard";
import Image from "next/image";
import QRScanModal from "./qr_scan";

export default function Page() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isScanModalOpen, setScanModalOpen] = useState(false);

  const handleJoinStream = (roomId: number, liveStreamId: number) => {
    router.push(`/qr/listen?roomId=${roomId}&liveStreamId=${liveStreamId}`);
  };

  return (
    <div
      className="h-screen overflow-hidden bg-white text-black"
      style={{
        backgroundImage: "url('/icons/settings/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* LeftSide overlay/panel */}
      <LeftSide
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={() => setSidebarOpen(false)}
        onOpenScan={() => setScanModalOpen(true)}
      />

      {/* QR Scan Modal */}
      <QRScanModal
        isOpen={isScanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onJoinStream={handleJoinStream}
      />

      {/* Main layout: NavBar + content */}
      <div className="flex flex-col h-full">
        <NavBar
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* content area */}
        <div
          className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full overflow-hidden mr-8"
          style={{ height: "calc(100vh - 56px)" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 h-full">
            {/* Main central content */}
            <main className="bg-[#fffaf8] border border-[#f0e6e5] rounded-2xl p-6 h-full flex items-center justify-center">
              <div className="max-w-md w-full text-center">
                <div className="mx-auto w-32 h-32 rounded-xl overflow-hidden shadow-lg mb-4">
                  <Image
                    src="/icons/qr/emam.png"
                    alt="Khatib"
                    width={320}
                    height={320}
                    className="object-cover"
                  />
                </div>

                <p className="text-base font-medium mb-3">
                  Note: Please Bring your Headset to join the khotba
                </p>

                <div className="text-left bg-transparent rounded px-2 ml-9">
                  <div className="mb-2">
                    <span className="font-semibold text-[#7b2030]">Title:</span>{" "}
                    <span className="font-medium text-gray-800">
                      Who is omar ebn el khatab
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-[#7b2030]">
                      Khatib Name:
                    </span>{" "}
                    <span className="font-medium text-gray-800">Mabrouk</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-[#7b2030]">Masjed:</span>{" "}
                    <span className="font-medium text-gray-800">
                      Mohamed Fared
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-[#7b2030]">Date:</span>{" "}
                    <span className="font-medium text-gray-800">
                      7/23/2025 Hejry
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-[#7b2030]">Date:</span>{" "}
                    <span className="font-medium text-gray-800">
                      10/3/2025 Melady
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-[#7b2030]">Live:</span>{" "}
                    <span className="font-medium text-gray-800">
                      22 Minutes ago
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="font-semibold text-[#7b2030]">Statue:</span>{" "}
                    <span className="font-medium text-gray-800">Live Now</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <button 
                    onClick={() => setScanModalOpen(true)}
                    className="inline-block bg-[#7b2030] text-white px-6 py-2 rounded-md font-medium hover:bg-[#6a1826] w-full"
                  >
                    📷 Scan QR Code
                  </button>
                  <button className="inline-block bg-[#cfae70] text-white px-6 py-2 rounded-md font-medium hover:bg-[#b89a5c] w-full">
                    Join Room
                  </button>
                </div>
              </div>
            </main>

            {/* Right column */}
            <aside className="h-full overflow-hidden">
              <div className="flex flex-col gap-6 h-full">
                <div className="flex-shrink-0">
                  <RightSide />
                </div>

                <div className="flex-1 overflow-hidden">
                  <Leaderboard />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
