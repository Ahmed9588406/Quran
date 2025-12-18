# Fatwa Reject - Quick Start Guide

## How It Works

1. **Click Reject Button** on a pending fatwa card
2. **Confirm** in the dialog that appears
3. **Loading Toast** shows: "🚫 Rejecting fatwa..."
4. **Success Toast** shows: "✅ Fatwa rejected successfully!"
5. **Fatwa Removed** from the pending list

## User Interface

### Reject Button
```
⊗ Reject
```
- Located in the action buttons section
- Red hover color
- Appears on all pending fatwas

### Confirmation Dialog
```
Are you sure you want to reject this fatwa?
[Cancel] [OK]
```
- Prevents accidental rejections
- Click OK to proceed

### Toast Notifications

**Loading:**
```
🚫 Rejecting fatwa...
```

**Success:**
```
✅ Fatwa rejected successfully!
```

**Error:**
```
❌ Failed to reject fatwa
```

## API Flow

```
User clicks Reject
        ↓
Confirmation dialog
        ↓
User confirms
        ↓
Loading toast appears
        ↓
DELETE /api/khateb_Studio/fatwas?fatwaId={id}
        ↓
Proxy forwards to backend
        ↓
PUT /api/v1/fatwas/{id}/reject
        ↓
Backend processes
        ↓
Success response
        ↓
Remove from list
        ↓
Success toast
```

## Testing

### Test 1: Successful Rejection
1. Open Fatwas page
2. Click Reject on any pending fatwa
3. Click OK in confirmation
4. See loading toast
5. See success toast
6. Fatwa disappears from list

### Test 2: Error Handling
1. Simulate network error (DevTools → Network → Offline)
2. Click Reject
3. See error toast
4. Fatwa remains in list

### Test 3: Cancel Rejection
1. Click Reject
2. Click Cancel in confirmation
3. Nothing happens
4. Fatwa remains in list

## Console Logs to Check

```javascript
// Rejection started
[API] Rejecting fatwa: { fatwaId: "...", hasAuth: true }

// API call made
[API] Calling reject endpoint: https://...

// Success
[API] ✓ Fatwa rejected successfully: ...

// Error
[API] Fatwa rejection failed: 400 Bad Request
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Toast not showing | Refresh page |
| Fatwa not removed | Check console for errors |
| Confirmation not appearing | Enable JavaScript |
| Network error | Check internet connection |

## Files Involved

1. `app/api/khateb_Studio/fatwas/route.ts` - DELETE endpoint
2. `app/khateb_Studio/fatwas/page.tsx` - handleReject function
3. `app/khateb_Studio/fatwas/fatwaCard.tsx` - Reject button

## Key Features

✅ Confirmation dialog prevents accidents
✅ Toast notifications for feedback
✅ Error handling with user messages
✅ Optimistic UI updates
✅ Proper authentication
✅ Console logging for debugging

## Next Steps

- Test the reject functionality
- Monitor console logs
- Check toast notifications
- Verify fatwa removal
- Test error scenarios
