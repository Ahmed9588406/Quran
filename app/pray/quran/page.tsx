"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavBar from '../../user/navbar';
import LeftSide from '../../user/leftside';

const SURAH_URL = 'https://quranapi.pages.dev/api/surah.json';

type SurahRaw = Record<string, unknown>;

type Surah = {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  translation: string;
  ayahs: number;
};

// Fetch full surah list from remote API
async function fetchSurahList(): Promise<SurahRaw[] | null> {
  try {
    const res = await fetch(SURAH_URL);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;
    return data as SurahRaw[];
  } catch {
    return null;
  }
}

// ...existing static list remains in-file for immediate render...
// we will override it when fetch returns — store it in state

export default function QuranChapters() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [quranChapters, setQuranChapters] = useState<Surah[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await fetchSurahList();
      if (mounted && list) {
        // Map remote shape to the shape used in this UI
        // The endpoint returns objects like:
        // { surahName, surahNameArabic, surahNameArabicLong, surahNameTranslation, revelationPlace, totalAyah }
        const mapped = list.map((s, idx) => {
          const surahName = (s['surahName'] ?? '') as string;
          const surahNameArabic = (s['surahNameArabicLong'] ?? s['surahNameArabic'] ?? '') as string;
          const surahNameTranslation = (s['surahNameTranslation'] ?? '') as string;
          const totalAyah = Number(s['totalAyah'] ?? 0);
          // Use index+1 as unique surah number (API list is ordered)
          return {
            number: idx + 1,
            nameArabic: String(surahNameArabic),
            nameEnglish: String(surahName),
            translation: String(surahNameTranslation),
            ayahs: Number.isNaN(totalAyah) ? 0 : totalAyah,
          } as Surah;
        });
        setQuranChapters(mapped);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  return (
    <div
      className="min-h-screen pt-15 pl-14 p-8"
      style={{
        backgroundImage: "url('/icons/settings/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Top navigation */}
      <NavBar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Fixed left sidebar */}
      <LeftSide
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView="pray"
      />

      <div className="max-w-7xl mx-auto">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[50px]">
          {quranChapters.map((chapter, idx) => (
            <Link
              href={`/pray/quran/${chapter.number}`}
              key={idx}
            >
              <div
                className="bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                style={{
                  width: '268px',
                  height: '73px',
                  borderRadius: '8px',
                  padding: '8px',
                  opacity: 1
                }}
              >
                <div className="flex items-center justify-between h-full">
                  {/* Left: Number */}
                  <div
                    className="shrink-0"
                    style={{
                      width: '39.99999931542916px',
                      height: '39.99999931542916px',
                      borderRadius: '8px',
                      opacity: 1,
                      transform: 'rotate(45deg)',
                      backgroundColor: '#CFAE70',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        transform: 'rotate(-45deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                      }}
                    >
                      <span className="text-base font-semibold text-[#8A1538]">
                        {chapter.number}
                      </span>
                    </div>
                  </div>

                  {/* Center: Names */}
                  <div className="flex-1 mx-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-0.5 leading-tight">
                      {chapter.nameEnglish}
                    </h3>
                    <p className="text-xs text-gray-600 leading-tight">{chapter.translation}</p>
                  </div>

                  {/* Right: Arabic & Ayahs */}
                  <div className="shrink-0 text-right">
                    <div className="text-xl mb-0.5 font-arabic leading-tight text-[#333333]">{chapter.nameArabic}</div>
                    <p className="text-xs text-gray-600 leading-tight">{chapter.ayahs} Ayahs</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}