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
    } catch (error) {
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
    } catch (error) {
      showToast("Error deleting mosque", "error");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mosque Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <span>+</span> Create Mosque
        </button>
      </div>

      {mosques.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <span className="text-5xl block mb-4">🕌</span>
          <p>No mosques found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mosques.map((mosque) => (
            <MosqueCard
              key={mosque.id}
              mosque={mosque}
              onViewDetails={() => setShowDetailsModal(mosque)}
              onDelete={() => handleDelete(mosque.id)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <Modal
          title="Create New Mosque"
          onClose={() => setShowCreateModal(false)}
          footer={
            <>
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create Mosque
              </button>
            </>
          }
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mosque Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">QR Code URL *</label>
              <input type="text" required value={formData.qrCodeUrl} onChange={(e) => setFormData({ ...formData, qrCodeUrl: e.target.value })}
                placeholder="e.g., grand-mosque-cairo" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Preacher</label>
              <select value={formData.preacherId} onChange={(e) => setFormData({ ...formData, preacherId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Preacher (Optional)</option>
                {preachers.map((p) => <option key={p.id} value={p.id}>{p.displayName}</option>)}
              </select>
            </div>
          </form>
        </Modal>
      )}

      {showDetailsModal && (
        <Modal title={showDetailsModal.name} onClose={() => setShowDetailsModal(null)}>
          <div className="space-y-3">
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
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{mosque.name}</h3>
          <p className="text-sm text-gray-500">{mosque.city || "N/A"}, {mosque.country || "N/A"}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${mosque.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {mosque.active ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p><span className="font-medium">Preacher:</span> {mosque.preacher?.displayName || "Not assigned"}</p>
        <p><span className="font-medium">Room:</span> {mosque.currentRoomId || "None"}</p>
      </div>
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button onClick={onViewDetails} className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          View Details
        </button>
        <button onClick={onDelete} className="px-3 py-2 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors">
          Delete
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium text-gray-600 min-w-[100px]">{label}:</span>
      <span className="text-gray-800 break-all">{value}</span>
    </div>
  );
}
