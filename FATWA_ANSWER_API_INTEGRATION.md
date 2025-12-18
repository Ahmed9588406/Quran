# Fatwa Answer API Integration

## Overview
This document describes the complete implementation of the fatwa answer submission feature using the PUT endpoint.

## API Endpoint

**URL:** `https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/fatwas/{fatwaID}/answer`

**Method:** `PUT`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "answer": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Answer submitted successfully",
  "data": {
    "id": "fatwa_123",
    "question": "...",
    "answer": "...",
    "status": "answered",
    "answeredAt": "2024-12-17T10:30:00Z"
  }
}
```

## Implementation Details

### 1. FatwaCard Component (`app/khateb_Studio/fatwas/fatwaCard.tsx`)

The FatwaCard component handles the UI for answering fatwas:

```typescript
const handleSubmitAnswer = async () => {
  if (!answer.trim() || !onAnswer) return;
  
  setIsSubmitting(true);
  
  console.log("[FatwaCard] Submitting answer:", {
    fatwaId: fatwa.id,
    answerLength: answer.length,
    preacher: preacherName,
  });
  
  try {
    // Call the parent's onAnswer handler which makes the API request
    await onAnswer(fatwa.id, answer);
    
    // Clear the answer field after successful submission
    setAnswer("");
    
    console.log("[FatwaCard] ✓ Answer submitted successfully for fatwa:", fatwa.id);
  } catch (error) {
    console.error("[FatwaCard] Error submitting answer:", error);
  } finally {
    setIsSubmitting(false);
  }
};
```

**Key Features:**
- Validates answer text is not empty
- Shows loading state during submission
- Clears input field after successful submission
- Logs submission details for debugging
- Handles errors gracefully

### 2. FatwasPage Component (`app/khateb_Studio/fatwas/page.tsx`)

The parent component handles the API request:

```typescript
const handleAnswer = async (fatwaId: string, answer: string) => {
  try {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    console.log("[Fatwas] Submitting answer for fatwa:", {
      fatwaId,
      answerLength: answer.length,
      hasToken: !!token,
    });

    // Call the backend API endpoint to submit the answer
    const apiUrl = `https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/fatwas/${fatwaId}/answer`;
    
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ answer: answer.trim() }),
    });

    console.log("[Fatwas] Answer submission response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || errorData.error || `HTTP ${response.status}`;
      throw new Error(`Failed to submit answer: ${errorMsg}`);
    }

    const responseData = await response.json();
    
    console.log("[Fatwas] ✓ Answer submitted successfully:", {
      fatwaId,
      response: responseData,
    });

    // Remove answered fatwa from list
    setFatwas((prev) => prev.filter((f) => f.id !== fatwaId));
    
    // Show success message
    alert("Answer submitted successfully!");
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "An error occurred";
    console.error("[Fatwas] Error answering fatwa:", errorMsg);
    alert(`Failed to submit answer: ${errorMsg}`);
  }
};
```

**Key Features:**
- Retrieves authentication token from localStorage
- Validates token exists before making request
- Constructs proper API URL with fatwa ID
- Sends PUT request with correct headers and body
- Handles response errors gracefully
- Removes answered fatwa from the list
- Logs all steps for debugging

## Data Flow

```
User Types Answer
        ↓
[FatwaCard] handleSubmitAnswer()
        ↓
Validates answer text
        ↓
Calls onAnswer() callback
        ↓
[FatwasPage] handleAnswer()
        ↓
Gets auth token from localStorage
        ↓
Constructs API URL: /api/v1/fatwas/{fatwaID}/answer
        ↓
Sends PUT request with:
  - Headers: Authorization: Bearer {token}
  - Body: { "answer": "..." }
        ↓
Backend processes answer
        ↓
Response received
        ↓
Remove fatwa from list
        ↓
Show success message
        ↓
