# Admin Notification System Integration Guide

## Overview
The notification system allows admins to send real-time notifications that appear in the navbar bell icon. Notifications are displayed with an unread count badge and can be viewed in a dropdown panel.

## Components

### 1. **useNotificationListener Hook** (`app/user/useNotificationListener.ts`)
- Listens for notifications from the admin console
- Manages notification storage in localStorage
- Provides utilities to add, retrieve, and mark notifications as read

**Key Functions:**
- `useNotificationListener(callback)` - Hook to listen for new notifications
- `addNotification(notification)` - Add a new notification
- `getNotifications()` - Retrieve all notifications
- `markAsRead(notificationId)` - Mark notification as read
- `clearNotifications()` - Clear all notifications

### 2. **Updated Navbar** (`app/user/navbar.tsx`)
- Displays notification bell icon with unread count badge
- Integrates the notification listener hook
- Shows badge only when there are unread notifications
- Badge displays "9+" for counts over 9

### 3. **Updated Notification Panel** (`app/user/notification.tsx`)
- Displays admin notifications in a dedicated section
- Separates unread (blue highlight) and read (gray) notifications
- Shows notification title, message, and timestamp
- Marks notifications as read when clicked
- Falls back to regular notifications if no admin notifications exist

### 4. **Admin Console** (`public/admin-notification-console.html`)
- Web interface for sending notifications
- Options to broadcast to all users or specific users
- Live preview of how notification appears in navbar
- Stores notifications in localStorage for cross-tab sync

### 5. **API Endpoint** (`app/api/notifications/send/route.ts`)
- Handles notification creation requests
- Validates authorization
- Returns success/error responses

## How It Works

### Sending a Notification

1. **Via Admin Console:**
   - Open `/admin-notification-console.html`
   - Enter JWT token (optional, for auth validation)
   - Select target audience (All Users, Specific User, or Self/Test)
   - Enter title and message
   - Click "Send Notification"

2. **Via API:**
   ```bash
   curl -X POST http://localhost:3000/api/notifications/send \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "target_user_id": "ALL",
       "title": "System Update",
       "message": "New features available",
       "type": "system_alert"
     }'
   ```

### Receiving Notifications

1. **Real-time Updates:**
   - The `useNotificationListener` hook listens for storage events
   - When a notification is added, it triggers the callback
   - Navbar updates with new unread count
   - Notification appears in the dropdown panel

2. **Cross-Tab Sync:**
   - Notifications are stored in localStorage
   - Storage events sync notifications across browser tabs
   - All tabs receive updates in real-time

## Notification Structure

```typescript
type AdminNotification = {
  id: string;                    // Unique identifier
  title: string;                 // Notification title
  message: string;               // Notification message
  type: "system_alert" | "broadcast" | "personal";
  timestamp: number;             // Unix timestamp
  read: boolean;                 // Read status
};
```

## Styling

### Unread Notifications (Blue)
- Background: `#f0f8ff` (light blue)
- Border: `#1a73e8` (blue)
- Indicator dot: Blue

### Read Notifications (Gray)
- Background: `#f9f9f9` (light gray)
- Border: `#e0e0e0` (gray)
- Opacity: 75%

## Integration Steps

1. **Navbar Integration:**
   - The navbar automatically listens for notifications
   - No additional setup required
   - Unread count updates automatically

2. **Custom Notifications:**
   - Import `addNotification` from `useNotificationListener`
   - Call `addNotification()` to add custom notifications
   - Example:
     ```typescript
     import { addNotification } from '@/app/user/useNotificationListener';
     
     addNotification({
       title: 'New Message',
       message: 'You have a new message from Admin',
       type: 'personal'
     });
     ```

3. **Listening for Notifications:**
   - Use the hook in any component:
     ```typescript
     import { useNotificationListener } from '@/app/user/useNotificationListener';
     
     export function MyComponent() {
       useNotificationListener((notification) => {
         console.log('New notification:', notification);
       });
       
       return <div>...</div>;
     }
     ```

## Testing

### Test Locally
1. Open the app in your browser
2. Open `/admin-notification-console.html` in another tab
3. Send a test notification to yourself
4. Watch the navbar bell icon update in real-time

### Test Cross-Tab
1. Open the app in two browser tabs
2. Send a notification from the admin console
3. Both tabs should receive the notification simultaneously

## Database Integration (Optional)

To persist notifications:

1. Create a `notifications` table:
   ```sql
   CREATE TABLE notifications (
     id UUID PRIMARY KEY,
     user_id UUID NOT NULL,
     title VARCHAR(255) NOT NULL,
     message TEXT NOT NULL,
     type VARCHAR(50),
     read BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. Update the API endpoint to save to database:
   ```typescript
   // In app/api/notifications/send/route.ts
   await db.notifications.create({
     user_id: targetUserId,
     title,
     message,
     type
   });
   ```

3. Load notifications on app startup:
   ```typescript
   // In navbar.tsx useEffect
   const notifications = await fetch('/api/notifications').then(r => r.json());
   setAdminNotifications(notifications);
   ```

## WebSocket Integration (Optional)

For real-time updates across different devices:

1. Set up WebSocket server
2. Emit notification events when sent
3. Listen in the hook:
   ```typescript
   useEffect(() => {
     const ws = new WebSocket('ws://your-server');
     ws.onmessage = (event) => {
       if (event.data.type === 'notification') {
         callbackRef.current?.(event.data.payload);
       }
     };
   }, []);
   ```

## Troubleshooting

### Notifications not appearing
- Check browser console for errors
- Verify localStorage is enabled
- Check that the notification listener hook is mounted

### Unread count not updating
- Ensure `useNotificationListener` is called in navbar
- Check that `setUnreadCount` is being called
- Verify localStorage events are firing

### Cross-tab sync not working
- Ensure both tabs are on the same domain
- Check that localStorage is not disabled
- Verify storage events are being triggered

## Security Considerations

1. **Token Validation:**
   - Implement proper JWT validation in the API endpoint
   - Only allow authorized users to send notifications

2. **Rate Limiting:**
   - Add rate limiting to prevent notification spam
   - Implement per-user or per-IP limits

3. **Content Validation:**
   - Sanitize notification content
   - Prevent XSS attacks by escaping HTML

4. **Access Control:**
   - Only admins should be able to send notifications
   - Implement role-based access control

## Future Enhancements

- [ ] Database persistence
- [ ] WebSocket real-time updates
- [ ] Notification categories/filtering
- [ ] Notification scheduling
- [ ] Email notifications
- [ ] Push notifications
- [ ] Notification history/archive
- [ ] Notification preferences per user
