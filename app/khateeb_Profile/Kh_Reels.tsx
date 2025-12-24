"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Reel = {
  id: string;
  src: string; // video file url
  video_url?: string; // alternative field name from API
  thumbnail?: string;
  thumbnail_url?: string; // alternative field name from API
  title?: string;
  content?: string; // alternative field name from API
  author?: { name: string; avatar?: string };
  username?: string; // alternative field name from API
  user_avatar?: string; // alternative field name from API
};

interface KhReelsProps {
  reels?: Reel[];
  userId?: string;
}

const BASE_URL = "http://apisoapp.twingroups.com";

export default function KhReels({ reels: initialReels, userId: propUserId }: KhReelsProps) {
  const [reels, setReels] = useState<Reel[]>(initialReels || []);
  const [active, setActive] = useState<Reel | null>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({}); // track load failures
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reels from API
  useEffect(() => {
    const fetchReels = async () => {
      try {
        // Get user ID from props or localStorage
        let userId: string | null | undefined = propUserId;
        
        if (!userId) {
          userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
        }

        if (!userId) {
          console.warn('[Kh_Reels] No user ID available');
          setError('User ID not found');
          return;
        }

        setIsLoading(true);
        setError(null);

        // Get auth token
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        // Fetch reels from proxy endpoint to avoid CORS issues
        const response = await fetch(`/api/users/${userId}/reels`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reels: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[Kh_Reels] API Response:', data);
        console.log('[Kh_Reels] Response type:', typeof data);
        console.log('[Kh_Reels] Is array:', Array.isArray(data));

        // Handle different response formats
        let reelsData: any[] = [];
        if (Array.isArray(data)) {
          reelsData = data;
          console.log('[Kh_Reels] Using array format, count:', reelsData.length);
        } else if (data.reels && Array.isArray(data.reels)) {
          reelsData = data.reels;
          console.log('[Kh_Reels] Using data.reels format, count:', reelsData.length);
        } else if (data.data && Array.isArray(data.data)) {
          reelsData = data.data;
          console.log('[Kh_Reels] Using data.data format, count:', reelsData.length);
        } else {
          console.warn('[Kh_Reels] Unknown response format:', Object.keys(data));
        }

        if (reelsData.length === 0) {
          console.warn('[Kh_Reels] No reels found in response');
        }

        // Helper function to normalize URLs and use video proxy for videos
        const normalizeUrl = (url?: string | null, isVideo: boolean = false): string => {
          if (!url) return '';
          
          // Construct full URL if relative
          let fullUrl = url;
          if (!url.startsWith('http')) {
            fullUrl = `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
          }
          
          // Use video proxy for video files to avoid CORS issues
          if (isVideo && (fullUrl.includes('.mp4') || fullUrl.includes('/reels/') || fullUrl.includes('/video'))) {
            const proxyUrl = `/api/video-proxy?url=${encodeURIComponent(fullUrl)}`;
            console.log('[Kh_Reels] Video proxy URL:', { original: url, fullUrl, proxyUrl });
            return proxyUrl;
          }
          
          console.log('[Kh_Reels] Normalized URL:', { original: url, normalized: fullUrl });
          return fullUrl;
        };

        // Transform API response to Reel format
        const transformedReels: Reel[] = reelsData.map((item: any) => {
          const videoUrl = item.video_url || item.src || '';
          const thumbnailUrl = item.thumbnail_url || item.thumbnail || '';
          
          console.log('[Kh_Reels] Processing reel:', {
            id: item.id,
            videoUrl,
            thumbnailUrl,
            username: item.username,
            content: item.content,
          });

          return {
            id: item.id,
            src: normalizeUrl(videoUrl, true), // Use video proxy
            video_url: normalizeUrl(videoUrl, true), // Use video proxy
            thumbnail: normalizeUrl(thumbnailUrl, false), // No proxy for images
            thumbnail_url: normalizeUrl(thumbnailUrl, false), // No proxy for images
            title: item.content || item.title || '',
            content: item.content,
            author: {
              name: item.username || item.author?.name || 'Unknown',
              avatar: normalizeUrl(item.user_avatar || item.author?.avatar || '', false), // No proxy for images
            },
            username: item.username,
            user_avatar: normalizeUrl(item.user_avatar || '', false), // No proxy for images
          };
        });

        console.log('[Kh_Reels] Transformed reels:', transformedReels);
        setReels(transformedReels);
      } catch (err) {
        console.error('[Kh_Reels] Error fetching reels:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch reels');
        setReels([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we don't have initial reels or if userId changes
    if (!initialReels || initialReels.length === 0) {
      fetchReels();
    }
  }, [propUserId, initialReels]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-[75vh] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#8A1538]/30 border-t-[#8A1538] rounded-full animate-spin" />
          <p className="text-[#8A1538]/70 text-sm">Loading reels...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-[75vh] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-800 text-lg font-medium">Failed to load reels</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (reels.length === 0) {
    return (
      <div className="h-[75vh] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 bg-[#F7E9CF] rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#8A1538]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">No reels yet</p>
          <p className="text-gray-400 text-sm">This user hasn't created any reels</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* hide scrollbar and provide utility classes for video sizing */}
      <style>{`
        .kh-hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .kh-hide-scrollbar::-webkit-scrollbar { display: none; } /* Chrome, Safari, Opera */
        /* ensure modal container doesn't crop video */
        .kh-modal-container { max-width: 95vw; max-height: 95vh; }
        .kh-modal-video { width: 100%; height: 85vh; object-fit: contain; }
        .kh-preview-video { width: auto; height: 100%; object-fit: contain; }

        /* Scroll snap so one reel fills the view per scroll */
        .kh-reels-scroll {
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          scroll-padding-block: 0;
        }
        .kh-reel-item {
          scroll-snap-align: center;
          scroll-snap-stop: always;
          flex: 0 0 100%;
          height: 100%;
        }
      `}</style>

      {/* container with vertical scroll; scrollbar hidden via kh-hide-scrollbar
          changed to fixed viewport area and scroll-snap so one video fully visible */}
      <div className="h-[75vh] overflow-y-auto pr-0 kh-hide-scrollbar kh-reels-scroll">
        {/* Vertical list of reels */}
        {reels.map((r) => (
          <div
            key={r.id}
            className="relative rounded-lg overflow-hidden bg-black/5 flex items-stretch kh-reel-item"
          >
            {/* If src missing or previously failed, show placeholder */}
            {(!r.src && !r.video_url || failed[r.id]) ? (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-600">
                <div className="text-center">
                  <p>No preview available</p>
                  <p className="text-xs mt-1">Video URL: {r.video_url || r.src || 'N/A'}</p>
                </div>
              </div>
            ) : (
              // video preview: autoplay with muted & looped
              <div className="w-full h-full flex items-center justify-center bg-black cursor-pointer relative">
                    <video
                         key={r.id}
                         poster={r.thumbnail || r.thumbnail_url}
                         muted
                         autoPlay
                         loop
                         playsInline
                         preload="auto"
                         ref={(video) => {
                           if (video) {
                             // Force autoplay
                             const playPromise = video.play();
                             if (playPromise !== undefined) {
                               playPromise.catch(err => {
                                 console.log('[Kh_Reels] Autoplay error:', err);
                               });
                             }
                           }
                         }}
                         onMouseEnter={(e) => {
                            try {
                                const video = e.currentTarget as HTMLVideoElement;
                                video.play().catch(err => console.log('[Kh_Reels] Play error:', err));
                            } catch (err) {
                              console.log('[Kh_Reels] Mouse enter error:', err);
                            }
                        }}
                        onMouseLeave={(e) => {
                            try {
                                (e.currentTarget as HTMLVideoElement).pause();
                            } catch (err) {
                              console.log('[Kh_Reels] Mouse leave error:', err);
                            }
                        }}
                        onError={(e) => {
                          const video = e.currentTarget as HTMLVideoElement;
                          console.error('[Kh_Reels] Video error for reel:', r.id);
                          console.error('[Kh_Reels] Video src:', video.src);
                          console.error('[Kh_Reels] Video error code:', video.error?.code);
                          console.error('[Kh_Reels] Video error message:', video.error?.message);
                          // Don't mark as failed immediately, try to reload
                          setTimeout(() => {
                            video.load();
                          }, 1000);
                        }}
                        onLoadedMetadata={() => {
                          console.log('[Kh_Reels] Video loaded:', r.id);
                          // Ensure autoplay on metadata loaded
                          const video = document.querySelector(`video[data-reel-id="${r.id}"]`) as HTMLVideoElement;
                          if (video) {
                            video.play().catch(err => console.log('[Kh_Reels] Play on metadata error:', err));
                          }
                        }}
                        onCanPlay={() => {
                          console.log('[Kh_Reels] Video can play:', r.id);
                        }}
                        className="kh-preview-video h-full"
                        data-reel-id={r.id}
                        onClick={() => setActive(r)}
                        tabIndex={0}
                    >
                        <source src={r.src || r.video_url} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}

            {/* overlay info (at bottom of each reel) */}
            <button
              onClick={() => setActive(r)}
              className="absolute left-0 right-0 bottom-0 flex items-end justify-between p-3 bg-gradient-to-t from-black/40 to-transparent text-white"
              aria-label={`Open reel ${(r.title || r.content) ?? r.id}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-xs text-left pr-3 flex-1">
                  <div className="font-semibold text-sm">{r.title || r.content || "Reel"}</div>
                  {r.author?.name && (
                    <div className="text-[11px] opacity-90">{r.author.name}</div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {r.author?.avatar && (
                    <div className="relative bg-gray-200 rounded-full">
                      <div className="bg-white p-[3px] rounded-full">
                        <Image
                          src={r.author.avatar}
                          alt={r.author.name ?? "avatar"}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>
        ))}

        {/* Modal player */}
        {active && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setActive(null)} />
            <div className="relative w-full kh-modal-container mx-auto rounded-lg overflow-visible bg-black">
              <button
                onClick={() => setActive(null)}
                className="absolute top-3 right-3 z-20 bg-white/10 text-white rounded-full p-2 hover:bg-white/20"
                aria-label="Close"
              >
                ✕
              </button>

              {/* modal uses source to ensure type is recognized and kh-modal-video to avoid cropping */}
              <div className="flex justify-center items-center bg-black">
                <video
                  controls
                  autoPlay
                  muted
                  className="kh-modal-video"
                  onError={(e) => {
                    const video = e.currentTarget as HTMLVideoElement;
                    console.error('[Kh_Reels] Modal video error for reel:', active.id);
                    console.error('[Kh_Reels] Video src:', active.src || active.video_url);
                    console.error('[Kh_Reels] Video error code:', video.error?.code);
                    console.error('[Kh_Reels] Video error message:', video.error?.message);
                  }}
                  onLoadedMetadata={() => {
                    console.log('[Kh_Reels] Modal video loaded:', active.id);
                  }}
                  onCanPlay={() => {
                    console.log('[Kh_Reels] Modal video can play:', active.id);
                  }}
                >
                  <source src={active.src || active.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="p-4 bg-white">
                <div className="flex items-start gap-3">
                  {active.author?.avatar && (
                    <div className="w-10 h-10 rounded-full overflow-hidden relative">
                      <Image
                        src={active.author.avatar}
                        alt={active.author.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{active.title || active.content || "Reel"}</div>
                    {active.author?.name && (
                      <div className="text-sm text-gray-600">{active.author.name}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Khateeb • Reel</div>
                </div>

                {(active.title || active.content) && <p className="mt-3 text-sm text-gray-700">{active.title || active.content}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
