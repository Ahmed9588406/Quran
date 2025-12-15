'use client';

/**
 * Document Message Component
 * 
 * Displays PDF and other document files in chat messages.
 * Shows file icon, name, size, and download button.
 */

import { FileText, Download } from 'lucide-react';

interface DocumentMessageProps {
  url: string;
  filename: string;
  fileSize?: string;
  isSent: boolean;
}

// Get file extension icon color
const getFileIconColor = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'text-red-500';
    case 'doc':
    case 'docx':
      return 'text-blue-500';
    case 'xls':
    case 'xlsx':
      return 'text-green-500';
    case 'ppt':
    case 'pptx':
      return 'text-orange-500';
    case 'txt':
      return 'text-gray-500';
    default:
      return 'text-gray-400';
  }
};

// Get file type label
const getFileTypeLabel = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'PDF';
    case 'doc':
    case 'docx':
      return 'Word';
    case 'xls':
    case 'xlsx':
      return 'Excel';
    case 'ppt':
    case 'pptx':
      return 'PowerPoint';
    case 'txt':
      return 'Text';
    default:
      return ext?.toUpperCase() || 'File';
  }
};

export default function DocumentMessage({ url, filename, fileSize, isSent }: DocumentMessageProps) {
  const iconColor = getFileIconColor(filename);
  const fileType = getFileTypeLabel(filename);
  
  // Truncate filename if too long
  const displayName = filename.length > 25 
    ? filename.substring(0, 22) + '...' + filename.split('.').pop()
    : filename;

  const handleDownload = () => {
    window.open(url, '_blank');
  };

  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors min-w-[200px] ${
        isSent 
          ? 'bg-white/10 hover:bg-white/20' 
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
      onClick={handleDownload}
    >
      {/* File Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isSent ? 'bg-white/20' : 'bg-white'
      }`}>
        <FileText className={`w-6 h-6 ${isSent ? 'text-white' : iconColor}`} />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${isSent ? 'text-white' : 'text-gray-900'}`}>
          {displayName}
        </div>
        <div className={`text-xs ${isSent ? 'text-white/60' : 'text-gray-500'}`}>
          {fileType} {fileSize && `• ${fileSize}`}
        </div>
      </div>

      {/* Download Icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isSent ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-200 hover:bg-gray-300'
      }`}>
        <Download className={`w-4 h-4 ${isSent ? 'text-white' : 'text-gray-600'}`} />
      </div>
    </div>
  );
}
