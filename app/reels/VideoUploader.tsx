"use client";

/**
 * VideoUploader Component
 * 
 * Implements drag-and-drop and click-to-upload functionality for video files.
 * Validates file format before upload and shows video preview after selection.
 * 
 * Requirements: 4.2
 */

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Play } from 'lucide-react';
import { isValidVideoFile, isValidThumbnailFile } from '@/lib/reels/utils';
import { SUPPORTED_VIDEO_FORMATS } from '@/lib/reels/types';

export interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
  onVideoRemove: () => void;
  selectedVideo: File | null;
  error?: string;
  disabled?: boolean;
}

/**
 * VideoUploader - Drag-and-drop video upload component
 * 
 * - Implements drag-and-drop and click-to-upload (Requirements: 4.2)
 * - Validates file format before upload
 * - Shows video preview after selection
 */
export function VideoUploader({
  onVideoSelect,
  onVideoRemove,
  selectedVideo,
  error,
  disabled = false,
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create preview URL when video is selected
  React.useEffect(() => {
    if (selectedVideo) {
      const url = URL.createObjectURL(selectedVideo);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedVideo]);

  const handleFileValidation = useCallback((file: File): boolean => {
    setValidationError(null);
    
    if (!isValidVideoFile(file)) {
      setValidationError('Please select a valid video file (MP4, MOV, or WebM)');
      return false;
    }
    
    return true;
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (handleFileValidation(file)) {
      onVideoSelect(file);
    }
  }, [handleFileValidation, onVideoSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [disabled, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setValidationError(null);
    onVideoRemove();
  }, [onVideoRemove]);

  const displayError = error || validationError;

  // Show preview if video is selected
  if (selectedVideo && previewUrl) {
    return (
      <div className="relative w-full" data-testid="video-uploader-preview">
        <div className="relative aspect-[9/16] max-h-[400px] bg-black rounded-xl overflow-hidden">
          <video
            src={previewUrl}
            className="w-full h-full object-contain"
            controls
            data-testid="video-preview"
          />
          
          {/* Remove button */}
          <button
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
            aria-label="Remove video"
            data-testid="remove-video-button"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* File info */}
        <div className="mt-2 text-sm text-gray-600">
          <p className="truncate">{selectedVideo.name}</p>
          <p className="text-xs text-gray-400">
            {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
      </div>
    );
  }

  // Show upload area
  return (
    <div className="w-full" data-testid="video-uploader">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-xl p-8 
          flex flex-col items-center justify-center 
          min-h-[300px] cursor-pointer transition-all
          ${isDragging 
            ? 'border-[#8A1538] bg-[#8A1538]/5' 
            : 'border-gray-300 hover:border-[#8A1538]/50 bg-white'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${displayError ? 'border-red-400' : ''}
        `}
        data-testid="video-drop-zone"
      >
        {/* Upload Icon */}
        <div className={`mb-4 ${isDragging ? 'text-[#8A1538]' : 'text-gray-400'}`}>
          <Upload className="w-16 h-16" strokeWidth={1.5} />
        </div>
        
        {/* Text */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-1">
            {isDragging ? 'Drop your video here' : 'Drag and drop video to upload'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse
          </p>
          <p className="text-xs text-gray-400">
            Supported formats: MP4, MOV, WebM
          </p>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_VIDEO_FORMATS.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
          data-testid="video-file-input"
        />
      </div>
      
      {/* Error message */}
      {displayError && (
        <p className="mt-2 text-sm text-red-500" data-testid="video-error">
          {displayError}
        </p>
      )}
    </div>
  );
}

export default VideoUploader;
