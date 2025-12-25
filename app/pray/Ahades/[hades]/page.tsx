/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import NavBar from '../../../user/navbar';
import LeftSide from '@/app/user/leftside';

const API_KEY = '$2y$10$RIuJylwAPesmEgBmKsZnfOCFTPTP0YI9rZLUZYWbEortEXDudvyt';

interface Chapter {
  id: number;
  chapterNumber: string;
  chapterEnglish: string;
  chapterUrdu: string;
  chapterArabic: string;
  bookSlug: string;
}

interface BookInfo {
  id: number;
  bookName: string;
  writerName: string;
  writerDeath: string;
  bookSlug: string;
}

interface Hadith {
  id: number;
  hadithNumber: string;
  englishNarrator: string;
  hadithEnglish: string;
  hadithUrdu: string;
  urduNarrator: string;
  hadithArabic: string;
  headingArabic: string | null;
  headingUrdu: string | null;
  headingEnglish: string | null;
  chapterId: string;
  bookSlug: string;
  volume: string;
  status: string;
  book: BookInfo;
  chapter: Chapter;
}

interface HadithResponse {
  status: number;
  message: string;
  hadiths: {
    current_page: number;
    data: Hadith[];
    last_page: number;
    per_page: number;
    total: number;
  };
}

const arabicNames: Record<string, string> = {
  'sahih-bukhari': 'صحيح البخاري',
  'sahih-muslim': 'صحيح مسلم',
  'al-tirmidhi': 'جامع الترمذي',
  'abu-dawood': 'سنن أبي داود',
  'ibn-e-majah': 'سنن ابن ماجه',
  'sunan-nasai': 'سنن النسائي',
  'mishkat': 'مشكاة المصابيح',
  'musnad-ahmad': 'مسند أحمد',
};

type Language = 'arabic' | 'english' | 'urdu';

