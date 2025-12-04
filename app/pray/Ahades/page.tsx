"use client";
import { useState } from 'react';
import Link from 'next/link';
import NavBar from '../../user/navbar';
import LeftSide from '../../user/leftside';

// Hadith collections available from the API
const hadithCollections = [
  { id: 'bukhari', nameEnglish: 'Sahih al-Bukhari', nameArabic: 'صحيح البخاري', hadithCount: 7563, description: 'The most authentic collection of Hadith' },
  { id: 'muslim', nameEnglish: 'Sahih Muslim', nameArabic: 'صحيح مسلم', hadithCount: 3033, description: 'Second most authentic collection' },
  { id: 'abudawud', nameEnglish: 'Sunan Abu Dawud', nameArabic: 'سنن أبي داود', hadithCount: 3998, description: 'Collection by Abu Dawud' },
  { id: 'tirmidhi', nameEnglish: 'Jami at-Tirmidhi', nameArabic: 'جامع الترمذي', hadithCount: 3956, description: 'Collection by al-Tirmidhi' },
  { id: 'nasai', nameEnglish: "Sunan an-Nasa'i", nameArabic: 'سنن النسائي', hadithCount: 5758, description: "Collection by an-Nasa'i" },
  { id: 'ibnmajah', nameEnglish: 'Sunan Ibn Majah', nameArabic: 'سنن ابن ماجه', hadithCount: 4341, description: 'Collection by Ibn Majah' },
];

export default function AhadesPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8A1538] mb-2">أحاديث النبوية</h1>
          <p className="text-gray-600">Prophetic Traditions - Select a collection to browse</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hadithCollections.map((collection) => (
            <Link
              href={`/pray/Ahades/${collection.id}`}
              key={collection.id}
            >
              <div className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer rounded-xl p-6 h-full">
                <div className="flex flex-col h-full">
                  {/* Arabic Name */}
                  <div className="text-right mb-4">
                    <h2 className="text-2xl font-arabic text-[#8A1538]">{collection.nameArabic}</h2>
                  </div>

                  {/* English Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {collection.nameEnglish}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 flex-grow">
                    {collection.description}
                  </p>

                  {/* Hadith Count */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {collection.hadithCount.toLocaleString()} Hadiths
                    </span>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: '#CFAE70',
                        transform: 'rotate(45deg)',
                      }}
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
      </div>
    </div>
  );
}
