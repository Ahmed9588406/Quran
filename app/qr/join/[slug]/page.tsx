"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/admin";

interface MosqueStreamInfo {
  mosque: {
    id: number;
    name: string;
    city?: string;
    country?: string;
    preacher?: {
      displayName: string;
    };
  };
  room?: {
    id: number;
    roomId: number;
    title?: string;
    status: "ACTIVE" | "ENDED" | "PENDING";
    listenerCount?: number;
  };
  hasActiveStream: boolean;
}

export default function JoinStreamPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [status, setStatus] = useState<"loading" | "found" | "not-found" | "no-stream" | "error">("loading");
  const [streamInfo, setStreamInfo] = useState<MosqueStreamInfo | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState<string>("");

  const fetchMosqueInfo = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/mosques/by-slug/${slug}`);
      
      if (response.status === 404) {
        setStatus("not-found");
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch mosque info");
      }
      
      const data: MosqueStreamInfo = await response.json();
      setStreamInfo(data);
      
      if (data.hasActiveStream && data.room) {
        setStatus("found");
      } else {
        setStatus("no-stream");
      }
    } catch (err) {
      console.error("Error fetching mosque:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }, [slug]);

  useEffect(() => {
    fetchMosqueInfo();
  }, [fetchMosqueInfo]);

  // Countdown and redirect when stream is found
  useEffect(() => {
    if (status === "found" && streamInfo?.room) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Redirect to the listen page with room info
            router.push(`/qr/listen?roomId=${streamInfo.room!.roomId}&liveStreamId=${streamInfo.room!.id}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, streamInfo, router]);

  const handleJoinNow = () => {
    if (streamInfo?.room) {
      router.push(`/qr/listen?roomId=${streamInfo.room.roomId}&liveStreamId=${streamInfo.room.id}`);
    }
  };

  const handleRetry = () => {
    setStatus("loading");
    setCountdown(5);
    fetchMosqueInfo();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/icons/settings/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div 
          className="p-6 text-white text-center"
          style={{
            background: "linear-gradient(135deg, #8A1538 0%, #6d1029 100%)",
          }}
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-4xl">🕌</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {status === "loading" ? "Finding Stream..." : 
             status === "found" ? streamInfo?.mosque.name : 
             status === "not-found" ? "Mosque Not Found" :
             status === "no-stream" ? streamInfo?.mosque.name :
             "Connection Error"}
          </h1>
          {streamInfo && (
            <p className="text-white/80 text-sm">
              {streamInfo.mosque.city}{streamInfo.mosque.country ? `, ${streamInfo.mosque.country}` : ""}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {status === "loading" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#8A1538]/20 border-t-[#8A1538] rounded-full animate-spin"></div>
              <p className="text-gray-600 text-lg">Looking for active stream...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
            </div>
          )}

          {status === "found" && streamInfo?.room && (
            <div className="text-center py-4">
              {/* Live indicator */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-bold mb-6 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                LIVE NOW
              </div>

              {/* Stream info */}
              <div className="space-y-3 mb-6 text-left bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎤</span>
                  <div>
                    <p className="text-xs text-gray-500">Preacher</p>
                    <p className="font-medium text-gray-800">{streamInfo.mosque.preacher?.displayName || "Unknown"}</p>
                  </div>
                </div>
                {streamInfo.room.title && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📜</span>
                    <div>
                      <p className="text-xs text-gray-500">Topic</p>
                      <p className="font-medium text-gray-800">{streamInfo.room.title}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-xl">👥</span>
                  <div>
                    <p className="text-xs text-gray-500">Listeners</p>
                    <p className="font-medium text-gray-800">{streamInfo.room.listenerCount || 0} listening now</p>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full border-4 border-[#8A1538] flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#8A1538]">{countdown}</span>
                </div>
                <p className="text-gray-600">Joining stream in {countdown} seconds...</p>
              </div>

              {/* Join now button */}
              <button
                onClick={handleJoinNow}
                className="w-full py-3 px-6 bg-[#8A1538] hover:bg-[#6d1029] text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Join Now
              </button>
            </div>
          )}

          {status === "no-stream" && streamInfo && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📡</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Active Stream</h2>
              <p className="text-gray-600 mb-6">
                {streamInfo.mosque.name} is not currently streaming. Please check back later or contact the mosque for schedule information.
              </p>
              
              {streamInfo.mosque.preacher && (
                <p className="text-sm text-gray-500 mb-4">
                  Preacher: {streamInfo.mosque.preacher.displayName}
                </p>
              )}

              <button
                onClick={handleRetry}
                className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300"
              >
                Check Again
              </button>
            </div>
          )}

          {status === "not-found" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">❓</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Mosque Not Found</h2>
              <p className="text-gray-600 mb-6">
                We couldn&apos;t find a mosque with this QR code. The link may be incorrect or the mosque may have been removed.
              </p>
              <button
                onClick={() => router.push("/qr")}
                className="w-full py-3 px-6 bg-[#8A1538] hover:bg-[#6d1029] text-white rounded-xl font-medium transition-all duration-300"
              >
                Go to QR Scanner
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
              <p className="text-gray-600 mb-2">
                We encountered an error while connecting to the stream.
              </p>
              {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
              <button
                onClick={handleRetry}
                className="w-full py-3 px-6 bg-[#8A1538] hover:bg-[#6d1029] text-white rounded-xl font-medium transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Powered by Quran App • Live Streaming
          </p>
        </div>
      </div>
    </div>
  );
}
