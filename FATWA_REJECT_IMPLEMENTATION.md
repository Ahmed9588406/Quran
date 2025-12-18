# Fatwa Reject Implementation

## Overview
Complete implementation of the fatwa rejection feature with toast notifications and proper error handling.

## API Endpoint

**Backend Endpoint:**
```
PUT https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/fatwas/{fatwaId}/reject
```

**Proxy Endpoint (Frontend):**
```
DELETE /api/khateb_Studio/fatwas?fatwaId={fatwaId}
```

## Implementation Details

### 1. API Route (`app/api/khateb_Studio/fatwas/route.ts`)

The DELETE endpoint handles fatwa rejection:

```typescript
export async function DELETE(request: NextRequest) {
  // 1. Extract fatwaId from query parameters
  const fatwaId = searchParams.get("fatwaId");
  
  // 2. Get authentication token from headers
  const authHeader = request.headers.get("authorization");
  
  // 3. Call backend API: PUT /api/v1/fatwas/{fatwaId}/reject
  const apiUrl = `${API_BASE_URL}/api/v1/fatwas/${fatwaId}/reject`;
  
  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json",
    },
  });
  
  // 4. Return response to client
  return NextResponse.json(data);
}
```

### 2. Page Component (`app/khateb_Studio/fatwas/page.tsx`)

The `handleReject` function manages the rejection flow:

```typescript
const handleReject = async (fatwaId: string) => {
  // 1. Confirm with user
  if (!confirm("Are you sure you want to reject this fatwa?")) return;

  // 2. Show loading toast
  const toastId = toast.loading("🚫 Rejecting fatwa...");
  
  try {
    // 3. Get authentication token
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    
    // 4. Call proxy endpoint
    const response = await fetch(
      `/api/khateb_Studio/fatwas?fatwaId=${fatwaId}`,
      {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to reject fatwa");
    }

    // 5. Remove from pending list
    setPendingFatwas((prev) => prev.filter((f) => f.id !== fatwaId));
    
    // 6. Show success toast
    toast.update(toastId, {
      render: "✅ Fatwa rejected successfully!",
      type: "success",
      isLoading: false,
      autoClose: 3000,
      closeButton: true,
    });
  } catch (err) {
    // 7. Show error toast
    const errorMsg = err instanceof Error ? err.message : "Failed to reject fatwa";
    toast.update(toastId, {
      render: `❌ ${errorMsg}`,
      type: "error",
      isLoading: false,
      autoClose: 4000,
      closeButton: true,
    });
  }
};
```

### 3. FatwaCard Component (`app/khateb_Studio/fatwas/fatwaCard.tsx`)

The reject button calls the `onReject` callback:

```typescript
<button
  onClick={() => onReject && onReject(fatwa.id)}
  className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
  <span className="text-sm font-medium">Reject</span>
</button>
```

## User Flow

### Step 1: View Pending Fatwa
- User navigates to Fatwas page
- Pending tab is active by default
- Fatwa cards are displayed with Reject button

### Step 2: Click Reject Button
- User clicks the Reject button on a fatwa card
- Confirmation dialog appears: "Are you sure you want to reject this fatwa?"

### Step 3: Confirm Rejection
- User clicks "OK" in confirmation dialog
- Loading toast appears: "🚫 Rejecting fatwa..."

### Step 4: Backend Processing
- Request sent to: `DELETE /api/khateb_Studio/fatwas?fatwaId={id}`
- Proxy forwards to: `PUT /api/v1/fatwas/{id}/reject`
- Backend processes rejection

### Step 5: Success Response
- Fatwa is removed from pending list
- Success toast appears: "✅ Fatwa rejected successfully!"
- Toast auto-closes after 3 seconds

### Step 6: Error Handling
- If rejection fails, error toast appears: "❌ [Error message]"
- Toast stays visible for 4 seconds
- Fatwa remains in list for retry

## Toast Notifications

