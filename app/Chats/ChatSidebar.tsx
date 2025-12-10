'use client';

/**
 * Chat Sidebar Component
 * 
 * Displays chat list and user list with tabs, search, and create group button.
 * Requirements: 1.1, 1.4, 2.1
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Menu, Users, MessageCircle, Plus } from 'lucide-react';
import { Chat, User } from '@/lib/chat/types';
import { chatAPI } from '@/lib/chat/api';
import { filterChatsByQuery } from '@/lib/chat/utils';
import ChatListItem from './ChatListItem';
import UserListItem from './UserListItem';

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  currentUserId: string;
  onSelectChat: (chat: Chat) => void;
  onSelectUser: (user: User) => void;
  onCreateGroup: () => void;
  onMenuClick?: () => void;
}

type TabType = 'chats' | 'users';

export default function ChatSidebar({
  chats,
  currentChatId,
  currentUserId,
  onSelectChat,
  onSelectUser,
  onCreateGroup,
  onMenuClick,
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Load users when switching to users tab
  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const fetchedUsers = await chatAPI.searchUsers(searchQuery);
      // Filter out current user
      setUsers(fetchedUsers.filter(u => u.id !== currentUserId));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [searchQuery, currentUserId]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, loadUsers]);

  // Filter chats based on search query
  const filteredChats = filterChatsByQuery(chats, searchQuery);

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      (user.display_name?.toLowerCase().includes(query) ?? false)
    );
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex items-center gap-2 text-lg font-semibold text-black"
          >
            <Menu className="w-6 h-6 text-[#D7BA83]" />
            <span>الرسائل</span>
          </button>

          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث..."
                className="w-full rounded-full py-2 pl-10 pr-3 text-sm shadow-sm text-black"
                style={{ background: '#FFF9F3', border: '1px solid #F7E9CF' }}
              />
            </div>
          </div>
        </div>
      </div>


      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'chats'
              ? 'text-[#8A1538] border-b-2 border-[#8A1538]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          المحادثات
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-[#8A1538] border-b-2 border-[#8A1538]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users className="w-4 h-4" />
          المستخدمين
        </button>
      </div>

      {/* Create Group Button */}
      <div className="p-3 border-b border-gray-100">
        <button
          onClick={onCreateGroup}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <Plus className="w-4 h-4" />
          مجموعة جديدة
        </button>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' ? (
          filteredChats.length > 0 ? (
            <div className="p-2">
              {filteredChats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  currentUserId={currentUserId}
                  isActive={chat.id === currentChatId}
                  onClick={() => onSelectChat(chat)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">لا توجد محادثات</p>
            </div>
          )
        ) : isLoadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8A1538]" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="p-2">
            {filteredUsers.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                onClick={() => onSelectUser(user)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Users className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">لا يوجد مستخدمين</p>
          </div>
        )}
      </div>
    </div>
  );
}
