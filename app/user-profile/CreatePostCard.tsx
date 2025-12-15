"use client";
import { useState, useRef } from "react";
import { Image as ImageIcon, Video, Send, X } from "lucide-react";
import { toast } from "react-toastify";

const DEFAULT_AVATAR = "/icons/settings/profile.png";

interface CreatePostCardProps {
  currentUserAvatar?: string;
  currentUserName?: string;
  onPostCreated?: () => void;
}

interface SelectedFile {
  file: File;
  preview: string;
  type: "image" | "video";
}

export default function CreatePostCard({
  currentUserAvatar = DEFAULT_AVATAR,
  currentUserName = "You",
  onPostCreated,
}: CreatePostCardProps) {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      if (type === "image" && !file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (type === "video" && !file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        setSelectedFiles((prev) => [
          ...prev,
          { file, preview, type },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!content.trim() && selectedFiles.length === 0) {
      toast.error("Please add content or media to your post");
      return;
    }

    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      
      if (!token) {
        toast.error("Please log in to create a post");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("content", content.trim());
      formData.append("visibility", visibility);

      // Add files
      selectedFiles.forEach((file, index) => {
        formData.append("files", file.file);
      });

      const response = await fetch("http://192.168.1.18:9001/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create post: ${response.status}`);
      }

      const result = await response.json();
      
      toast.success("Post created successfully!");
      setContent("");
      setSelectedFiles([]);
      setVisibility("public");
      
      onPostCreated?.();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#f0e6e5] overflow-hidden mb-6">
      {/* Header with Avatar */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <img
              src={currentUserAvatar}
              alt={currentUserName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_AVATAR;
              }}
            />
          </div>
          
          {/* Content Input */}
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write here..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7b2030] focus:ring-opacity-50"
          />
        </div>
      </div>

      {/* Media Preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {file.type === "image" ? (
                    <img
                      src={file.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={file.preview}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visibility Selector */}
      <div className="px-4 py-2 border-t border-gray-100">
        <label className="text-xs font-medium text-gray-600 block mb-2">Visibility</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as "public" | "friends" | "private")}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#7b2030]"
        >
          <option value="public">Public</option>
          <option value="friends">Friends Only</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {/* Add Media Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-2 text-[#7b2030] hover:text-[#5e0e27] disabled:opacity-50 transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Add media</span>
          </button>

          {/* Add Reel Button */}
          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-2 text-[#7b2030] hover:text-[#5e0e27] disabled:opacity-50 transition-colors"
          >
            <Video className="w-5 h-5" />
            <span className="text-sm font-medium">Add reel</span>
          </button>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e, "image")}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            multiple
            accept="video/*"
            onChange={(e) => handleFileSelect(e, "video")}
            className="hidden"
          />
        </div>

        {/* Post Button */}
        <button
          onClick={handleCreatePost}
          disabled={isLoading || (!content.trim() && selectedFiles.length === 0)}
          className="flex items-center gap-2 bg-[#7b2030] hover:bg-[#5e0e27] disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? "Posting..." : "Post"}</span>
        </button>
      </div>
    </div>
  );
}
