# Notification System - Quick Setup Guide

## What's Included

Your notification system now has:

1. ✅ **Real-time notifications** in the navbar
2. ✅ **Audio alerts** with Web Audio API
3. ✅ **Browser notifications** (OS-level)
4. ✅ **Admin console** to send notifications
5. ✅ **Sound toggle** in navbar
6. ✅ **Unread badge** on bell icon
7. ✅ **Cross-tab sync** via localStorage
8. ✅ **Complete TypeScript support**

## Files Created/Updated

### New Files
- `app/user/useNotificationListener.ts` - Hook for listening to notifications
- `app/user/notificationService.ts` - Service for audio and browser notifications
- `app/user/NotificationExample.tsx` - Example component
- `app/api/notifications/send/route.ts` - API endpoint
- `public/admin-notification-console.html` - Admin console
- `NOTIFICATION_SYSTEM_COMPLETE.md` - Full documentation

### Updated Files
- `app/user/navbar.tsx` - Added notification listener and sound toggle
- `app/user/notification.tsx` - Added admin notifications display

## How to Use

### 1. Send a Notification (Admin Console)

```bash
# Open in browser
http://localhost:3000/admin-notification-console.html

# Fill in the form:
# Title: "System Update"
# Message: "New features available"
# Enable Sound: ✓ checked
# Click: "Send Notification"
```

### 2. Listen for Notifications (In Your Code)

```typescript
import { useNotificationListener } from "@/app/user/useNotificationListener";

export function MyComponent() {
  useNotificationListener((notification) => {
    console.log("New notification:", notification);
  });

  return <div>...</div>;
}
```

### 3. Send Notifications Programmatically

```typescript
import { addNotification } from "@/app/user/useNotificationListener";

addNotification({
  title: "Welcome",
  message: "Welcome to our app!",
  type: "system_alert",
});
```

### 4. Use Notification Service

```typescript
import { notificationService } from "@/app/user/notificationService";

// Play sound
notificationService.playSound();

// Show browser notification
notificationService.showBrowserNotification("Title", {
  message: "Your message",
});

// Show toast
notificationService.showToast("Success", "Done!");

// Toggle sound
notificationService.toggleSound();
```

## Features Explained

### Audio Alerts
- **Automatic**: Plays when notification arrives (if enabled)
- **Web Audio API**: Generates two beeps (800Hz + 1000Hz)
- **Customizable**: Users can toggle sound on/off
- **Cross-browser**: Works on all modern browsers

### Browser Notifications
- **Native OS notifications**: Shows system-level alerts
- **Permission-based**: Requests permission on first load
- **Non-intrusive**: Doesn't interrupt user
- **Clickable**: Users can interact with notification

### Navbar Integration
- **Bell icon**: Shows notification count
- **Sound toggle**: Enable/disable audio
- **Dropdown panel**: View all notifications
- **Real-time updates**: Instant notification display

### Admin Console
- **Web interface**: Easy to use form
- **Target options**: All users, specific user, or self
- **Sound control**: Enable/disable audio for notification
- **Live preview**: See how notification appears
- **Broadcast**: Sends via localStorage for instant sync

## Testing

### Test 1: Send Notification
1. Open app: `http://localhost:3000`
2. Open admin console: `http://localhost:3000/admin-notification-console.html`
3. Send a test notification
4. ✅ Bell icon should show "1"
5. ✅ Sound should play
6. ✅ Browser notification should appear
7. ✅ Notification should appear in dropdown

### Test 2: Cross-Tab Sync
1. Open app in two browser tabs
2. Send notification from admin console
3. ✅ Both tabs should receive notification
4. ✅ Both should show unread count

### Test 3: Sound Toggle
1. Click sound icon in navbar
2. Send another notification
3. ✅ Sound should not play
4. ✅ Notification should still appear

### Test 4: Mark as Read
1. Click notification in dropdown
2. ✅ Notification should turn gray
3. ✅ Unread count should decrease

## Customization

### Change Notification Sound

Edit `app/user/useNotificationListener.ts`:

```typescript
const playNotificationSound = async () => {
  // Use custom audio file
  const audio = new Audio("/path/to/notification.mp3");
  audio.volume = 0.5;
  await audio.play();
};
```

### Change Sound Frequency

Edit `app/user/notificationService.ts`:

```typescript
playSound(frequency1: number = 800, frequency2: number = 1000, duration: number = 0.1)
```

### Change Notification Colors

Edit `app/user/notification.tsx`:

```typescript
// Unread notification styling
className="p-3 bg-blue-50 border border-blue-200 rounded-lg"

// Read notification styling
className="p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-75"
```

### Change Toast Position

Edit `app/user/notificationService.ts`:

```typescript
// Change from bottom-right to top-right
toast.className = "fixed top-4 right-4 bg-blue-50 ..."
```

## API Endpoint

### Send Notification via API

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "target_user_id": "ALL",
    "title": "System Update",
    "message": "New features available",
    "type": "system_alert",
    "soundEnabled": true
  }'
```

### Response

```json
{
  "success": true,
  "message": "Notification sent successfully",
  "notification": {
    "id": "notif_1234567890_abc123",
    "title": "System Update",
    "message": "New features available",
    "type": "system_alert",
    "timestamp": 1234567890000,
    "read": false,
    "soundEnabled": true
  }
}
```

## Troubleshooting

### Notifications not appearing?

1. Check browser console for errors
2. Verify localStorage is enabled
3. Check that notification listener is mounted
4. Try refreshing the page

### Sound not playing?

1. Check if sound is enabled (click sound icon)
2. Check browser volume
3. Check if Web Audio API is supported
4. Try playing test sound from admin console

### Browser notifications not showing?

1. Check notification permission in browser settings
2. Allow notifications when prompted
3. Check if browser supports notifications
4. Try requesting permission manually

### Cross-tab sync not working?

1. Ensure both tabs are on same domain
2. Check if localStorage is enabled
3. Try opening tabs in same browser window
4. Check browser console for errors

## Next Steps

1. **Integrate with your backend**: Update API endpoint to save notifications to database
2. **Add WebSocket support**: For real-time updates across devices
3. **Customize sounds**: Use your own audio files
4. **Add notification categories**: Filter by type
5. **Implement notification history**: Archive old notifications
6. **Add user preferences**: Let users customize notification settings

## Support

For detailed documentation, see:
- `NOTIFICATION_SYSTEM_COMPLETE.md` - Full API reference
- `NOTIFICATION_INTEGRATION_GUIDE.md` - Integration guide
- `app/user/NotificationExample.tsx` - Example component

## Questions?

Check the example component at `app/user/NotificationExample.tsx` for working code examples.
