"use client";
import React, { useState, useEffect } from "react";
import {
  Disc,
  Play,
  Download,
  Trash2,
  Search,
  Calendar,
  Clock,
  MoreVertical,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { streamAPI, OldRoomInfo } from "@/lib/streaming/api";
import { toast } from "react-toastify";

interface Recording {
  id: number;
  roomId: number;
  title: string;
  mosqueName?: string;
  preacherName?: string;
  duration?: string;
  createdAt: string;
  fileSize?: string;
  playUrl: string;
  downloadUrl: string;
}

function AudioPlayer({ recording, onClose }: { recording: Recording; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
      <audio ref={audioRef} src={recording.playUrl} preload="metadata" />
      
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-lg bg-[#8A1538] flex items-center justify-center shrink-0">
            <Disc className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[#231217] truncate">{recording.title}</p>
            <p className="text-sm text-gray-500 truncate">{recording.mosqueName || "Unknown"}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 flex-1 justify-center">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-[#8A1538] flex items-center justify-center hover:bg-[#6d1029] transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs text-gray-500 w-10">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#8A1538]"
          />
          <span className="text-xs text-gray-500 w-10">{formatTime(duration)}</span>
        </div>

        {/* Volume & Close */}
        <div className="flex items-center gap-3">
          <button onClick={toggleMute} className="p-2 hover:bg-gray-100 rounded-lg">
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-600" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function RecordingCard({
  recording,
  onPlay,
  onDownload,
  onDelete,
}: {
  recording: Recording;
  onPlay: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-[#FFF9F3] flex items-center justify-center shrink-0">
          <Disc className="w-7 h-7 text-[#8A1538]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-[#231217] truncate">{recording.title}</h3>
              <p className="text-sm text-gray-500">{recording.mosqueName || "Unknown Mosque"}</p>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                    <button
                      onClick={() => {
                        onDownload();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(recording.createdAt).toLocaleDateString()}</span>
            </div>
            {recording.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{recording.duration}</span>
              </div>
            )}
            {recording.fileSize && (
              <span className="text-gray-400">{recording.fileSize}</span>
            )}
          </div>

          <button
            onClick={onPlay}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8A1538] text-white text-sm font-medium hover:bg-[#6d1029] transition-colors"
          >
            <Play className="w-4 h-4" />
            Play Recording
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecordingsPanel() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const oldRooms = await streamAPI.getOldRooms();
        const recordingsList: Recording[] = [];

        oldRooms.forEach((info, roomId) => {
          if (info.recordingAvailable) {
            recordingsList.push({
              id: roomId,
              roomId,
              title: info.title || `Recording #${roomId}`,
              createdAt: new Date().toISOString(),
              playUrl: streamAPI.getRecordingPlayUrl(roomId),
              downloadUrl: streamAPI.getRecordingDownloadUrl(roomId),
            });
          }
        });

        setRecordings(recordingsList);
      } catch (error) {
        console.error("Failed to fetch recordings:", error);
        // Mock data for demo
        setRecordings([
          {
            id: 1,
            roomId: 1,
            title: "Friday Khutbah - Week 1",
            mosqueName: "Al-Noor Mosque",
            preacherName: "Sheikh Ahmed",
            duration: "45:30",
            createdAt: "2024-12-15T10:00:00Z",
            fileSize: "32 MB",
            playUrl: "#",
            downloadUrl: "#",
          },
          {
            id: 2,
            roomId: 2,
            title: "Quran Recitation Session",
            mosqueName: "Central Mosque",
            preacherName: "Sheikh Mohammed",
            duration: "1:20:15",
            createdAt: "2024-12-14T14:30:00Z",
            fileSize: "58 MB",
            playUrl: "#",
            downloadUrl: "#",
          },
          {
            id: 3,
            roomId: 3,
            title: "Islamic Lecture - Ramadan Prep",
            mosqueName: "East Side Mosque",
            preacherName: "Sheikh Ibrahim",
            duration: "55:00",
            createdAt: "2024-12-13T18:00:00Z",
            fileSize: "40 MB",
            playUrl: "#",
            downloadUrl: "#",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  const handlePlay = (recording: Recording) => {
    setCurrentRecording(recording);
  };

  const handleDownload = (recording: Recording) => {
    window.open(recording.downloadUrl, "_blank");
    toast.success("Download started");
  };

  const handleDelete = (recording: Recording) => {
    if (!confirm("Are you sure you want to delete this recording?")) return;
    setRecordings(recordings.filter((r) => r.id !== recording.id));
    toast.success("Recording deleted");
  };

  const filteredRecordings = recordings.filter(
    (recording) =>
      recording.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording.mosqueName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording.preacherName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${currentRecording ? "pb-24" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#8A1538]">Recordings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and playback recorded streams
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {recordings.length} recording{recordings.length !== 1 ? "s" : ""} available
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search recordings..."
          className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 focus:border-[#8A1538] focus:outline-none"
        />
      </div>

      {/* Recordings Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredRecordings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecordings.map((recording) => (
            <RecordingCard
              key={recording.id}
              recording={recording}
              onPlay={() => handlePlay(recording)}
              onDownload={() => handleDownload(recording)}
              onDelete={() => handleDelete(recording)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Disc className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No recordings found</h3>
          <p className="text-gray-500">
            {searchQuery
              ? "Try a different search term"
              : "Recordings will appear here after streams are recorded"}
          </p>
        </div>
      )}

      {/* Audio Player */}
      {currentRecording && (
        <AudioPlayer
          recording={currentRecording}
          onClose={() => setCurrentRecording(null)}
        />
      )}
    </div>
  );
}
