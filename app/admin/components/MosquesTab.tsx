"use client";

import React, { useState, useCallback } from "react";
import { Mosque, Preacher } from "../types";
import { Modal } from "./Modal";
import { QRCodeSVG } from "qrcode.react";

interface MosquesTabProps {
  mosques: Mosque[];
  preachers: Preacher[];
  adminToken: string;
  apiBase: string;
  onRefresh: () => void;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

// Helper to generate the full listener URL based on current domain
const getListenerUrl = (slug: string) => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/qr/join/${slug}`;
  }
  return `/qr/join/${slug}`;
};

export function MosquesTab({ mosques, preachers, adminToken, apiBase, onRefresh, showToast }: MosquesTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<Mosque | null>(null);
  const [showQRModal, setShowQRModal] = useState<Mosque | null>(null);
  const [formData, setFormData] = useState({
    name: "", address: "", city: "", country: "", qrCodeUrl: "", preacherId: ""
  });

  // Auto-generate slug from mosque name
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }, []);

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      qrCodeUrl: generateSlug(name)
    }));
  };

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
          <h2 className="text-xl font-semibold text-gray-800">Mosque Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage all registered mosques</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#8A1538] hover:bg-[#6d1029] text-white rounded-xl font-medium shadow-lg transition-all duration-300">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Mosque
        </button>
      </div>

      {mosques.length === 0 ? (
        <EmptyState icon="🕌" message="No mosques found" subMessage="Create one to get started" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mosques.map((mosque) => (
            <MosqueCard key={mosque.id} mosque={mosque} onViewDetails={() => setShowDetailsModal(mosque)} onShowQR={() => setShowQRModal(mosque)} onDelete={() => handleDelete(mosque.id)} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <Modal title="Create New Mosque" onClose={() => setShowCreateModal(false)} footer={<><button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button><button onClick={handleCreate} className="px-4 py-2 bg-[#8A1538] hover:bg-[#6d1029] text-white rounded-lg shadow-lg transition-all">Create Mosque</button></>}>
          <form onSubmit={handleCreate} className="space-y-4">
            <FormInput label="Mosque Name" required value={formData.name} onChange={handleNameChange} />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="City" value={formData.city} onChange={(v) => setFormData({ ...formData, city: v })} />
              <FormInput label="Country" value={formData.country} onChange={(v) => setFormData({ ...formData, country: v })} />
            </div>
            <FormInput label="Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">QR Code URL Slug <span className="text-red-500">*</span></label>
              <div className="flex gap-2 items-center">
                <input type="text" required value={formData.qrCodeUrl} onChange={(e) => setFormData({ ...formData, qrCodeUrl: e.target.value })} placeholder="e.g., grand-mosque-cairo" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] transition-colors" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-generated from name. Users will scan QR to visit: /qr/join/{formData.qrCodeUrl || "your-slug"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Preacher</label>
              <select value={formData.preacherId} onChange={(e) => setFormData({ ...formData, preacherId: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] transition-colors">
                <option value="" className="bg-white">Select Preacher (Optional)</option>
                {preachers.map((p) => <option key={p.id} value={p.id} className="bg-white">{p.displayName}</option>)}
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
            <InfoRow label="QR Code Slug" value={showDetailsModal.qrCodeUrl} />
            <InfoRow label="Listener URL" value={getListenerUrl(showDetailsModal.qrCodeUrl)} />
            <InfoRow label="Current Room" value={showDetailsModal.currentRoomId?.toString() || "None"} />
            <InfoRow label="Preacher" value={showDetailsModal.preacher?.displayName || "Not assigned"} />
            
            {/* QR Code Preview */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3 text-center">Scan to Join Stream</p>
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <QRCodeSVG
                    value={getListenerUrl(showDetailsModal.qrCodeUrl)}
                    size={150}
                    level="H"
                    fgColor="#8A1538"
                    bgColor="#ffffff"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2 break-all">{getListenerUrl(showDetailsModal.qrCodeUrl)}</p>
            </div>
          </div>
        </Modal>
      )}

      {showQRModal && (
        <Modal title={`QR Code - ${showQRModal.name}`} onClose={() => setShowQRModal(null)}>
          <div className="text-center">
            {/* QR Code Large Display */}
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
                <QRCodeSVG
                  value={getListenerUrl(showQRModal.qrCodeUrl)}
                  size={256}
                  level="H"
                  fgColor="#8A1538"
                  bgColor="#ffffff"
                  imageSettings={{
                    src: "/icons/qr/mosque-icon.svg",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>
            </div>

            {/* Mosque Info */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{showQRModal.name}</h3>
              <p className="text-sm text-gray-500">
                {showQRModal.city}{showQRModal.country ? `, ${showQRModal.country}` : ""}
              </p>
              {showQRModal.preacher && (
                <p className="text-sm text-[#8A1538] mt-1">
                  Preacher: {showQRModal.preacher.displayName}
                </p>
              )}
            </div>

            {/* URL Display */}
            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Listener URL:</p>
              <p className="text-sm text-gray-800 break-all font-mono">{getListenerUrl(showQRModal.qrCodeUrl)}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getListenerUrl(showQRModal.qrCodeUrl));
                  showToast("Link copied to clipboard!", "success");
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy Link
              </button>
              <button
                onClick={() => {
                  const svg = document.querySelector(`#qr-${showQRModal.id}`) as SVGSVGElement;
                  if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx?.drawImage(img, 0, 0);
                      const pngUrl = canvas.toDataURL("image/png");
                      const downloadLink = document.createElement("a");
                      downloadLink.href = pngUrl;
                      downloadLink.download = `qr-${showQRModal.qrCodeUrl}.png`;
                      downloadLink.click();
                      showToast("QR Code downloaded!", "success");
                    };
                    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-[#8A1538] hover:bg-[#6d1029] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download QR
              </button>
            </div>

            {/* Hidden QR for download */}
            <div className="hidden">
              <QRCodeSVG
                id={`qr-${showQRModal.id}`}
                value={getListenerUrl(showQRModal.qrCodeUrl)}
                size={512}
                level="H"
                fgColor="#8A1538"
                bgColor="#ffffff"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


function MosqueCard({ mosque, onViewDetails, onShowQR, onDelete }: { mosque: Mosque; onViewDetails: () => void; onShowQR: () => void; onDelete: () => void }) {
  return (
    <div className="group bg-white hover:shadow-lg border border-gray-200 rounded-2xl p-5 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8A1538]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#8A1538]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{mosque.name}</h3>
            <p className="text-xs text-gray-500">{mosque.city || "N/A"}, {mosque.country || "N/A"}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${mosque.active ? "bg-[#8A1538]/10 text-[#8A1538] border border-[#8A1538]/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
          {mosque.active ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span>{mosque.preacher?.displayName || "Not assigned"}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
          <span>Room: {mosque.currentRoomId || "None"}</span>
        </div>
      </div>
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button onClick={onViewDetails} className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">View Details</button>
        <button onClick={onShowQR} className="px-3 py-2 text-sm bg-[#8A1538]/10 text-[#8A1538] hover:bg-[#8A1538]/20 rounded-lg transition-colors" title="Show QR Code">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
        </button>
        <button onClick={onDelete} className="px-3 py-2 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
      <input type="text" required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] transition-colors" />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0">
      <span className="text-sm text-gray-600 min-w-[100px]">{label}</span>
      <span className="text-sm text-gray-800 break-all">{value}</span>
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
