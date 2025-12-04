import React, { useEffect, useState } from "react";
import Image from "next/image";
import AddMediaModal from "./Add_media";

type Media = { type: "image" | "video"; src: string; thumbnail?: string };

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: { content: string; media?: Media }) => void;
  authorName: string;
  authorAvatar: string;
}

export default function CreatePostModal({ isOpen, onClose, onCreate, authorName, authorAvatar }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);

  // Add-media modal toggle
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // reset when closing
      setContent("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setFile(null);
      setPreviewUrl(null);
      setMediaType(null);
      setShowAddMediaModal(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleFile = (f?: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      setMediaType(null);
      return;
    }
    const url = URL.createObjectURL(f);
    setFile(f);
    setPreviewUrl(url);
    setMediaType(f.type.startsWith("video") ? "video" : "image");
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    handleFile(f);
  };

  const removeMedia = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setMediaType(null);
  };

  const handlePost = () => {
    if (!content.trim() && !previewUrl) return;
    const payload: { content: string; media?: Media } = { content: content.trim() };
    if (previewUrl && mediaType) {
      payload.media = { type: mediaType, src: previewUrl, thumbnail: previewUrl };
    }
    onCreate(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-lg overflow-hidden shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#f0e6e5] text-[#333333]">
          <h3 className="text-sm font-semibold">Create a post</h3>
          <button aria-label="Close" onClick={onClose} className="text-gray-500 p-2 rounded-full">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ">
              <Image src={authorAvatar} alt={authorName} fill style={{ objectFit: "cover" }} />
            </div>
            <div className="flex-1">
                <div className="text-sm font-medium text-[#333333]">{authorName}</div>
                <button className="mt-1 text-xs px-3 py-1 bg-[#FFF4E8] rounded-full text-[#7b2030] inline-flex items-center gap-2">
                    <Image src="/icons/Khateb_Profile/earth.svg" alt="globe" width={12} height={12} />
                    Anyone ▾
                </button>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write here..."
            className="w-full mt-3 min-h-[120px] resize-none p-3 text-sm rounded-md border border-[#f0e6e5] focus:outline-none text-[#333333]"
          />

          {/* Media preview */}
          {previewUrl && (
            <div className="mt-3">
              {mediaType === "image" ? (
                <img src={previewUrl} alt="preview" className="w-full max-h-60 object-contain rounded-md" />
              ) : (
                <video src={previewUrl} controls className="w-full max-h-60 rounded-md" />
              )}
              <div className="flex justify-end mt-2">
                <button onClick={removeMedia} className="text-sm text-gray-500 hover:text-gray-700">Remove</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#f0e6e5] bg-[#fffaf7] flex items-center justify-between gap-3">
          {/* Add media opens AddMediaModal */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddMediaModal(true)}
              className="h-10 px-4 bg-[#EFDEBC] text-[#7b2030] rounded-2xl flex items-center gap-2 hover:bg-[#e5d4ac] transition-colors"
            >
              <Image src="/icons/Khateb_Profile/add_media.svg" alt="add" width={20} height={20} />
              <span className="text-sm">Add media</span>
            </button>

            <button
              type="button"
              className="h-10 px-4 bg-[#EFDEBC] text-[#7b2030] rounded-2xl flex items-center gap-2 hover:bg-[#e5d4ac] transition-colors"
            >
              <Image src="/icons/Khateb_Profile/live.svg" alt="live" width={20} height={20} />
              <span className="text-sm">Start Live</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-sm text-gray-500">Cancel</button>
            <button
              onClick={handlePost}
              className={`px-4 py-2 rounded-md text-sm text-white ${!content.trim() && !previewUrl ? "bg-gray-300 cursor-not-allowed" : "bg-[#7b2030]"}`}
              disabled={!content.trim() && !previewUrl}
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* AddMedia modal - returns FileList to onFilesSelected */}
      <AddMediaModal
        isOpen={showAddMediaModal}
        onClose={() => setShowAddMediaModal(false)}
        onFilesSelected={(files) => {
          setShowAddMediaModal(false);
          if (!files || files.length === 0) return;
          const f = files[0];
          // set into local create-post state
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          const url = URL.createObjectURL(f);
          setFile(f);
          setPreviewUrl(url);
          setMediaType(f.type.startsWith("video") ? "video" : "image");
        }}
      />
    </div>
  );
}
