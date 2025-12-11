/**
 * Chat System Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the real-time chat system.
 * Requirements: 1.3, 3.3, 8.3
 */

// ============================================================================
// User Types
// ============================================================================

/**
 * Represents a user in the chat system
 */
export interface User {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  status: 'online' | 'offline';
  last_seen?: string;
}

/**
 * Represents a participant in a chat conversation
 */
export interface Participant {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  status: 'online' | 'offline';
  role?: 'admin' | 'member';
}

// ============================================================================
// Chat Types
// ============================================================================

/**
 * Represents a chat conversation (direct or group)
 * Backend may include user info directly on chat object for direct chats
 */
export interface Chat {
  id: string;
  type: 'direct' | 'group';
  title?: string;
  participants: Participant[];
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  // Direct chat - backend may include other user info directly
  username?: string;
  display_name?: string;
  avatar_url?: string;
  status?: 'online' | 'offline';
  last_seen?: string;
  participants_count?: number;
}

/**
 * Extended chat details including additional metadata
 */
export interface ChatDetails extends Chat {
  description?: string;
  avatar_url?: string;
}

// ============================================================================
// Message Types
// ============================================================================

/**
 * Represents a file attachment in a message
 */
export interface Attachment {
  type: 'image' | 'video' | 'audio' | 'file' | 'document' | 'pdf';
  url: string;
  filename?: string;
  size?: number;
  mime_type?: string;
  pageCount?: number; // For PDF documents
}

/**
 * Represents a message in a chat conversation
 */
export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  // Attachments can be JSON string from backend or parsed array
  attachments?: Attachment[] | string;
  media_url?: string;
  created_at: string;
  is_read: boolean;
}

/**
 * Options for fetching messages
 */
export interface MessageOptions {
  limit?: number;
  filter?: 'media';
  search?: string;
  before?: string;
  after?: string;
}

// ============================================================================
// WebSocket Types
// ============================================================================

/**
 * Connection status for WebSocket
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

/**
 * WebSocket message types
 */
export type WSMessageType = 
  | 'chat/receive'
  | 'typing'
  | 'chat/typing'
  | 'chat/stop_typing'
  | 'chat/seen'
  | 'chat/seen_all'
  | 'chat/message_deleted'
  | 'presence'
  | 'notification'
  | 'notification/ack'
  | 'seen';

/**
 * Base WebSocket message structure
 */
export interface WSMessage {
  type: WSMessageType;
  data?: unknown;
  chat_id?: string;
  user_id?: string;
  timestamp?: string;
}

/**
 * WebSocket message for receiving a new chat message
 */
export interface WSChatReceiveMessage extends WSMessage {
  type: 'chat/receive';
  data: Message;
  chat_id: string;
}

/**
 * WebSocket message for typing indicator
 */
export interface WSTypingMessage extends WSMessage {
  type: 'chat/typing' | 'chat/stop_typing';
  chat_id: string;
  user_id: string;
}

/**
 * WebSocket message for message seen status
 */
export interface WSSeenMessage extends WSMessage {
  type: 'chat/seen';
  chat_id: string;
  user_id: string;
  message_id: string;
}

/**
 * WebSocket message for message deletion
 */
export interface WSMessageDeletedMessage extends WSMessage {
  type: 'chat/message_deleted';
  chat_id: string;
  data: {
    message_id: string;
  };
}

/**
 * WebSocket message for presence updates
 */
export interface WSPresenceMessage extends WSMessage {
  type: 'presence';
  user_id: string;
  data: {
    status: 'online' | 'offline';
  };
}

/**
 * WebSocket message for notifications
 */
export interface WSNotificationMessage extends WSMessage {
  type: 'notification';
  data: {
    id: string;
    title: string;
    body: string;
    chat_id?: string;
    sender_id?: string;
    created_at: string;
  };
}

/**
 * WebSocket message for seen all messages
 */
export interface WSSeenAllMessage extends WSMessage {
  type: 'chat/seen_all';
  chat_id: string;
  last_message_id: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Response from creating a new chat
 */
export interface CreateChatResponse {
  chat_id: string;
}

/**
 * Response from creating a new group
 */
export interface CreateGroupResponse {
  chat_id: string;
}

/**
 * Generic API error response
 */
export interface APIError {
  error: string;
  message: string;
  status_code: number;
}

// ============================================================================
// Chat State Types
// ============================================================================

/**
 * Chat state for the context provider
 */
export interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  messages: Record<string, Message[]>;
  users: User[];
  typingUsers: Record<string, string[]>;
  connectionStatus: ConnectionStatus;
}

/**
 * Actions available in the chat context
 */
export interface ChatActions {
  setChats(chats: Chat[]): void;
  selectChat(chatId: string): void;
  addMessage(chatId: string, message: Message): void;
  removeMessage(chatId: string, messageId: string): void;
  setTyping(chatId: string, userId: string, isTyping: boolean): void;
  updatePresence(userId: string, status: 'online' | 'offline'): void;
}

/**
 * Combined chat context type
 */
export interface ChatContextType extends ChatState, ChatActions {}
