"use client";
import { MoreHorizontal } from "lucide-react";

const BASE_URL = "http://192.168.1.18:9001";

function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return url;
}

interface PhotoItem {
  post_id?: string;
  photo_url?: string | null;
  media_type?: string | null;
  created_at?: string | null;
}

interface PhotosGridProps {
  photos: PhotoItem[];
  onViewAll?: () => void;
}

export default function PhotosGrid({ photos, onViewAll }: PhotosGridProps) {
  // Filter photos that have valid URLs
  const validPhotos = photos.filter((p) => p.photo_url);

  if (validPhotos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#f0e6e5] p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Photos</h2>
        </div>
        <div className="text-center text-gray-500 py-4">No photos yet</div>
      </div>
    );
  }

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
        {validPhotos.slice(0, 9).map((photo, idx) => {
          const src = normalizeUrl(photo.photo_url);
          return (
            <div
              key={photo.post_id || `photo-${idx}`}
              className="relative aspect-square overflow-hidden rounded-sm cursor-pointer hover:opacity-90 transition-opacity"
            >
              {src ? (
                <img
                  src={src}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {validPhotos.length > 9 && (
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
