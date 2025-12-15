# Complete Notification System with Audio

This is a comprehensive notification system that includes real-time notifications, audio alerts, browser notifications, and a complete admin console.

## Features

✅ **Real-time Notifications** - Instant updates across all tabs
✅ **Audio Alerts** - Web Audio API for notification sounds
✅ **Browser Notifications** - Native OS notifications
✅ **Admin Console** - Web interface to send notifications
✅ **Sound Toggle** - Users can enable/disable audio
✅ **Unread Badge** - Shows count of unread notifications
✅ **Persistent Storage** - Notifications stored in localStorage
✅ **Cross-tab Sync** - Notifications sync across browser tabs
✅ **TypeScript Support** - Fully typed components

## File Structure

```
app/user/
├── navbar.tsx                      # Main navbar with notification bell
├── notification.tsx                # Notification dropdown panel
├── useNotificationListener.ts       # Custom hook for listening to notifications
├── notificationService.ts           # Notification service with audio/browser notifications
├── NotificationExample.tsx          # Example component showing usage
└── NOTIFICATION_SYSTEM_COMPLETE.md # This file

app/api/
└── notifications/send/route.ts      # API endpoint for sending notifications

public/
└── admin-notification-console.html  # Admin console for sending notifications
```

## Quick Start

### 1. Send a Notification from Admin Console

```bash
# Open in browser
http://localhost:3000/admin-notification-console.html

# Fill in:
# - Title: "System Update"
# - Message: "New features available"
# - Enable Sound: checked
# - Click "Send Notification"
```

### 2. Listen for Notifications in Components

```typescript
import { useNotificationListener } from "@/app/user/useNotificationListener";

export function MyComponent() {
  useNotificationListener((notification) => {
    console.log("New notification:", notification);
    // Handle notification
  });

  return <div>...</div>;
}
```

### 3. Send Notifications Programmatically

```typescript
import { addNotification } from "@/app/user/useNotificationListener";

// Send a notification
addNotification({
  title: "Welcome",
  message: "Welcome to our app!",
  type: "system_alert",
});
```

### 4. Use the Notification Service

```typescript
import { notificationService } from "@/app/user/notificationService";

// Play sound
notificationService.playSound();

// Show browser notification
notificationService.showBrowserNotification("Title", {
  message: "Your message here",
});

// Show toast notification
notificationService.showToast("Success", "Operation completed!");

// Toggle sound
notificationService.toggleSound();

// Send complete notification
notificationService.notify({
  title: "Alert",
  message: "Something happened",
  soundEnabled: true,
  showBrowserNotification: true,
});
```

## API Reference

### useNotificationListener Hook

```typescript
useNotificationListener(callback?: (notification: AdminNotification) => void)
```

Listens for incoming notifications and calls the callback when a new notification arrives.

**Example:**
```typescript
useNotificationListener((notification) => {
  console.log("Received:", notification.title);
});
```

### addNotification Function

```typescript
addNotification(notification: Omit<AdminNotification, "id" | "timestamp" | "read">)
```

Adds a new notification to the system.

**Example:**
```typescript
addNotification({
  title: "New Message",
  message: "You have a new message",
  type: "personal",
});
```

### getNotifications Function

```typescript
getNotifications(): AdminNotification[]
```

Retrieves all notifications from storage.

**Example:**
```typescript
const notifications = getNotifications();
console.log(`You have ${notifications.length} notifications`);
```

### markAsRead Function

```typescript
markAsRead(notificationId: string)
```

Marks a notification as read.

**Example:**
```typescript
markAsRead("notif_1234567890_abc123");
```

### clearNotifications Function

```typescript
clearNotifications()
```

Clears all notifications from storage.

**Example:**
```typescript
clearNotifications();
```

### Sound Control Functions

```typescript
isSoundEnabled(): boolean
setSoundEnabled(enabled: boolean): void
requestNotificationPermission(): void
```

**Example:**
```typescript
if (isSoundEnabled()) {
  console.log("Sound is enabled");
}

setSoundEnabled(false); // Disable sound
requestNotificationPermission(); // Request browser notification permission
```

### NotificationService

```typescript
import { notificationService } from "@/app/user/notificationService";

// Play sound
notificationService.playSound(frequency1, frequency2, duration);

// Show browser notification
notificationService.showBrowserNotification(title, options);

// Request permission
notificationService.requestPermission();

// Send complete notification
notificationService.notify(options);

// Get/set sound state
notificationService.getSoundEnabled();
notificationService.setSoundEnabled(enabled);
notificationService.toggleSound();

// Show toast
notificationService.showToast(title, message, duration);

// Get/clear notifications
notificationService.getNotifications();
notificationService.clearNotifications();
```

## Notification Types

```typescript
type AdminNotification = {
  id: string;                    // Unique identifier
  title: string;                 // Notification title
  message: string;               // Notification message
  type: "system_alert" | "broadcast" | "personal";
  timestamp: number;             // Unix timestamp
  read: boolean;                 // Read status
  soundEnabled?: boolean;        // Whether sound should play
};
```

## Styling

