# Khateb Reels Video Autoplay Fix

## Problem
Videos in the Khateb Reels component were not autoplaying and error handling was not providing enough debugging information.

## Solution
Updated the video elements to enable autoplay and improved error logging.

## Changes Made

### 1. Preview Video (Grid View)

**Before:**
```tsx
<video
  poster={r.thumbnail || r.thumbnail_url}
  muted
  loop
  playsInline
  preload="metadata"
  crossOrigin="anonymous"
  onError={(e) => {
    console.error('[Kh_Reels] Video error:', e);
    setFailed((p) => ({ ...p, [r.id]: true }));
  }}
>
  <source src={r.src || r.video_url} type="video/mp4" />
</video>
```

**After:**
```tsx
<video
  poster={r.thumbnail || r.thumbnail_url}
  muted
  autoPlay          // ← Added autoplay
  loop
  playsInline
  preload="auto"    // ← Changed from "metadata" to "auto"
  crossOrigin="anonymous"
  onError={(e) => {
    const video = e.currentTarget as HTMLVideoElement;
    console.error('[Kh_Reels] Video error for reel:', r.id);
    console.error('[Kh_Reels] Video src:', video.src);
    console.error('[Kh_Reels] Video error code:', video.error?.code);
    console.error('[Kh_Reels] Video error message:', video.error?.message);
    setFailed((p) => ({ ...p, [r.id]: true }));
  }}
  onCanPlay={() => {
    console.log('[Kh_Reels] Video can play:', r.id);
  }}
>
  <source src={r.src || r.video_url} type="video/mp4" />
</video>
```

### 2. Modal Video (Full Screen View)

**Before:**
```tsx
<video
  controls
  autoPlay
  crossOrigin="anonymous"
  className="kh-modal-video"
  onError={(e) => {
    console.error('[Kh_Reels] Modal video error:', e);
    console.error('[Kh_Reels] Video src:', active.src || active.video_url);
  }}
  onLoadedMetadata={() => {
    console.log('[Kh_Reels] Modal video loaded');
  }}
>
  <source src={active.src || active.video_url} type="video/mp4" />
</video>
```

**After:**
```tsx
<video
  controls
  autoPlay
  muted             // ← Added muted for autoplay to work
  crossOrigin="anonymous"
  className="kh-modal-video"
  onError={(e) => {
    const video = e.currentTarget as HTMLVideoElement;
    console.error('[Kh_Reels] Modal video error for reel:', active.id);
    console.error('[Kh_Reels] Video src:', active.src || active.video_url);
    console.error('[Kh_Reels] Video error code:', video.error?.code);
    console.error('[Kh_Reels] Video error message:', video.error?.message);
  }}
  onLoadedMetadata={() => {
    console.log('[Kh_Reels] Modal video loaded:', active.id);
  }}
  onCanPlay={() => {
    console.log('[Kh_Reels] Modal video can play:', active.id);
  }}
>
  <source src={active.src || active.video_url} type="video/mp4" />
</video>
```

## Key Improvements

### 1. Autoplay Enabled
- Added `autoPlay` attribute to both preview and modal videos
- Videos now start playing automatically when loaded
- Requires `muted` attribute for autoplay to work in most browsers

### 2. Better Preload Strategy
- Changed `preload="metadata"` to `preload="auto"` for preview videos
- Allows browser to preload entire video for smoother playback
- Improves user experience when scrolling through reels

### 3. Enhanced Error Logging
- Logs reel ID for easier debugging
- Logs actual video src being used
- Logs error code (1-4) with meaning:
  - 1: MEDIA_ERR_ABORTED - Loading aborted
  - 2: MEDIA_ERR_NETWORK - Network error
  - 3: MEDIA_ERR_DECODE - Decoding error
  - 4: MEDIA_ERR_SRC_NOT_SUPPORTED - Source not supported
- Logs error message from browser

### 4. Added onCanPlay Event
- Logs when video is ready to play
- Helps track video loading progress
- Useful for debugging playback issues

## Browser Autoplay Policy

Modern browsers require videos to be **muted** to autoplay without user interaction:

```
✅ Works: <video muted autoPlay>
❌ Doesn't work: <video autoPlay> (without muted)
```

This is a security/UX feature to prevent annoying auto-playing videos with sound.

## Debugging Console Output

### Successful Video Load
```
[Kh_Reels] Video loaded: reel_id
[Kh_Reels] Video can play: reel_id
```

### Video Error
```
[Kh_Reels] Video error for reel: reel_id
[Kh_Reels] Video src: http://apisoapp.twingroups.com/uploads/reels/reel_id.mp4
[Kh_Reels] Video error code: 4
[Kh_Reels] Video error message: MEDIA_ERR_SRC_NOT_SUPPORTED
```

## Testing Checklist

- [ ] Videos autoplay when grid loads
- [ ] Videos autoplay in modal when opened
- [ ] Videos loop continuously
- [ ] Hover pause/play works (preview only)
- [ ] Modal video has controls
- [ ] Error messages appear in console
- [ ] Error code helps identify issue
- [ ] Videos play on different browsers
- [ ] Mobile autoplay works (muted)
- [ ] Network errors are logged

## Common Issues & Solutions

### Issue: Videos not autoplaying
**Solution:** Check browser console for error code
- Code 4: Video URL is wrong or inaccessible
- Code 2: Network error - check URL accessibility
- Code 3: Video codec not supported - use H.264 MP4

### Issue: Autoplay not working on mobile
**Solution:** Ensure `muted` attribute is present
- Mobile browsers require muted for autoplay
- User can unmute after clicking play

### Issue: Videos buffering
**Solution:** Check preload strategy
- Use `preload="auto"` for better buffering
- Ensure video file is optimized
- Check network speed

## Files Modified
- `quran-app/app/khateeb_Profile/Kh_Reels.tsx`
  - Added `autoPlay` attribute to preview video
  - Changed `preload="metadata"` to `preload="auto"`
  - Added `muted` to modal video
  - Enhanced error logging with error codes
  - Added `onCanPlay` event handler
