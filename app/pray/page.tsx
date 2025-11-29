'use client'
import React, { useState } from 'react'
import RightSide from '../user/rightside'
import Image from 'next/image'
import NavBar from '../user/navbar' // add navbar import
import LeftSide from '../user/leftside' // NEW: import LeftSide so NavBar can toggle it

export default function PrayPage() {
  const [isLeftOpen, setIsLeftOpen] = useState(true); // NEW: local sidebar state for this page

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NavBar shown on top of Pray page; pass toggle handler and state */}
      <NavBar onToggleSidebar={() => setIsLeftOpen((s) => !s)} isSidebarOpen={isLeftOpen} />

      {/* LeftSide moved to this page so NavBar can control it here */}
      <LeftSide
        isOpen={isLeftOpen}
        onClose={() => setIsLeftOpen(false)}
        onNavigate={(view) => {
          // If you want navigation from LeftSide to affect this page, handle here.
          // e.g. set a local state or use router.push(...)
        }}
        activeView={''}
      />

      <main className="max-w-6xl mx-auto px-4 lg:px-8 mt-6">
        <div className="w-full flex flex-col items-center px-4">
          <div
            className="relative rounded-lg shadow-sm w-full"
            style={{
              width: "min(920px, 96vw)",
              maxHeight: "calc(92vh - 80px)",
              overflow: "hidden",
              transition: "transform 180ms ease",
            }}
          >
            <div className="w-full h-full">
              <RightSide />
            </div>
          </div>

          {/* vertical pill list (matches provided screenshot style) */}
          <ul className="mt-4 w-full max-w-[min(920px,96vw)] space-y-3">
            <li>
              <button className="w-full flex items-center justify-between bg-[#e6cfa3] hover:bg-[#e0c49b] rounded-full px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-[#2b2b2b] text-left">Quraan Kareem</span>
                <Image src="/icons/pray/quran%201.svg" alt="Quran Icon" width={30} height={30} className="object-contain" />
              </button>
            </li>

            <li>
              <button className="w-full flex items-center justify-between bg-[#e6cfa3] hover:bg-[#e0c49b] rounded-full px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-[#2b2b2b] text-left">Ahades</span>
                <Image src="/icons/pray/ahades.svg" alt="Ahades Icon" width={30} height={30} className="object-contain" />
              </button>
            </li>

            <li>
              <button className="w-full flex items-center justify-between bg-[#e6cfa3] hover:bg-[#e0c49b] rounded-full px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-[#2b2b2b] text-left">Azkar</span>
                <Image src="/icons/pray/azkar.svg" alt="Azkar Icon" width={30} height={30} className="object-contain" />
              </button>
            </li>

            <li>
              <button className="w-full flex items-center justify-between bg-[#e6cfa3] hover:bg-[#e0c49b] rounded-full px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-[#2b2b2b] text-left">Roqya</span>
                <Image src="/icons/pray/roqia.svg" alt="Roqya Icon" width={40} height={40} className="object-contain" />
              </button>
            </li>

            <li>
              <button className="w-full flex items-center justify-between bg-[#e6cfa3] hover:bg-[#e0c49b] rounded-full px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-[#2b2b2b] text-left">Fatwa</span>
                <Image src="/icons/pray/fatwa.svg" alt="Fatwa Icon" width={40} height={40} className="object-contain" />
              </button>
            </li>

            <li>
              <button className="w-full flex items-center justify-between bg-[#e6cfa3] hover:bg-[#e0c49b] rounded-full px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-[#2b2b2b] text-left">Sebha</span>
                <Image src="/icons/pray/roqia.svg" alt="Sebha Icon" width={40} height={40} className="object-contain" />
              </button>
            </li>

            <li>
              <button className="w-full flex items-center justify-between bg-[#e6cfa3] hover:bg-[#e0c49b] rounded-full px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-[#2b2b2b] text-left">Asmaa Allah el hosna</span>
                <Image src="/icons/pray/asma.svg" alt="Asmaa Icon" width={40} height={40} className="object-contain" />
              </button>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}

// also export named component for embedding
export const PrayComponent = PrayPage