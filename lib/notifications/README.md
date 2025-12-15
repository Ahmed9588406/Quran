# Notification System

Real-time notification system using WebSocket connection to `ws://soap-websocket.twingroups.com`.

## Files

- **notificationSocket.ts** - Core WebSocket service for handling notifications
- **useNotifications.ts** - React hook for managing notifications
- **NotificationProvider.tsx** - Context provider for app-wide notification access
- **NotificationCenter.tsx** - UI component for displaying notifications

## Setup

### 1. Wrap your app with NotificationProvider

In your root layout or app component:

```tsx
import { NotificationProvider } from '@/lib/notifications/NotificationProvider';
import { NotificationCenter } from '@/components/NotificationCenter';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NotificationProvider>
          <NotificationCenter />
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
```

### 2. Use notifications in components

```tsx
import { useNotificationContext } from '@/lib/notifications/NotificationProvider';

export function MyComponent() {
  const { notifications, isConnected, addNotification } = useNotificationContext();

  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>Notifications: {notifications.length}</p>
    </div>
  );
}
```

## Features

- ✅ Auto-reconnect with exponential backoff
- ✅ Real-time notifications via WebSocket
- ✅ Toast notifications UI
- ✅ Connection status indicator
- ✅ Notification types: system_alert, message, follow, like, comment, custom
- ✅ Auto-dismiss after 5 seconds
- ✅ Manual dismiss option
- ✅ Max 5 toasts displayed at once

## Notification Types

```typescript
type NotificationType = 
  | 'system_alert'  // System announcements
  | 'message'       // New messages
  | 'follow'        // New followers
  | 'like'          // Post likes
  | 'comment'       // Post comments
  | 'custom'        // Custom notifications
```

## API

### notificationSocket

```typescript
// Connect to WebSocket
await notificationSocket.connect(token);

// Send a message
notificationSocket.send({ type: 'ping' });

// Subscribe to notifications
const unsubscribe = notificationSocket.onNotification((notification) => {
  console.log('New notification:', notification);
});

// Subscribe to connection changes
const unsubscribeConnection = notificationSocket.onConnectionChange((connected) => {
  console.log('Connected:', connected);
});

// Check connection status
notificationSocket.isConnected();
notificationSocket.getStatus(); // 'connected' | 'connecting' | 'disconnected'

// Disconnect
notificationSocket.disconnect();
```

### useNotifications Hook

```typescript
const {
  notifications,      // Array of notifications
  isConnected,        // Connection status
  addNotification,    // Add notification manually
  clearNotifications, // Clear all notifications
  markAsRead,         // Mark notification as read
  removeNotification, // Remove specific notification
} = useNotifications();
```

## WebSocket Message Format

### Incoming Notification

```json
{
  "type": "notification",
  "data": {
    "id": "notif-123",
    "title": "New Message",
    "body": "You have a new message",
    "type": "message",
    "created_at": "2025-12-15T10:30:00Z",
    "data": {
      "sender_id": "user-456",
      "chat_id": "chat-789"
    }
  }
}
```

### Ping/Pong

```json
{
  "type": "ping"
}
```

Response:
```json
{
  "type": "pong"
}
```

## Error Handling

The system automatically handles:
- Connection failures
- Reconnection with exponential backoff (max 5 attempts)
- Message parsing errors
- Handler errors

All errors are logged to console for debugging.

## Example Usage

```tsx
'use client';

import { useNotificationContext } from '@/lib/notifications/NotificationProvider';

export function NotificationBell() {
  const { notifications, isConnected } = useNotificationContext();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button className="p-2 hover:bg-gray-100 rounded-full">
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
    </div>
  );
}
```

## Troubleshooting

### Not receiving notifications?
1. Check if token is valid: `localStorage.getItem('access_token')`
2. Check browser console for connection errors
3. Verify WebSocket URL is correct: `ws://soap-websocket.twingroups.com`
4. Check if backend is sending notifications

### Connection keeps dropping?
1. Check network stability
2. Verify token hasn't expired
3. Check browser console for errors
4. Increase `maxReconnectAttempts` if needed

### Notifications not displaying?
1. Ensure `NotificationProvider` wraps your app
2. Ensure `NotificationCenter` component is rendered
3. Check if notifications are being received in console
4. Verify notification type is supported
