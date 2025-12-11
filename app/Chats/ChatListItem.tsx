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

import { Chat } from '@/lib/chat/types';
import { formatTime, getChatDisplayName, getChatAvatarUrl, truncateText } from '@/lib/chat/utils';

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
  const rawAvatarUrl = getChatAvatarUrl(chat, currentUserId);
  // Ensure avatar URL has the correct base URL
  const avatarUrl = rawAvatarUrl 
    ? (rawAvatarUrl.startsWith('http') ? rawAvatarUrl : `http://192.168.1.18:9001${rawAvatarUrl}`)
    : undefined;
  const lastMessage = truncateText(chat.last_message || 'Start a new conversation', 35);
  const time = formatTime(chat.last_message_at || chat.created_at);
  const initial = displayName.charAt(0).toUpperCase();
  
  // Log chat data for debugging
  console.log('ChatListItem data:', { 
    chatId: chat.id, 
    displayName, 
    rawAvatarUrl, 
    avatarUrl,
    participants: chat.participants,
    chat_avatar_url: chat.avatar_url
  });

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-gray-50 ${
        isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="object-cover w-full h-full"
              onError={(e) => {
                // Hide broken image and show initial instead
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-amber-700 font-semibold text-lg">{initial}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {displayName}
          </span>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-sm text-gray-500 truncate">
            {lastMessage}
          </span>
          {/* Unread Badge */}
          {chat.unread_count > 0 && (
            <span className="flex-shrink-0 ml-2 w-5 h-5 flex items-center justify-center text-xs font-medium text-white bg-[#8A1538] rounded-full">
              {chat.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
