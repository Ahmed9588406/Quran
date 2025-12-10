'use client';

/**
 * User List Item Component
 * 
 * Displays a single user in the user list with avatar, name, username, and online status.
 * Requirements: 2.1, 5.1
 */

import React from 'react';
import Image from 'next/image';
import { User } from '@/lib/chat/types';

interface UserListItemProps {
  user: User;
  onClick: () => void;
}

export default function UserListItem({ user, onClick }: UserListItemProps) {
  const displayName = user.display_name || user.username;
  const initial = displayName.charAt(0).toUpperCase();
  const isOnline = user.status === 'online';

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-gray-50"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-bold text-lg">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
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
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
          title={isOnline ? 'متصل' : 'غير متصل'}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900 truncate">
            {displayName}
          </span>
        </div>
        <div className="text-sm text-gray-500 truncate mt-0.5">
          @{user.username}
        </div>
      </div>
    </button>
  );
}
