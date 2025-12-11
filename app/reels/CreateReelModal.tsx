"use client";

/**
 * CreateReelModal Component
 * 
 * Modal for creating and uploading new reels with video upload,
 * caption input, visibility selector, and optional thumbnail upload.
 * 
 * Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7
 */

import React, { useState, useCallback, useRef } from 'react';
import { X, Image as ImageIcon, Globe, Lock, Users, Loader2, CheckCircle } from 'lucide-react';
import { VideoUploader } from './VideoUploader';
import { isValidThumbnailFile } from '@/lib/reels/utils';
import { ReelVisibility, Reel, SUPPORTED_IMAGE_FORMATS } from '@/lib/reels/types';
import { reelsAPI } from '@/lib/reels/api';

export interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reel: Reel) => void;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

const VISIBILITY_OPTIONS: { value: ReelVisibility; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'public', 
    label: 'Public', 
    icon: <Globe className="w-5 h-5" />,
    description: 'Anyone can see this reel'
  },
  { 
    value: 'followers', 
    label: 'Followers', 
    icon: <Users className="w-5 h-5" />,
    description: 'Only your followers can see this reel'
  },
  { 
    value: 'private', 
    label: 'Private', 
    icon: <Lock className="w-5 h-5" />,
    description: 'Only you can see this reel'
  },
];

/**
 * CreateReelModal - Reel creation form with video upload
 * 
 * - Displays modal with video upload functionality (Requirements: 4.1)
 * - Accepts text input for caption (Requirements: 4.3)
 * - Allows choosing visibility (Requirements: 4.4)
 * - Accepts optional thumbnail image (Requirements: 4.5)
 * - Uploads via POST /reels with form-data (Requirements: 4.6)
 * - Displays success message on completion (Requirements: 4.7)
 */
export function CreateReelModal({ isOpen, onClose, onSuccess }: CreateReelModalProps) {
  // Form state
  const [video, setVideo] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<ReelVisibility>('public');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  // Upload state
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Reset form state
  const resetForm = useCallback(() => {
    setVideo(null);
    setCaption('');
    setVisibility('public');
    setThumbnail(null);
    setThumbnailPreview(null);
    setUploadState('idle');
    setError(null);
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    if (uploadState === 'uploading') return; // Prevent closing during upload
    resetForm();
    onClose();
  }, [uploadState, resetForm, onClose]);

  // Handle video selection
  const handleVideoSelect = useCallback((file: File) => {
    setVideo(file);
    setError(null);
  }, []);

  // Handle video removal
  const handleVideoRemove = useCallback(() => {
    setVideo(null);
  }, []);

  // Handle thumbnail selection
  const handleThumbnailSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isValidThumbnailFile(file)) {
        setError('Please select a valid image file (JPG or PNG)');
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError(null);
    }
    e.target.value = '';
  }, []);

  // Handle thumbnail removal
  const handleThumbnailRemove = useCallback(() => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnail(null);
    setThumbnailPreview(null);
  }, [thumbnailPreview]);

  // Handle form submission - Requirements: 4.6, 4.7
  const handleSubmit = useCallback(async () => {
    // Validation
    if (!video) {
      setError('Please select a video to upload');
      return;
    }
    
    if (!caption.trim()) {
      setError('Please add a caption for your reel');
      return;
    }

    setUploadState('uploading');
    setError(null);

    try {
      const response = await reelsAPI.createReel({
        video,
        content: caption.trim(),
        visibility,
        thumbnail: thumbnail || undefined,
      });

      setUploadState('success');
      
      // Delay before closing to show success state
      setTimeout(() => {
        onSuccess(response.reel);
        resetForm();
        onClose();
      }, 1500);
    } catch (err) {
      setUploadState('error');
      setError(err instanceof Error ? err.message : 'Failed to upload reel. Please try again.');
    }
  }, [video, caption, visibility, thumbnail, onSuccess, resetForm, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  const isUploading = uploadState === 'uploading';
  const isSuccess = uploadState === 'success';
  const canSubmit = video && caption.trim() && !isUploading && !isSuccess;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" data-testid="create-reel-modal">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleClose}
        data-testid="modal-backdrop"
      />
      
      {/* Modal Content */}
      <div className="relative z-[70] w-full max-w-2xl max-h-[90vh] bg-[#FFF9F3] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#8A1538]/10 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-semibold text-[#8A1538]">Create New Reel</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#8A1538]/5 transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Close modal"
            data-testid="close-modal-button"
          >
            <X className="w-5 h-5 text-[#8A1538]" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Success State */}
          {isSuccess && (
            <div className="flex flex-col items-center justify-center py-12" data-testid="success-state">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Reel Uploaded!</h3>
              <p className="text-gray-600">Your reel has been successfully uploaded.</p>
            </div>
          )}

          {/* Form Content */}
          {!isSuccess && (
            <div className="space-y-6">
              {/* Video Upload - Requirements: 4.1, 4.2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video <span className="text-red-500">*</span>
                </label>
                <VideoUploader
                  onVideoSelect={handleVideoSelect}
                  onVideoRemove={handleVideoRemove}
                  selectedVideo={video}
                  disabled={isUploading}
                />
              </div>

              {/* Caption Input - Requirements: 4.3 */}
              <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
                  Caption <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption for your reel..."
                  disabled={isUploading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8A1538]/20 focus:border-[#8A1538] outline-none resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={3}
                  maxLength={2200}
                  data-testid="caption-input"
                />
                <p className="mt-1 text-xs text-gray-400 text-right">
                  {caption.length}/2200
                </p>
              </div>

              {/* Visibility Selector - Requirements: 4.4 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <div className="space-y-2" data-testid="visibility-selector">
                  {VISIBILITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setVisibility(option.value)}
                      disabled={isUploading}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        visibility === option.value
                          ? 'border-[#8A1538] bg-[#8A1538]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      data-testid={`visibility-${option.value}`}
                    >
                      <div className={`${visibility === option.value ? 'text-[#8A1538]' : 'text-gray-400'}`}>
                        {option.icon}
                      </div>
                      <div className="text-left">
                        <p className={`font-medium ${visibility === option.value ? 'text-[#8A1538]' : 'text-gray-700'}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                      {visibility === option.value && (
                        <div className="ml-auto">
                          <div className="w-5 h-5 bg-[#8A1538] rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thumbnail Upload - Requirements: 4.5 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail (Optional)
                </label>
                {thumbnailPreview ? (
                  <div className="relative inline-block" data-testid="thumbnail-preview">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                    <button
                      onClick={handleThumbnailRemove}
                      disabled={isUploading}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                      aria-label="Remove thumbnail"
                      data-testid="remove-thumbnail-button"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:border-[#8A1538]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="add-thumbnail-button"
                  >
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Add thumbnail</span>
                  </button>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept={SUPPORTED_IMAGE_FORMATS.join(',')}
                  onChange={handleThumbnailSelect}
                  className="hidden"
                  disabled={isUploading}
                  data-testid="thumbnail-file-input"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Supported formats: JPG, PNG
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl" data-testid="error-message">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="px-6 py-4 border-t border-[#8A1538]/10 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="cancel-button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2.5 bg-[#8A1538] hover:bg-[#6d1029] text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              data-testid="submit-button"
            >
              {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isUploading ? 'Uploading...' : 'Post Reel'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateReelModal;
