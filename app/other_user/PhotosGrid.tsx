"use client";
import React from "react";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";

interface Photo {
  id: string;
  src: string;
  alt: string;
}

interface PhotosGridProps {
  photos: Photo[];
  onViewAll?: () => void;
}

export default function PhotosGrid({ photos, onViewAll }: PhotosGridProps) {
  return (
    <div className="bg-white rounded-lg border border-[#f0e6e5] p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Photos</h2>
        <button
          aria-label="More options"
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {photos.slice(0, 9).map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-sm cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
      </div>

      {photos.length > 9 && (
        <button
          onClick={onViewAll}
          className="w-full mt-3 py-2 text-sm text-[#7b2030] font-medium hover:bg-gray-50 rounded-md transition-colors"
        >
          View all photos
        </button>
      )}
    </div>
  );
}
