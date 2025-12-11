'use client';

/**
 * Message Bubble Component
 * 
 * Renders individual messages with support for text, images, videos, and audio.
 * Requirements: 3.3, 6.2, 9.1
 * 
 * **Feature: real-time-chat-system, Property 6: Message display completeness**
 * **Feature: real-time-chat-system, Property 10: Media rendering by type**
 */

import { useState } from 'react';
import { Message } from '@/lib/chat/types';
import { formatMessageTime } from '@/lib/chat/utils';
import { API_BASE_URL } from '@/lib/chat/api';
import { Trash2, Check } from 'lucide-react';
import AudioMessage from './AudioMessage';
import DocumentMessage from './DocumentMessage';
import PDFPreviewMessage from './PDFPreviewMessage';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  onDelete?: (messageId: string) => void;
}

export default function MessageBubble({ message, isSent, onDelete }: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const time = formatMessageTime(message.created_at);

  // Check if URL is an audio file
  const isAudioUrl = (url: string) => {
    return url.match(/\.(mp3|wav|ogg|webm|m4a)$/i) || url.includes('audio');
  };

  // Check if URL is a document file
  const isDocumentUrl = (url: string) => {
    return url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i);
  };

  // Check if URL is a PDF file
  const isPdfUrl = (url: string) => {
    return url.match(/\.pdf$/i) !== null;
  };

  // Get filename from URL
  const getFilenameFromUrl = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Document';
  };

  // Render media content based on type
  const renderMedia = () => {
    const mediaUrl = message.media_url ? `${API_BASE_URL}${message.media_url}` : null;
    
    // Handle attachments - may be JSON string or array
    let attachments = message.attachments;
    if (attachments) {
      // Parse if it's a JSON string (backend returns JSON string)
      if (typeof attachments === 'string') {
        try {
          attachments = JSON.parse(attachments);
        } catch {
          attachments = undefined;
        }
      }
    }
    
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      return attachments.map((attachment, index) => {
        const url = attachment.url.startsWith('http') ? attachment.url : `${API_BASE_URL}${attachment.url}`;
        const filename = attachment.filename || getFilenameFromUrl(url);
        
        // PRIORITY: Always check URL extension first for PDF detection
        // This ensures PDFs display correctly regardless of attachment.type
        if (isPdfUrl(url) || attachment.type === 'pdf' || attachment.mime_type === 'application/pdf') {
          return (
            <div key={index} className="mt-2">
              <PDFPreviewMessage 
                url={url} 
                filename={filename}
                fileSize={attachment.size}
                pageCount={attachment.pageCount}
                isSent={isSent} 
              />
            </div>
          );
        }
        
        // Check for other document types
        if (isDocumentUrl(url) || attachment.type === 'document') {
          return (
            <div key={index} className="mt-2">
              <DocumentMessage 
                url={url} 
                filename={filename}
                fileSize={attachment.size}
                isSent={isSent} 
              />
            </div>
          );
        }
        
        switch (attachment.type) {
          case 'image':
            return (
              <img
                key={index}
                src={url}
                alt="Image"
                className="max-w-full rounded-lg mt-2 cursor-pointer"
                onClick={() => window.open(url, '_blank')}
              />
            );
          case 'video':
            return (
              <video
                key={index}
                src={url}
                controls
                className="max-w-full rounded-lg mt-2"
              />
            );
          case 'audio':
            return (
              <div key={index} className="mt-2">
                <AudioMessage src={url} isSent={isSent} />
              </div>
            );
          default:
            // Fallback: detect type from URL extension
            if (isAudioUrl(url)) {
              return (
                <div key={index} className="mt-2">
                  <AudioMessage src={url} isSent={isSent} />
                </div>
              );
            }
            if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              return (
                <img
                  key={index}
                  src={url}
                  alt="Image"
                  className="max-w-full rounded-lg mt-2 cursor-pointer"
                  onClick={() => window.open(url, '_blank')}
                />
              );
            }
            if (url.match(/\.(mp4|webm|mov)$/i)) {
              return (
                <video
                  key={index}
                  src={url}
                  controls
                  className="max-w-full rounded-lg mt-2"
                />
              );
            }
            return (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 mt-2 hover:underline ${isSent ? 'text-white/80' : 'text-blue-500'}`}
              >
                📎 {filename}
              </a>
            );
        }
      });
    }

    // Handle direct media_url - PRIORITY: Check file extension first
    if (mediaUrl) {
      // First check if it's a PDF by URL extension (regardless of message type)
      // This ensures PDFs are always displayed correctly even after page refresh
      if (isPdfUrl(mediaUrl)) {
        return (
          <div className="mt-2">
            <PDFPreviewMessage 
              url={mediaUrl} 
              filename={getFilenameFromUrl(mediaUrl)}
              isSent={isSent} 
            />
          </div>
        );
      }
      
      // Check if it's another document type by extension
      if (isDocumentUrl(mediaUrl)) {
        return (
          <div className="mt-2">
            <DocumentMessage 
              url={mediaUrl} 
              filename={getFilenameFromUrl(mediaUrl)}
              isSent={isSent} 
            />
          </div>
        );
      }

      // Now check by message type (for non-document files)
      switch (message.type) {
        case 'image':
          // Double-check it's actually an image, not a mistyped PDF
          if (!isPdfUrl(mediaUrl) && !isDocumentUrl(mediaUrl)) {
            return (
              <img
                src={mediaUrl}
                alt="Image"
                className="max-w-full rounded-lg mt-2 cursor-pointer"
                onClick={() => window.open(mediaUrl, '_blank')}
              />
            );
          }
          break;
        case 'video':
          return (
            <video
              src={mediaUrl}
              controls
              className="max-w-full rounded-lg mt-2"
            />
          );
        case 'audio':
          return (
            <div className="mt-2">
              <AudioMessage src={mediaUrl} isSent={isSent} />
            </div>
          );
        case 'document':
          // Already handled above by extension check
          return (
            <div className="mt-2">
              <DocumentMessage 
                url={mediaUrl} 
                filename={getFilenameFromUrl(mediaUrl)}
                isSent={isSent} 
              />
            </div>
          );
      }
      
      // Fallback: detect type from URL extension
      if (isAudioUrl(mediaUrl)) {
        return (
          <div className="mt-2">
            <AudioMessage src={mediaUrl} isSent={isSent} />
          </div>
        );
      }
      if (mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return (
          <img
            src={mediaUrl}
            alt="Image"
            className="max-w-full rounded-lg mt-2 cursor-pointer"
            onClick={() => window.open(mediaUrl, '_blank')}
          />
        );
      }
      if (mediaUrl.match(/\.(mp4|webm|mov)$/i)) {
        return (
          <video
            src={mediaUrl}
            controls
            className="max-w-full rounded-lg mt-2"
          />
        );
      }
      // Final fallback - show as link
      return (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 mt-2 hover:underline ${isSent ? 'text-white/80' : 'text-blue-400'}`}
        >
          📎 Attached file
        </a>
      );
    }

    return null;
  };

  return (
    <div
      className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button for sent messages */}
      {isSent && onDelete && isHovered && (
        <button
          onClick={() => onDelete(message.id)}
          className="self-center mr-2 p-1.5 rounded-full hover:bg-red-100 text-red-500 transition-colors"
          title="Delete message"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div
        className={`max-w-[65%] px-3 py-2 rounded-lg shadow-sm ${
          isSent
            ? 'bg-[#8A1538] text-white rounded-br-none'
            : 'bg-white text-gray-900 rounded-bl-none'
        }`}
      >
        {/* Sender name for received messages */}
        {!isSent && message.sender_name && (
          <div className="text-xs font-medium text-[#8A1538] mb-1">
            {message.sender_name}
          </div>
        )}

        {/* Message content */}
        {message.content && (
          <div className="text-sm break-words whitespace-pre-wrap">
            {message.content}
          </div>
        )}

        {/* Media content */}
        {renderMedia()}

        {/* Time and read status */}
        <div className={`flex items-center justify-end gap-1 mt-1 ${isSent ? 'text-white/70' : 'text-gray-400'}`}>
          <span className="text-xs">{time}</span>
          {isSent && (
            <Check className="w-3 h-3" />
          )}
        </div>
      </div>
    </div>
  );
}
