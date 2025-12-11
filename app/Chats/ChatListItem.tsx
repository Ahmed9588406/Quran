'use client';

/**
 * Chat List Item Component
 * 
 * Displays a single chat in the chat list with avatar, name, last message, time, and unread badge.
 * Requirements: 1.2, 1.3, 5.1
 * 
 * **Feature: real-time-chat-system, Property 2: Conversation display completeness**
 * **Feature: real-time-chat-system, Property 9: Presence status display**
 */

import React from 'react';
import Image from 'next/image';
import { Chat } from '@/lib/chat/types';
import { formatTime, getChatDisplayName, getChatAvatarUrl, isChatOnline, truncateText } from '@/lib/chat/utils';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  isActive: boolean;
  onClick: () => void;
}

export default function ChatListItem({
  chat,
  currentUserId,
  isActive,
  onClick,
}: ChatListItemProps) {
  const displayName = getChatDisplayName(chat, currentUserId);
  const avatarUrl = getChatAvatarUrl(chat, currentUserId);
  const isOnline = isChatOnline(chat, currentUserId);
  const lastMessage = truncateText(chat.last_message || 'بدأ محادثة جديدة', 40);
  const time = formatTime(chat.last_message_at || chat.created_at);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
        isActive ? 'bg-[#e7f3ff] border-r-3 border-[#667eea]' : 'hover:bg-gray-50'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-bold text-lg">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        {/* Online Status Indicator */}
        {chat.type === 'direct' && (
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
            title={isOnline ? 'متصل' : 'غير متصل'}
          />
        )}
        {/* Group Icon */}
        {chat.type === 'group' && (
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#667eea] flex items-center justify-center text-white text-xs">
            👥
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 truncate">
            {displayName}
          </span>
          <span className="text-xs text-gray-400 flex-shrink-0 mr-2">
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-gray-500 truncate">
            {lastMessage}
          </span>
          {/* Unread Badge */}
          {chat.unread_count > 0 && (
            <span className="flex-shrink-0 mr-2 px-2 py-0.5 text-xs font-medium text-white bg-[#8A1538] rounded-full">
              {chat.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
