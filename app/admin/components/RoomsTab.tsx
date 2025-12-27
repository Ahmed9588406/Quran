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
    } catch { showToast("Error creating room", "error"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      const response = await fetch(`${apiBase}/rooms/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${adminToken}` } });
      if (response.ok) { showToast("Room deleted successfully", "success"); onRefresh(); }
      else { showToast("Failed to delete room", "error"); }
    } catch { showToast("Error deleting room", "error"); }
  };

  const handleEndStream = async (liveStreamId: number) => {
    if (!confirm("Are you sure you want to end this stream?")) return;
    try {
      const response = await fetch(`${apiBase}/stream/${liveStreamId}?action=end`, { method: "POST", headers: { Authorization: `Bearer ${adminToken}` } });
      const data = await response.json();
      if (data.success) { showToast("Stream ended successfully!", "success"); onRefresh(); }
      else { showToast("Failed to end stream", "error"); }
    } catch { showToast("Error ending stream", "error"); }
  };

  const handleStartRecording = async (roomId: number) => {
    try {
      const response = await fetch(`${apiBase}/stream/${roomId}?action=record-start`, { method: "POST", headers: { Authorization: `Bearer ${adminToken}` } });
      const data = await response.json();
      if (data.success) { showToast("Recording started!", "success"); }
      else { showToast("Failed to start recording", "error"); }
    } catch { showToast("Error starting recording", "error"); }
  };

  const handleStopRecording = async (roomId: number) => {
    try {
      const response = await fetch(`${apiBase}/stream/${roomId}?action=record-stop`, { method: "POST", headers: { Authorization: `Bearer ${adminToken}` } });
      const data = await response.json();
      if (data.success) { showToast("Recording stopped!", "success"); onRefresh(); }
      else { showToast("Failed to stop recording", "error"); }
    } catch { showToast("Error stopping recording", "error"); }
  };

  const copyToClipboard = (text: string, label: string) => { navigator.clipboard.writeText(text); showToast(`${label} copied!`, "success"); };
  const getPreacherLink = (room: Room) => `${window.location.origin}/admin/broadcaster?roomId=${room.roomId}&liveStreamId=${room.id}`;
  const getListenerLink = (room: Room) => `${window.location.origin}/admin/listener?roomId=${room.roomId}&liveStreamId=${room.id}`;
  const mosquesWithPreachers = mosques.filter((m) => m.preacher);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Room Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage live streaming rooms</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#8A1538] hover:bg-[#6d1029] text-white rounded-xl font-medium shadow-lg transition-all duration-300">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <EmptyState icon="📡" message="No rooms found" subMessage="Create one to get started" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onShowLinks={() => setShowLinksModal(room)} onDelete={() => handleDelete(room.id)} onEndStream={() => handleEndStream(room.id)} onStartRecording={() => handleStartRecording(room.roomId)} onStopRecording={() => handleStopRecording(room.roomId)} onPlayRecording={() => setShowRecordingModal(room)} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <Modal title="Create New Room" onClose={() => setShowCreateModal(false)} footer={<><button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button><button onClick={handleCreate} className="px-4 py-2 bg-[#8A1538] hover:bg-[#6d1029] text-white rounded-lg hover:shadow-lg transition-all">Create Room</button></>}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Mosque <span className="text-red-500">*</span></label>
              <select required value={formData.mosqueId} onChange={(e) => setFormData({ ...formData, mosqueId: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] transition-colors">
                <option value="" className="bg-white">Choose a mosque</option>
                {mosquesWithPreachers.map((m) => <option key={m.id} value={m.id} className="bg-white">{m.name} ({m.preacher?.displayName})</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Only mosques with assigned preachers are shown</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Friday Prayer - Dec 15" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] transition-colors resize-none" />
            </div>
          </form>
        </Modal>
      )}

      {showLinksModal && (
        <Modal title="Room Links" onClose={() => setShowLinksModal(null)}>
          <div className="space-y-4">
            <div className="p-3 bg-[#8A1538]/10 border border-[#8A1538]/20 rounded-xl text-[#8A1538] text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Room created and automatically assigned to mosque!
            </div>
            <LinkCopyField label="Preacher Broadcast Link" icon="🎤" value={getPreacherLink(showLinksModal)} onCopy={() => copyToClipboard(getPreacherLink(showLinksModal), "Preacher link")} color="maroon" />
            <LinkCopyField label="Listener Link" icon="🎧" value={getListenerLink(showLinksModal)} onCopy={() => copyToClipboard(getListenerLink(showLinksModal), "Listener link")} color="maroon" />
          </div>
        </Modal>
      )}

      {showRecordingModal && (
        <Modal title={`Play Recording - Room ${showRecordingModal.roomId}`} onClose={() => setShowRecordingModal(null)}>
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4 text-sm">Loading recording... This may take a moment for conversion.</p>
            <audio controls autoPlay className="w-full"><source src={`${apiBase}/stream/${showRecordingModal.roomId}/record/play`} type="audio/wav" />Your browser does not support the audio element.</audio>
          </div>
        </Modal>
      )}
    </div>
  );
}


