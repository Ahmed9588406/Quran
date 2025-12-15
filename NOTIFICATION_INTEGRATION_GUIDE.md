# Notification System Integration Guide

## How It Works

The notification system now has two layers:

1. **WebSocket Layer** (`notificationSocket.ts`)
   - Connects to `ws://soap-websocket.twingroups.com`
   - Receives notifications from the server
   - Dispatches custom events to the window

2. **UI Layer** (`NotificationProvider.tsx` + `NotificationCenter.tsx`)
   - Listens for WebSocket notifications via custom events
   - Displays toast notifications
   - Plays sound and browser notifications
   - Stores notifications in localStorage

## Setup

### 1. Already Configured in Root Layout

Your `app/layout.tsx` already has:

```tsx
import { NotificationProvider } from "./components/NotificationProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
```

### 2. NotificationCenter is Included

The `NotificationCenter` component is automatically included in the `NotificationProvider` and displays:
- Connection status indicator
- Toast notifications
- Auto-dismiss after 5 seconds

## How to Send Notifications

### From Admin Console (HTML File)

1. Open: `http://localhost:3000/admin-notification-socket.html`
2. Enter your JWT token
3. Click "Connect to Socket"
4. Fill in notification details
5. Click "Send Notification"

### From Backend

Send a WebSocket message with this format:

```json
{
  "type": "notification",
  "data": {
    "id": "notif-123",
    "title": "Notification Title",
    "body": "Notification message",
    "type": "system_alert",
    "target_user_id": "user-id-or-ALL",
    "created_at": "2025-12-15T10:30:00Z"
  }
}
```

## Notification Flow

```
Admin Console (HTML)
        ↓
WebSocket (ws://soap-websocket.twingroups.com)
        ↓
notificationSocket.ts (receives message)
        ↓
Dispatches custom event: 'websocket-notification'
        ↓
NotificationProvider (listens for event)
        ↓
Displays toast + plays sound + browser notification
```

## Testing

### Test 1: Send from Admin Console
1. Open admin console: `/admin-notification-socket.html`
2. Connect with your token
3. Send a test notification
4. Should see toast appear in your app

### Test 2: Send from Socket Tester
1. Open socket tester: `/notification-test.html`
2. Connect with your token
3. Send a test notification
4. Should see toast appear in your app

### Test 3: Check Logs
- Open browser DevTools Console
- Look for `[NotificationSocket]` logs
- Check for `websocket-notification` events

## Troubleshooting

### Notifications Not Appearing?

1. **Check WebSocket Connection**
   ```javascript
   // In browser console
   localStorage.getItem('access_token') // Should have a token
   ```

2. **Check if NotificationProvider is Wrapped**
   - Verify `app/layout.tsx` has `<NotificationProvider>`

3. **Check Browser Console**
   - Look for connection errors
   - Look for `[NotificationSocket]` logs

4. **Check Network Tab**
   - Look for WebSocket connection to `ws://soap-websocket.twingroups.com`
   - Should show "101 Switching Protocols"

### Sound Not Playing?

1. Check if sound is enabled in NotificationProvider
2. Check browser audio permissions
3. Check if browser tab is muted

### Browser Notifications Not Showing?

1. Check browser notification permissions
2. Grant permission when prompted
3. Check if browser is in focus

## Files Modified

- `app/components/NotificationProvider.tsx` - Added WebSocket event listener
- `components/NotificationCenter.tsx` - Updated to connect to WebSocket
- `lib/notifications/notificationSocket.ts` - Added window event dispatch

## Files Created

- `lib/notifications/notificationSocket.ts` - WebSocket service
- `lib/notifications/useNotifications.ts` - React hook
- `lib/notifications/NotificationProvider.tsx` - Context provider
- `components/NotificationCenter.tsx` - UI component
- `public/admin-notification-socket.html` - Admin console
- `public/notification-test.html` - Socket tester

## Next Steps

1. Test sending notifications from admin console
2. Monitor browser console for logs
3. Check if toasts appear in your app
4. Verify sound and browser notifications work
5. Deploy to production

## Support

For issues:
1. Check browser console for errors
2. Check WebSocket connection status
3. Verify token is valid
4. Check backend is sending notifications correctly