### Loading Toast
```
🚫 Rejecting fatwa...
```
- Position: Top-right
- Duration: Until response received
- Dismissible: No

### Success Toast
```
✅ Fatwa rejected successfully!
```
- Position: Top-right
- Duration: 3 seconds
- Dismissible: Yes (close button)
- Background: Green

### Error Toast
```
❌ Failed to reject fatwa
```
- Position: Top-right
- Duration: 4 seconds
- Dismissible: Yes (close button)
- Background: Red

## Console Logs

### Rejection Started
```
[API] Rejecting fatwa: {
  fatwaId: "ac166001-9b0c-1fdf-819b-1d2127190009",
  hasAuth: true
}
```

### API Call
```
[API] Calling reject endpoint: https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/fatwas/ac166001-9b0c-1fdf-819b-1d2127190009/reject
```

### Success
```
[API] ✓ Fatwa rejected successfully: ac166001-9b0c-1fdf-819b-1d2127190009
```

### Error
```
[API] Fatwa rejection failed: 400 Bad Request
```

## Testing Checklist

- [ ] Click Reject button on a pending fatwa
- [ ] Confirm rejection in dialog
- [ ] See loading toast: "🚫 Rejecting fatwa..."
- [ ] See success toast: "✅ Fatwa rejected successfully!"
- [ ] Fatwa is removed from pending list
- [ ] Toast auto-closes after 3 seconds
- [ ] Check console logs for confirmation

## Error Scenarios

### Scenario 1: Missing Authentication Token
**Error:** "Missing authentication token"
**Solution:** Login again to refresh token

### Scenario 2: Invalid Fatwa ID
**Error:** "Failed to reject fatwa"
**Solution:** Refresh page and try again

### Scenario 3: Network Error
**Error:** "Failed to reject fatwa"
**Solution:** Check internet connection and retry

### Scenario 4: Backend Error
**Error:** "Failed to reject fatwa: 500 Internal Server Error"
**Solution:** Check backend logs and retry

## Files Modified

1. `quran-app/app/api/khateb_Studio/fatwas/route.ts`
   - Added DELETE endpoint for rejecting fatwas
   - Proxies to backend PUT endpoint

2. `quran-app/app/khateb_Studio/fatwas/page.tsx`
   - Implemented `handleReject` function
   - Added toast notifications
   - Removes fatwa from pending list on success

3. `quran-app/app/khateb_Studio/fatwas/fatwaCard.tsx`
   - Reject button calls `onReject` callback
   - Already implemented, no changes needed

## API Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Fatwa rejected successfully",
  "data": {
    "id": "ac166001-9b0c-1fdf-819b-1d2127190009",
    "status": "REJECTED",
    "rejectedAt": "2025-12-17T15:45:00Z"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "error": "Bad Request",
  "message": "Invalid fatwa ID",
  "timestamp": "2025-12-17T15:45:00Z"
}
```

## Performance Considerations

- Toast notifications are lightweight
- Fatwa removal from list is instant (optimistic update)
- No page reload required
- Smooth user experience

## Security Notes

- Authentication token required for all rejections
- Token sent in Authorization header
- Backend validates token before processing
- Fatwa ID validated on backend

## Future Enhancements

1. **Rejection Reason** - Allow preacher to provide rejection reason
2. **Bulk Rejection** - Reject multiple fatwas at once
3. **Undo Action** - Allow undoing rejection within 5 seconds
4. **Rejection History** - Track all rejected fatwas
5. **Rejection Analytics** - Show rejection statistics

## Troubleshooting

### Toast Not Showing
- Check if ToastContainer is rendered in page
- Verify react-toastify CSS is imported
- Check browser console for errors

### Fatwa Not Removed
- Check console for success log
- Verify response status is 200
- Check if fatwa ID matches

### Confirmation Dialog Not Appearing
- Check browser console for errors
- Verify JavaScript is enabled
- Try refreshing page

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs
3. Check browser DevTools Network tab
4. Verify backend is running
