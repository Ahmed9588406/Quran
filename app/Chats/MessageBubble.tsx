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

import React, { useState } from 'react';
import { Message } from '@/lib/chat/types';
import { formatMessageTime } from '@/lib/chat/utils';
import { API_BASE_URL } from '@/lib/chat/api';
import { Trash2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  onDelete?: (messageId: string) => void;
}

export default function MessageBubble({ message, isSent, onDelete }: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const time = formatMessageTime(message.created_at);

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
        const url = `${API_BASE_URL}${attachment.url}`;
        
        switch (attachment.type) {
          case 'image':
            return (
              <img
                key={index}
                src={url}
                alt="صورة"
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
              <div key={index} className="mt-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🎤</span>
                  <span className="text-xs opacity-70">رسالة صوتية</span>
                </div>
                <audio
                  src={url}
                  controls
                  className="w-full h-10"
                  style={{ minWidth: '200px' }}
                />
              </div>
            );
          default:
            return (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 mt-2 text-blue-500 hover:underline"
              >
                📎 {attachment.filename || 'ملف'}
              </a>
            );
        }
      });
    }

    // Handle direct media_url
    if (mediaUrl) {
      switch (message.type) {
        case 'image':
          return (
            <img
              src={mediaUrl}
              alt="صورة"
              className="max-w-full rounded-lg mt-2 cursor-pointer"
              onClick={() => window.open(mediaUrl, '_blank')}
            />
          );
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
            <div className="mt-2 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎤</span>
                <span className="text-xs opacity-70">رسالة صوتية</span>
              </div>
              <audio
                src={mediaUrl}
                controls
                className="w-full h-10"
                style={{ minWidth: '200px' }}
              />
            </div>
          );
        default:
          // If type is not specified but we have media_url, try to detect from URL
          if (mediaUrl.match(/\.(mp3|wav|ogg|webm|m4a)$/i) || mediaUrl.includes('audio')) {
            return (
              <div className="mt-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🎤</span>
                  <span className="text-xs opacity-70">رسالة صوتية</span>
                </div>
                <audio
                  src={mediaUrl}
                  controls
                  className="w-full h-10"
                  style={{ minWidth: '200px' }}
                />
              </div>
            );
          }
          if (mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return (
              <img
                src={mediaUrl}
                alt="صورة"
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
          // Fallback - show as link
          return (
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-2 text-blue-400 hover:underline"
            >
              📎 ملف مرفق
            </a>
          );
      }
    }

    return null;
  };

  return (
    <div
      className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3 animate-slideUp`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button for sent messages */}
      {isSent && onDelete && isHovered && (
        <button
          onClick={() => onDelete(message.id)}
          className="self-center mr-2 p-1.5 rounded-full hover:bg-red-100 text-red-500 transition-colors"
          title="حذف الرسالة"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div
        className={`max-w-[65%] px-3 py-2 rounded-2xl ${
          isSent
            ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-br-sm'
            : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
        }`}
      >
        {/* Sender name for received messages */}
        {!isSent && message.sender_name && (
          <div className="text-xs font-medium text-[#667eea] mb-1">
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
        <div className={`flex items-center justify-end gap-1 mt-1 ${isSent ? 'text-white/70' : 'text-gray-500'}`}>
          <span className="text-xs">{time}</span>
          {isSent && message.is_read && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 8L9 11L16 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
