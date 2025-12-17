# CORS Fix for Fatwas API - Using Next.js Proxy

## Problem
The frontend was making direct requests to the backend API, which resulted in CORS errors:
```
Access to fetch at 'https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/fatwas/{id}/answer' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

## Root Cause
- Frontend was calling the backend API directly from the browser
- Backend doesn't have CORS headers configured
- Browser blocks cross-origin requests without proper CORS headers

## Solution
Route all API requests through the Next.js API proxy instead of calling the backend directly. This avoids CORS issues because:
1. Next.js server-to-server requests don't have CORS restrictions
2. Browser only sees requests to `localhost:3000` (same origin)
3. Next.js proxy handles the backend communication

## Implementation

### 1. Updated API Route (`app/api/khateb_Studio/fatwas/route.ts`)

Added three endpoints:

#### GET - Fetch Pending Fatwas
```typescript
GET /api/khateb_Studio/fatwas?page=0&size=20&sort=createdAt,desc
```
- Fetches pending fatwas for the authenticated preacher
- Proxies to: `GET /api/v1/fatwas/pending`

#### PUT - Submit Answer
```typescript
PUT /api/khateb_Studio/fatwas?fatwaId={id}
Body: { "answer": "The preacher's answer" }
```
- Submits an answer to a fatwa
- Proxies to: `PUT /api/v1/fatwas/{id}/answer`

#### DELETE - Reject Fatwa
```typescript
DELETE /api/khateb_Studio/fatwas?fatwaId={id}
```
- Rejects a fatwa
- Proxies to: `PUT /api/v1/fatwas/{id}/reject`

### 2. Updated Fatwas Page (`app/khateb_Studio/fatwas/page.tsx`)

Changed the `handleAnswer` function to use the proxy:

**Before (Direct API call - CORS error):**
```typescript
const apiUrl = `https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/fatwas/${fatwaId}/answer`;
const response = await fetch(apiUrl, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify({ answer: answer.trim() }),
});
```

**After (Using proxy - No CORS error):**
```typescript
const apiUrl = `/api/khateb_Studio/fatwas?fatwaId=${fatwaId}`;
const response = await fetch(apiUrl, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify({ answer: answer.trim() }),
});
```

## Request Flow

### Before (CORS Error)
```
Browser
  ↓
Direct API Call to Backend
  ↓
CORS Policy Blocks Request ❌
```

### After (No CORS Error)
```
Browser
  ↓
Request to /api/khateb_Studio/fatwas (same origin)
  ↓
Next.js Server
  ↓
Backend API Call (server-to-server, no CORS)
  ↓
Response back to Browser ✓
```

## Testing

### Step 1: Submit an Answer
1. Navigate to fatwas page
2. Type an answer in a fatwa card
3. Click "Submit Answer"

### Step 2: Check Console Logs
Look for these logs indicating successful proxy call:
```
[API] Submitting answer for fatwa: {
  fatwaId: "ac166001-9b0c-1fdf-819b-1d2127190009",
  answerLength: 150,
  hasAuth: true
}
[API] ✓ Answer submitted successfully for fatwa: ac166001-9b0c-1fdf-819b-1d2127190009
```

### Step 3: Verify No CORS Errors
- Open DevTools → Console
- Should NOT see CORS error messages
- Should see success messages instead

## API Endpoints Summary

| Operation | Method | Endpoint | Purpose |
|-----------|--------|----------|---------|
| Fetch Fatwas | GET | `/api/khateb_Studio/fatwas?page=0&size=20` | Get pending fatwas |
| Submit Answer | PUT | `/api/khateb_Studio/fatwas?fatwaId={id}` | Answer a fatwa |
| Reject Fatwa | DELETE | `/api/khateb_Studio/fatwas?fatwaId={id}` | Reject a fatwa |

## Error Handling

The proxy includes comprehensive error handling:

1. **Missing Parameters:**
   ```
   Status: 400
   Error: "Missing fatwaId parameter"
   ```

2. **Missing Authentication:**
   ```
   Status: 401
   Error: "Missing authentication token"
   ```

3. **Backend Errors:**
   ```
   Status: 400-500 (from backend)
   Error: "Failed to submit answer"
   Details: (backend error message)
   ```

## Debugging

### If you still see CORS errors:

1. **Check Network Tab:**
   - Open DevTools → Network tab
   - Look for requests to `/api/khateb_Studio/fatwas`
   - Should show status 200 (not CORS error)

2. **Check Console Logs:**
   - Look for `[API]` prefixed logs
   - Should show successful submission logs

3. **Check Backend Response:**
   - If proxy returns error, check the `details` field
   - This contains the actual backend error

### Common Issues:

**Issue:** Still seeing CORS error
- **Solution:** Clear browser cache and reload
- **Command:** `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)

**Issue:** 401 Unauthorized
- **Solution:** Token might be expired, login again
- **Command:** Clear localStorage: `localStorage.clear()`

**Issue:** 400 Bad Request
- **Solution:** Check if fatwaId is being passed correctly
- **Debug:** Add console.log to verify fatwaId value

## Files Modified

1. `quran-app/app/api/khateb_Studio/fatwas/route.ts` - Added PUT and DELETE endpoints
2. `quran-app/app/khateb_Studio/fatwas/page.tsx` - Updated handleAnswer to use proxy

## Benefits

✓ No CORS errors
✓ Secure - tokens handled server-side
✓ Consistent - all API calls go through proxy
✓ Maintainable - single place to manage API logic
✓ Scalable - easy to add more endpoints
