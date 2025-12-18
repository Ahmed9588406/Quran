# Khateb Reels Debug Guide

## Video Playback Issues - Troubleshooting

### Problem: Videos not playing or showing in Kh_Reels component

### Step 1: Check Browser Console
Open browser DevTools (F12) and check the Console tab for these logs:

```
[Kh_Reels] API Response: {...}
[Kh_Reels] Response type: object
[Kh_Reels] Is array: true/false
[Kh_Reels] Using array format, count: X
[Kh_Reels] Processing reel: {...}
[Kh_Reels] Video loaded: reel_id
```

### Step 2: Verify API Response Format

The API should return one of these formats:

**Format 1: Direct Array**
```json
[
  {
    "id": "reel_id",
    "video_url": "https://...",
    "thumbnail_url": "https://...",
    "content": "Caption",
    "username": "Preacher",
    "user_avatar": "https://..."
  }
]
```

**Format 2: Object with reels property**
```json
{
  "reels": [
    { ... }
  ]
}
```

**Format 3: Object with data property**
```json
{
  "data": [
    { ... }
  ]
}
```

### Step 3: Check Video URL

In the console, look for:
```
[Kh_Reels] Processing reel: {
  videoUrl: "https://...",
  thumbnailUrl: "https://...",
  username: "...",
  content: "..."
}
```

**If videoUrl is empty or undefined:**
- The API response doesn't have `video_url` or `src` field
- Check API response structure
- Verify field names match

### Step 4: Check Video Proxy

Videos are proxied through `/api/video-proxy` to handle CORS issues.

If you see errors like:
```
[Kh_Reels] Video error: ...
```

Check:
1. Video proxy route exists at `app/api/video-proxy/route.ts`
2. Video URL is properly encoded
3. Original video URL is accessible

### Step 5: Network Tab Analysis

In DevTools Network tab:

1. **Look for API request:**
   - URL: `http://apisoapp.twingroups.com/users/{userId}/reels`
   - Status: 200 OK
   - Response: Check JSON structure

2. **Look for video requests:**
   - URL: `/api/video-proxy?url=...`
   - Status: 200 OK
   - Type: video/mp4

3. **If video request fails:**
   - Check CORS headers
   - Verify original video URL is accessible
   - Check video file format

### Common Issues & Solutions

#### Issue 1: "No preview available" message
**Cause:** Video URL is empty or failed to load

**Solution:**
1. Check API response has `video_url` field
2. Verify video URL is not null/undefined
3. Check video file exists at URL
4. Test URL directly in browser

#### Issue 2: Video shows but doesn't play
**Cause:** CORS or codec issues

**Solution:**
1. Check browser console for CORS errors
2. Verify video codec is H.264 (MP4)
3. Check video proxy is working
4. Try different video format

#### Issue 3: Thumbnail not showing
**Cause:** Thumbnail URL missing or invalid

**Solution:**
1. Check API response has `thumbnail_url` field
2. Verify thumbnail URL is accessible
3. Check image format (JPG/PNG)
4. Verify URL is properly formatted

#### Issue 4: Author info not showing
**Cause:** Username or avatar missing

**Solution:**
1. Check API response has `username` field
2. Check API response has `user_avatar` field
3. Verify avatar URL is accessible
4. Check field names match API response

### Debugging Steps

#### Step 1: Enable Detailed Logging
The component already logs to console. Check for:
- API response structure
- Transformed reel data
- Video load events
- Error events

#### Step 2: Test API Directly
Use curl or Postman to test:
```bash
curl -H "Authorization: Bearer {token}" \
  http://apisoapp.twingroups.com/users/{userId}/reels
```

#### Step 3: Check Video Proxy
Verify video proxy route works:
```bash
curl "http://localhost:3000/api/video-proxy?url=https://example.com/video.mp4"
```

#### Step 4: Inspect Component State
Add temporary console logs to check:
- `reels` state
- `active` state
- `isLoading` state
- `error` state

### Expected Behavior

1. **On Mount:**
   - Component fetches reels from API
   - Shows loading spinner
   - Logs API response

2. **On Success:**
   - Reels display in vertical scroll
   - Videos show thumbnails
   - Hover plays preview
   - Click opens modal

3. **On Error:**
   - Shows error message
   - Logs error to console
   - Provides retry option

### Performance Tips

1. **Lazy Load Videos:**
   - Use `preload="metadata"` (already set)
   - Videos load on demand

2. **Optimize Thumbnails:**
   - Use compressed images
   - Proper aspect ratio (9:16)

3. **Handle Large Lists:**
   - Implement pagination
   - Virtual scrolling for many reels

### Testing Checklist

- [ ] API returns data in correct format
- [ ] Video URLs are accessible
- [ ] Thumbnail URLs are accessible
- [ ] Author info is present
- [ ] Videos play in modal
- [ ] Hover preview works
- [ ] Mobile responsive
- [ ] Error states work
- [ ] Loading states work
- [ ] Empty states work

### Useful Console Commands

```javascript
// Check reels state
console.log(document.querySelector('[data-testid="reel-item"]'));

// Check video element
const video = document.querySelector('video');
console.log('Video src:', video.src);
console.log('Video ready state:', video.readyState);
console.log('Video network state:', video.networkState);

// Check for CORS errors
fetch('http://apisoapp.twingroups.com/users/{userId}/reels', {
  headers: { 'Authorization': 'Bearer {token}' }
}).then(r => r.json()).then(console.log);
```

### Contact Support

If issues persist:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify API endpoint is correct
4. Verify authentication token is valid
5. Check video file format and codec
