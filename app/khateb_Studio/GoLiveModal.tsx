"use client";
import React, { useEffect, useState } from "react";
import { X, Mic, Loader2 } from "lucide-react";

type RoomInfo = {
  preacherId: string;
  username: string;
  displayName: string;
  liveStreamId: number;
  roomId: number;
  status: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onStartLive?: (roomInfo?: { roomId: number; liveStreamId: number; topic?: string }) => void;
};

export default function GoLiveModal({ open, onClose, onStartLive }: Props) {
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [whoCanSpeak, setWhoCanSpeak] = useState("Only people you invite to speak");
  const [recordSpace, setRecordSpace] = useState(false);

  // Fetch room info when modal opens
  useEffect(() => {
    if (!open) return;

    const fetchRoomInfo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const preacherId = localStorage.getItem("user_id");
        const token = localStorage.getItem("access_token");
        
        if (!preacherId) {
          setError("User not logged in");
          return;
        }

        if (!token) {
          setError("Authentication token not found. Please log in again.");
          return;
        }

        const response = await fetch(
          `/api/stream/room-info?preacherId=${preacherId}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch room info");
        }

        const data: RoomInfo = await response.json();
        setRoomInfo(data);
      } catch (err) {
        console.error("Error fetching room info:", err);
        setError(err instanceof Error ? err.message : "Failed to load room info");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomInfo();
  }, [open]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* modal */}
      <div className="relative z-70 w-[720px] max-w-[92vw] bg-[#FFF9F3] rounded-2xl shadow-xl p-8">
        {/* close button */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50"
        >
          <X className="w-5 h-5 text-[#231217]" />
        </button>

        {/* mic icon centered */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
            <Mic className="w-7 h-7 text-[#8A1538]" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-[#231217] text-center mb-4">Create your khotba room</h2>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-[#8A1538] animate-spin" />
            <span className="ml-3 text-sm text-gray-600">Loading room info...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Room info display - All fields */}
        {roomInfo && !isLoading && (
          <div className="mb-6 p-5 bg-gradient-to-br from-white to-[#FFF9F3] rounded-xl border-2 border-[#CFAE70] shadow-sm">
            <h3 className="text-sm font-semibold text-[#8A1538] mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#8A1538]"></div>
              Live Stream Room Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Preacher ID */}
              <div className="bg-white/60 p-3 rounded-lg">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Preacher ID</span>
                <p className="font-semibold text-[#231217] mt-1 break-all">{roomInfo.preacherId}</p>
              </div>
              
              {/* Display Name */}
              <div className="bg-white/60 p-3 rounded-lg">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Display Name</span>
                <p className="font-semibold text-[#231217] mt-1">{roomInfo.displayName}</p>
              </div>
              
              {/* Username */}
              <div className="bg-white/60 p-3 rounded-lg">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Username</span>
                <p className="font-semibold text-[#231217] mt-1">@{roomInfo.username}</p>
              </div>
              
              {/* Live Stream ID */}
              <div className="bg-white/60 p-3 rounded-lg">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Live Stream ID</span>
                <p className="font-semibold text-[#231217] mt-1">{roomInfo.liveStreamId}</p>
              </div>
              
              {/* Room ID */}
              <div className="bg-white/60 p-3 rounded-lg">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Room ID</span>
                <p className="font-semibold text-[#231217] mt-1">{roomInfo.roomId}</p>
              </div>
              
              {/* Status */}
              <div className="bg-white/60 p-3 rounded-lg">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
                <p className="font-semibold text-[#231217] mt-1 capitalize flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    roomInfo.status.toLowerCase() === 'active' ? 'bg-green-500' : 
                    roomInfo.status.toLowerCase() === 'inactive' ? 'bg-gray-400' : 
                    'bg-yellow-500'
                  }`}></span>
                  {roomInfo.status}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Who can speak select */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-2">Who can speak?</label>
          <div className="relative">
            <select 
              value={whoCanSpeak}
              onChange={(e) => setWhoCanSpeak(e.target.value)}
              className="w-full h-12 rounded-lg border border-[#E7D9D2] bg-white px-4 text-sm text-[#231217] appearance-none"
            >
              <option>Only people you invite to speak</option>
              <option>People you follow</option>
              <option>Everyone</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
          </div>
        </div>

        {/* Topic input */}
        <div className="mb-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What do you want to talk about?"
            className="w-full h-12 rounded-lg border-2 border-[#8A1538] px-4 text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Record Space toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-[#231217]">Record Space</div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={recordSpace}
                onChange={(e) => setRecordSpace(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-[#8A1538] transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full border transform peer-checked:translate-x-4 transition-transform" />
            </label>
          </div>
        </div>

        {/* Start live button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              if (!roomInfo) {
                alert("Please wait for room info to load");
                return;
              }
              onStartLive?.({
                roomId: roomInfo.roomId,
                liveStreamId: roomInfo.liveStreamId,
                topic: topic || undefined,
              });
            }}
            disabled={isLoading || !roomInfo}
            className="w-64 h-12 bg-[#7A1233] hover:bg-[#6d1029] text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Loading..." : "Start live"}
          </button>
        </div>
      </div>
    </div>
  );
}
