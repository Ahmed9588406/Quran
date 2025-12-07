/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function UploadModal({ open, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setIsDragging(false);
      setIsUploading(false);
      setProgress(0);
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
        uploadIntervalRef.current = null;
      }
    }
  }, [open]);

  if (!open) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setProgress(0);

    let currentProgress = 0;
    uploadIntervalRef.current = setInterval(() => {
      currentProgress += Math.random() * 15;

      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        if (uploadIntervalRef.current) {
          clearInterval(uploadIntervalRef.current);
          uploadIntervalRef.current = null;
        }
        // Small delay to show 100% before success modal
        setTimeout(() => {
          setIsUploading(false);
          onSuccess();
        }, 500);
      } else {
        setProgress(Math.min(currentProgress, 99));
      }
    }, 300);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
      simulateUpload();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      simulateUpload();
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={!isUploading ? onClose : undefined} />
      <div className="relative z-[70] w-[740px] max-w-[95vw] bg-[#FFF9F3] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#8A1538]/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#8A1538]">Upload videos</h2>
          <button
            onClick={!isUploading ? onClose : undefined}
            disabled={isUploading}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#8A1538]/5 transition-colors ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <svg className="w-5 h-5 text-[#8A1538]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Drag and Drop Area */}
          <div
            onDragOver={!isUploading ? handleDragOver : undefined}
            onDragLeave={!isUploading ? handleDragLeave : undefined}
            onDrop={!isUploading ? handleDrop : undefined}
            className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all ${
              isDragging
                ? "border-[#8A1538] bg-[#8A1538]/5"
                : "border-[#8A1538]/20 bg-white"
            } ${isUploading ? "opacity-50" : ""}`}
          >
            {/* Upload Icon */}
            <div className="mb-6">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                className="text-[#8A1538]"
              >
                <path
                  d="M60 20V70M60 20L40 40M60 20L80 40"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M30 70C30 65.5817 33.5817 62 38 62H42M90 70C90 65.5817 86.4183 62 82 62H78"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M25 80C25 74.4772 29.4772 70 35 70H85C90.5228 70 95 74.4772 95 80V95C95 100.523 90.5228 105 85 105H35C29.4772 105 25 100.523 25 95V80Z"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
            </div>

            {/* Text */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-[#160309] mb-2">
                {isUploading ? "Uploading..." : "Drag and drop video files to upload"}
              </h3>
              <p className="text-sm text-[#666666]">
                {isUploading
                  ? `${Math.round(progress)}% complete`
                  : "Your videos will be private until you publish them."}
              </p>
            </div>

            {/* Select File Button */}
            {!isUploading && (
              <button
                onClick={handleSelectFileClick}
                className="bg-[#8A1538] hover:bg-[#6d1029] text-white font-medium px-8 py-3 rounded-lg transition-colors shadow-sm"
              >
                Select File
              </button>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[#8A1538] transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-[#666666]">
                  {file?.name || "Uploading..."}
                </span>
                <span className="text-xs font-medium text-[#8A1538]">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          )}

          {/* Footer Text */}
          {!isUploading && (
            <div className="mt-6 text-center text-xs text-[#666666]">
              <p>
                By submitting your videos to Wesal, you acknowledge that you agree to Wesal&apos;s{" "}
                <a href="#" className="text-[#8A1538] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#8A1538] hover:underline">
                  Community Guidelines
                </a>
                .
              </p>
              <p className="mt-2">
                Please be sure not to violate others&apos; copyright or privacy rights.{" "}
                <a href="#" className="text-[#8A1538] hover:underline">
                  Learn more
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
