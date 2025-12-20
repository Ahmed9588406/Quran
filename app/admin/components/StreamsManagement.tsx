"use client";
import React, { useState, useEffect } from "react";
import {
  Radio,
  Plus,
  Search,
  MoreVertical,
  Play,
  Square,
  Trash2,
  Users,
  Mic,
  MicOff,
  Settings,
  X,
} from "lucide-react";
import { streamAPI, LiveStreamRoom, CreateRoomRequest } from "@/lib/streaming/api";
import { toast } from "react-toastify";

// Import the audio modal components from khateb_Studio
import AudioModal from "../../khateb_Studio/Audio_modal";
import GoLiveModal from "../../khateb_Studio/GoLiveModal";
import LiveSettings from "../../khateb_Studio/Live_settings";

type StreamStatus = "all" | "active" | "ended" | "scheduled";

function CreateRoomModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mosqueId, setMosqueId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a room title");
      return;
    }
    if (!mosqueId.trim()) {
      toast.error("Please enter a mosque ID");
      return;
    }

    const mosqueIdNum = parseInt(mosqueId.trim(), 10);
    if (isNaN(mosqueIdNum)) {
      toast.error("Mosque ID must be a valid number");
      return;
    }

    setIsSubmitting(true);
    try {
      await streamAPI.createRoom({
        title: title.trim(),
        description: description.trim() || undefined,
        mosqueId: mosqueIdNum,
      });
      toast.success("Room created successfully");
      onCreated();
      onClose();
      setTitle("");
      setDescription("");
      setMosqueId("");
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[480px] max-w-[92vw] bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-[#231217]">Create New Room</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter room title"
              className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[#8A1538] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter room description"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#8A1538] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mosque ID *
            </label>
            <input
              type="number"
              value={mosqueId}
              onChange={(e) => setMosqueId(e.target.value)}
              placeholder="Enter mosque ID (e.g., 1, 2, 3)"
              className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[#8A1538] focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Required - Enter the numeric ID of the mosque</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-lg bg-[#8A1538] text-white font-medium hover:bg-[#6d1029] disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StreamCard({
  stream,
  onDelete,
  onEndStream,
  onOpenLive,
}: {
  stream: LiveStreamRoom;
  onDelete: (id: number) => void;
  onEndStream: (id: number) => void;
  onOpenLive: (stream: LiveStreamRoom) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const statusColors = {
    active: "bg-green-100 text-green-700 border-green-200",
    ended: "bg-gray-100 text-gray-600 border-gray-200",
    scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFF9F3] flex items-center justify-center">
            <Radio className={`w-6 h-6 ${stream.status === "active" ? "text-green-600" : "text-[#8A1538]"}`} />
          </div>
          <div>
            <h3 className="font-medium text-[#231217]">{stream.title || `Room #${stream.id}`}</h3>
            <p className="text-sm text-gray-500">{stream.mosqueName || "No mosque assigned"}</p>
          </div>
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
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                {stream.status === "active" && (
                  <button
                    onClick={() => {
                      onEndStream(stream.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Square className="w-4 h-4" />
                    End Stream
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(stream.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Room
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[stream.status || "ended"]}`}>
          {stream.status === "active" ? "🔴 Live" : stream.status || "Ended"}
        </span>
        <div className="flex items-center gap-1 text-gray-500">
          <Users className="w-4 h-4" />
          <span className="text-sm">{stream.listeners || 0} listeners</span>
        </div>
      </div>

      {stream.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{stream.description}</p>
      )}

      <div className="flex gap-2">
        {stream.status === "active" ? (
          <button
            onClick={() => onOpenLive(stream)}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
          >
            <Mic className="w-4 h-4" />
            Join Live
          </button>
        ) : (
          <button
            onClick={() => onOpenLive(stream)}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-[#8A1538] text-white font-medium hover:bg-[#6d1029]"
          >
            <Play className="w-4 h-4" />
            Start Stream
          </button>
        )}
        <button className="h-10 px-4 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function StreamsManagement() {
  const [streams, setStreams] = useState<LiveStreamRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StreamStatus>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<LiveStreamRoom | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchStreams = async () => {
    setIsLoading(true);
    try {
      const response = await streamAPI.getAllRooms(currentPage, 12);
      setStreams(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch streams:", error);
      // Mock data for demo
      setStreams([
        { id: 1, title: "Friday Khutbah", status: "active", listeners: 45, mosqueName: "Al-Noor Mosque" },
        { id: 2, title: "Quran Recitation", status: "ended", listeners: 0, mosqueName: "Central Mosque" },
        { id: 3, title: "Islamic Lecture", status: "scheduled", listeners: 0, mosqueName: "East Side Mosque" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, [currentPage]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    
    try {
      await streamAPI.deleteRoom(id);
      toast.success("Room deleted successfully");
      fetchStreams();
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast.error("Failed to delete room");
    }
  };

  const handleEndStream = async (id: number) => {
    try {
      await streamAPI.endStream(id);
      toast.success("Stream ended successfully");
      fetchStreams();
    } catch (error) {
      console.error("Failed to end stream:", error);
      toast.error("Failed to end stream");
    }
  };

  const handleOpenLive = (stream: LiveStreamRoom) => {
    setSelectedStream(stream);
    if (stream.status === "active") {
      setIsAudioOpen(true);
    } else {
      setIsGoLiveOpen(true);
    }
  };

  const filteredStreams = streams.filter((stream) => {
    const matchesSearch =
      !searchQuery ||
      stream.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.mosqueName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || stream.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#8A1538]">Live Streams</h1>
          <p className="text-sm text-gray-500 mt-1">Manage streaming rooms and live sessions</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 h-11 px-5 rounded-lg bg-[#8A1538] text-white font-medium hover:bg-[#6d1029] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Room
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search streams..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 focus:border-[#8A1538] focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "active", "scheduled", "ended"] as StreamStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-[#8A1538] text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Streams Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredStreams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStreams.map((stream) => (
            <StreamCard
              key={stream.id}
              stream={stream}
              onDelete={handleDelete}
              onEndStream={handleEndStream}
              onOpenLive={handleOpenLive}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Radio className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No streams found</h3>
          <p className="text-gray-500 mb-4">Create a new room to start streaming</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#8A1538] text-white font-medium hover:bg-[#6d1029]"
          >
            <Plus className="w-4 h-4" />
            Create Room
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateRoomModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchStreams}
      />

      <GoLiveModal
        open={isGoLiveOpen}
        onClose={() => setIsGoLiveOpen(false)}
        onStartLive={() => {
          setIsGoLiveOpen(false);
          setIsAudioOpen(true);
        }}
      />

      <AudioModal
        open={isAudioOpen}
        onClose={() => {
          setIsAudioOpen(false);
          setSelectedStream(null);
        }}
        participantsCount={selectedStream?.listeners || 1}
      />
    </div>
  );
}
