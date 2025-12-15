"use client";

/**
 * CreateReelModal Component
 * 
 * Modal for creating and uploading new reels with video upload,
 * cover photo, and description input matching the Figma design.
 * 
 * Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Play, Loader2, CheckCircle } from 'lucide-react';
import { isValidVideoFile, isValidThumbnailFile } from '@/lib/reels/utils';
import { Reel, SUPPORTED_VIDEO_FORMATS, SUPPORTED_IMAGE_FORMATS } from '@/lib/reels/types';
import { reelsAPI } from '@/lib/reels/api';

export interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reel: Reel) => void;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

/**
 * CreateReelModal - Reel creation form with video upload
 * 
 * - Displays modal with video upload functionality (Requirements: 4.1)
 * - Accepts text input for description (Requirements: 4.3)
 * - Accepts optional cover photo image (Requirements: 4.5)
 * - Uploads via POST /reels with form-data (Requirements: 4.6)
 * - Displays success message on completion (Requirements: 4.7)
 */
export function CreateReelModal({ isOpen, onClose, onSuccess }: CreateReelModalProps) {
  // Form state
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  
  // Upload state
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);

  // Create video preview URL
  useEffect(() => {
    if (video) {
      const url = URL.createObjectURL(video);
      setVideoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoPreview(null);
    }
  }, [video]);

  // Create cover photo preview URL
  useEffect(() => {
    if (coverPhoto) {
      const url = URL.createObjectURL(coverPhoto);
      setCoverPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCoverPhotoPreview(null);
    }
  }, [coverPhoto]);

  // Reset form state
  const resetForm = useCallback(() => {
    setVideo(null);
    setVideoPreview(null);
    setDescription('');
    setCoverPhoto(null);
    setCoverPhotoPreview(null);
    setUploadState('idle');
    setError(null);
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    if (uploadState === 'uploading') return;
    resetForm();
    onClose();
  }, [uploadState, resetForm, onClose]);

  // Handle video selection
  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isValidVideoFile(file)) {
        setError('Please select a valid video file (MP4, MOV, or WebM)');
        return;
      }
      setVideo(file);
      setError(null);
    }
    e.target.value = '';
  }, []);

  // Handle cover photo selection
  const handleCoverPhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isValidThumbnailFile(file)) {
        setError('Please select a valid image file (JPG or PNG)');
        return;
      }
      setCoverPhoto(file);
      setError(null);
    }
    e.target.value = '';
  }, []);

  // Handle form submission - Requirements: 4.6, 4.7
  const handleSubmit = useCallback(async () => {
    if (!video) {
      setError('Please select a video to upload');
      return;
    }

    setUploadState('uploading');
    setError(null);

    try {
      const response = await reelsAPI.createReel({
        video,
        content: description.trim(),
        visibility: 'public',
        thumbnail: coverPhoto || undefined,
      });

      console.log('[CreateReelModal] API Response:', response);
      setUploadState('success');
      
      setTimeout(() => {
        // Handle different response structures from backend
        const reel = response.reel || response;
        onSuccess(reel);
        resetForm();
        onClose();
      }, 1500);
    } catch (err) {
      setUploadState('error');
      setError(err instanceof Error ? err.message : 'Failed to upload reel. Please try again.');
    }
  }, [video, description, coverPhoto, onSuccess, resetForm, onClose]);

  if (!isOpen) return null;

  const isUploading = uploadState === 'uploading';
  const isSuccess = uploadState === 'success';
  const canSubmit = video && !isUploading && !isSuccess;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" data-testid="create-reel-modal">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleClose}
        data-testid="modal-backdrop"
      />
      
      {/* Modal Content */}
      <div className="relative z-[70] w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#8A1538]/20">
          <h2 className="text-xl font-semibold text-[#8A1538] text-center">Create new reel</h2>
        </div>

        {/* Success State */}
        {isSuccess && (
          <div className="flex flex-col items-center justify-center py-16" data-testid="success-state">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Reel Uploaded!</h3>
            <p className="text-gray-600">Your reel has been successfully uploaded.</p>
          </div>
        )}

        {/* Form Content */}
        {!isSuccess && (
          <div className="p-6">
            <div className="flex gap-8">
              {/* Left Side - Media & Description */}
              <div className="flex-1">
                {/* Media Section */}
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-1">Media</h3>
                  <p className="text-sm text-gray-500 mb-4">Upload video or photos to create a reel.</p>
                  
                  <div className="flex gap-4">
                    {/* Video Upload Box */}
                    <div className="flex flex-col items-center">
                      <div 
                        onClick={() => !isUploading && videoInputRef.current?.click()}
                        className={`w-36 h-44 bg-[#F5EDE8] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#EDE5E0] transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {video && videoPreview && (
                          <div className="relative w-full h-full">
                            <video 
                              src={videoPreview} 
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setVideo(null);
                              }}
                              className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => !isUploading && videoInputRef.current?.click()}
                        disabled={isUploading}
                        className="mt-2 px-4 py-1.5 border border-[#8A1538] text-[#8A1538] text-sm rounded-full hover:bg-[#8A1538]/5 transition-colors disabled:opacity-50"
                      >
                        Add Video
                      </button>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept={SUPPORTED_VIDEO_FORMATS.join(',')}
                        onChange={handleVideoSelect}
                        className="hidden"
                        disabled={isUploading}
                        data-testid="video-file-input"
                      />
                    </div>

                    {/* Cover Photo Upload Box */}
                    <div className="flex flex-col items-center">
                      <div 
                        onClick={() => !isUploading && coverPhotoInputRef.current?.click()}
                        className={`w-36 h-44 bg-[#F5EDE8] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#EDE5E0] transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {coverPhoto && coverPhotoPreview ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={coverPhotoPreview} 
                              alt="Cover" 
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCoverPhoto(null);
                              }}
                              className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <button
                        onClick={() => !isUploading && coverPhotoInputRef.current?.click()}
                        disabled={isUploading}
                        className="mt-2 px-4 py-1.5 border border-[#8A1538] text-[#8A1538] text-sm rounded-full hover:bg-[#8A1538]/5 transition-colors disabled:opacity-50"
                      >
                        Add cover Photos
                      </button>
                      <input
                        ref={coverPhotoInputRef}
                        type="file"
                        accept={SUPPORTED_IMAGE_FORMATS.join(',')}
                        onChange={handleCoverPhotoSelect}
                        className="hidden"
                        disabled={isUploading}
                        data-testid="cover-photo-file-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-1">Description</h3>
                  <p className="text-sm text-gray-500 mb-2">Let viewers know what your reel is about</p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your reel"
                    disabled={isUploading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A1538]/20 focus:border-[#8A1538] outline-none resize-none transition-colors disabled:opacity-50"
                    rows={4}
                    maxLength={2200}
                    data-testid="description-input"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" data-testid="error-message">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>

              {/* Right Side - Video Preview */}
              <div className="w-[320px] flex-shrink-0">
                <div className="w-full h-[400px] bg-[#C4A99A] rounded-lg flex items-center justify-center overflow-hidden">
                  {videoPreview ? (
                    <video 
                      src={videoPreview} 
                      className="w-full h-full object-contain"
                      controls
                    />
                  ) : (
                    <div className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center">
                      <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="px-12 py-3 bg-[#8A1538] hover:bg-[#6d1029] text-white font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                data-testid="submit-button"
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isUploading ? 'Uploading...' : 'Post reel'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateReelModal;
