"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavBar from '../../user/navbar';
import LeftSide from '../../user/leftside';
import azkarData from './adhkar.json';

interface AzkarItem {
  id: number;
  text: string;
  count: number;
  audio: string;
  filename: string;
}

interface AzkarCategory {
  id: number;
  category: string;
  audio: string;
  filename: string;
  array: AzkarItem[];
}

export default function AzkarPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [categories] = useState<AzkarCategory[]>(azkarData as AzkarCategory[]);
  const [selectedCategory, setSelectedCategory] = useState<AzkarCategory | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  const toggleItem = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  

  if (selectedCategory) {
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
          {/* Back button */}
          <button
            onClick={() => {
              setSelectedCategory(null);
              setExpandedItems(new Set());
            }}
            className="inline-flex items-center mb-6 text-[#8A1538] hover:text-[#6d1029] transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Categories</span>
          </button>

          {/* Category Header */}
          <div className="bg-gradient-to-r from-[#8A1538] to-[#6d1029] rounded-2xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{selectedCategory.category}</h1>
                </div>
                <p className="text-white/80">{selectedCategory.array.length} أذكار</p>
              </div>
            </div>
          </div>

          {/* Azkar Items */}
          <div className="space-y-4 mb-6">
            {selectedCategory.array.map((item, index) => (
              <div key={item.id} className="bg-[#fdfaf5] rounded-xl p-6 shadow-md">
                {/* Item Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#CFAE70', transform: 'rotate(45deg)' }}
                    >
                      <span className="text-sm font-bold text-[#8A1538]" style={{ transform: 'rotate(-45deg)' }}>
                        {index + 1}
                      </span>
                    </div>
                    {item.count > 1 && (
                      <span className="px-3 py-1 bg-[#8A1538] text-white rounded-full text-sm font-medium">
                        {item.count}x
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="text-[#8A1538] hover:text-[#6d1029] transition-colors"
                  >
                    <svg
                      className={`w-6 h-6 transition-transform ${expandedItems.has(item.id) ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Arabic Text */}
                <div className="text-right" dir="rtl">
                  <p className={`font-arabic leading-[2.5] text-[#333333] ${
                    expandedItems.has(item.id) ? 'text-2xl' : 'text-xl'
                  }`}>
                    {item.text}
                  </p>
                </div>

                {/* Counter for repeated dhikr */}
                {expandedItems.has(item.id) && item.count > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-gray-600">Repeat:</span>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(item.count, 10) }, (_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-[#CFAE70]/20 flex items-center justify-center text-sm text-[#8A1538] font-medium"
                          >
                            {i + 1}
                          </div>
                        ))}
                        {item.count > 10 && (
                          <span className="text-gray-500 text-sm">... {item.count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8A1538] mb-2">الأذكار</h1>
          <p className="text-gray-600">Islamic Remembrances - Daily Supplications and Dhikr</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className="bg-white border border-gray-200 hover:shadow-lg transition-all cursor-pointer rounded-xl p-6 h-full text-left transform hover:scale-105 duration-200"
            >
              <div className="flex flex-col h-full">
                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-arabic text-[#8A1538] text-right mb-2" dir="rtl">
                      {category.category}
                    </h2>
                  </div>
                </div>

                {/* Count */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <span className="text-sm text-gray-500">{category.array.length} أذكار</span>
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
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
