'use client';

/**
 * Chat Header Component
 * 
 * Displays chat name, avatar, status, and action buttons.
 * Requirements: 5.1, 10.1
 */

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
  onShowContactInfo?: () => void;
}

export default function ChatHeader({
  chat,
  currentUserId,
  isSearchVisible,
  onToggleSearch,
  onShowGroupInfo,
  onShowContactInfo,
}: ChatHeaderProps) {
  const displayName = getChatDisplayName(chat, currentUserId);
  const rawAvatarUrl = getChatAvatarUrl(chat, currentUserId);
  // Ensure avatar URL has the correct base URL
  const avatarUrl = rawAvatarUrl 
    ? (rawAvatarUrl.startsWith('http') ? rawAvatarUrl : `http://apisoapp.twingroups.com${rawAvatarUrl}`)
    : undefined;
  const isOnline = isChatOnline(chat, currentUserId);
  const initial = displayName.charAt(0).toUpperCase();

  const statusText = chat.type === 'group'
    ? `${chat.participants?.length || 0} أعضاء`
    : isOnline
      ? 'متصل'
      : 'غير متصل';

  // Handle click on avatar/name to show contact info
  const handleUserClick = () => {
    if (onShowContactInfo) {
      onShowContactInfo();
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
      {/* Left side - Avatar and info */}
      <button 
        onClick={handleUserClick}
        className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-amber-700 font-semibold">{initial}</span>
            )}
          </div>
          {/* Online indicator dot */}
          {isOnline && chat.type === 'direct' && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Name and status */}
        <div className="text-right">
          <div className="font-semibold text-gray-900">{displayName}</div>
          <div className={`text-xs ${isOnline ? 'text-green-500' : 'text-gray-500'}`}>
            {statusText}
          </div>
        </div>
      </button>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-1">
        {/* Search button */}
        <button
          onClick={onToggleSearch}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            isSearchVisible ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-100 text-gray-500'
          }`}
          title="بحث"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* More options button */}
        <button
          onClick={chat.type === 'group' ? onShowGroupInfo : onShowContactInfo}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
          title="المزيد"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
