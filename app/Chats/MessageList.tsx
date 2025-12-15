'use client';

/**
 * Message List Component
 * 
 * Renders messages with auto-scroll, search bar, and media filter.
 * Requirements: 3.2, 6.3, 10.1, 10.2
 * 
 * **Feature: real-time-chat-system, Property 11: Media filter correctness**
 */

import { useRef, useEffect, useState, useCallback } from 'react';
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

  // Beige/cream background with subtle pattern
  const bgStyle: React.CSSProperties = {
    backgroundColor: '#F5E6D3',
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(215, 186, 131, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(215, 186, 131, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(215, 186, 131, 0.1) 0%, transparent 70%)
    `,
    minHeight: '100%',
  };

  return (
    <div className="h-full overflow-hidden" style={{ backgroundColor: '#F5E6D3' }}>
      {/* Messages Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 py-4"
        style={bgStyle}
      >
        {/* Date indicator */}
        <div className="flex justify-center mb-4">
          <div className="px-3 py-1 rounded-lg text-xs font-medium bg-white/80 text-gray-600 shadow-sm">
            Today
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
                <p className="text-sm">No results found</p>
              </>
            ) : (
              <>
                <span className="text-4xl mb-2">💬</span>
                <p className="text-sm">Start a conversation</p>
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
