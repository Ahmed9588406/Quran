'use client'
import { useState, useEffect, useRef } from 'react'
import NavBar from '../../user/navbar'
import LeftSide from '../../user/leftside'
import Link from 'next/link'

export default function SebhaPage() {
  const [isLeftOpen, setIsLeftOpen] = useState(true)
  const [count, setCount] = useState(0)
  const [selectedDhikr, setSelectedDhikr] = useState('subhanallah')
  const [totalCount, setTotalCount] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const beadRefs = useRef<(HTMLDivElement | null)[]>([])
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (scrollContainerRef.current && isMobile) {
      const currentBead = beadRefs.current[count]
      if (currentBead) {
        currentBead.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [count, isMobile])

  // Handle swipe up gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
    const deltaY = touchStartRef.current.y - touchEnd.y
    const deltaX = Math.abs(touchStartRef.current.x - touchEnd.x)

    // Swipe up: deltaY > 50 (moved up) and minimal horizontal movement
    if (deltaY > 50 && deltaX < 50) {
      handleCount()
    }

    touchStartRef.current = null
  }

  const dhikrs = {
    subhanallah: {
      text: 'سبحان الله',
      transliteration: 'Subhan Allah',
      meaning: 'Glory be to Allah',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      light: 'from-emerald-50 to-teal-50',
      accent: 'emerald',
      beadColor: 'bg-emerald-500',
    },
    alhamdulillah: {
      text: 'الحمد لله',
      transliteration: 'Alhamdulillah',
      meaning: 'All praise is due to Allah',
      gradient: 'from-blue-400 via-indigo-500 to-purple-600',
      light: 'from-blue-50 to-indigo-50',
      accent: 'blue',
      beadColor: 'bg-blue-500',
    },
    allahu_akbar: {
      text: 'الله أكبر',
      transliteration: 'Allahu Akbar',
      meaning: 'Allah is the Greatest',
      gradient: 'from-amber-400 via-orange-500 to-red-600',
      light: 'from-amber-50 to-orange-50',
      accent: 'amber',
      beadColor: 'bg-amber-500',
    },
    la_ilaha: {
      text: 'لا إله إلا الله',
      transliteration: 'La ilaha illallah',
      meaning: 'There is no god but Allah',
      gradient: 'from-pink-400 via-rose-500 to-red-600',
      light: 'from-pink-50 to-rose-50',
      accent: 'pink',
      beadColor: 'bg-pink-500',
    },
    astaghfirullah: {
      text: 'أستغفر الله',
      transliteration: 'Astaghfirullah',
      meaning: 'I seek forgiveness from Allah',
      gradient: 'from-violet-400 via-purple-500 to-indigo-600',
      light: 'from-violet-50 to-purple-50',
      accent: 'violet',
      beadColor: 'bg-violet-500',
    },
  }

  const currentDhikr = dhikrs[selectedDhikr as keyof typeof dhikrs]

  const handleCount = () => {
    setCount(count + 1)
    setTotalCount(totalCount + 1)
  }

  const resetCount = () => setCount(0)
  const resetAll = () => {
    setCount(0)
    setTotalCount(0)
  }

  const handleDhikrChange = (dhikr: string) => {
    setSelectedDhikr(dhikr)
    setCount(0)
  }

  // Generate beads array (99 beads for traditional sebha)
  const totalBeads = 99

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentDhikr.light} transition-all duration-500`}>
      <NavBar onToggleSidebar={() => setIsLeftOpen((s) => !s)} isSidebarOpen={isLeftOpen} />

      <LeftSide
        isOpen={isLeftOpen}
        onClose={() => setIsLeftOpen(false)}
        onNavigate={() => {}}
        activeView={''}
      />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 mt-15 pb-12" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Islamic Sebha
          </h1>
          <p className="text-sm sm:text-base text-slate-600">Dhikr Counter - Remember Allah</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Sebha - Desktop View */}
          {!isMobile && (
            <div className="lg:col-span-2 flex justify-center">
              <div className="w-full max-w-md">
                {/* Dhikr Display Card */}
                <div className={`bg-gradient-to-br ${currentDhikr.gradient} rounded-3xl p-8 text-white text-center shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-300`}>
                  <p className="text-6xl font-bold mb-3 font-arabic">{currentDhikr.text}</p>
                  <p className="text-xl font-semibold mb-2">{currentDhikr.transliteration}</p>
                  <p className="text-sm opacity-90">{currentDhikr.meaning}</p>
                </div>

                {/* Sebha Beads Circle - Desktop */}
                <div className="relative w-80 h-80 mx-auto mb-8">
                  <svg className="w-full h-full" viewBox="0 0 300 300">
                    {/* Circle path */}
                    <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="2" />
                  </svg>

                  {/* Beads positioned in circle */}
                  <div className="absolute inset-0">
                    {Array.from({ length: totalBeads }).map((_, i) => {
                      const angle = (i / totalBeads) * Math.PI * 2 - Math.PI / 2
                      const radius = 120
                      const x = 150 + radius * Math.cos(angle)
                      const y = 150 + radius * Math.sin(angle)
                      const isActive = i < count

                      return (
                        <div
                          key={i}
                          className={`absolute w-6 h-6 rounded-full transition-all duration-300 cursor-pointer transform hover:scale-125 ${
                            isActive
                              ? `${currentDhikr.beadColor} shadow-lg scale-110`
                              : 'bg-gray-300 opacity-40 hover:opacity-60'
                          }`}
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: 'translate(-50%, -50%)',
                          }}
                          onClick={() => setCount(i + 1)}
                        />
                      )
                    })}
                  </div>

                  {/* Center display */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`bg-gradient-to-br ${currentDhikr.gradient} rounded-full w-32 h-32 flex flex-col items-center justify-center text-white shadow-2xl`}>
                      <p className="text-5xl font-bold">{count}</p>
                      <p className="text-xs mt-1 opacity-90">/ {totalBeads}</p>
                    </div>
                  </div>
                </div>

                {/* Counter Info */}
                <div className={`bg-gradient-to-r ${currentDhikr.light} rounded-2xl p-6 text-center border-2 border-opacity-20 mb-6`}>
                  <p className="text-slate-600 text-sm mb-2">Session Total</p>
                  <p className={`text-4xl font-bold bg-gradient-to-r ${currentDhikr.gradient} bg-clip-text text-transparent`}>
                    {totalCount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Scrollable Sebha */}
          {isMobile && (
            <div className="lg:col-span-2">
              {/* Dhikr Display Card */}
              <div className={`bg-gradient-to-br ${currentDhikr.gradient} rounded-2xl p-6 text-white text-center shadow-xl mb-6`}>
                <p className="text-5xl font-bold mb-2 font-arabic">{currentDhikr.text}</p>
                <p className="text-lg font-semibold mb-1">{currentDhikr.transliteration}</p>
                <p className="text-xs opacity-90">{currentDhikr.meaning}</p>
              </div>

              {/* Swipe Hint */}
              <div className="text-center mb-4 text-sm text-slate-600 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m0 0l4 4m10-4v12m0 0l4-4m0 0l-4-4" />
                </svg>
                <span>Swipe up to count</span>
              </div>

              {/* Scrollable Beads */}
              <div className="mb-6">
                <div
                  ref={scrollContainerRef}
                  className="relative h-96 bg-white rounded-2xl shadow-xl overflow-y-scroll overflow-x-hidden border-2 border-opacity-10"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <div className="flex flex-col items-center pt-32 pb-32">
                    {Array.from({ length: totalBeads }).map((_, i) => {
                      const isActive = i === count
                      const isCompleted = i < count

                      return (
                        <div
                          key={i}
                          ref={(el) => {
                            beadRefs.current[i] = el
                          }}
                          className={`flex items-center justify-center transition-all duration-300 snap-center ${
                            isActive ? 'h-24 scale-125' : 'h-16 scale-100'
                          }`}
                          onClick={() => setCount(i)}
                        >
                          <div
                            className={`rounded-full transition-all duration-300 cursor-pointer ${
                              isActive
                                ? `${currentDhikr.beadColor} w-20 h-20 shadow-2xl`
                                : isCompleted
                                ? `${currentDhikr.beadColor} w-12 h-12 opacity-60`
                                : 'bg-gray-300 w-12 h-12 opacity-30'
                            }`}
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              <span
                                className={`font-bold transition-all duration-300 ${
                                  isActive ? 'text-white text-2xl' : 'text-gray-600 text-sm'
                                }`}
                              >
                                {i + 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Counter Display Below Scroll */}
                <div className={`mt-6 bg-gradient-to-r ${currentDhikr.light} rounded-2xl p-6 text-center border-2 border-opacity-20`}>
                  <p className="text-slate-600 text-sm mb-2">Current Count</p>
                  <p className={`text-5xl font-bold bg-gradient-to-r ${currentDhikr.gradient} bg-clip-text text-transparent`}>
                    {count}
                  </p>
                  <p className="text-slate-500 text-xs mt-2">Session Total: {totalCount}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Dhikr Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Select Dhikr</h3>
              <div className="space-y-3">
                {Object.entries(dhikrs).map(([key, dhikr]) => (
                  <button
                    key={key}
                    onClick={() => handleDhikrChange(key)}
                    className={`w-full p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      selectedDhikr === key
                        ? `bg-gradient-to-r ${dhikr.gradient} text-white shadow-lg`
                        : `bg-gradient-to-r ${dhikr.light} text-slate-700 border-2 border-opacity-20 hover:shadow-md`
                    }`}
                  >
                    <p className="font-arabic text-lg mb-1">{dhikr.text}</p>
                    <p className="text-xs opacity-80">{dhikr.transliteration}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleCount}
                  className={`w-full bg-gradient-to-r ${currentDhikr.gradient} text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-lg`}
                >
                  + Count
                </button>
                <button
                  onClick={resetCount}
                  className={`w-full bg-gradient-to-r ${currentDhikr.gradient} text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300 opacity-80 hover:opacity-100`}
                >
                  Reset Count
                </button>
                <button
                  onClick={resetAll}
                  className="w-full bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-300 transition-all duration-300"
                >
                  Reset All
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Current</span>
                  <span className={`text-2xl font-bold bg-gradient-to-r ${currentDhikr.gradient} bg-clip-text text-transparent`}>
                    {count}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Session Total</span>
                  <span className={`text-2xl font-bold bg-gradient-to-r ${currentDhikr.gradient} bg-clip-text text-transparent`}>
                    {totalCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Progress</span>
                  <span className="text-sm font-semibold text-slate-500">
                    {Math.round((count / totalBeads) * 100)}%
                  </span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${currentDhikr.gradient} h-full transition-all duration-300`}
                  style={{ width: `${(count / totalBeads) * 100}%` }}
                />
              </div>
            </div>

            {/* Back Button */}
            <Link href="/pray">
              <button className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
                ← Back to Pray
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
