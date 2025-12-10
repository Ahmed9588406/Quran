'use client';

/**
 * Chat Context Provider
 * 
 * Manages global chat state and integrates with WebSocket for real-time updates.
 * Requirements: 3.2, 4.2, 5.2, 11.1
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { Chat, Message, User, ConnectionStatus, WSMessage, ChatContextType } from './types';
import { chatAPI } from './api';
import { wsManager } from './websocket';
import { sortChatsByRecent } from './utils';

// Initial state
const initialState: Omit<ChatContextType, keyof import('./types').ChatActions> = {
  chats: [],
  currentChatId: null,
  messages: {},
  users: [],
  typingUsers: {},
  connectionStatus: 'disconnected',
};

// Action types
type ChatAction =
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'SELECT_CHAT'; payload: string | null }
  | { type: 'SET_MESSAGES'; payload: { chatId: string; messages: Message[] } }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'REMOVE_MESSAGE'; payload: { chatId: string; messageId: string } }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_TYPING'; payload: { chatId: string; userId: string; isTyping: boolean } }
  | { type: 'UPDATE_PRESENCE'; payload: { userId: string; status: 'online' | 'offline' } }
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus };

// Reducer
function chatReducer(state: typeof initialState, action: ChatAction): typeof initialState {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: sortChatsByRecent(action.payload) };
    
    case 'SELECT_CHAT':
      return { ...state, currentChatId: action.payload };
    
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: { ...state.messages, [action.payload.chatId]: action.payload.messages },
      };
    
    case 'ADD_MESSAGE': {
      const { chatId, message } = action.payload;
      const existing = state.messages[chatId] || [];
      return {
        ...state,
        messages: { ...state.messages, [chatId]: [...existing, message] },
      };
    }

    
    case 'REMOVE_MESSAGE': {
      const { chatId, messageId } = action.payload;
      const existing = state.messages[chatId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [chatId]: existing.filter(m => m.id !== messageId),
        },
      };
    }
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'SET_TYPING': {
      const { chatId, userId, isTyping } = action.payload;
      const current = state.typingUsers[chatId] || [];
      const updated = isTyping
        ? [...new Set([...current, userId])]
        : current.filter(id => id !== userId);
      return {
        ...state,
        typingUsers: { ...state.typingUsers, [chatId]: updated },
      };
    }
    
    case 'UPDATE_PRESENCE': {
      const { userId, status } = action.payload;
      // Update in chats
      const updatedChats = state.chats.map(chat => ({
        ...chat,
        participants: chat.participants.map(p =>
          p.id === userId ? { ...p, status } : p
        ),
      }));
      // Update in users
      const updatedUsers = state.users.map(u =>
        u.id === userId ? { ...u, status } : u
      );
      return { ...state, chats: updatedChats, users: updatedUsers };
    }
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    
    default:
      return state;
  }
}

// Context
const ChatContext = createContext<ChatContextType | null>(null);

// Provider Props
interface ChatProviderProps {
  children: React.ReactNode;
}

/**
 * Chat Provider Component
 * 
 * Wraps the application to provide chat state and actions.
 */
