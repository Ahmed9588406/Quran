"use client"
import React, { useState } from 'react'
import Image from 'next/image'

type Tab = 'Media' | 'links' | 'docs'

type Props = {
  onClose: () => void
}

const placeholderImages = [
  'https://picsum.photos/seed/m1/200',
  'https://picsum.photos/seed/m2/200',
  'https://picsum.photos/seed/m3/200',
  'https://picsum.photos/seed/m4/200',
  'https://picsum.photos/seed/m5/200',
  'https://picsum.photos/seed/m6/200',
  'https://picsum.photos/seed/m7/200',
  'https://picsum.photos/seed/m8/200',
  'https://picsum.photos/seed/m9/200',
]

export default function MediaPanel({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Media')

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Tabs */}
      <nav className="flex border-b" style={{ borderColor: '#E5E7EB' }}>
        {(['Media', 'links', 'docs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-[#8A1538] border-b-2 border-[#8A1538]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {activeTab === 'Media' && (
          <div className="grid grid-cols-3 gap-1">
            {placeholderImages.map((src, i) => (
              <div key={i} className="aspect-square rounded overflow-hidden bg-gray-100">
                <Image src={src} alt={`media ${i + 1}`} width={200} height={200} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="text-sm text-gray-500 py-6 text-center">No links yet</div>
        )}

        {activeTab === 'docs' && (
          <div className="text-sm text-gray-500 py-6 text-center">No docs yet</div>
        )}
      </div>
    </div>
  )
}
