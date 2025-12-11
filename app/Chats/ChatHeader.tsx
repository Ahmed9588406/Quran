'use client';

/**
 * Chat Header Component
 * 
 * Displays chat name, avatar, status, and action buttons.
 * Requirements: 5.1, 10.1
 */

import Image from 'next/image';
import { Search, MoreVertical } from 'lucide-react';
import { Chat } from '@/lib/chat/types';
import { getChatDisplayName, getChatAvatarUrl, isChatOnline } from '@/lib/chat/utils';

interface ChatHeaderProps {
  chat: Chat;
  currentUserId: string;
  isSearchVisible: boolean;
  isMediaFilterActive: boolean;
  onToggleSearch: () => void;
  onToggleMediaFilter: () => void;
  onShowGroupInfo?: () => void;
}

export default function ChatHeader({
  chat,
  currentUserId,
  isSearchVisible,
  onToggleSearch,
  onShowGroupInfo,
}: ChatHeaderProps) {
  const displayName = getChatDisplayName(chat, currentUserId);
  const avatarUrl = getChatAvatarUrl(chat, currentUserId);
  const isOnline = isChatOnline(chat, currentUserId);
  const initial = displayName.charAt(0).toUpperCase();

  const statusText = chat.type === 'group'
    ? `${chat.participants.length} members`
    : isOnline
      ? 'online'
      : 'last seen 5 mins ago';

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
      {/* Left side - Avatar and info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-amber-700 font-semibold">{initial}</span>
            )}
          </div>
        </div>

        {/* Name and status */}
        <div>
          <div className="font-semibold text-gray-900">{displayName}</div>
          <div className="text-xs text-gray-500">
            {statusText}
          </div>
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-1">
        {/* Search button */}
        <button
          onClick={onToggleSearch}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            isSearchVisible ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-100 text-gray-500'
          }`}
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* More options button */}
        <button
          onClick={onShowGroupInfo}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
          title="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
