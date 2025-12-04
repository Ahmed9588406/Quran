import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface AddMediaProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected?: (files: FileList | null) => void;
}

export default function AddMediaModal({ isOpen, onClose, onFilesSelected }: AddMediaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (onFilesSelected) onFilesSelected(files);
    },
    [onFilesSelected]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const onSelectClick = () => {
    inputRef.current?.click();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files && e.dataTransfer.files.length ? e.dataTransfer.files : null;
    handleFiles(files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-white rounded-lg overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="px-6 pt-4 pb-2 text-center">
          <h2 className="text-lg font-medium text-[#7b2030]">Create new post</h2>
        </div>

        {/* thin gold divider */}
        <div className="h-[1px] bg-[#c9a227] opacity-60" />

        {/* Drop area */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`px-6 py-8 flex flex-col items-center justify-center text-center ${
            isDragOver ? "bg-[#fff6f5]" : "bg-white"
          }`}
        >
          {/* illustration (SVG) */}
          <div className="mb-6">
            <Image
                src="/icons/Khateb_Profile/media.svg"
                alt="Add media"
                width={80}
                height={80}

             />
          </div>

          <div className="text-sm text-gray-700 mb-6">Drag photos and videos here</div>

          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={onInputChange}
              className="hidden"
            />
            <button
              onClick={onSelectClick}
              className="px-6 py-2 bg-[#7b2030] text-white rounded-md shadow-sm hover:bg-[#5e0e27] transition-colors"
              type="button"
            >
              Select from computer
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-400">Supported: JPG, PNG, MP4. Max size depends on server.</div>
        </div>
      </div>
    </div>
  );
}
