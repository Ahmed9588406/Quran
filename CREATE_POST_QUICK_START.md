# Create Post Feature - Quick Start Guide

## What Was Created

✅ **CreatePostCard Component** - Beautiful post creation UI matching your design
✅ **API Endpoint** - Backend proxy for post creation
✅ **Standalone Page** - `/create-post` route for dedicated post creation
✅ **Full Documentation** - Complete integration guide

## Quick Integration (2 minutes)

### Option 1: Add to Existing Page
```tsx
import CreatePostCard from "@/app/user-profile/CreatePostCard";

export default function YourPage() {
  return (
    <CreatePostCard
      currentUserAvatar="/path/to/avatar.jpg"
      currentUserName="User Name"
      onPostCreated={() => {
        // Refresh posts or navigate
        window.location.reload();
      }}
    />
  );
}
```

### Option 2: Use Standalone Page
Navigate to `/create-post` - it's ready to use!

## Component Features

| Feature | Status |
|---------|--------|
| Text input | ✅ |
| Image upload | ✅ |
| Video upload | ✅ |
| File preview | ✅ |
| Remove files | ✅ |
| Visibility selector | ✅ |
| Loading state | ✅ |
| Error handling | ✅ |
| Toast notifications | ✅ |

## API Endpoint

**POST** `http://localhost:3000/api/posts`

Forwards to: `http://apisoapp.twingroups.com/posts`

**Headers:**
```
Authorization: Bearer <token>
```

**Body (FormData):**
```
content: "Post text"
visibility: "public|friends|private"
files: [File, File, ...]
```

## File Structure

```
quran-app/
├── app/
│   ├── api/
│   │   └── posts/
│   │       └── route.ts              ← API endpoint
│   ├── create-post/
│   │   └── page.tsx                  ← Standalone page
│   └── user-profile/
│       ├── CreatePostCard.tsx        ← Main component
│       └── CreatePostIntegration.tsx ← Usage examples
└── CREATE_POST_DOCUMENTATION.md      ← Full docs
```

## Styling

Uses your brand colors:
- Primary: `#7b2030` (dark red)
- Hover: `#5e0e27` (darker red)
- Border: `#f0e6e5` (light beige)

## Testing

1. **Text Post**: Type text and click Post
2. **Image Post**: Click "Add media", select images, click Post
3. **Video Post**: Click "Add reel", select videos, click Post
4. **Mixed Post**: Add text + media, click Post
5. **Visibility**: Change dropdown, verify in backend

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Missing authorization" | User not logged in - check localStorage token |
| "Post must have content" | Add text or media before posting |
| Files not uploading | Check backend file size limits |
| CORS errors | Verify backend allows your domain |

## Next Steps

1. **Integrate into your pages** - Copy the component into your feed/profile
2. **Test with your backend** - Verify API endpoint works
3. **Customize styling** - Adjust colors/spacing as needed
4. **Add enhancements** - Character limit, hashtags, mentions, etc.

## Component Props

```typescript
interface CreatePostCardProps {
  currentUserAvatar?: string;  // User avatar URL
  currentUserName?: string;    // User display name
  onPostCreated?: () => void;  // Callback after post creation
}
```

## Example: Full Integration

```tsx
"use client";
import { useState } from "react";
import CreatePostCard from "@/app/user-profile/CreatePostCard";
import PostCard from "@/app/user-profile/PostCard";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);

  const handlePostCreated = async () => {
    // Refresh posts from API
    const response = await fetch("/api/posts");
    const data = await response.json();
    setPosts(data.posts || []);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Create Post */}
      <CreatePostCard
        currentUserAvatar="/avatar.jpg"
        currentUserName="Ahmed"
        onPostCreated={handlePostCreated}
      />

      {/* Posts Feed */}
      <div className="mt-6 space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
```

## Customization Examples

### Add Character Limit
```tsx
const MAX_CHARS = 280;
<div className="text-xs text-gray-500">
  {MAX_CHARS - content.length} characters remaining
</div>
```

### Change Colors
Replace `#7b2030` with your color throughout the component

### Add Hashtag Support
Add a hashtag input field and parse on submit

### Add Location
Add a location selector dropdown

## Performance Tips

- Use React Query or SWR for post fetching
- Implement image compression before upload
- Lazy load the component if not always visible
- Cache user data to avoid repeated fetches

## Security Notes

- Tokens stored in localStorage (consider httpOnly cookies)
- File types validated on client and backend
- User input sanitized to prevent XSS
- Implement rate limiting on backend

---

**Ready to use!** Start integrating the CreatePostCard component into your pages.
