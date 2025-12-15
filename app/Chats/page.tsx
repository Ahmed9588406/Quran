/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

/**
 * Main Chats Page
 * 
 * Integrates all chat components with real-time functionality.
 * Requirements: 1.1, 2.1, 3.1, 11.1
 */

import { useState, useEffect, useCallback } from 'react';
import { Chat, Message, User, WSMessageType } from '@/lib/chat/types';
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
import ContactInfo from './contact_info';

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
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);

  // Load chats - defined first so it can be used in useEffect
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
  }, [loadChats]);

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
          // Backend sends: { type: 'chat/receive', data: { chat_id, content, sender_id, ... } }
          if (message.data) {
            const msgData = message.data as Message & { chat_id?: string };
            const chatId = msgData.chat_id || message.chat_id;
            
            // Add message if it's for the current chat
            if (currentChat && chatId === currentChat.id) {
              setMessages(prev => [...prev, msgData]);
              // Auto-mark as seen when receiving in active chat via REST API
              // Endpoint: POST /chat/:chat_id/seen
              chatAPI.markAsSeen(currentChat.id).catch(console.error);
            }
            // Refresh chat list to update unread counts
            loadChats();
          }
          break;
        
        case 'typing' as WSMessageType:
        case 'chat/typing':
          // Backend sends: { type: 'typing', chat_id, is_typing, user_id }
          // or: { type: 'chat/typing', data: { chat_id, is_typing, user_id } }
          {
            // Handle both formats - data in root or nested in data object
            const msgAny = message as unknown as Record<string, unknown>;
            const typingData = (message.data as Record<string, unknown>) || msgAny;
            const typingChatId = (typingData?.chat_id as string) || message.chat_id;
            const typingUserId = (typingData?.user_id as string) || message.user_id;
            const isTyping = typingData?.is_typing !== false;
            
            if (typingChatId === currentChat?.id && typingUserId) {
              if (isTyping) {
                setTypingUsers(prev => [...new Set([...prev, typingUserId])]);
              } else {
                setTypingUsers(prev => prev.filter(id => id !== typingUserId));
              }
            }
          }
          break;
        
        case 'chat/stop_typing':
          if (message.chat_id === currentChat?.id && message.user_id) {
            setTypingUsers(prev => prev.filter(id => id !== message.user_id));
          }
          break;

        case 'seen' as WSMessageType:
        case 'chat/seen':
          // Backend sends: { type: 'chat/seen', chat_id, message_id, user_id }
          // or: { type: 'seen', chat_id, user_id }
          {
            const msgAny = message as unknown as Record<string, unknown>;
            const seenData = (message.data as Record<string, unknown>) || msgAny;
            const seenChatId = (seenData?.chat_id as string) || message.chat_id;
            const seenMessageId = seenData?.message_id as string;
            const seenUserId = (seenData?.user_id as string) || message.user_id;
            
            if (seenChatId === currentChat?.id) {
              if (seenMessageId) {
                // Mark specific message as read
                setMessages(prev => prev.map(m => 
                  m.id === seenMessageId ? { ...m, is_read: true } : m
                ));
              } else if (seenUserId) {
                // Mark all messages from current user as read by the other user
                setMessages(prev => prev.map(m => 
                  m.sender_id === currentUserId ? { ...m, is_read: true } : m
                ));
              }
              // Refresh chat list to update unread counts
              loadChats();
            }
          }
          break;
        
        case 'chat/message_deleted':
          // Backend sends: { type: 'chat/message_deleted', data: { chat_id, message_id } }
          if (message.data) {
            const deleteData = message.data as { chat_id?: string; message_id: string };
            const deleteChatId = deleteData.chat_id || message.chat_id;
            
            if (deleteChatId === currentChat?.id) {
              setMessages(prev => prev.filter(m => m.id !== deleteData.message_id));
            }
          }
          loadChats();
          break;
        
        case 'presence':
          // Update user status in chats
          if (message.user_id && message.data) {
            const data = message.data as { status: 'online' | 'offline' };
            setChats(prev => prev.map(chat => ({
              ...chat,
              // Update status on chat object for direct chats
              status: chat.type === 'direct' && 
                (chat.participants?.some(p => p.id === message.user_id) || true) 
                ? data.status 
                : chat.status,
              participants: chat.participants?.map(p =>
                p.id === message.user_id ? { ...p, status: data.status } : p
              ) || [],
            })));
          }
          break;

        case 'notification':
          // Handle push notifications from server
          if (message.data) {
            const notifData = message.data as { id: string; title: string; body: string };
            // Show browser notification if supported
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(notifData.title, { body: notifData.body });
            }
          }
          break;
      }
    });
    return unsubscribe;
  }, [currentChat, loadChats]);

  // Mark messages as seen when opening a chat via REST API
  // Endpoint: POST /chat/:chat_id/seen
  useEffect(() => {
    if (currentChat && messages.length > 0) {
      // Find unread messages from other users
      const unreadMessages = messages.filter(
        (msg) => msg.sender_id !== currentUserId && !msg.is_read
      );
      
      if (unreadMessages.length > 0) {
        // Mark all messages in the chat as seen
        chatAPI.markAsSeen(currentChat.id).then(() => {
          // Update local state to mark messages as read
          setMessages((prev) =>
            prev.map((msg) =>
              msg.sender_id !== currentUserId ? { ...msg, is_read: true } : msg
            )
          );
          // Refresh chat list to update unread counts
          loadChats();
        }).catch(console.error);
      }
    }
  }, [currentChat?.id, messages.length, currentUserId, loadChats]);

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
      // Fill in sender_id if not provided by backend
      const fullMessage = {
        ...message,
        sender_id: message.sender_id || currentUserId,
      };
      setMessages(prev => [...prev, fullMessage]);
      loadChats(); // Refresh to update last message
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [currentChat, currentUserId, loadChats]);

  // Handle send media
  const handleSendMedia = useCallback(async (file: File, type: 'image' | 'video' | 'audio' | 'document') => {
    if (!currentChat) return;
    
    try {
      const message = await chatAPI.sendMedia(currentChat.id, file, type);
      // Fill in sender_id if not provided by backend
      const fullMessage = {
        ...message,
        sender_id: message.sender_id || currentUserId,
      };
      setMessages(prev => [...prev, fullMessage]);
      loadChats();
    } catch (error) {
      console.error('Error sending media:', error);
      throw error;
    }
  }, [currentChat, currentUserId, loadChats]);

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
      <main className="fixed top-0 bottom-0 right-0 left-[420px] flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header - Fixed at top */}
            <div className="flex-shrink-0">
              <ChatHeader
                chat={currentChat}
                currentUserId={currentUserId}
                isSearchVisible={isSearchVisible}
                isMediaFilterActive={isMediaFilterActive}
                onToggleSearch={() => setIsSearchVisible(!isSearchVisible)}
                onToggleMediaFilter={() => setIsMediaFilterActive(!isMediaFilterActive)}
                onShowGroupInfo={currentChat.type === 'group' ? () => {} : undefined}
                onShowContactInfo={() => setIsContactInfoOpen(true)}
              />

              {/* Search Bar */}
              {isSearchVisible && (
                <div className="px-4 py-2 bg-white border-b border-gray-200">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in conversation..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent text-sm"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Message List - Scrollable middle section */}
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                typingUsers={typingUsers}
                searchQuery={searchQuery}
                isMediaFilterActive={isMediaFilterActive}
                onDeleteMessage={handleDeleteMessage}
              />
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="flex-shrink-0">
              <MessageInput
                chatId={currentChat.id}
                onSendMessage={handleSendMessage}
                onSendMedia={handleSendMedia}
              />
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </main>

      {/* Create Group Modal */}
      <CreateGroupModal {...({
        isOpen: isCreateGroupModalOpen,
        currentUserId,
        onClose: () => setIsCreateGroupModalOpen(false),
        onCreateGroup: handleCreateGroup,
      } as any)} />

      {/* Contact Info Panel */}
      {isContactInfoOpen && currentChat && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsContactInfoOpen(false)}
          />
          {/* Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-[360px] bg-white shadow-xl z-50 animate-slide-in-right">
            <ContactInfo
              chat={currentChat}
              currentUserId={currentUserId}
              onClose={() => setIsContactInfoOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
