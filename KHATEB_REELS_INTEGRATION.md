# Khateb Reels Integration Guide

## Overview
This document describes the integration of reels functionality for Khateb (preacher) profiles and studio.

## Components Created

### 1. Khateb Studio Reels Section
**Location:** `quran-app/app/khateb_Studio/reels/`

#### Files:
- **page.tsx** - Main reels page for Khateb Studio
  - Authorization check (preacher role only)
  - Full-screen reels feed
  - Create reel button
  - Messages and profile modals
  
- **KhatebReelsFeed.tsx** - Full-screen reels feed component
  - Fetches reels from: `GET /users/{userId}/reels`
  - Swipe/scroll navigation (up/down)
  - Like, comment, share, save actions
  - Follow functionality
  - Mute/unmute controls
  - Keyboard navigation (arrow keys, j/k, m)
  - Styled with Khateb Studio colors (#8A1538, #C9A96E)

- **KhatebReelsGrid.tsx** - Grid display component
  - 3-column thumbnail grid for profile pages
  - Full-screen viewer modal
  - Empty state handling

- **index.ts** - Module exports

### 2. Khateb Profile Reels Tab
**Location:** `quran-app/app/khateeb_Profile/Kh_Reels.tsx`

#### Features:
- Fetches reels from: `GET /users/{userId}/reels`
- Gets user ID from:
  1. Component props (`userId` prop)
  2. localStorage (`user_id` key)
- Transforms API response to component format
- Handles different API response formats:
  - Array of reels
  - `{ reels: [...] }`
  - `{ data: [...] }`
- Video preview with hover play
- Full-screen modal viewer
- Loading, error, and empty states
- Responsive design

## API Endpoint

### Fetch User Reels
```
GET http://apisoapp.twingroups.com/users/{user_id}/reels
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Response Format:**
```json
[
  {
    "id": "reel_id",
    "video_url": "https://...",
    "thumbnail_url": "https://...",
    "content": "Reel caption",
    "username": "Preacher Name",
    "user_avatar": "https://...",
    "likes_count": 100,
    "comments_count": 5,
    "is_liked": false,
    "is_saved": false,
    "is_following": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

## Integration Points

### 1. Khateb Studio Navigation
- Added "Reels" menu item to Sidebar
- Icon: Film icon from lucide-react
- Route: `/khateb_Studio/reels`
- Only visible to preacher role users

### 2. Khateb Profile Page
- Reels tab in profile tabs
- Displays user's reels in grid format
- Accessible from: `/khateeb_Profile/{id}`

### 3. Authentication
- Uses `access_token` from localStorage
- Uses `user_id` from localStorage
- Automatic fallback if credentials missing

## Usage

### In Khateb Studio
```tsx
import { KhatebReelsFeed } from '@/app/khateb_Studio/reels';

<KhatebReelsFeed currentUserId={userId} />
```

### In Khateb Profile
```tsx
import KhReels from '@/app/khateeb_Profile/Kh_Reels';

<KhReels userId={preacherId} />
```

## Features

### KhatebReelsFeed
- ✅ Full-screen video player
- ✅ Swipe/scroll navigation
- ✅ Like/unlike reels
- ✅ Save/unsave reels
- ✅ Comment on reels
- ✅ Share reels
- ✅ Follow creators
- ✅ Mute/unmute audio
- ✅ Keyboard shortcuts (↑↓, j/k, m)
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states

### Kh_Reels (Profile Tab)
- ✅ Vertical scroll grid
- ✅ Video preview with hover play
- ✅ Full-screen modal viewer
- ✅ Video controls in modal
- ✅ Creator info display
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states

## Styling

### Colors Used
- Primary: `#8A1538` (Khateb red)
- Secondary: `#C9A96E` (Gold)
- Background: `#fff6f3` (Light beige)
- Accent: `#F7E9CF` (Light gold)

### Responsive Design
- Mobile: Full-width, single column
- Tablet: Adjusted spacing
- Desktop: Full layout with sidebars

## Error Handling

### Network Errors
- Displays error message with retry button
- Logs errors to console for debugging

### Missing Data
- Handles missing video URLs
- Handles missing thumbnails
- Handles missing user info
- Shows appropriate fallback UI

### Authorization
- Checks for valid access token
- Checks for valid user ID
- Redirects to login if missing

## Future Enhancements

1. **Pagination** - Load more reels on scroll
2. **Filtering** - Filter by date, popularity, etc.
3. **Search** - Search reels by caption
4. **Analytics** - View reel performance metrics
5. **Editing** - Edit reel captions
6. **Deletion** - Delete reels
7. **Sharing** - Share to social media
8. **Notifications** - Get notified on interactions

## Testing

### Manual Testing Checklist
- [ ] Verify reels load from API
- [ ] Test swipe navigation
- [ ] Test like/unlike
- [ ] Test save/unsave
- [ ] Test comment functionality
- [ ] Test share functionality
- [ ] Test follow functionality
- [ ] Test mute/unmute
- [ ] Test keyboard shortcuts
- [ ] Test error states
- [ ] Test empty states
- [ ] Test loading states
- [ ] Test responsive design
- [ ] Test on mobile devices
- [ ] Test on tablets
- [ ] Test on desktop

## Troubleshooting

### Reels Not Loading
1. Check if user ID is in localStorage
2. Check if access token is valid
3. Check network tab for API errors
4. Verify endpoint URL is correct
5. Check CORS headers

### Videos Not Playing
1. Check video URL format
2. Verify video file exists
3. Check browser video support
4. Check for CORS issues
5. Check video codec compatibility

### Authorization Issues
1. Verify user is logged in
2. Check access token expiration
3. Verify user role is "preacher"
4. Check localStorage for credentials

## References

- Reels API: `http://apisoapp.twingroups.com/users/{user_id}/reels`
- Khateb Studio: `/khateb_Studio/reels`
- Khateb Profile: `/khateeb_Profile/{id}`
