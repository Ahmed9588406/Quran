"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavBar from '../../user/navbar';
import LeftSide from '../../user/leftside';

const API_KEY = '$2y$10$RIuJylwAPesmEgBmKsZnfOCFTPTP0YI9rZLUZYWbEortEXDudvyt';

interface Book {
  id: number;
  bookName: string;
  writerName: string;
  writerDeath: string;
  bookSlug: string;
}

// Fallback collections if API fails
const fallbackCollections = [
  { id: 1, bookName: 'Sahih Bukhari', writerName: 'Imam Bukhari', writerDeath: '256 ھ', bookSlug: 'sahih-bukhari', nameArabic: 'صحيح البخاري' },
  { id: 2, bookName: 'Sahih Muslim', writerName: 'Imam Muslim', writerDeath: '261 ھ', bookSlug: 'sahih-muslim', nameArabic: 'صحيح مسلم' },
  { id: 3, bookName: 'Jami At-Tirmidhi', writerName: 'Imam Tirmidhi', writerDeath: '279 ھ', bookSlug: 'al-tirmidhi', nameArabic: 'جامع الترمذي' },
  { id: 4, bookName: 'Sunan Abu Dawud', writerName: 'Imam Abu Dawud', writerDeath: '275 ھ', bookSlug: 'abu-dawood', nameArabic: 'سنن أبي داود' },
  { id: 5, bookName: 'Sunan Ibn Majah', writerName: 'Imam Ibn Majah', writerDeath: '273 ھ', bookSlug: 'ibn-e-majah', nameArabic: 'سنن ابن ماجه' },
  { id: 6, bookName: "Sunan An-Nasa'i", writerName: "Imam An-Nasa'i", writerDeath: '303 ھ', bookSlug: 'sunan-nasai', nameArabic: 'سنن النسائي' },
  { id: 7, bookName: 'Mishkat Al-Masabih', writerName: 'Imam Tabrizi', writerDeath: '741 ھ', bookSlug: 'mishkat', nameArabic: 'مشكاة المصابيح' },
  { id: 8, bookName: 'Musnad Ahmad', writerName: 'Imam Ahmad', writerDeath: '241 ھ', bookSlug: 'musnad-ahmad', nameArabic: 'مسند أحمد' },
];

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

export default function AhadesPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`https://hadithapi.com/public/api/books?apiKey=${API_KEY}`);
        if (res.ok) {
          const data = await res.json();
          if (data.books && Array.isArray(data.books)) {
            setBooks(data.books);
          } else {
            setBooks(fallbackCollections);
          }
        } else {
          setBooks(fallbackCollections);
        }
      } catch {
        setBooks(fallbackCollections);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

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

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8A1538] mb-2">أحاديث النبوية</h1>
          <p className="text-gray-600">Prophetic Traditions - Select a collection to browse</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8A1538]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Link href={`/pray/Ahades/${book.bookSlug}`} key={book.id}>
                <div className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer rounded-xl p-6 h-full">
                  <div className="flex flex-col h-full">
                    <div className="text-right mb-4">
                      <h2 className="text-2xl font-arabic text-[#8A1538]">
                        {arabicNames[book.bookSlug] || book.bookName}
                      </h2>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{book.bookName}</h3>
                    <p className="text-sm text-gray-600 mb-2">By: {book.writerName}</p>
                    <p className="text-xs text-gray-500 mb-4 flex-grow">Passed: {book.writerDeath}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">Browse Hadiths</span>
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: '#CFAE70', transform: 'rotate(45deg)' }}
                      >
                        <svg
                          className="w-5 h-5 text-[#8A1538]"
                          style={{ transform: 'rotate(-45deg)' }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
