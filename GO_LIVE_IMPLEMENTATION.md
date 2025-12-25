# Go Live Feature Implementation

## Overview
The Go Live feature allows preachers to create and start live streaming rooms. It fetches room information from the backend and displays it before starting the live session.

## API Endpoint

### GET Room Information
**Endpoint:** `https://javabacked.twingroups.com/api/v1/stream/preacher/{preacherId}/room-info`

**Response:**
```json
{
  "preacherId": "string",
  "username": "string",
  "displayName": "string",
  "liveStreamId": 0,
  "roomId": 0,
  "status": "string"
}
```

## Implementation Files

### 1. API Route: `/api/stream/room-info/route.ts`
- Proxies requests to the backend API
- Handles authentication and error cases
- Query parameter: `preacherId`

### 2. GoLiveModal Component: `app/khateb_Studio/GoLiveModal.tsx`
**Features:**
- Fetches room info when modal opens
- Displays loading state while fetching
- Shows error messages if fetch fails
- Displays room information (display name, username, room ID, status)
- Configurable options:
  - Who can speak (dropdown)
  - Topic input
  - Record space toggle
- Start Live button (disabled until room info loads)

### 3. CreateModal Integration: `app/khateb_Studio/CreateModal.tsx`
- "Go Live" button triggers the GoLiveModal
- Passes `onOpenGoLive` callback to parent

## User Flow

1. User clicks the "+" button in Khateb Studio navbar
2. CreateModal opens with options
3. User clicks "Go Live" button
4. GoLiveModal opens and automatically fetches room info
5. Room information is displayed (display name, username, room ID, status)
6. User configures:
   - Who can speak
   - Topic for the live session
   - Whether to record the space
7. User clicks "Start live" button
8. AudioModal opens for the live streaming session

## State Management

**GoLiveModal State:**
- `roomInfo`: Stores fetched room information
- `isLoading`: Loading state for API call
- `error`: Error message if fetch fails
- `topic`: User-entered topic
- `whoCanSpeak`: Selected speaker permission
- `recordSpace`: Toggle for recording

## Error Handling

- User not logged in: Shows error message
- API failure: Displays error with details
- Network issues: Caught and displayed to user
- Start button disabled until room info loads successfully

## Styling

- Modal: 720px width, centered, with backdrop
- Color scheme: Matches app theme (#8A1538, #FFF9F3)
- Loading spinner: Animated with Loader2 icon
- Error messages: Red background with border
- Room info: White card with grid layout

## Testing

To test the implementation:
1. Log in as a preacher
2. Navigate to Khateb Studio
3. Click the "+" button
4. Click "Go Live"
5. Verify room info loads and displays correctly
6. Configure options and click "Start live"
7. Verify AudioModal opens for live streaming
