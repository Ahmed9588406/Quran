/**
 * WebSocket Manager for Real-Time Chat
 * 
 * Manages WebSocket connection lifecycle, message handling, and auto-reconnection.
 * Requirements: 11.1, 11.2, 11.3
 */

import { ConnectionStatus, WSMessage } from './types';

const WS_URL = 'ws://192.168.1.18:8080';
const RECONNECT_DELAY = 3000; // 3 seconds

type MessageHandler = (message: WSMessage) => void;
type StatusHandler = (status: ConnectionStatus) => void;

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
      this.ws = new WebSocket(`${this.wsUrl}?token=${encodeURIComponent(token)}`);

      this.ws.onopen = () => {
        this.setStatus('connected');
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.messageHandlers.forEach(handler => handler(message));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = () => {
        this.setStatus('disconnected');
      };

      this.ws.onclose = () => {
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
   * Sends a typing indicator.
   * 
   * Requirements: 4.1
   * 
   * @param chatId - Chat ID
   * @param isTyping - Whether user is typing
   */
  sendTyping(chatId: string, isTyping: boolean): void {
    this.send({
      type: isTyping ? 'chat/typing' : 'chat/stop_typing',
      chat_id: chatId,
    });
  }

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