export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Actions
  const setChats = useCallback((chats: Chat[]) => {
    dispatch({ type: 'SET_CHATS', payload: chats });
  }, []);

  const selectChat = useCallback((chatId: string | null) => {
    dispatch({ type: 'SELECT_CHAT', payload: chatId });
  }, []);

  const setMessages = useCallback((chatId: string, messages: Message[]) => {
    dispatch({ type: 'SET_MESSAGES', payload: { chatId, messages } });
  }, []);

  const addMessage = useCallback((chatId: string, message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { chatId, message } });
  }, []);

  const removeMessage = useCallback((chatId: string, messageId: string) => {
    dispatch({ type: 'REMOVE_MESSAGE', payload: { chatId, messageId } });
  }, []);

  const setTyping = useCallback((chatId: string, userId: string, isTyping: boolean) => {
    dispatch({ type: 'SET_TYPING', payload: { chatId, userId, isTyping } });
  }, []);

  const updatePresence = useCallback((userId: string, status: 'online' | 'offline') => {
    dispatch({ type: 'UPDATE_PRESENCE', payload: { userId, status } });
  }, []);


  // Load chats
  const loadChats = useCallback(async () => {
    try {
      const chats = await chatAPI.listChats();
      setChats(chats);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }, [setChats]);

  // Load messages for a chat
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const messages = await chatAPI.getMessages(chatId);
      setMessages(chatId, messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [setMessages]);

  // Send message
  const sendMessage = useCallback(async (chatId: string, content: string) => {
    try {
      const message = await chatAPI.sendMessage(chatId, content);
      addMessage(chatId, message);
      loadChats(); // Refresh chat list to update last message
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [addMessage, loadChats]);

  // Send typing indicator with debounce
  const sendTypingIndicator = useCallback((chatId: string) => {
    wsManager.sendTyping(chatId, true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      wsManager.sendTyping(chatId, false);
    }, 1000);
  }, []);

  // Handle WebSocket messages
  useEffect(() => {
    const unsubscribe = wsManager.onMessage((message: WSMessage) => {
      switch (message.type) {
        case 'chat/receive':
          if (message.chat_id && message.data) {
            addMessage(message.chat_id, message.data as Message);
            loadChats();
          }
          break;
        
        case 'chat/typing':
        case 'chat/stop_typing':
          if (message.chat_id && message.user_id) {
            setTyping(message.chat_id, message.user_id, message.type === 'chat/typing');
          }
          break;
        
        case 'chat/message_deleted':
          if (message.chat_id && message.data) {
            const data = message.data as { message_id: string };
            removeMessage(message.chat_id, data.message_id);
            loadChats();
          }
          break;
        
        case 'presence':
          if (message.user_id && message.data) {
            const data = message.data as { status: 'online' | 'offline' };
            updatePresence(message.user_id, data.status);
          }
          break;
      }
    });

    return unsubscribe;
  }, [addMessage, loadChats, removeMessage, setTyping, updatePresence]);

  // Handle connection status changes
  useEffect(() => {
    const unsubscribe = wsManager.onStatusChange((status) => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
    });

    return unsubscribe;
  }, []);

  // Connect WebSocket on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      wsManager.connect(token);
      loadChats();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [loadChats]);

  const contextValue: ChatContextType = {
    ...state,
    setChats,
    selectChat,
    addMessage,
    removeMessage,
    setTyping,
    updatePresence,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

/**
 * Hook to access chat context
 */
export function useChatContext(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

/**
 * Hook for chat operations
 */
export function useChatOperations() {
  const context = useChatContext();
  
  const loadChats = useCallback(async () => {
    try {
      const chats = await chatAPI.listChats();
      context.setChats(chats);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }, [context]);

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const messages = await chatAPI.getMessages(chatId);
      return messages;
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }, []);

  const sendMessage = useCallback(async (chatId: string, content: string) => {
    const message = await chatAPI.sendMessage(chatId, content);
    context.addMessage(chatId, message);
    loadChats();
    return message;
  }, [context, loadChats]);

  const deleteMessage = useCallback(async (messageId: string, chatId: string) => {
    await chatAPI.deleteMessage(messageId);
    context.removeMessage(chatId, messageId);
    loadChats();
  }, [context, loadChats]);

  const createChat = useCallback(async (targetUserId: string) => {
    const response = await chatAPI.createChat(targetUserId);
    loadChats();
    return response.chat_id;
  }, [loadChats]);

  const createGroup = useCallback(async (title: string, memberIds: string[]) => {
    const response = await chatAPI.createGroup(title, memberIds);
    loadChats();
    return response.chat_id;
  }, [loadChats]);

  return {
    loadChats,
    loadMessages,
    sendMessage,
    deleteMessage,
    createChat,
    createGroup,
  };
}
