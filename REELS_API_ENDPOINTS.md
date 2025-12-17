# Reels API Endpoints Documentation

## Overview
This document outlines all the reels API endpoints and their implementations.

## Backend Endpoints (apisoapp.twingroups.com)

### Get Reels Feed
- **Endpoint**: `GET /reels?page=1&limit=10`
- **Frontend Route**: `GET /api/reels?page=1&limit=10`
- **Response**: `{ success: true, videos: [...], page: 1, limit: 10 }`
- **Status**: ✅ Working

### Get Reel by ID
- **Endpoint**: `GET /reels/{reel_id}`
- **Frontend Route**: `GET /api/reels/{reelId}`
- **Response**: Single reel object
- **Status**: ✅ Implemented

### Like Reel
- **Endpoint**: `POST /reels/{reel_id}/like`
- **Frontend Route**: `POST /api/reels/{reelId}/like`
- **Auth**: Required (Bearer token)
- **Body**: None (or empty)
- **Response**: `{ success: true }` or `{ likes_count: N }`
- **Status**: ⚠️ Returns 404 - endpoint may not exist or requires different format

### Unlike Reel
- **Endpoint**: `DELETE /reels/{reel_id}/like`
- **Frontend Route**: `DELETE /api/reels/{reelId}/like`
- **Auth**: Required (Bearer token)
- **Body**: None
- **Response**: `{ success: true }`
- **Status**: ⚠️ Returns 404

### Create Comment
- **Endpoint**: `POST /reels/{reel_id}/comment`
- **Frontend Route**: `POST /api/reels/{reelId}/comment`
- **Auth**: Required (Bearer token)
- **Body**: `{ "content": "comment text" }`
- **Response**: `{ success: true, comment: {...} }` or `{ success: true }`
- **Status**: ⚠️ Returns 404 - endpoint may not exist

### Get Comments
- **Endpoint**: `GET /reels/{reel_id}/comment?page=1&limit=20`
- **Frontend Route**: `GET /api/reels/{reelId}/comments?page=1&limit=20`
- **Auth**: Optional
- **Response**: `{ comments: [...], total_count: N, page: 1, limit: 20, has_more: false }`
- **Status**: ⚠️ Returns 404 - endpoint may not exist

### Follow User
- **Endpoint**: `POST /follow`
- **Frontend Route**: `POST /api/follow`
- **Auth**: Required (Bearer token)
- **Body**: `{ "user_id": "user_id" }`
- **Response**: `{ success: true, is_following: true }`
- **Status**: ⚠️ Returns 404

### Save Reel
- **Endpoint**: `POST /reels/{reel_id}/save`
- **Frontend Route**: `POST /api/reels/{reelId}/save`
- **Auth**: Required (Bearer token)
- **Body**: None
- **Response**: `{ success: true }`
- **Status**: ⚠️ Returns 404

## Issues to Resolve

### 1. Like/Unlike Not Saving
- **Problem**: Backend returns 404 for `/reels/{reel_id}/like`
- **Possible Causes**:
  - Endpoint doesn't exist on backend
  - Endpoint requires different HTTP method
  - Endpoint requires request body
  - Authentication token not being passed correctly
- **Solution**: Verify backend endpoint exists and check authentication

### 2. Comments Not Saving
- **Problem**: Backend returns 404 for `/reels/{reel_id}/comment`
- **Possible Causes**:
  - Endpoint doesn't exist on backend
  - Endpoint path is different
  - Request body format is incorrect
- **Solution**: Verify backend endpoint and request format

### 3. Authentication
- **Current Implementation**: Bearer token from `localStorage.getItem('access_token')`
- **Verification Needed**: 
  - Is token being stored correctly?
  - Is token format correct?
  - Is token being passed in Authorization header?

## Testing Endpoints

### Test Like Endpoint
```bash
curl -X POST http://localhost:3000/api/reels/561aa0c0-f6e8-4b4c-85ac-885fbe056794/like \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Comment Endpoint
```bash
curl -X POST http://localhost:3000/api/reels/561aa0c0-f6e8-4b4c-85ac-885fbe056794/comment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Great reel!"}'
```

## Next Steps

1. Verify backend endpoints exist at:
   - `POST /reels/{reel_id}/like`
   - `DELETE /reels/{reel_id}/like`
   - `POST /reels/{reel_id}/comment`
   - `GET /reels/{reel_id}/comment`

2. Check if endpoints require different request formats

3. Verify authentication token is being passed correctly

4. Check backend logs for error details
