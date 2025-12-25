"use client";

import React, { useState } from "react";
import { Mosque, Preacher } from "../types";
import { Modal } from "./Modal";

interface MosquesTabProps {
  mosques: Mosque[];
  preachers: Preacher[];
  adminToken: string;
  apiBase: string;
  onRefresh: () => void;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export function MosquesTab({ mosques, preachers, adminToken, apiBase, onRefresh, showToast }: MosquesTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<Mosque | null>(null);
  const [formData, setFormData] = useState({
    name: "", address: "", city: "", country: "", qrCodeUrl: "", preacherId: ""
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBase}/mosques`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, preacherId: formData.preacherId || null }),
      });
      if (response.ok) {
        showToast("Mosque created successfully!", "success");
        setShowCreateModal(false);
        setFormData({ name: "", address: "", city: "", country: "", qrCodeUrl: "", preacherId: "" });
        onRefresh();
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to create mosque", "error");
      }
    } catch {
      showToast("Error creating mosque", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this mosque?")) return;
    try {
      const response = await fetch(`${apiBase}/mosques/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.ok) {
        showToast("Mosque deleted successfully", "success");
        onRefresh();
      } else {
        showToast("Failed to delete mosque", "error");
      }
    } catch {
      showToast("Error deleting mosque", "error");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Mosque Management</h2>
          <p className="text-sm text-gray-400 mt-1">Manage all registered mosques</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Mosque
        </button>
      </div>

      {mosques.length === 0 ? (
        <EmptyState icon="🕌" message="No mosques found" subMessage="Create one to get started" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mosques.map((mosque) => (
            <MosqueCard key={mosque.id} mosque={mosque} onViewDetails={() => setShowDetailsModal(mosque)} onDelete={() => handleDelete(mosque.id)} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <Modal title="Create New Mosque" onClose={() => setShowCreateModal(false)} footer={<><button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Cancel</button><button onClick={handleCreate} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all">Create Mosque</button></>}>
          <form onSubmit={handleCreate} className="space-y-4">
            <FormInput label="Mosque Name" required value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="City" value={formData.city} onChange={(v) => setFormData({ ...formData, city: v })} />
              <FormInput label="Country" value={formData.country} onChange={(v) => setFormData({ ...formData, country: v })} />
            </div>
            <FormInput label="Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} />
            <FormInput label="QR Code URL" required value={formData.qrCodeUrl} onChange={(v) => setFormData({ ...formData, qrCodeUrl: v })} placeholder="e.g., grand-mosque-cairo" />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Assign Preacher</label>
              <select value={formData.preacherId} onChange={(e) => setFormData({ ...formData, preacherId: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors">
                <option value="" className="bg-[#12121a]">Select Preacher (Optional)</option>
                {preachers.map((p) => <option key={p.id} value={p.id} className="bg-[#12121a]">{p.displayName}</option>)}
              </select>
            </div>
          </form>
        </Modal>
      )}

      {showDetailsModal && (
        <Modal title={showDetailsModal.name} onClose={() => setShowDetailsModal(null)}>
          <div className="space-y-4">
            <InfoRow label="Address" value={showDetailsModal.address || "N/A"} />
            <InfoRow label="City" value={showDetailsModal.city || "N/A"} />
            <InfoRow label="Country" value={showDetailsModal.country || "N/A"} />
            <InfoRow label="QR Code URL" value={showDetailsModal.qrCodeUrl} />
            <InfoRow label="Redirect URL" value={showDetailsModal.redirectUrl || "Not set"} />
            <InfoRow label="Current Room" value={showDetailsModal.currentRoomId?.toString() || "None"} />
            <InfoRow label="Preacher" value={showDetailsModal.preacher?.displayName || "Not assigned"} />
          </div>
        </Modal>
      )}
    </div>
  );
}


function MosqueCard({ mosque, onViewDetails, onDelete }: { mosque: Mosque; onViewDetails: () => void; onDelete: () => void }) {
  return (
    <div className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <h3 className="font-medium text-white">{mosque.name}</h3>
            <p className="text-xs text-gray-500">{mosque.city || "N/A"}, {mosque.country || "N/A"}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${mosque.active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {mosque.active ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span>{mosque.preacher?.displayName || "Not assigned"}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
          <span>Room: {mosque.currentRoomId || "None"}</span>
        </div>
      </div>
      <div className="flex gap-2 pt-4 border-t border-white/5">
        <button onClick={onViewDetails} className="flex-1 px-3 py-2 text-sm bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors">View Details</button>
        <button onClick={onDelete} className="px-3 py-2 text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label} {required && <span className="text-red-400">*</span>}</label>
      <input type="text" required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors" />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-400 min-w-[100px]">{label}</span>
      <span className="text-sm text-white break-all">{value}</span>
    </div>
  );
}

function EmptyState({ icon, message, subMessage }: { icon: string; message: string; subMessage: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4"><span className="text-4xl">{icon}</span></div>
      <p className="text-gray-300 font-medium">{message}</p>
      <p className="text-gray-500 text-sm mt-1">{subMessage}</p>
    </div>
  );
}
