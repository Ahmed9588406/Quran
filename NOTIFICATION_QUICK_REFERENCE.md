# Notification System - Quick Reference Card

## 🚀 Quick Start (30 seconds)

```bash
# 1. Open admin console
http://localhost:3000/admin-notification-console.html

# 2. Fill in form
Title: "Hello"
Message: "This is a test"
Enable Sound: ✓

# 3. Click "Send Notification"
# Done! Check the navbar bell icon
```

## 📝 Code Examples

### Listen for Notifications
```typescript
import { useNotificationListener } from "@/app/user/useNotificationListener";

useNotificationListener((notification) => {
  console.log(notification.title);
});
```

### Send Notification
```typescript
import { addNotification } from "@/app/user/useNotificationListener";

addNotification({
  title: "Welcome",
  message: "Hello user!",
  type: "system_alert",
});
```

### Play Sound
```typescript
import { notificationService } from "@/app/user/notificationService";

notificationService.playSound();
```

### Show Browser Notification
```typescript
notificationService.showBrowserNotification("Title", {
  message: "Your message",
});
```

### Show Toast
```typescript
notificationService.showToast("Success", "Operation completed!");
```

### Toggle Sound
```typescript
notificationService.toggleSound();
```

## 🔗 URLs

| URL | Purpose |
|-----|---------|
| `/admin-notification-console.html` | Send notifications |
| `/notification-test.html` | Test all features |
| `/api/notifications/send` | API endpoint |

## 📚 Documentation

| File | Purpose |
|------|---------|
| `NOTIFICATION_SYSTEM_COMPLETE.md` | Full documentation |
| `NOTIFICATION_QUICK_SETUP.md` | Setup guide |
| `NOTIFICATION_INTEGRATION_GUIDE.md` | Integration guide |
| `NOTIFICATION_QUICK_REFERENCE.md` | This file |

## 🎯 Key Features

✅ Real-time notifications in navbar
✅ Audio alerts (Web Audio API)
✅ Browser notifications (OS-level)
✅ Sound toggle in navbar
✅ Unread count badge
✅ Cross-tab sync
✅ Admin console
✅ TypeScript support

## 📦 Files Created

```
app/user/
├── useNotificationListener.ts    # Hook
├── notificationService.ts        # Service
├── NotificationExample.tsx       # Example
└── navbar.tsx                    # Updated

app/api/notifications/send/
└── route.ts                      # API

public/
├── admin-notification-console.html
└── notification-test.html
```

## 🧪 Testing

### Test 1: Send Notification
1. Open admin console
2. Send notification
3. Check navbar bell icon

### Test 2: Sound
1. Click sound icon in navbar
2. Send notification
3. Verify sound plays/doesn't play

### Test 3: Cross-Tab
1. Open app in 2 tabs
2. Send notification
3. Both tabs should receive it

### Test 4: Browser Notification
1. Allow notifications
2. Send notification
3. OS notification should appear

## 🔧 API Reference

### Hook
```typescript
useNotificationListener(callback)
```

### Functions
```typescript
addNotification(notification)
getNotifications()
markAsRead(id)
clearNotifications()
isSoundEnabled()
setSoundEnabled(enabled)
requestNotificationPermission()
```

### Service
```typescript
notificationService.playSound()
notificationService.showBrowserNotification(title, options)
notificationService.notify(options)
notificationService.toggleSound()
notificationService.showToast(title, message, duration)
```

## 🎨 Styling

**Unread**: Blue background, blue border
**Read**: Gray background, gray border (75% opacity)
**Toast**: Blue background, bottom-right position

## 🌐 Browser Support

✅ Chrome
✅ Firefox
✅ Safari
✅ Edge
❌ IE 11

## ⚙️ Configuration

### Change Sound Frequency
Edit `notificationService.ts`:
```typescript
playSound(frequency1: number = 800, frequency2: number = 1000)
```

### Change Toast Duration
```typescript
notificationService.showToast(title, message, 3000) // 3 seconds
```

### Use Custom Audio
Replace `playNotificationSound()` in `useNotificationListener.ts`:
```typescript
const audio = new Audio("/path/to/sound.mp3");
await audio.play();
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No notifications | Check localStorage enabled |
| No sound | Check sound toggle, browser volume |
| No browser notifications | Allow permission in browser |
| Cross-tab not syncing | Ensure same domain, refresh |

## 📞 Support

1. Check documentation files
2. Review NotificationExample.tsx
3. Test using notification-test.html
4. Check browser console for errors

## 🎓 Learning Path

1. **Beginner**: Use admin console to send notifications
2. **Intermediate**: Use `addNotification()` in code
3. **Advanced**: Use `notificationService` for custom behavior
4. **Expert**: Integrate with backend database/WebSocket

## 💡 Tips

- Sound is enabled by default
- Notifications stored in localStorage (max 50)
- Browser notifications require permission
- Cross-tab sync uses storage events
- Unread count updates automatically

## 🚀 Next Steps

1. Send your first notification via admin console
2. Test sound and browser notifications
3. Integrate into your components
4. Customize styling and sounds
5. Add database persistence (optional)

---

**Ready to go!** Open the admin console and send your first notification.