### Unread Notifications
- Background: Light blue (#f0f8ff)
- Border: Blue (#1a73e8)
- Indicator: Blue dot

### Read Notifications
- Background: Light gray (#f9f9f9)
- Border: Gray (#e0e0e0)
- Opacity: 75%

### Toast Notifications
- Background: Light blue (#f0f8ff)
- Border: Blue (#1a73e8)
- Position: Bottom right
- Auto-dismiss: 5 seconds

## Audio System

The notification system uses the Web Audio API to generate notification sounds:

1. **First Beep**: 800 Hz frequency
2. **Second Beep**: 1000 Hz frequency (150ms delay)
3. **Duration**: 100ms per beep
4. **Volume**: 0.3 (30%)

### Custom Sounds

To use custom audio files instead of generated sounds:

```typescript
// In useNotificationListener.ts
const playNotificationSound = async () => {
  const audio = new Audio("/path/to/notification.mp3");
  audio.volume = 0.5;
  await audio.play();
};
```

## Browser Notifications

The system uses the Notification API for native OS notifications:

1. **Permission**: Requests permission on first load
2. **Icon**: Uses app logo
3. **Tag**: Prevents duplicate notifications
4. **Interaction**: Non-intrusive (doesn't require user action)

### Permission States

- `default`: Not requested yet
- `granted`: User allowed notifications
- `denied`: User denied notifications

## Integration Examples

### Example 1: Chat Notification

```typescript
import { addNotification } from "@/app/user/useNotificationListener";

function handleNewMessage(message) {
  addNotification({
    title: `New message from ${message.sender}`,
    message: message.content,
    type: "personal",
  });
}
```

### Example 2: System Alert

```typescript
import { notificationService } from "@/app/user/notificationService";

function handleSystemAlert(alert) {
  notificationService.notify({
    title: "System Alert",
    message: alert.message,
    type: "system_alert",
    soundEnabled: true,
    showBrowserNotification: true,
  });
}
```

### Example 3: Custom Notification Component

```typescript
"use client";
import { useNotificationListener } from "@/app/user/useNotificationListener";
import { useState } from "react";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);

  useNotificationListener((notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 20));
  });

  return (
    <div className="notification-center">
      {notifications.map((notif) => (
        <div key={notif.id} className="notification-item">
          <h4>{notif.title}</h4>
          <p>{notif.message}</p>
          <time>{new Date(notif.timestamp).toLocaleTimeString()}</time>
        </div>
      ))}
    </div>
  );
}
```

## Testing

### Test Locally

1. Open the app: `http://localhost:3000`
2. Open admin console: `http://localhost:3000/admin-notification-console.html`
3. Send a test notification
4. Verify:
   - Bell icon shows unread count
   - Sound plays (if enabled)
   - Browser notification appears
   - Notification appears in dropdown

### Test Cross-Tab

1. Open app in two browser tabs
2. Send notification from admin console
3. Both tabs should receive notification simultaneously

### Test Sound

1. Click sound toggle in navbar
2. Send notification
3. Verify sound plays/doesn't play based on toggle state

### Test Browser Notifications

1. Allow browser notifications when prompted
2. Send notification
3. Verify OS notification appears

## Troubleshooting

### Notifications not appearing

**Check:**
- Browser console for errors
- localStorage is enabled
- Notification listener hook is mounted
- Admin console is sending correctly

**Fix:**
```typescript
// Check if notifications are being stored
console.log(localStorage.getItem('admin_notifications'));

// Check if listener is working
useNotificationListener((notif) => {
  console.log('Notification received:', notif);
});
```

### Sound not playing

**Check:**
- Sound is enabled: `isSoundEnabled()`
- Browser allows audio
- Web Audio API is supported
- Volume is not muted

**Fix:**
```typescript
// Enable sound
setSoundEnabled(true);

// Test sound
notificationService.playSound();

// Check browser support
console.log('Web Audio API supported:', !!window.AudioContext);
```

### Browser notifications not showing

**Check:**
- Permission is granted: `Notification.permission`
- Browser supports notifications
- Notification permission was requested

**Fix:**
```typescript
// Request permission
requestNotificationPermission();

// Check permission status
console.log('Notification permission:', Notification.permission);

// Manually request
Notification.requestPermission().then(permission => {
  console.log('Permission:', permission);
});
```

### Cross-tab sync not working

**Check:**
- Both tabs on same domain
- localStorage is not disabled
- Storage events are firing

**Fix:**
```typescript
// Test storage events
window.addEventListener('storage', (e) => {
  console.log('Storage event:', e.key, e.newValue);
});

// Manually trigger
localStorage.setItem('test', 'value');
```

## Performance Considerations

1. **Max Notifications**: Limited to 50 in storage
2. **Audio Context**: Created once and reused
3. **Storage Events**: Debounced to prevent duplicate notifications
4. **Memory**: Notifications cleaned up automatically

## Security Considerations

1. **Token Validation**: Implement JWT validation in API
2. **Rate Limiting**: Add rate limiting to prevent spam
3. **Content Sanitization**: Escape HTML in notifications
4. **Access Control**: Only admins can send notifications

## Future Enhancements

- [ ] Database persistence
- [ ] WebSocket real-time updates
- [ ] Notification categories/filtering
- [ ] Notification scheduling
- [ ] Email notifications
- [ ] Push notifications
- [ ] Notification history/archive
- [ ] Notification preferences per user
- [ ] Custom notification sounds
- [ ] Notification animations

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Full |
| Firefox | ✅ Full |
| Safari  | ✅ Full |
| Edge    | ✅ Full |
| IE 11   | ❌ No   |

## License

This notification system is part of the Quran App project.

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