Clear input field
```

## Testing

### Step 1: Login as Preacher
1. Navigate to login page
2. Enter preacher credentials
3. Verify redirect to `/khateb_Studio/{userId}/fatwas`

### Step 2: View Fatwas
1. Check that fatwas are loaded
2. Verify preacher name and avatar display correctly
3. Check console for logs:
   ```
   [Fatwas] ✓ Preacher credentials loaded: {
     name: "Ahmed Al-Mansouri",
     hasAvatar: true,
     userId: "preacher_123",
     role: "preacher"
   }
   ```

### Step 3: Submit Answer
1. Click on a fatwa card
2. Type an answer in the textarea
3. Click "Submit Answer" button
4. Check console for logs:
   ```
   [FatwaCard] Submitting answer: {
     fatwaId: "fatwa_123",
     answerLength: 150,
     preacher: "Ahmed Al-Mansouri"
   }
   
   [Fatwas] Submitting answer for fatwa: {
     fatwaId: "fatwa_123",
     answerLength: 150,
     hasToken: true
   }
   
   [Fatwas] Answer submission response status: 200
   
   [Fatwas] ✓ Answer submitted successfully: {
     fatwaId: "fatwa_123",
     response: {...}
   }
   ```

### Step 4: Verify Success
1. Check that success alert appears
2. Verify fatwa is removed from the list
3. Check that input field is cleared
4. Verify no errors in console

## Error Handling

### Missing Authentication Token
```
Error: No authentication token found. Please login again.
```
**Solution:** Login again to get a new token

### Network Error
```
Error: Failed to submit answer: Network error
```
**Solution:** Check internet connection and try again

### Invalid Answer
```
Error: Failed to submit answer: Answer cannot be empty
```
**Solution:** Enter a valid answer text

### Server Error
```
Error: Failed to submit answer: HTTP 500
```
**Solution:** Check backend logs and try again later

## Debugging

### Check Authentication Token
```javascript
// In browser console:
localStorage.getItem('access_token')
// Should return: "eyJ..."
```

### Check User Data
```javascript
// In browser console:
JSON.parse(localStorage.getItem('user'))
// Should return: { id: "...", name: "...", role: "preacher", ... }
```

### Monitor API Requests
1. Open DevTools → Network tab
2. Filter by "answer"
3. Look for PUT request to `/api/v1/fatwas/{fatwaID}/answer`
4. Check request headers and body
5. Check response status and body

### View Console Logs
1. Open DevTools → Console tab
2. Filter by "[Fatwas]" or "[FatwaCard]"
3. Check for submission logs
4. Look for error messages

## Common Issues

### Issue 1: Answer Not Submitting
**Symptoms:** Button doesn't respond when clicked

**Debugging:**
1. Check console for errors
2. Verify token exists: `localStorage.getItem('access_token')`
3. Check Network tab for API request
4. Verify answer text is not empty

**Solution:**
- Clear localStorage and login again
- Check backend is running
- Verify API endpoint is correct

### Issue 2: "Failed to submit answer" Error
**Symptoms:** Error alert appears after clicking submit

**Debugging:**
1. Check console for error message
2. Check Network tab for response status
3. Check response body for error details

**Solution:**
- If 401: Token expired, login again
- If 404: Fatwa ID not found
- If 500: Backend error, check server logs

### Issue 3: Fatwa Not Removed from List
**Symptoms:** Fatwa still appears after successful submission

**Debugging:**
1. Check console for success log
2. Verify response status is 200
3. Check if fatwa ID matches

**Solution:**
- Refresh page to reload fatwas
- Check backend to verify answer was saved

## Files Modified

1. `quran-app/app/khateb_Studio/fatwas/fatwaCard.tsx`
   - Updated `handleSubmitAnswer()` with detailed logging
   - Added comprehensive comments

2. `quran-app/app/khateb_Studio/fatwas/page.tsx`
   - Updated `handleAnswer()` to use PUT endpoint
   - Added proper error handling
   - Added detailed logging

## API Response Examples

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Answer submitted successfully",
  "data": {
    "id": "fatwa_123",
    "question": "What is the meaning of Quran?",
    "answer": "The Quran is the holy book of Islam...",
    "status": "answered",
    "answeredAt": "2024-12-17T10:30:00Z",
    "answeredBy": {
      "id": "preacher_123",
      "name": "Ahmed Al-Mansouri"
    }
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Answer cannot be empty",
  "message": "Validation failed"
}
```

### Error Response (401 Unauthorized)
```json
{
  "success": false,
  "error": "Invalid or expired token",
  "message": "Authentication failed"
}
```

### Error Response (404 Not Found)
```json
{
  "success": false,
  "error": "Fatwa not found",
  "message": "The specified fatwa does not exist"
}
```

## Next Steps

1. Test the implementation with actual backend
2. Monitor console logs for any issues
3. Verify fatwas are properly removed after submission
4. Test error scenarios (network errors, invalid tokens, etc.)
5. Optimize performance if needed
