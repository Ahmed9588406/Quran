"use client";
import React from "react";

interface PhotoItem {
  post_id: string;
  photo_url: string;
  media_type: string;
  created_at: string;
}

interface PhotosGridProps {
  photos: PhotoItem[];
  onViewAll?: () => void;
}

export default function PhotosGrid({ photos, onViewAll }: PhotosGridProps) {
  const displayPhotos = photos.slice(0, 9);

  return (
    <div className="bg-white rounded-lg border border-[#f0e6e5] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Photos</h3>
        {photos.length > 9 && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-[#7b2030] hover:underline"
          >
            See All
          </button>
        )}
      </div>

      {displayPhotos.length === 0 ? (
        <div className="text-center text-gray-500 py-4 text-sm">
          No photos yet
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {displayPhotos.map((photo, idx) => (
            <div
              key={photo.post_id || `photo-${idx}`}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={photo.photo_url}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
