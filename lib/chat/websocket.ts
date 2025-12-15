/**
 * WebSocket Manager for Real-Time Chat
 * 
 * Manages WebSocket connection lifecycle, message handling, and auto-reconnection.
 * Supports: Chat messages, Typing indicators, Seen status, Notifications
 * Requirements: 11.1, 11.2, 11.3
 */

import { ConnectionStatus, WSMessage } from './types';

const WS_URL = 'ws://soap-websocket.twingroups.com';
const RECONNECT_DELAY = 3000; // 3 seconds

type MessageHandler = (message: WSMessage) => void;
type StatusHandler = (status: ConnectionStatus) => void;
type NotificationHandler = (notification: WSNotification) => void;

/**
 * WebSocket Notification structure
 */
export interface WSNotification {
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
 * WebSocket Seen Message structure
 */
export interface WSSeenPayload {
  chat_id: string;
  message_id: string;
  user_id?: string;
}

/**
 * WebSocket Typing Message structure
 */
export interface WSTypingPayload {
  chat_id: string;
  user_id?: string;
  is_typing: boolean;
}

/**
 * WebSocket Manager Class
 * 
 * Handles WebSocket connection with auto-reconnect functionality.
 * **Feature: real-time-chat-system, Property 16: WebSocket reconnection**
 * **Feature: real-time-chat-system, Property 17: Connection status display**
 */
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private notificationHandlers: Set<NotificationHandler> = new Set();
  private status: ConnectionStatus = 'disconnected';
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private shouldReconnect: boolean = true;
  private wsUrl: string;

  constructor(wsUrl: string = WS_URL) {
    this.wsUrl = wsUrl;
  }

  /**
   * Gets the current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Updates connection status and notifies handlers
   */
  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusHandlers.forEach(handler => handler(status));
  }

  /**
   * Connects to the WebSocket server.
   * URL format: ws://192.168.1.18:8080?token={jwt_token}
   * 
   * Requirements: 11.1
   * 
   * @param token - JWT authentication token
   */
  connect(token: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.token = token;
    this.shouldReconnect = true;
    this.setStatus('connecting');

    try {
      // Connect with token as query parameter
      this.ws = new WebSocket(`${this.wsUrl}?token=${encodeURIComponent(token)}`);

      this.ws.onopen = () => {
        this.setStatus('connected');
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
        console.log('WebSocket connected successfully');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle notifications separately
          if (message.type === 'notification') {
            this.notificationHandlers.forEach(handler => handler(message as WSNotification));
          }
          
          // Always pass to message handlers
          this.messageHandlers.forEach(handler => handler(message as WSMessage));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.setStatus('disconnected');
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.setStatus('disconnected');
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.setStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  /**
   * Schedules a reconnection attempt after the specified delay.
   * 
   * Requirements: 11.2
   * **Validates: Property 16 - WebSocket reconnection within 3 seconds**
   */
  private scheduleReconnect(): void {
    if (!this.shouldReconnect || !this.token) {
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.setStatus('reconnecting');
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.token && this.shouldReconnect) {
        this.connect(this.token);
      }
    }, RECONNECT_DELAY);
  }

  /**
   * Disconnects from the WebSocket server.
   */
  disconnect(): void {
    this.shouldReconnect = false;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setStatus('disconnected');
  }

  /**
   * Sends a message through the WebSocket connection.
   * 
   * @param message - Message to send
   */
  send(message: WSMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  /**
   * Sends a raw payload through the WebSocket connection.
   * 
   * @param payload - Raw payload object to send
   */
  sendRaw(payload: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  // ============================================================================
  // TYPING INDICATOR
  // Endpoint: ws://192.168.1.18:8080?token={token}
  // ============================================================================

  /**
   * Sends a typing indicator via WebSocket.
   * Format: { type: "typing", chat_id: "xxx", is_typing: true/false }
   * 
   * Requirements: 4.1
   * 
   * @param chatId - Chat ID
   * @param isTyping - Whether user is typing
   */
  sendTyping(chatId: string, isTyping: boolean): void {
    // Send via WebSocket in the format backend expects
    this.sendRaw({
      type: 'typing',
      chat_id: chatId,
      is_typing: isTyping,
    });
  }

  /**
   * Sends typing start indicator with additional data.
   * 
   * @param chatId - Chat ID where user is typing
   */
  sendTypingStart(chatId: string): void {
    this.sendRaw({
      type: 'typing',
      chat_id: chatId,
      is_typing: true,
    });
  }

  /**
   * Sends typing stop indicator.
   * 
   * @param chatId - Chat ID where user stopped typing
   */
  sendTypingStop(chatId: string): void {
    this.sendRaw({
      type: 'typing',
      chat_id: chatId,
      is_typing: false,
    });
  }

  // ============================================================================
  // MESSAGE SEEN STATUS
  // Endpoint: ws://192.168.1.18:8080?token={token}
  // ============================================================================

  /**
   * Sends a message seen status.
   * Marks a specific message as read/seen by the current user.
   * Format: { type: "seen", chat_id: "xxx", message_id: "xxx" }
   * 
   * @param chatId - Chat ID containing the message
   * @param messageId - ID of the message that was seen
   */
  sendSeen(chatId: string, messageId: string): void {
    this.sendRaw({
      type: 'seen',
      chat_id: chatId,
      message_id: messageId,
    });
  }

  /**
   * Marks all messages in a chat as seen up to a specific message.
   * 
   * @param chatId - Chat ID
   * @param lastMessageId - ID of the last message seen
   */
  sendAllSeen(chatId: string, lastMessageId: string): void {
    this.sendRaw({
      type: 'seen',
      chat_id: chatId,
      last_message_id: lastMessageId,
    });
  }

  // ============================================================================
  // NOTIFICATIONS
  // Endpoint: ws://192.168.1.18:8080?token={token}
  // ============================================================================

  /**
   * Registers a notification handler.
   * Notifications are pushed from server for new messages, mentions, etc.
   * 
   * @param handler - Function to call when a notification is received
   * @returns Cleanup function to remove the handler
   */
  onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.add(handler);
    return () => this.notificationHandlers.delete(handler);
  }

  /**
   * Acknowledges a notification (marks it as read).
   * 
   * @param notificationId - ID of the notification to acknowledge
   */
  acknowledgeNotification(notificationId: string): void {
    this.sendRaw({
      type: 'notification/ack',
      notification_id: notificationId,
      timestamp: new Date().toISOString(),
    });
  }

  // ============================================================================
  // MESSAGE HANDLERS
  // ============================================================================

  /**
   * Registers a message handler.
   * 
   * @param handler - Function to call when a message is received
   * @returns Cleanup function to remove the handler
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Registers a status change handler.
   * 
   * Requirements: 11.3
   * 
   * @param handler - Function to call when status changes
   * @returns Cleanup function to remove the handler
   */
  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    // Immediately call with current status
    handler(this.status);
    return () => this.statusHandlers.delete(handler);
  }

  // ============================================================================
  // PRESENCE
  // ============================================================================

  /**
   * Sends user presence status (online/offline).
   * 
   * @param status - User's presence status
   */
  sendPresence(status: 'online' | 'offline' | 'away'): void {
    this.sendRaw({
      type: 'presence',
      status: status,
      timestamp: new Date().toISOString(),
    });
  }
}

// Default WebSocket manager instance
export const wsManager = new WebSocketManager();

/**
 * Creates a new WebSocket manager with a custom URL.
 * Useful for testing.
 */
export function createWebSocketManager(wsUrl: string): WebSocketManager {
  return new WebSocketManager(wsUrl);
}
