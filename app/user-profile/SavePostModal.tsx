"use client";
import { useState } from "react";
import { X, Bookmark } from "lucide-react";

interface SavePostModalProps {
  isOpen: boolean;
  isSaving: boolean;
  isSaved: boolean;
  onSave: () => void;
  onUnsave: () => void;
  onClose: () => void;
}

export default function SavePostModal({
  isOpen,
  isSaving,
  isSaved,
  onSave,
  onUnsave,
  onClose,
}: SavePostModalProps) {
  if (!isOpen) return null;

  const handleAction = () => {
    if (isSaved) {
      onUnsave();
    } else {
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#7b2030]/10 rounded-full">
              <Bookmark className="w-5 h-5 text-[#7b2030]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isSaved ? "Unsave Post?" : "Save Post?"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {isSaved
              ? "Remove this post from your saved collection? You can save it again later."
              : "Save this post to your collection for later. You can access it anytime from your saved posts."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-gray-700 font-medium text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 bg-[#7b2030] text-white font-medium text-sm rounded-lg hover:bg-[#5e0e27] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isSaved ? "Unsave Post" : "Save Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
