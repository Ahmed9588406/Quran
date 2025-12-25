# Document Upload Feature - Quick Reference

## Overview
The document upload feature allows users to upload PDF files to the backend when preparing Khotba content. Files are uploaded to the backend API and associated with the logged-in user.

## Implementation Details

### API Endpoint
**Backend URL:** `https://javabacked.twingroups.com/api/v1/documents/upload`

**Local Proxy:** `/api/documents` (POST)

### Request Parameters

#### Query Parameters
- `userId` (required): The ID of the logged-in user
- `liveStreamId` (optional): Optional live stream ID to associate with the document

#### Request Body (FormData)
- `file` (required): PDF file to upload (binary)

#### Headers
- `Authorization: Bearer <access_token>` (required)

### Files Modified

1. **`/app/api/documents/route.ts`**
   - Proxy endpoint for document uploads
   - Handles FormData and forwards to backend
   - Adds userId as query parameter
   - Includes authorization header

2. **`/app/Schedual/prepare_khotba/page.tsx`**
   - Updated file upload handlers
   - Retrieves user ID from localStorage
   - Sends files to backend API
   - Shows success/error feedback

## How It Works

### User Flow
1. User clicks "Add file" button
2. Upload modal appears
3. User can either:
   - Click "Select File" to browse
   - Drag and drop PDF files
4. File is uploaded to backend with user ID
5. Success message is displayed
6. File appears in the attached files list

### Authentication
- User ID is retrieved from `localStorage.getItem('user_id')`
- Access token is retrieved from `localStorage.getItem('access_token')`
- Token is sent as Bearer token in Authorization header

### File Restrictions
- Only PDF files are accepted (`.pdf` extension)
- Multiple files can be uploaded at once
- Each file is uploaded separately to the backend

## Code Example

### Upload Function
```typescript
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    setIsUploading(true);
    
    try {
      const userId = localStorage.getItem('user_id');
      const accessToken = localStorage.getItem('access_token');
      
      if (!userId) {
        alert('User not authenticated. Please log in.');
        return;
      }

      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);

        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        return await response.json();
      });

      await Promise.all(uploadPromises);
      setSelectedFiles(prev => [...prev, ...Array.from(files)]);
      setUploadSuccessOpen(true);
    } catch (error) {
      alert(`Failed to upload file: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  }
};
```

## Testing

### Prerequisites
1. User must be logged in
2. `user_id` and `access_token` must be in localStorage
3. Backend API must be accessible

### Test Steps
1. Navigate to `/Schedual/prepare_khotba`
2. Click "Add file" button
3. Select or drag a PDF file
4. Verify upload progress indicator
5. Check for success message
6. Verify file appears in attached files list

### Troubleshooting

**Error: "User not authenticated"**
- Solution: Log in first to get user_id and access_token

**Error: "Upload failed"**
- Check network tab for actual error
- Verify backend is accessible
- Check authorization token is valid

**Error: "User ID is required"**
- Ensure user_id is stored in localStorage
- Check login flow stores user_id correctly

## API Response

### Success Response (200)
```json
{
  "id": "document_id",
  "userId": "user_id",
  "fileName": "document.pdf",
  "fileUrl": "https://...",
  "uploadedAt": "2025-12-22T10:30:00Z"
}
```

### Error Response (400/500)
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Future Enhancements
- [ ] Add file size validation
- [ ] Show upload progress percentage
- [ ] Add file preview before upload
- [ ] Support additional file types
- [ ] Add file deletion functionality
- [ ] Associate files with specific Khotba entries
