'use client';

/**
 * Message List Component
 * 
 * Renders messages with auto-scroll, search bar, and media filter.
 * Requirements: 3.2, 6.3, 10.1, 10.2
 * 
 * **Feature: real-time-chat-system, Property 11: Media filter correctness**
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Message } from '@/lib/chat/types';
import { filterMessagesByQuery } from '@/lib/chat/utils';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  typingUsers: string[];
  searchQuery: string;
  isMediaFilterActive: boolean;
  onDeleteMessage: (messageId: string) => void;
}

export default function MessageList({
  messages,
  currentUserId,
  typingUsers,
  searchQuery,
  isMediaFilterActive,
  onDeleteMessage,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Filter messages based on search query
  let filteredMessages = searchQuery
    ? filterMessagesByQuery(messages, searchQuery)
    : messages;

  // Filter by media if active
  if (isMediaFilterActive) {
    filteredMessages = filteredMessages.filter((msg) => {
      if (msg.media_url) return true;
      if (msg.attachments) {
        // Handle both string and array attachments
        const attachments = typeof msg.attachments === 'string' 
          ? (() => { try { return JSON.parse(msg.attachments); } catch { return []; } })()
          : msg.attachments;
        return Array.isArray(attachments) && attachments.length > 0;
      }
      return false;
    });
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [filteredMessages, shouldAutoScroll]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  }, []);

  // Scroll to bottom manually
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setShouldAutoScroll(true);
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{
          background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><rect fill=\'%23f0f2f5\' width=\'100\' height=\'100\'/><circle fill=\'%23e4e6eb\' cx=\'50\' cy=\'50\' r=\'1\'/></svg>")',
        }}
      >
        {/* Date indicator */}
        <div className="flex justify-center mb-4">
          <div className="px-3 py-1 rounded-lg text-xs font-medium bg-white text-gray-600 shadow-sm">
            اليوم
          </div>
        </div>

        {/* Messages */}
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message, index) => (
            <MessageBubble
              key={message.id || `msg-${index}`}
              message={message}
              isSent={message.sender_id === currentUserId}
              onDelete={message.sender_id === currentUserId ? onDeleteMessage : undefined}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {searchQuery || isMediaFilterActive ? (
              <>
                <span className="text-4xl mb-2">🔍</span>
                <p className="text-sm">لا توجد نتائج</p>
              </>
            ) : (
              <>
                <span className="text-4xl mb-2">💬</span>
                <p className="text-sm">ابدأ المحادثة</p>
              </>
            )}
          </div>
        )}

        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />
      </div>

      {/* Scroll to bottom button */}
      {!shouldAutoScroll && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
