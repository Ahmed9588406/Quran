'use client';

/**
 * Main Chats Page
 * 
 * Integrates all chat components with real-time functionality.
 * Requirements: 1.1, 2.1, 3.1, 11.1
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Chat, Message, User } from '@/lib/chat/types';
import { chatAPI } from '@/lib/chat/api';
import { wsManager } from '@/lib/chat/websocket';
import { sortChatsByRecent } from '@/lib/chat/utils';
import LeftSide from '../user/leftside';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConnectionStatus from './ConnectionStatus';
import CreateGroupModal from './CreateGroupModal';
import EmptyState from './EmptyState';

export default function ChatsPage() {
  // State
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMediaFilterActive, setIsMediaFilterActive] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  // Initialize - get current user and connect WebSocket
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id || '');
        
        // Connect WebSocket
        wsManager.connect(token);
        
        // Load initial data
        loadChats();
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    setIsLoading(false);

    return () => {
      // Cleanup is handled by wsManager
    };
  }, []);

  // WebSocket status listener
  useEffect(() => {
    const unsubscribe = wsManager.onStatusChange((status) => {
      setConnectionStatus(status);
    });
    return unsubscribe;
  }, []);

  // WebSocket message listener
  useEffect(() => {
    const unsubscribe = wsManager.onMessage((message) => {
      switch (message.type) {
        case 'chat/receive':
          if (message.data && message.chat_id) {
            const newMessage = message.data as Message;
            // Add message if it's for the current chat
            if (currentChat && message.chat_id === currentChat.id) {
              setMessages(prev => [...prev, newMessage]);
            }
            // Refresh chat list
            loadChats();
          }
          break;
        
        case 'chat/typing':
          if (message.chat_id === currentChat?.id && message.user_id) {
            setTypingUsers(prev => [...new Set([...prev, message.user_id!])]);
          }
          break;
        
        case 'chat/stop_typing':
          if (message.chat_id === currentChat?.id && message.user_id) {
            setTypingUsers(prev => prev.filter(id => id !== message.user_id));
          }
          break;
        
        case 'chat/message_deleted':
          if (message.chat_id === currentChat?.id && message.data) {
            const data = message.data as { message_id: string };
            setMessages(prev => prev.filter(m => m.id !== data.message_id));
          }
          loadChats();
          break;
        
        case 'presence':
          // Update user status in chats
          if (message.user_id && message.data) {
            const data = message.data as { status: 'online' | 'offline' };
            setChats(prev => prev.map(chat => ({
              ...chat,
              participants: chat.participants.map(p =>
                p.id === message.user_id ? { ...p, status: data.status } : p
              ),
            })));
          }
          break;
      }
    });
    return unsubscribe;
  }, [currentChat]);


  // Load chats
  const loadChats = useCallback(async () => {
    try {
      const fetchedChats = await chatAPI.listChats();
      setChats(sortChatsByRecent(fetchedChats));
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }, []);

  // Load messages for a chat
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const fetchedMessages = await chatAPI.getMessages(chatId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  // Handle chat selection
  const handleSelectChat = useCallback(async (chat: Chat) => {
    setCurrentChat(chat);
    setTypingUsers([]);
    setSearchQuery('');
    setIsSearchVisible(false);
    setIsMediaFilterActive(false);
    await loadMessages(chat.id);
  }, [loadMessages]);

  // Handle user selection (start new chat)
  const handleSelectUser = useCallback(async (user: User) => {
    try {
      const response = await chatAPI.createChat(user.id);
      await loadChats();
      
      // Find and select the new/existing chat
      const updatedChats = await chatAPI.listChats();
      const chat = updatedChats.find(c => c.id === response.chat_id);
      if (chat) {
        handleSelectChat(chat);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  }, [loadChats, handleSelectChat]);

  // Handle send message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentChat) return;
    
    try {
      const message = await chatAPI.sendMessage(currentChat.id, content);
      setMessages(prev => [...prev, message]);
      loadChats(); // Refresh to update last message
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [currentChat, loadChats]);

  // Handle send media
  const handleSendMedia = useCallback(async (file: File, type: 'image' | 'video' | 'audio') => {
    if (!currentChat) return;
    
    try {
      const message = await chatAPI.sendMedia(currentChat.id, file, type);
      setMessages(prev => [...prev, message]);
      loadChats();
    } catch (error) {
      console.error('Error sending media:', error);
      throw error;
    }
  }, [currentChat, loadChats]);

  // Handle delete message
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    
    try {
      await chatAPI.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      loadChats();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, [loadChats]);

  // Handle create group
  const handleCreateGroup = useCallback(async (title: string, memberIds: string[]) => {
    try {
      const response = await chatAPI.createGroup(title, memberIds);
      await loadChats();
      
      // Find and select the new group
      const updatedChats = await chatAPI.listChats();
      const chat = updatedChats.find(c => c.id === response.chat_id);
      if (chat) {
        handleSelectChat(chat);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }, [loadChats, handleSelectChat]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8A1538]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Navigation */}
      <LeftSide isOpen={false} permanent onNavigate={() => {}} activeView="chats" />

      {/* Chat Sidebar */}
      <aside className="fixed top-0 left-14 bottom-0 w-[364px] bg-white border-r border-gray-200">
        {/* Connection Status */}
        <div className="absolute top-2 left-2 z-10">
          <ConnectionStatus status={connectionStatus} />
        </div>
        
        <ChatSidebar
          chats={chats}
          currentChatId={currentChat?.id || null}
          currentUserId={currentUserId}
          onSelectChat={handleSelectChat}
          onSelectUser={handleSelectUser}
          onCreateGroup={() => setIsCreateGroupModalOpen(true)}
        />
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white ml-[420px]">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              chat={currentChat}
              currentUserId={currentUserId}
              isSearchVisible={isSearchVisible}
              isMediaFilterActive={isMediaFilterActive}
              onToggleSearch={() => setIsSearchVisible(!isSearchVisible)}
              onToggleMediaFilter={() => setIsMediaFilterActive(!isMediaFilterActive)}
              onShowGroupInfo={currentChat.type === 'group' ? () => {} : undefined}
            />

            {/* Search Bar */}
            {isSearchVisible && (
              <div className="px-4 py-2 bg-white border-b border-gray-200">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في المحادثة..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent text-sm"
                  autoFocus
                />
              </div>
            )}

            {/* Message List */}
            <div className="flex-1 relative overflow-hidden">
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                typingUsers={typingUsers}
                searchQuery={searchQuery}
                isMediaFilterActive={isMediaFilterActive}
                onDeleteMessage={handleDeleteMessage}
              />
            </div>

            {/* Message Input */}
            <MessageInput
              chatId={currentChat.id}
              onSendMessage={handleSendMessage}
              onSendMedia={handleSendMedia}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </main>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        currentUserId={currentUserId}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}
