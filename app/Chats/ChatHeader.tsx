'use client';

/**
 * Chat Header Component
 * 
 * Displays chat name, avatar, status, and action buttons.
 * Requirements: 5.1, 10.1
 */

import React from 'react';
import Image from 'next/image';
import { Search, Image as ImageIcon, Info } from 'lucide-react';
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
  isMediaFilterActive,
  onToggleSearch,
  onToggleMediaFilter,
  onShowGroupInfo,
}: ChatHeaderProps) {
  const displayName = getChatDisplayName(chat, currentUserId);
  const avatarUrl = getChatAvatarUrl(chat, currentUserId);
  const isOnline = isChatOnline(chat, currentUserId);
  const initial = displayName.charAt(0).toUpperCase();

  const statusText = chat.type === 'group'
    ? `${chat.participants.length} عضو`
    : isOnline
      ? 'متصل'
      : 'غير متصل';

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#F0F2F5] border-b border-gray-200">
      {/* Left side - Avatar and info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-bold">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          {chat.type === 'direct' && (
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#F0F2F5] ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          )}
        </div>

        {/* Name and status */}
        <div>
          <div className="font-medium text-gray-900">{displayName}</div>
          <div className={`text-xs ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
            {statusText}
          </div>
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-2">
        {/* Search button */}
        <button
          onClick={onToggleSearch}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isSearchVisible ? 'bg-[#e7f3ff] text-[#667eea]' : 'hover:bg-gray-200 text-gray-600'
          }`}
          title="بحث"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Media filter button */}
        <button
          onClick={onToggleMediaFilter}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isMediaFilterActive ? 'bg-[#e7f3ff] text-[#667eea]' : 'hover:bg-gray-200 text-gray-600'
          }`}
          title="الوسائط فقط"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Group info button */}
        {chat.type === 'group' && onShowGroupInfo && (
          <button
            onClick={onShowGroupInfo}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"
            title="معلومات المجموعة"
          >
            <Info className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
