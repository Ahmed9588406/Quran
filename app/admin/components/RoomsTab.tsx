"use client";

import React, { useState } from "react";
import { Room, Mosque } from "../types";
import { Modal } from "./Modal";

interface RoomsTabProps {
  rooms: Room[];
  mosques: Mosque[];
  adminToken: string;
  apiBase: string;
  onRefresh: () => void;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export function RoomsTab({ rooms, mosques, adminToken, apiBase, onRefresh, showToast }: RoomsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState<Room | null>(null);
  const [showRecordingModal, setShowRecordingModal] = useState<Room | null>(null);
  const [formData, setFormData] = useState({ mosqueId: "", title: "", description: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBase}/rooms`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ mosqueId: parseInt(formData.mosqueId), title: formData.title, description: formData.description }),
      });
      if (response.ok) {
        const room = await response.json();
        showToast("Room created successfully!", "success");
        setShowCreateModal(false);
        setFormData({ mosqueId: "", title: "", description: "" });
        onRefresh();
        setShowLinksModal(room);
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to create room", "error");
      }
    } catch (error) {
      showToast("Error creating room", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      const response = await fetch(`${apiBase}/rooms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.ok) {
        showToast("Room deleted successfully", "success");
        onRefresh();
      } else {
        showToast("Failed to delete room", "error");
      }
    } catch (error) {
      showToast("Error deleting room", "error");
    }
  };

  const handleEndStream = async (liveStreamId: number) => {
    if (!confirm("Are you sure you want to end this stream?")) return;
    try {
      const response = await fetch(`${apiBase}/stream/${liveStreamId}?action=end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      if (data.success) {
        showToast("Stream ended successfully!", "success");
        onRefresh();
      } else {
        showToast("Failed to end stream", "error");
      }
    } catch (error) {
      showToast("Error ending stream", "error");
    }
  };

  const handleStartRecording = async (roomId: number) => {
    try {
      const response = await fetch(`${apiBase}/stream/${roomId}?action=record-start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      if (data.success) {
        showToast("Recording started!", "success");
      } else {
        showToast("Failed to start recording", "error");
      }
    } catch (error) {
      showToast("Error starting recording", "error");
    }
  };

  const handleStopRecording = async (roomId: number) => {
    try {
      const response = await fetch(`${apiBase}/stream/${roomId}?action=record-stop`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      if (data.success) {
        showToast("Recording stopped!", "success");
        onRefresh();
      } else {
        showToast("Failed to stop recording", "error");
      }
    } catch (error) {
      showToast("Error stopping recording", "error");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied!`, "success");
  };

  const getPreacherLink = (room: Room) => `${window.location.origin}/admin/broadcaster?roomId=${room.roomId}&liveStreamId=${room.id}`;
  const getListenerLink = (room: Room) => `${window.location.origin}/admin/listener?roomId=${room.roomId}&liveStreamId=${room.id}`;

  const mosquesWithPreachers = mosques.filter((m) => m.preacher);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <span>+</span> Create Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <span className="text-5xl block mb-4">📡</span>
          <p>No rooms found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onShowLinks={() => setShowLinksModal(room)}
              onDelete={() => handleDelete(room.id)}
              onEndStream={() => handleEndStream(room.id)}
              onStartRecording={() => handleStartRecording(room.roomId)}
              onStopRecording={() => handleStopRecording(room.roomId)}
              onPlayRecording={() => setShowRecordingModal(room)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <Modal
          title="Create New Room"
          onClose={() => setShowCreateModal(false)}
          footer={
            <>
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Room</button>
            </>
          }
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Mosque *</label>
              <select required value={formData.mosqueId} onChange={(e) => setFormData({ ...formData, mosqueId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="">Choose a mosque</option>
                {mosquesWithPreachers.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.preacher?.displayName})</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Only mosques with assigned preachers are shown</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Friday Prayer - Dec 15" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </form>
        </Modal>
      )}

      {showLinksModal && (
        <Modal title="✅ Room Links" onClose={() => setShowLinksModal(null)}>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Room created and automatically assigned to mosque!
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🎤 Preacher Broadcast Link</label>
              <div className="flex gap-2">
                <input type="text" readOnly value={getPreacherLink(showLinksModal)} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm" />
                <button onClick={() => copyToClipboard(getPreacherLink(showLinksModal), "Preacher link")} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Copy</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🎧 Listener Link</label>
              <div className="flex gap-2">
                <input type="text" readOnly value={getListenerLink(showLinksModal)} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm" />
                <button onClick={() => copyToClipboard(getListenerLink(showLinksModal), "Listener link")} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Copy</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showRecordingModal && (
        <Modal title={`🎵 Play Recording - Room ${showRecordingModal.roomId}`} onClose={() => setShowRecordingModal(null)}>
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">Loading recording... This may take a moment for conversion.</p>
            <audio controls autoPlay className="w-full">
              <source src={`${apiBase}/stream/${showRecordingModal.roomId}/record/play`} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </Modal>
      )}
    </div>
  );
}

function RoomCard({ room, onShowLinks, onDelete, onEndStream, onStartRecording, onStopRecording, onPlayRecording }: {
  room: Room;
  onShowLinks: () => void;
  onDelete: () => void;
  onEndStream: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayRecording: () => void;
}) {
  const statusColors = {
    ACTIVE: "bg-green-100 text-green-700",
    ENDED: "bg-red-100 text-red-700",
    PENDING: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{room.title || "Untitled Room"}</h3>
          <p className="text-sm text-gray-500">Room ID: {room.roomId}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[room.status]}`}>
          {room.status}
        </span>
      </div>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p><span className="font-medium">Mosque:</span> {room.mosque?.name || "Not assigned"}</p>
        <p><span className="font-medium">Preacher:</span> {room.creator?.displayName || "N/A"}</p>
        <p><span className="font-medium">Listeners:</span> {room.listenerCount || 0}</p>
        <p><span className="font-medium text-indigo-600">Total Views:</span> <span className="font-bold text-indigo-600">{room.totalViews || 0}</span></p>
        {room.status === "ENDED" && room.endedAt && (
          <p><span className="font-medium">Ended:</span> {new Date(room.endedAt).toLocaleString()}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
        {room.status === "ACTIVE" && (
          <>
            <button onClick={onStartRecording} className="px-3 py-1.5 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-lg">⏺️ Record</button>
            <button onClick={onStopRecording} className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg">⏹️ Stop</button>
            <button onClick={onEndStream} className="px-3 py-1.5 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-lg">🛑 End</button>
          </>
        )}
        {room.status === "ENDED" && (
          <button onClick={onPlayRecording} className="px-3 py-1.5 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-lg">▶️ Play</button>
        )}
        <button onClick={onShowLinks} className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg">🔗 Links</button>
        <button onClick={onDelete} className="px-3 py-1.5 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-lg">🗑️</button>
      </div>
    </div>
  );
}
