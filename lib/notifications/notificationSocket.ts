/**
 * Notification Socket Service
 * Handles WebSocket connection for real-time notifications
 * Connects to: ws://soap-websocket.twingroups.com
 */

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system_alert' | 'message' | 'follow' | 'like' | 'comment' | 'custom';
  data?: Record<string, any>;
  created_at: string;
  read: boolean;
}

type NotificationHandler = (notification: Notification) => void;
type ConnectionHandler = (connected: boolean) => void;

class NotificationSocket {
  private ws: WebSocket | null = null;
  private url: string = 'ws://soap-websocket.twingroups.com';
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private notificationHandlers: Set<NotificationHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private isIntentionallyClosed = false;

  /**
   * Initialize the notification socket
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.token = token;
      this.isIntentionallyClosed = false;

      try {
        // Connect with token in query params
        const wsUrl = `${this.url}?token=${encodeURIComponent(token)}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[NotificationSocket] Connected');
          this.reconnectAttempts = 0;
          this.notifyConnectionHandlers(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('[NotificationSocket] Error:', error);
          this.notifyConnectionHandlers(false);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[NotificationSocket] Disconnected');
          this.notifyConnectionHandlers(false);
          
          if (!this.isIntentionallyClosed) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        console.error('[NotificationSocket] Connection failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: string): void {
    console.log('[NotificationSocket] Raw message received:', data);
    
    try {
      const message = JSON.parse(data);
      console.log('[NotificationSocket] Parsed message:', message);

      // Handle different message types
      if (message.type === 'notification') {
        console.log('[NotificationSocket] Processing notification:', message.data);
        const notification: Notification = {
          id: message.data?.id || `notif-${Date.now()}`,
          title: message.data?.title || 'Notification',
          message: message.data?.body || message.data?.message || '',
          type: message.data?.type || 'custom',
          data: message.data?.data,
          created_at: message.data?.created_at || new Date().toISOString(),
          read: false,
        };
        console.log('[NotificationSocket] Dispatching notification:', notification);
        this.notifyNotificationHandlers(notification);
      } else if (message.type === 'ping') {
        console.log('[NotificationSocket] Received ping, sending pong');
        // Respond to ping with pong
        this.send({ type: 'pong' });
      } else {
        console.log('[NotificationSocket] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[NotificationSocket] Failed to parse message:', error, 'Data:', data);
      console.error('[NotificationSocket] Failed to parse message:', error);
    }
  }

  /**
   * Send a message through the socket
   */
  send(data: Record<string, any>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('[NotificationSocket] Failed to send message:', error);
      }
    } else {
      console.warn('[NotificationSocket] WebSocket not connected');
    }
  }

  /**
   * Subscribe to notifications
   */
  onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.notificationHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  /**
   * Notify all notification handlers
   */
  private notifyNotificationHandlers(notification: Notification): void {
    this.notificationHandlers.forEach((handler) => {
      try {
        handler(notification);
      } catch (error) {
        console.error('[NotificationSocket] Handler error:', error);
      }
    });

    // Also dispatch a custom event for global listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('websocket-notification', {
          detail: notification,
        })
      );
    }
  }

  /**
   * Notify all connection handlers
   */
  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected);
      } catch (error) {
        console.error('[NotificationSocket] Connection handler error:', error);
      }
    });
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[NotificationSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[NotificationSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.token && !this.isIntentionallyClosed) {
        this.connect(this.token).catch((error) => {
          console.error('[NotificationSocket] Reconnection failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Disconnect the socket
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.notifyConnectionHandlers(false);
    console.log('[NotificationSocket] Disconnected');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  getStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.ws) return 'disconnected';
    if (this.ws.readyState === WebSocket.OPEN) return 'connected';
    if (this.ws.readyState === WebSocket.CONNECTING) return 'connecting';
    return 'disconnected';
  }
}

// Export singleton instance
export const notificationSocket = new NotificationSocket();
