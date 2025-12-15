'use client';

/**
 * Chat Sidebar Component
 * 
 * Displays chat list and user list with tabs, search, and create group button.
 * Requirements: 1.1, 1.4, 2.1
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Menu, MessageCircle, Archive, Users, CheckSquare, LogOut, Circle } from 'lucide-react';
import { Chat, User } from '@/lib/chat/types';
import { chatAPI } from '@/lib/chat/api';
import { filterChatsByQuery, isChatOnline } from '@/lib/chat/utils';
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

type TabType = 'all' | 'chats' | 'online' | 'groups';

export default function ChatSidebar({
  chats,
  currentChatId,
  currentUserId,
  onSelectChat,
  onSelectUser,
  onCreateGroup,
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (activeTab === 'all') {
      loadUsers();
    }
  }, [activeTab, loadUsers]);

  // Filter chats based on search query and tab
  const filteredChats = filterChatsByQuery(chats, searchQuery).filter(chat => {
    if (activeTab === 'all') return true;
    if (activeTab === 'chats') return chat.type === 'direct';
    if (activeTab === 'groups') return chat.type === 'group';
    if (activeTab === 'online') return chat.type === 'direct' && isChatOnline(chat, currentUserId);
    return true;
  });

  // Filter users based on search query and online status
  const filteredUsers = users.filter(user => {
    // For online tab, only show online users
    if (activeTab === 'online' && user.status !== 'online') return false;
    
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      (user.display_name?.toLowerCase().includes(query) ?? false)
    );
  });

  // Get online users count
  const onlineUsersCount = users.filter(u => u.status === 'online').length;
  const onlineChatsCount = chats.filter(c => c.type === 'direct' && isChatOnline(c, currentUserId)).length;

  // Count chats by type
  const allCount = chats.length;
  const chatsCount = chats.filter(c => c.type === 'direct').length;
  const groupsCount = chats.filter(c => c.type === 'group').length;

  const tabs = [
    { id: 'all' as TabType, label: 'All', count: allCount },
    { id: 'chats' as TabType, label: 'Chats', count: chatsCount },
    { id: 'online' as TabType, label: 'Online', count: onlineChatsCount + onlineUsersCount },
    { id: 'groups' as TabType, label: 'Groups', count: groupsCount },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Menu Button with Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                <button
                  onClick={() => {
                    onCreateGroup();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Users className="w-4 h-4" />
                  New group
                </button>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <CheckSquare className="w-4 h-4" />
                  Select chats
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full rounded-full py-2 pl-10 pr-4 text-sm bg-gray-100 border-0 focus:outline-none focus:ring-1 focus:ring-gray-200 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-4 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[#8A1538] border-b-2 border-[#8A1538]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} {tab.count}
          </button>
        ))}
      </div>

      {/* Archive Section */}
      <button 
        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
      >
        <div className="flex items-center gap-3">
          <Archive className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-700">Archive</span>
        </div>
        <span className="text-sm text-gray-400">1</span>
      </button>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          <div>
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
        ) : isLoadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8A1538]" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div>
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
            <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">لا توجد محادثات</p>
          </div>
        )}
      </div>
    </div>
  );
}
