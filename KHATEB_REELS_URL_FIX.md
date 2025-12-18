# Khateb Reels Video URL Fix

## Problem
Video URLs from the API were coming as relative paths like `/uploads/reels/reel_d5a218c1165bdc4d8ff8d053.mp4` but needed to be converted to full URLs like `http://apisoapp.twingroups.com/uploads/reels/reel_d5a218c1165bdc4d8ff8d053.mp4` for the video player to work correctly.

## Solution
Updated the `normalizeUrl` function in `quran-app/app/khateeb_Profile/Kh_Reels.tsx` to properly construct full URLs.

### Before
```typescript
const normalizeUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Use video proxy for video URLs
  if (url.includes('video') || url.endsWith('.mp4')) {
    return `/api/video-proxy?url=${encodeURIComponent(`${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`)}`;
  }
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
```

### After
```typescript
const normalizeUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Construct full URL for video and image files
  const fullUrl = `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  console.log('[Kh_Reels] Normalized URL:', { original: url, normalized: fullUrl });
  return fullUrl;
};
```

## How It Works

### Input Examples
- `/uploads/reels/reel_d5a218c1165bdc4d8ff8d053.mp4`
- `uploads/reels/reel_d5a218c1165bdc4d8ff8d053.mp4`
- `http://apisoapp.twingroups.com/uploads/reels/reel_d5a218c1165bdc4d8ff8d053.mp4`

### Output Examples
- `http://apisoapp.twingroups.com/uploads/reels/reel_d5a218c1165bdc4d8ff8d053.mp4`
- `http://apisoapp.twingroups.com/uploads/reels/reel_d5a218c1165bdc4d8ff8d053.mp4`
- `http://apisoapp.twingroups.com/uploads/reels/reel_d5a218c1165bdc4d8ff8d053.mp4`

## Logic Flow

1. **Check if URL is empty** → Return empty string
2. **Check if URL already has protocol** → Return as-is (already full URL)
3. **Check if URL starts with `/`** → Prepend BASE_URL directly
4. **Otherwise** → Prepend BASE_URL with `/` separator

## Base URL
```
BASE_URL = "http://apisoapp.twingroups.com"
```

## Applied To
- Video URLs (`video_url`, `src`)
- Thumbnail URLs (`thumbnail_url`, `thumbnail`)
- Avatar URLs (`user_avatar`, `author.avatar`)

## Debugging
The function logs normalized URLs to the console:
```
[Kh_Reels] Normalized URL: { 
  original: '/uploads/reels/reel_d5a218c1165bdc4d8ff8d053.mp4',
  normalized: 'http://apisoapp.twingroups.com/uploads/reels/reel_d5a218c1165bdc4d8ff8d053.mp4'
}
```

## Testing
To verify the fix is working:
1. Open the Khateb profile page
2. Navigate to the Reels tab
3. Check the browser console for normalized URL logs
4. Verify videos load and play correctly
5. Check Network tab to see full URLs being requested

## Files Modified
- `quran-app/app/khateeb_Profile/Kh_Reels.tsx`
  - Removed unused imports (React, Button, Plus)
  - Updated `normalizeUrl` function
  - Added console logging for debugging
