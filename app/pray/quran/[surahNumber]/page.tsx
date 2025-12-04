/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '../../../user/navbar';
import LeftSide from '@/app/user/leftside';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
  surah: Surah;
}

interface SurahResponse {
  code: number;
  status: string;
  data: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
    ayahs: Ayah[];
    edition: {
      identifier: string;
      language: string;
      name: string;
      englishName: string;
      format: string;
      type: string;
      direction: string;
    };
  };
}

// Arabic number converter
const toArabicNumber = (num: number): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumbers[parseInt(digit)]).join('');
};

const SURAH_URL = 'https://quranapi.pages.dev/api/surah.json';

async function fetchSurahList(): Promise<any[] | null> {
  try {
    const res = await fetch(SURAH_URL);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;
    return data;
  } catch {
    return null;
  }
}

export default function SurahPage() {
  const params = useParams();
  const router = useRouter();
  const surahNumber = params.surahNumber as string;

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [surahData, setSurahData] = useState<SurahResponse['data'] | null>(null);
  const [surahMeta, setSurahMeta] = useState<any | null>(null); // metadata from surah.json
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [showBismillahHeader, setShowBismillahHeader] = useState(false);

  const ayahsPerPage = 10; // Number of ayahs per custom page

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  useEffect(() => {
    const fetchSurah = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch surah data');
        }
        const data: SurahResponse = await response.json();
        
        // Check if we should show Bismillah header (not Surah 9 and not Surah 1)
        const shouldShowBismillah = parseInt(surahNumber) !== 9 && parseInt(surahNumber) !== 1;
        setShowBismillahHeader(shouldShowBismillah);
        
        // Fetch ayahs from the new API
        const ayahPromises = Array.from({ length: data.data.numberOfAyahs }, (_, i) =>
          fetch(`https://quranapi.pages.dev/api/${surahNumber}/${i + 1}.json`).then(res => res.json())
        );
        const ayahDatas = await Promise.all(ayahPromises);
        
        // Map to Ayah interface, keeping original metadata but replacing text
        const ayahs: Ayah[] = data.data.ayahs.map((ayah, idx) => ({
          ...ayah,
          text: ayahDatas[idx].arabic1,
        }));
        
        setSurahData({ ...data.data, ayahs });
        
        // Set initial page to 1
        setCurrentPage(1);
        setCurrentAyah(1);
        
        // also fetch surah list metadata and pick the matching surah to enhance header
        const list = await fetchSurahList();
        if (Array.isArray(list)) {
          // Since list is ordered, surah 1 is index 0
          const found = list[Number(surahNumber) - 1];
          if (found) setSurahMeta(found);
        }
       } catch (err) {
         setError(err instanceof Error ? err.message : 'An error occurred');
       } finally {
         setLoading(false);
       }
    };

    if (surahNumber) {
      fetchSurah();
    }
  }, [surahNumber]);

  // Calculate custom pages
  const totalPages = surahData ? Math.ceil(surahData.numberOfAyahs / ayahsPerPage) : 0;
  const startAyah = (currentPage - 1) * ayahsPerPage + 1;
  const endAyah = Math.min(currentPage * ayahsPerPage, surahData?.numberOfAyahs || 0);
  const currentPageAyahs = surahData ? surahData.ayahs.slice(startAyah - 1, endAyah) : [];

  // Get unique pages for this surah
  const uniquePages = surahData
    ? [...new Set(surahData.ayahs.map((ayah) => ayah.page))].sort((a, b) => a - b)
    : [];

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousSurah = () => {
    const num = parseInt(surahNumber);
    if (num > 1) {
      router.push(`/pray/quran/${num - 1}`);
    }
  };

  const goToNextSurah = () => {
    const num = parseInt(surahNumber);
    if (num < 114) {
      router.push(`/pray/quran/${num + 1}`);
    }
  };

  // Navigate to a specific ayah
  const goToAyah = (ayahNumber: number) => {
    if (surahData) {
      const page = Math.ceil(ayahNumber / ayahsPerPage);
      setCurrentAyah(ayahNumber);
      setCurrentPage(page);
    }
  };

  const goToPreviousAyah = () => {
    if (currentAyah > 1) {
      goToAyah(currentAyah - 1);
    }
  };

  const goToNextAyah = () => {
    if (surahData && currentAyah < surahData.numberOfAyahs) {
      goToAyah(currentAyah + 1);
    }
  };

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

      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          href="/pray/quran"
          className="inline-flex items-center mb-6 text-[#8A1538] hover:text-[#6d1029] transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium">Back to Surahs</span>
        </Link>

        {loading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8A1538]"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error loading surah</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {surahData && !loading && (
          <>
            {/* Surah Header */}
            <div className="bg-gradient-to-r from-[#8A1538] to-[#6d1029] rounded-2xl p-6 mb-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-1">
                    {surahMeta?.surahName || surahData.englishName}
                  </h1>
                  <p className="text-white/80">
                    {surahMeta?.surahNameTranslation || surahData.englishNameTranslation}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
                    <span>{surahData.revelationType}</span>
                    <span>•</span>
                    <span>{surahMeta?.totalAyah ?? surahData.numberOfAyahs} Ayahs</span>
                    <span>•</span>
                    <span>Page {currentPage} of {totalPages}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-arabic mb-2">{surahMeta?.surahNameArabicLong || surahData.name}</div>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto"
                    style={{
                      backgroundColor: '#CFAE70',
                      transform: 'rotate(45deg)',
                    }}
                  >
                    <span
                      className="text-lg font-bold text-[#8A1538]"
                      style={{ transform: 'rotate(-45deg)' }}
                    >
                      {surahData.number}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Surah Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousSurah}
                disabled={parseInt(surahNumber) <= 1}
                className="px-4 py-2 bg-[#CFAE70] rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Surah
              </button>
              <button
                onClick={goToNextSurah}
                disabled={parseInt(surahNumber) >= 114}
                className="px-4 py-2 bg-[#CFAE70] text-[#8A1538] rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next Surah
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Ayah Navigation */}
            <div className="flex items-center justify-center gap-3 mb-4 bg-white/90 rounded-xl p-3 shadow-md">
              <button
                onClick={goToPreviousAyah}
                disabled={currentAyah <= 1}
                className="px-3 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Prev Ayah
              </button>

              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Ayah:</span>
                <select
                  value={currentAyah}
                  onChange={(e) => goToAyah(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A1538] text-sm"
                >
                  {surahData.ayahs.map((ayah) => (
                    <option key={ayah.numberInSurah} value={ayah.numberInSurah}>
                      {ayah.numberInSurah}
                    </option>
                  ))}
                </select>
                <span className="text-gray-600 text-sm">of {surahData.numberOfAyahs}</span>
              </div>

              <button
                onClick={goToNextAyah}
                disabled={currentAyah >= surahData.numberOfAyahs}
                className="px-3 py-2 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
              >
                Next Ayah
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Bismillah Header - Show for all surahs except At-Tawbah (9) and Al-Fatihah (1) */}
            {showBismillahHeader && currentPage === 1 && (
              <div className="bg-[#fdfaf5] rounded-xl p-6 mb-6 text-center shadow-md">
                <p className="text-3xl font-arabic text-[#333333] leading-loose">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              </div>
            )}

            {/* Ayahs Container */}
            <div className="bg-[#fdfaf5] rounded-2xl p-8 shadow-lg mb-6">
              <div className="text-right" dir="rtl">
                <p className="text-2xl font-arabic leading-[3] text-[#333333] text-justify">
                  {currentPageAyahs.map((ayah, index) => {
                    return (
                      <span key={ayah.number} className="inline">
                        <span 
                          id={`ayah-${ayah.numberInSurah}`}
                          className={`hover:bg-[#CFAE70]/20 rounded px-1 transition-colors ${
                            ayah.numberInSurah === currentAyah ? 'bg-[#CFAE70]/30' : ''
                          }`}
                        >
                          {ayah.text}
                        </span>
                        <span className="inline-flex items-center justify-center mx-1 text-[#8A1538] font-semibold text-base">
                          ﴿{toArabicNumber(ayah.numberInSurah)}﴾
                        </span>
                        {index < currentPageAyahs.length - 1 && ' '}
                      </span>
                    );
                  })}
                </p>
              </div>
            </div>

            {/* Fixed Page Navigation - Always visible with two buttons */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={goToPreviousPage}
                disabled={loading || currentPage === 1}
                className="px-6 py-3 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Page
              </button>

              <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-lg">
                <span className="text-gray-600">Page:</span>
                <select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8A1538]"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <option key={page} value={page}>
                      {page}
                    </option>
                  ))}
                </select>
                <span className="text-gray-600">of {totalPages}</span>
              </div>

              <button
                onClick={goToNextPage}
                disabled={loading || currentPage === totalPages}
                className="px-6 py-3 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-medium"
              >
                Next Page
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Ayah Info */}
            <div className="bg-white/80 rounded-xl p-4 text-center text-sm text-gray-600">
              <p>
                Showing Ayahs {startAyah} - {endAyah} of {surahData.numberOfAyahs} | Page {currentPage} of {totalPages} | Current Ayah: {currentAyah}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}