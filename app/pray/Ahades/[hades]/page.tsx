/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import NavBar from '../../../user/navbar';
import LeftSide from '@/app/user/leftside';

// Collection metadata
const collectionInfo: Record<string, { nameEnglish: string; nameArabic: string }> = {
  bukhari: { nameEnglish: 'Sahih al-Bukhari', nameArabic: 'صحيح البخاري' },
  muslim: { nameEnglish: 'Sahih Muslim', nameArabic: 'صحيح مسلم' },
  abudawud: { nameEnglish: 'Sunan Abu Dawud', nameArabic: 'سنن أبي داود' },
  tirmidhi: { nameEnglish: 'Jami at-Tirmidhi', nameArabic: 'جامع الترمذي' },
  nasai: { nameEnglish: "Sunan an-Nasa'i", nameArabic: 'سنن النسائي' },
  ibnmajah: { nameEnglish: 'Sunan Ibn Majah', nameArabic: 'سنن ابن ماجه' },
};

interface Hadith {
  number: number;
  arab: string;
  id?: string;
}

export default function HadithCollectionPage() {
  const params = useParams();
  const collectionId = params.hades as string;

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalHadiths, setTotalHadiths] = useState(0);

  const hadithsPerPage = 10;

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  const collection = collectionInfo[collectionId] || {
    nameEnglish: collectionId,
    nameArabic: collectionId,
  };

  useEffect(() => {
    const fetchHadiths = async () => {
      setLoading(true);
      setError(null);
      try {
        // Using the Hadith API - fetching a range of hadiths
        const startHadith = (currentPage - 1) * hadithsPerPage + 1;
        const endHadith = currentPage * hadithsPerPage;
        
        const promises = [];
        for (let i = startHadith; i <= endHadith; i++) {
          promises.push(
            fetch(`https://api.hadith.gading.dev/books/${collectionId}/${i}`)
              .then(res => res.json())
              .catch(() => null)
          );
        }
        
        const results = await Promise.all(promises);
        const validHadiths = results
          .filter(r => r && r.data)
          .map(r => ({
            number: r.data.number,
            arab: r.data.arab,
            id: r.data.id,
          }));
        
        setHadiths(validHadiths);
        
        // Get total count from the first request or use default
        if (results[0]?.data) {
          // Estimate total based on collection
          const totals: Record<string, number> = {
            bukhari: 7563,
            muslim: 3033,
            abudawud: 3998,
            tirmidhi: 3956,
            nasai: 5758,
            ibnmajah: 4341,
          };
          setTotalHadiths(totals[collectionId] || 1000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (collectionId) {
      fetchHadiths();
    }
  }, [collectionId, currentPage]);

  const totalPages = Math.ceil(totalHadiths / hadithsPerPage);

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
          href="/pray/Ahades"
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
          <span className="font-medium">Back to Collections</span>
        </Link>

        {/* Collection Header */}
        <div className="bg-gradient-to-r from-[#8A1538] to-[#6d1029] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">{collection.nameEnglish}</h1>
              <p className="text-white/80">Hadith Collection</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
                <span>{totalHadiths.toLocaleString()} Hadiths</span>
                <span>•</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-arabic mb-2">{collection.nameArabic}</div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8A1538]"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error loading hadiths</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Hadiths Container */}
            <div className="space-y-4 mb-6">
              {hadiths.map((hadith, idx) => (
                <div
                  // composite key to avoid collisions: collectionId + hadith number + index
                  key={`${collectionId}-${hadith.number ?? idx}-${hadith.id ?? idx}`}
                  className="bg-[#fdfaf5] rounded-xl p-6 shadow-md"
                >
                   {/* Hadith Number */}
                   <div className="flex items-center justify-between mb-4">
                     <div
                       className="w-10 h-10 rounded-lg flex items-center justify-center"
                       style={{
                         backgroundColor: '#CFAE70',
                         transform: 'rotate(45deg)',
                       }}
                     >
                       <span
                         className="text-sm font-bold text-[#8A1538]"
                         style={{ transform: 'rotate(-45deg)' }}
                       >
                         {hadith.number}
                       </span>
                     </div>
                     <span className="text-sm text-gray-500">
                       Hadith #{hadith.number}
                     </span>
                   </div>

                   {/* Arabic Text */}
                   <div className="text-right" dir="rtl">
                     <p className="text-xl font-arabic leading-[2.5] text-[#333333]">
                       {hadith.arab}
                     </p>
                   </div>
                 </div>
               ))}
            </div>

            {/* Page Navigation */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-6 py-3 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-lg">
                <span className="text-gray-600">Page:</span>
                <select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8A1538]"
                >
                  {Array.from({ length: Math.min(totalPages, 100) }, (_, i) => i + 1).map((page) => (
                    <option key={page} value={page}>
                      {page}
                    </option>
                  ))}
                </select>
                <span className="text-gray-600">of {totalPages}</span>
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-[#8A1538] text-white rounded-lg hover:bg-[#6d1029] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-medium"
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Info */}
            <div className="bg-white/80 rounded-xl p-4 text-center text-sm text-gray-600">
              <p>
                Showing Hadiths {(currentPage - 1) * hadithsPerPage + 1} -{' '}
                {Math.min(currentPage * hadithsPerPage, totalHadiths)} of {totalHadiths.toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