function RoomCard({ room, onShowLinks, onDelete, onEndStream, onStartRecording, onStopRecording, onPlayRecording }: { room: Room; onShowLinks: () => void; onDelete: () => void; onEndStream: () => void; onStartRecording: () => void; onStopRecording: () => void; onPlayRecording: () => void }) {
  const statusConfig = {
    ACTIVE: { bg: "bg-[#8A1538]/10", text: "text-[#8A1538]", border: "border-[#8A1538]/20", dot: "bg-[#8A1538]" },
    ENDED: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", dot: "bg-red-500" },
    PENDING: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-400" },
  }[room.status] || { bg: "bg-gray-500/10", text: "text-gray-500", border: "border-gray-500/20", dot: "bg-gray-400" };

  return (
    <div className="group bg-white hover:shadow-lg border border-gray-200 rounded-2xl p-5 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8A1538]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#8A1538]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{room.title || "Untitled Room"}</h3>
            <p className="text-xs text-gray-500">Room ID: {room.roomId}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} ${room.status === "ACTIVE" ? "animate-pulse" : ""}`} />
          {room.status}
        </span>
      </div>
      
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          <span>{room.mosque?.name || "Not assigned"}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span>{room.creator?.displayName || "N/A"}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span>{room.listenerCount || 0} listeners</span>
          </div>
          <div className="flex items-center gap-1 text-[#8A1538] font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            <span>{room.totalViews || 0}</span>
          </div>
        </div>
        {room.status === "ENDED" && room.endedAt && (
          <p className="text-xs text-gray-500">Ended: {new Date(room.endedAt).toLocaleString()}</p>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
        {room.status === "ACTIVE" && (
          <>
            <ActionButton onClick={onStartRecording} icon="⏺️" label="Record" color="maroon" />
            <ActionButton onClick={onStopRecording} icon="⏹️" label="Stop" color="red" />
            <ActionButton onClick={onEndStream} icon="🛑" label="End" color="red" />
          </>
        )}
        {room.status === "ENDED" && <ActionButton onClick={onPlayRecording} icon="▶️" label="Play" color="maroon" />}
        <ActionButton onClick={onShowLinks} icon="🔗" label="Links" color="gray" />
        <button onClick={onDelete} className="px-2.5 py-1.5 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors">🗑️</button>
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon, label, color }: { onClick: () => void; icon: string; label: string; color: string }) {
  const colorClasses = {
    maroon: "bg-[#8A1538]/10 text-[#8A1538] hover:bg-[#8A1538]/20",
    amber: "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
    red: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
    gray: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  }[color] || "bg-gray-100 text-gray-700 hover:bg-gray-200";
  return <button onClick={onClick} className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors ${colorClasses}`}>{icon} {label}</button>;
}

function LinkCopyField({ label, icon, value, onCopy, color }: { label: string; icon: string; value: string; onCopy: () => void; color: string }) {
  const btnColor = color === "maroon" ? "bg-[#8A1538] hover:bg-[#6d1029]" : "bg-[#8A1538] hover:bg-[#6d1029]";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{icon} {label}</label>
      <div className="flex gap-2">
        <input type="text" readOnly value={value} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 truncate" />
        <button onClick={onCopy} className={`px-4 py-2 ${btnColor} text-white rounded-lg text-sm font-medium transition-colors`}>Copy</button>
      </div>
    </div>
  );
}

function EmptyState({ icon, message, subMessage }: { icon: string; message: string; subMessage: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4"><span className="text-4xl">{icon}</span></div>
      <p className="text-gray-700 font-medium">{message}</p>
      <p className="text-gray-500 text-sm mt-1">{subMessage}</p>
    </div>
  );
}
