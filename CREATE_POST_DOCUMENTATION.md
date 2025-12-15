# Create Post Feature Documentation

## Overview
Complete post creation feature with UI matching your design, including:
- Text content input
- Image and video upload
- Visibility settings (public, friends, private)
- Real-time file preview
- Integration with backend API at `http://192.168.1.18:9001`

## Files Created

### 1. **CreatePostCard.tsx** (`/app/user-profile/CreatePostCard.tsx`)
Main component for creating posts with the exact UI from your design.

**Features:**
- User avatar display
- Text input field with placeholder "Write here..."
- Media upload (images and videos)
- File preview with remove option
- Visibility selector dropdown
- Add media and Add reel buttons
- Post button with loading state

**Props:**
```typescript
interface CreatePostCardProps {
  currentUserAvatar?: string;      // User's avatar URL
  currentUserName?: string;        // User's display name
  onPostCreated?: () => void;      // Callback after successful post creation
}
```

**Usage:**
```tsx
import CreatePostCard from "@/app/user-profile/CreatePostCard";

<CreatePostCard
  currentUserAvatar="/path/to/avatar.jpg"
  currentUserName="Ahmed"
  onPostCreated={() => console.log("Post created!")}
/>
```

### 2. **API Endpoint** (`/app/api/posts/route.ts`)
Backend proxy for post creation and fetching.

**POST /api/posts**
- Creates a new post with optional media files
- Forwards request to `http://192.168.1.18:9001/posts`
- Requires Bearer token in Authorization header
- Accepts FormData with:
  - `content`: Post text (string)
  - `visibility`: "public" | "friends" | "private"
  - `files`: Image or video files (optional)

**GET /api/posts**
- Fetches posts with pagination
- Query parameters:
  - `limit`: Number of posts (default: 10)
  - `offset`: Pagination offset (default: 0)

### 3. **Create Post Page** (`/app/create-post/page.tsx`)
Standalone page for creating posts.

**Features:**
- Fetches current user information
- Displays CreatePostCard component
- Redirects to user profile after post creation
- Handles authentication

**Route:** `/create-post`

### 4. **Integration Guide** (`/app/user-profile/CreatePostIntegration.tsx`)
Examples showing how to integrate CreatePostCard into existing pages.

## API Integration

### Backend Endpoint
```
POST http://192.168.1.18:9001/posts
```

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
content: "Post text content"
visibility: "public"
files: [File, File, ...]
```

**Response (Success - 201):**
```json
{
  "id": "post_id",
  "content": "Post text",
  "visibility": "public",
  "created_at": "2025-12-14T10:30:00Z",
  "media": [
    {
      "url": "/uploads/image.jpg",
      "media_type": "image/jpeg"
    }
  ]
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

## Styling

The component uses Tailwind CSS with your brand color `#7b2030`:
- Primary color: `#7b2030` (dark red)
- Secondary color: `#5e0e27` (darker red for hover)
- Border color: `#f0e6e5` (light beige)

## Integration Steps

### Step 1: Add to User Profile Page
```tsx
// In your user profile page
import CreatePostCard from "@/app/user-profile/CreatePostCard";

export default function UserProfilePage() {
  return (
    <div>
      <CreatePostCard
        currentUserAvatar={userAvatar}
        currentUserName={userName}
        onPostCreated={() => {
          // Refresh posts
          fetchPosts();
        }}
      />
      
      {/* Your posts feed */}
    </div>
  );
}
```

### Step 2: Add to Feed Page
```tsx
// In your feed/home page
import CreatePostCard from "@/app/user-profile/CreatePostCard";

export default function FeedPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <CreatePostCard
        currentUserAvatar={currentUser.avatar}
        currentUserName={currentUser.name}
        onPostCreated={() => window.location.reload()}
      />
      
      {/* Feed posts */}
    </div>
  );
}
```

### Step 3: Add Navigation Link
```tsx
// In your navigation/header
<Link href="/create-post" className="btn">
  Create Post
</Link>
```

## Features

### 1. Text Input
- Placeholder: "Write here..."
- Supports multi-line text
- Real-time character count (optional enhancement)

### 2. Media Upload
- **Add Media**: Upload images (jpg, png, gif, etc.)
- **Add Reel**: Upload videos (mp4, webm, etc.)
- Multiple file selection supported
- Real-time preview with remove option
- File validation on client side

### 3. Visibility Settings
- **Public**: Visible to everyone
- **Friends**: Visible to friends only
- **Private**: Visible to you only

### 4. Error Handling
- Toast notifications for errors
- Validation for empty posts
- Authentication check
- Network error handling

### 5. Loading States
- Disabled buttons during upload
- Loading indicator on post button
- File preview loading

## Customization

### Change Brand Colors
Edit the color values in `CreatePostCard.tsx`:
```tsx
// Change from #7b2030 to your color
className="text-[#7b2030]"  // Primary
className="bg-[#7b2030]"    // Background
className="hover:bg-[#5e0e27]" // Hover
```

### Add Character Limit
```tsx
const MAX_CHARS = 280;
const remaining = MAX_CHARS - content.length;

<div className="text-xs text-gray-500">
  {remaining} characters remaining
</div>
```

### Add Hashtag/Mention Support
```tsx
// Add a mention/hashtag input component
<input
  type="text"
  placeholder="Add hashtags or mentions..."
  className="..."
/>
```

### Add Location
```tsx
// Add location selector
<select className="...">
  <option>Select location...</option>
</select>
```

## Testing

### Manual Testing Checklist
- [ ] Create post with text only
- [ ] Create post with images
- [ ] Create post with videos
- [ ] Create post with text + media
- [ ] Test visibility options
- [ ] Test file removal
- [ ] Test error handling (no content)
- [ ] Test authentication (no token)
- [ ] Test network errors
- [ ] Test file preview display

### API Testing
```bash
# Test with curl
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=Test post" \
  -F "visibility=public" \
  -F "files=@image.jpg"
```

## Troubleshooting

### Issue: "Missing or invalid authorization header"
**Solution:** Ensure user is logged in and token is stored in localStorage

### Issue: "Post must have content or media"
**Solution:** Add either text content or select media files

### Issue: Files not uploading
**Solution:** 
- Check file size limits on backend
- Verify file types are supported
- Check network connection

### Issue: CORS errors
**Solution:** Ensure backend allows requests from your frontend domain

## Performance Optimization

### Image Optimization
```tsx
// Add image compression before upload
const compressImage = async (file: File) => {
  // Use canvas or library like sharp
};
```

### Lazy Loading
```tsx
// Lazy load the component
const CreatePostCard = dynamic(() => import("./CreatePostCard"), {
  loading: () => <div>Loading...</div>,
});
```

### Caching
```tsx
// Cache user data to avoid repeated fetches
const { data: user } = useSWR("/api/user", fetcher);
```

## Security Considerations

1. **Token Storage**: Tokens stored in localStorage (consider using httpOnly cookies)
2. **File Validation**: Validate file types and sizes on backend
3. **Content Sanitization**: Sanitize user input to prevent XSS
4. **Rate Limiting**: Implement rate limiting on backend
5. **File Scanning**: Scan uploaded files for malware

## Future Enhancements

- [ ] Scheduled posts
- [ ] Draft saving
- [ ] Hashtag suggestions
- [ ] Mention suggestions
- [ ] Image filters
- [ ] Video trimming
- [ ] Polls/Surveys
- [ ] Location tagging
- [ ] Emoji picker
- [ ] Rich text editor

## Support

For issues or questions, check:
1. Browser console for errors
2. Network tab for API responses
3. Backend logs for server errors
4. This documentation for common issues
