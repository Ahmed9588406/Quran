# API Endpoint Reference

## Create Post Endpoint

### URL
```
POST http://192.168.1.18:9001/posts
```

### Local Proxy
```
POST http://localhost:3000/api/posts
```

## Request Details

### Headers
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

### Body (FormData)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | No* | Post text content |
| `visibility` | string | Yes | "public", "friends", or "private" |
| `files` | File[] | No* | Image or video files |

*At least one of `content` or `files` is required

### Example Request (cURL)
```bash
curl -X POST http://192.168.1.18:9001/posts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "content=Check out this amazing post!" \
  -F "visibility=public" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg"
```

### Example Request (JavaScript/Fetch)
```javascript
const formData = new FormData();
formData.append("content", "Check out this amazing post!");
formData.append("visibility", "public");
formData.append("files", imageFile1);
formData.append("files", imageFile2);

const response = await fetch("http://192.168.1.18:9001/posts", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
```

### Example Request (Using Local Proxy)
```javascript
const formData = new FormData();
formData.append("content", "Check out this amazing post!");
formData.append("visibility", "public");
formData.append("files", imageFile);

const response = await fetch("http://localhost:3000/api/posts", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
```

## Response

### Success Response (201 Created)
```json
{
  "id": "post_123abc",
  "user_id": "user_456def",
  "content": "Check out this amazing post!",
  "visibility": "public",
  "created_at": "2025-12-14T10:30:00Z",
  "updated_at": "2025-12-14T10:30:00Z",
  "likes_count": 0,
  "comments_count": 0,
  "shares_count": 0,
  "media": [
    {
      "id": "media_789ghi",
      "url": "/uploads/posts/image1.jpg",
      "media_type": "image/jpeg",
      "created_at": "2025-12-14T10:30:00Z"
    },
    {
      "id": "media_012jkl",
      "url": "/uploads/posts/image2.jpg",
      "media_type": "image/jpeg",
      "created_at": "2025-12-14T10:30:00Z"
    }
  ]
}
```

### Error Response (400 Bad Request)
```json
{
  "error": "Post must have content or media"
}
```

### Error Response (401 Unauthorized)
```json
{
  "error": "Missing or invalid authorization header"
}
```

### Error Response (413 Payload Too Large)
```json
{
  "error": "File size exceeds maximum allowed size"
}
```

### Error Response (500 Server Error)
```json
{
  "error": "Internal server error"
}
```

## Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 201 | Created | Post created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 413 | Payload Too Large | File size too large |
| 500 | Server Error | Backend error |

## File Upload Specifications

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- BMP (.bmp)

### Supported Video Formats
- MP4 (.mp4)
- WebM (.webm)
- OGG (.ogg)
- MOV (.mov)
- AVI (.avi)

### Size Limits (Typical)
- Single file: 50MB
- Total request: 100MB
- Images: 10MB each
- Videos: 50MB each

*Verify with your backend configuration*

## Visibility Options

| Value | Description |
|-------|-------------|
| `public` | Visible to everyone |
| `friends` | Visible to friends only |
| `private` | Visible to you only |

## Complete Integration Example

```typescript
// types.ts
export interface CreatePostRequest {
  content: string;
  visibility: "public" | "friends" | "private";
  files?: File[];
}

export interface CreatePostResponse {
  id: string;
  user_id: string;
  content: string;
  visibility: string;
  created_at: string;
  media: Array<{
    id: string;
    url: string;
    media_type: string;
  }>;
}

// api.ts
export async function createPost(
  data: CreatePostRequest,
  token: string
): Promise<CreatePostResponse> {
  const formData = new FormData();
  formData.append("content", data.content);
  formData.append("visibility", data.visibility);

  if (data.files) {
    data.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await fetch("http://192.168.1.18:9001/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create post");
  }

  return response.json();
}

// usage.tsx
import { createPost } from "@/api";

async function handleCreatePost() {
  try {
    const token = localStorage.getItem("access_token");
    const result = await createPost(
      {
        content: "My awesome post!",
        visibility: "public",
        files: [imageFile],
      },
      token
    );
    console.log("Post created:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

## Rate Limiting

Typical rate limits (verify with backend):
- 10 posts per hour per user
- 100 files per day per user

## Pagination (GET /posts)

### Query Parameters
```
GET http://192.168.1.18:9001/posts?limit=10&offset=0
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 10 | Number of posts to return |
| `offset` | number | 0 | Number of posts to skip |

### Response
```json
{
  "posts": [
    {
      "id": "post_123",
      "content": "...",
      ...
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

## Authentication

### Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Getting Token
```javascript
const token = localStorage.getItem("access_token");
```

### Token Refresh
If token expires, refresh using your auth endpoint and update localStorage.

## Error Handling

```javascript
try {
  const response = await fetch("http://192.168.1.18:9001/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error:", error.error);
    // Handle specific error codes
    if (response.status === 401) {
      // Redirect to login
    } else if (response.status === 413) {
      // File too large
    }
  } else {
    const result = await response.json();
    console.log("Success:", result);
  }
} catch (error) {
  console.error("Network error:", error);
}
```

## Testing with Postman

1. **Create new POST request**
   - URL: `http://192.168.1.18:9001/posts`

2. **Set Headers**
   - Authorization: `Bearer YOUR_TOKEN`

3. **Set Body**
   - Type: form-data
   - Add fields:
     - `content`: "Test post"
     - `visibility`: "public"
     - `files`: (select image file)

4. **Send request**

## Troubleshooting

### 401 Unauthorized
- Check token is valid
- Check token is not expired
- Check Authorization header format

### 400 Bad Request
- Ensure content or files are provided
- Check field names match exactly
- Verify visibility value is valid

### 413 Payload Too Large
- Reduce file size
- Compress images before upload
- Check backend file size limits

### CORS Error
- Ensure backend allows your domain
- Check backend CORS configuration
- Use local proxy endpoint instead

## Related Endpoints

### Get User Posts
```
GET http://192.168.1.18:9001/users/{userId}/posts
```

### Get Post Details
```
GET http://192.168.1.18:9001/posts/{postId}
```

### Delete Post
```
DELETE http://192.168.1.18:9001/posts/{postId}
```

### Like Post
```
POST http://192.168.1.18:9001/posts/{postId}/like
```

### Comment on Post
```
POST http://192.168.1.18:9001/posts/{postId}/comments
```

---

**Base URL:** `http://192.168.1.18:9001`
**Local Proxy:** `http://localhost:3000/api`
**Last Updated:** December 14, 2025