export default function HadithCollectionPage() {
  const params = useParams();
  const bookSlug = params.hades as string;

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHadiths, setTotalHadiths] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('arabic');
  const [expandedHadith, setExpandedHadith] = useState<number | null>(null);
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  const fetchHadiths = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://hadithapi.com/public/api/hadiths?apiKey=${API_KEY}&book=${bookSlug}&page=${page}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch hadiths');
      
      const data: HadithResponse = await res.json();
      
      if (data.status === 200 && data.hadiths) {
        setHadiths(data.hadiths.data);
        setTotalPages(data.hadiths.last_page);
        setTotalHadiths(data.hadiths.total);
        setCurrentPage(data.hadiths.current_page);
        
        if (data.hadiths.data.length > 0 && data.hadiths.data[0].book) {
          setBookInfo(data.hadiths.data[0].book);
        }
      } else {
        throw new Error(data.message || 'Failed to load hadiths');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [bookSlug]);

  useEffect(() => {
    if (bookSlug) {
      fetchHadiths(currentPage);
    }
  }, [bookSlug, currentPage, fetchHadiths]);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const toggleExpand = (id: number) => {
    setExpandedHadith(expandedHadith === id ? null : id);
  };

  const getHadithText = (hadith: Hadith): string => {
    switch (selectedLanguage) {
      case 'english': return hadith.hadithEnglish;
      case 'urdu': return hadith.hadithUrdu;
      default: return hadith.hadithArabic;
    }
  };

  const getNarrator = (hadith: Hadith): string => {
    switch (selectedLanguage) {
      case 'english': return hadith.englishNarrator;
      case 'urdu': return hadith.urduNarrator;
      default: return '';
    }
  };

  const bookName = bookInfo?.bookName || bookSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const arabicName = arabicNames[bookSlug] || bookName;

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
      <NavBar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <LeftSide isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} activeView="pray" />

      <div className="max-w-4xl mx-auto">
        <Link
          href="/pray/Ahades"
          className="inline-flex items-center mb-6 text-[#8A1538] hover:text-[#6d1029] transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back to Collections</span>
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#8A1538] to-[#6d1029] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">{bookName}</h1>
              {bookInfo && <p className="text-white/80">By: {bookInfo.writerName}</p>}
              <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
                <span>{totalHadiths.toLocaleString()} Hadiths</span>
                <span>•</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-arabic mb-2">{arabicName}</div>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-md flex items-center justify-center gap-4">
          <span className="text-gray-600 font-medium">Language:</span>
          {(['arabic', 'english', 'urdu'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedLanguage === lang
                  ? 'bg-[#8A1538] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {lang === 'arabic' ? 'العربية' : lang === 'urdu' ? 'اردو' : 'English'}
            </button>
          ))}
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
            <div className="space-y-4 mb-6">
              {hadiths.map((hadith) => (
                <div key={hadith.id} className="bg-[#fdfaf5] rounded-xl p-6 shadow-md">
                  {/* Hadith Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: '#CFAE70', transform: 'rotate(45deg)' }}
                      >
                        <span className="text-sm font-bold text-[#8A1538]" style={{ transform: 'rotate(-45deg)' }}>
                          {hadith.hadithNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Hadith #{hadith.hadithNumber}</span>
                        {hadith.status && (
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            hadith.status === 'Sahih' ? 'bg-green-100 text-green-700' :
                            hadith.status === 'Hasan' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {hadith.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(hadith.id)}
                      className="text-[#8A1538] hover:text-[#6d1029] transition-colors"
                    >
                      <svg
                        className={`w-6 h-6 transition-transform ${expandedHadith === hadith.id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Chapter Info */}
                  {hadith.chapter && (
                    <div className="mb-4 p-3 bg-[#CFAE70]/10 rounded-lg">
                      <p className="text-sm text-[#8A1538] font-medium">
                        Chapter {hadith.chapter.chapterNumber}: {
                          selectedLanguage === 'arabic' ? hadith.chapter.chapterArabic :
                          selectedLanguage === 'urdu' ? hadith.chapter.chapterUrdu :
                          hadith.chapter.chapterEnglish
                        }
                      </p>
                    </div>
                  )}

                  {/* Narrator */}
                  {getNarrator(hadith) && (
                    <p className={`text-sm text-gray-600 mb-3 italic ${selectedLanguage === 'urdu' ? 'text-right' : ''}`}
                       dir={selectedLanguage === 'urdu' ? 'rtl' : 'ltr'}>
                      {getNarrator(hadith)}
                    </p>
                  )}

                  {/* Hadith Text */}
                  <div className={selectedLanguage === 'arabic' || selectedLanguage === 'urdu' ? 'text-right' : ''}
                       dir={selectedLanguage === 'arabic' || selectedLanguage === 'urdu' ? 'rtl' : 'ltr'}>
                    <p className={`leading-[2.5] text-[#333333] ${
                      selectedLanguage === 'arabic' ? 'text-xl font-arabic' :
                      selectedLanguage === 'urdu' ? 'text-lg' : 'text-base'
                    }`}>
                      {getHadithText(hadith)}
                    </p>
                  </div>

                  {/* Expanded: Show all languages */}
                  {expandedHadith === hadith.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                      {selectedLanguage !== 'arabic' && (
                        <div>
                          <h4 className="text-sm font-semibold text-[#8A1538] mb-2">العربية (Arabic)</h4>
                          <p className="text-xl font-arabic leading-[2.5] text-[#333333] text-right" dir="rtl">
                            {hadith.hadithArabic}
                          </p>
                        </div>
                      )}
                      {selectedLanguage !== 'english' && hadith.hadithEnglish && (
                        <div>
                          <h4 className="text-sm font-semibold text-[#8A1538] mb-2">English</h4>
                          {hadith.englishNarrator && (
                            <p className="text-sm text-gray-600 mb-2 italic">{hadith.englishNarrator}</p>
                          )}
                          <p className="text-base leading-relaxed text-[#333333]">{hadith.hadithEnglish}</p>
                        </div>
                      )}
                      {selectedLanguage !== 'urdu' && hadith.hadithUrdu && (
                        <div>
                          <h4 className="text-sm font-semibold text-[#8A1538] mb-2">اردو (Urdu)</h4>
                          {hadith.urduNarrator && (
                            <p className="text-sm text-gray-600 mb-2 italic text-right" dir="rtl">{hadith.urduNarrator}</p>
                          )}
                          <p className="text-lg leading-[2] text-[#333333] text-right" dir="rtl">{hadith.hadithUrdu}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
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
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= totalPages) setCurrentPage(val);
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8A1538] text-center"
                />
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

            <div className="bg-white/80 rounded-xl p-4 text-center text-sm text-gray-600">
              <p>Total: {totalHadiths.toLocaleString()} Hadiths | Page {currentPage} of {totalPages}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
