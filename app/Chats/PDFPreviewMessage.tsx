'use client';

/**
 * PDF Preview Message Component
 * 
 * Displays PDF documents in chat messages with a modern, WhatsApp-style preview.
 * Shows PDF icon, file metadata, download progress, and download options.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 3.1, 3.3, 4.1, 4.2
 * 
 * **Feature: pdf-chat-preview, Property 3: Color scheme matches message direction**
 */

import { useState } from 'react';
import { Download, Check, Loader2 } from 'lucide-react';
import { formatFileSize, truncateFilename } from '@/lib/chat/pdf-utils';

/**
 * Props interface for PDFPreviewMessage component
 * Requirements: 1.1, 1.3, 1.4, 1.5
 */
export interface PDFPreviewMessageProps {
  /** URL to the PDF file */
  url: string;
  /** Original filename */
  filename: string;
  /** File size in bytes */
  fileSize?: number;
  /** Number of pages (if known) */
  pageCount?: number;
  /** Whether message was sent by current user */
  isSent: boolean;
}

type DownloadState = 'idle' | 'downloading' | 'downloaded';

/**
 * PDFPreviewMessage Component
 * 
 * Renders a modern WhatsApp-style PDF preview card with icon, file info, and download button.
 * Applies different color schemes based on message direction (sent/received).
 */
export default function PDFPreviewMessage({
  url,
  filename,
  fileSize,
  pageCount,
  isSent,
}: PDFPreviewMessageProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Format display values
  const displayFilename = truncateFilename(filename, 30);
  const displayFileSize = fileSize ? formatFileSize(fileSize) : 'PDF';

  /**
   * Handle click on preview area to open PDF in new tab
   * Requirements: 3.1
   */
  const handlePreviewClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  /**
   * Handle download button click with visual feedback
   * Requirements: 3.3
   */
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (downloadState === 'downloading') return;
    
    setDownloadState('downloading');
    setDownloadProgress(0);

    // Simulate progress animation for visual feedback
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 30 + 10;
      if (progress >= 90) {
        progress = 90;
        clearInterval(progressInterval);
      }
      setDownloadProgress(Math.min(Math.round(progress), 90));
    }, 200);

    // Create download link - opens in new tab for cross-origin URLs
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Complete the progress animation
    setTimeout(() => {
      clearInterval(progressInterval);
      setDownloadProgress(100);
      setDownloadState('downloaded');
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setDownloadState('idle');
        setDownloadProgress(0);
      }, 3000);
    }, 800);
  };

  /**
   * Get download button icon based on state
   */
  const getDownloadIcon = () => {
    switch (downloadState) {
      case 'downloading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'downloaded':
        return <Check className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  /**
   * Get download button styles based on state
   */
  const getDownloadButtonStyles = () => {
    if (downloadState === 'downloaded') {
      return isSent 
        ? 'bg-green-500 text-white' 
        : 'bg-green-500 text-white';
    }
    if (downloadState === 'downloading') {
      return isSent 
        ? 'bg-white/10 text-white cursor-wait' 
        : 'bg-gray-200 text-gray-600 cursor-wait';
    }
    return isSent 
      ? 'bg-white/20 hover:bg-white/30 text-white' 
      : 'bg-[#00a884] hover:bg-[#008f72] text-white';
  };

  /**
   * Get status text for download state
   */
  const getStatusText = () => {
    switch (downloadState) {
      case 'downloading':
        return `${downloadProgress}%`;
      case 'downloaded':
        return 'Downloaded';
      default:
        return displayFileSize;
    }
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-xl cursor-pointer 
        transition-all duration-200 min-w-[260px] max-w-[320px]
        ${isSent 
          ? 'bg-[#6b1029] hover:bg-[#5a0d22]' 
          : 'bg-[#f0f2f5] hover:bg-[#e4e6e9]'
        }
      `}
      onClick={handlePreviewClick}
      role="button"
      tabIndex={0}
      aria-label={`Open PDF: ${filename}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handlePreviewClick();
        }
      }}
    >
      {/* PDF Icon Container */}
      <div className="relative flex-shrink-0">
        {/* Document icon with folded corner effect */}
        <div className="w-12 h-14 rounded-lg flex items-center justify-center relative bg-[#dc3545]">
          {/* Folded corner effect */}
          <div 
            className={`absolute top-0 right-0 w-3 h-3 ${isSent ? 'bg-[#6b1029]' : 'bg-[#f0f2f5]'}`} 
            style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} 
          />
          <div 
            className="absolute top-0 right-0 w-3 h-3 bg-[#b02a37] rounded-bl-sm" 
            style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }} 
          />
          
          {/* PDF text */}
          <span className="text-white font-bold text-xs mt-1">PDF</span>
        </div>
        
        {/* Download progress ring overlay */}
        {downloadState === 'downloading' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="3"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - downloadProgress / 100)}`}
                className="transition-all duration-300"
              />
            </svg>
          </div>
        )}
        
        {/* Downloaded checkmark overlay */}
        {downloadState === 'downloaded' && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/80 rounded-lg">
            <Check className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* File Info Section */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Filename */}
        <div 
          className={`text-sm font-medium truncate leading-tight ${isSent ? 'text-white' : 'text-gray-900'}`} 
          title={filename}
        >
          {displayFilename}
        </div>
        
        {/* File metadata / Download status */}
        <div className={`text-xs mt-0.5 flex items-center gap-1.5 ${isSent ? 'text-white/70' : 'text-gray-500'}`}>
          <span className={downloadState === 'downloaded' ? 'text-green-400' : ''}>
            {getStatusText()}
          </span>
          {downloadState === 'idle' && pageCount && (
            <>
              <span>•</span>
              <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
            </>
          )}
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={downloadState === 'downloading'}
        className={`
          w-9 h-9 rounded-full flex items-center justify-center 
          flex-shrink-0 transition-all duration-200
          ${getDownloadButtonStyles()}
        `}
        aria-label={
          downloadState === 'downloading' 
            ? `Downloading ${downloadProgress}%` 
            : downloadState === 'downloaded' 
              ? 'Downloaded' 
              : `Download ${filename}`
        }
        title={
          downloadState === 'downloading' 
            ? `Downloading ${downloadProgress}%` 
            : downloadState === 'downloaded' 
              ? 'Downloaded' 
              : 'Download PDF'
        }
      >
        {getDownloadIcon()}
      </button>
    </div>
  );
}
