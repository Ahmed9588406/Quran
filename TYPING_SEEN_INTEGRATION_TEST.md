# Typing Indicator & Mark Seen - Integration Test Guide

## Overview
This guide provides manual and automated tests for the typing indicator and mark seen functionality.

## Test Files Created

1. **`app/api/chats/[chatId]/typing/route.test.ts`** - REST API endpoint tests
2. **`app/api/chats/[chatId]/seen/route.test.ts`** - REST API endpoint tests
3. **`lib/chat/api.typing-seen.test.ts`** - ChatAPI method tests

## Running Tests

### Run All Tests
```bash
npm test
# or
yarn test
# or
pnpm test
```

### Run Specific Test File
```bash
npm test -- typing/route.test.ts
npm test -- seen/route.test.ts
npm test -- api.typing-seen.test.ts
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## Manual Integration Tests

### Test 1: Typing Indicator via REST API

**Setup:**
- Open two browser windows with the same chat
- Have the backend running at `http://192.168.1.18:9001`
- Have the WebSocket server running at `ws://192.168.1.18:8080`

**Steps:**
1. In Window 1, open the chat
2. In Window 2, open the same chat
3. In Window 1, start typing in the message input
4. Observe Window 2 - typing indicator should appear

**Expected Results:**
- ✅ Typing indicator appears in Window 2 within 1 second
- ✅ Typing indicator shows animated dots
- ✅ Typing indicator disappears 1.5 seconds after user stops typing
- ✅ Console shows no errors

**API Calls Made:**
```
POST /api/chats/chat-123/typing
Content-Type: application/json
Authorization: Bearer {token}

{
  "is_typing": true
}
```

Then after 1.5 seconds of inactivity:
```
POST /api/chats/chat-123/typing
Content-Type: application/json
Authorization: Bearer {token}

{
  "is_typing": false
}
```

### Test 2: Mark Seen via REST API

**Setup:**
- Open two browser windows with different users
- User A and User B
- Have the backend running at `http://192.168.1.18:9001`
- Have the WebSocket server running at `ws://192.168.1.18:8080`

**Steps:**
1. User A sends a message to User B
2. In User B's window, open the chat
3. Observe the message - it should be marked as read
4. In User A's window, observe the message - it should show as read

**Expected Results:**
- ✅ Message is marked as read in User B's view
- ✅ Message shows read status in User A's view
- ✅ No errors in console
- ✅ Chat list updates to show 0 unread messages

**API Calls Made:**
```
POST /api/chats/chat-123/seen
Content-Type: application/json
Authorization: Bearer {token}

{}
```

Or for specific message:
```
POST /api/chats/chat-123/seen
Content-Type: application/json
Authorization: Bearer {token}

{
  "message_id": "msg-456"
}
```

### Test 3: Typing Indicator with WebSocket

**Setup:**
- Same as Test 1

**Steps:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by WebSocket
4. In Window 1, start typing
5. Observe WebSocket messages

**Expected Results:**
- ✅ WebSocket message sent with type "typing"
- ✅ Message contains `chat_id` and `is_typing: true`
- ✅ After 1.5 seconds, another message with `is_typing: false`

**WebSocket Message Format:**
```json
{
  "type": "typing",
  "chat_id": "chat-123",
  "is_typing": true
}
```

### Test 4: Mark Seen with WebSocket

**Setup:**
- Same as Test 2

**Steps:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by WebSocket
4. User B opens the chat
5. Observe WebSocket messages

**Expected Results:**
- ✅ WebSocket message sent with type "seen"
- ✅ Message contains `chat_id` and `message_id`
- ✅ Message appears in User A's WebSocket connection

**WebSocket Message Format:**
```json
{
  "type": "seen",
  "chat_id": "chat-123",
  "message_id": "msg-456"
}
```

### Test 5: Error Handling

**Setup:**
- Backend is stopped or unreachable

**Steps:**
1. Open the chat
2. Start typing
3. Observe console

**Expected Results:**
- ✅ No errors thrown
- ✅ Chat still works normally
- ✅ Console shows error message (non-critical)
- ✅ Typing indicator still works when backend is back online

### Test 6: Multiple Chats

**Setup:**
- Open 3 chats in different tabs

**Steps:**
1. In Tab 1, start typing in Chat A
2. In Tab 2, start typing in Chat B
3. In Tab 3, open Chat C
4. Observe each chat independently

**Expected Results:**
- ✅ Typing indicator only appears in the correct chat
- ✅ Each chat maintains its own typing state
- ✅ No cross-chat interference

### Test 7: Rapid Typing

**Setup:**
- Same as Test 1

**Steps:**
1. In Window 1, type quickly: "Hello world"
2. Observe Window 2

**Expected Results:**
- ✅ Typing indicator appears immediately
- ✅ Typing indicator stays visible while typing
- ✅ Typing indicator disappears after user stops
- ✅ No duplicate messages or errors

### Test 8: Long Inactivity

**Setup:**
- Same as Test 1

**Steps:**
1. In Window 1, type one character
2. Wait 2 seconds without typing
3. Observe Window 2

**Expected Results:**
- ✅ Typing indicator appears
- ✅ Typing indicator disappears after 1.5 seconds
- ✅ No lingering typing indicator

## Automated Test Coverage

### Typing Indicator Tests
- ✅ Send typing start (is_typing=true)
- ✅ Send typing stop (is_typing=false)
- ✅ Default to is_typing=true
- ✅ Work without authorization
- ✅ Handle errors gracefully
- ✅ Log errors to console
- ✅ Handle network errors
- ✅ Validate is_typing is boolean
- ✅ Include CORS headers
- ✅ Handle different chat IDs

### Mark Seen Tests
- ✅ Mark all messages as seen
- ✅ Mark specific message as seen
- ✅ Work without authorization
- ✅ Handle errors gracefully
- ✅ Log errors to console
- ✅ Handle network errors
- ✅ Include CORS headers
- ✅ Handle different chat IDs
- ✅ Handle different message IDs

### Integration Tests
- ✅ Rapid typing indicator calls
- ✅ Concurrent typing and seen calls

## Test Results Checklist

### REST API Endpoint Tests
- [ ] Typing endpoint returns 200 on success
- [ ] Typing endpoint validates is_typing is boolean
- [ ] Typing endpoint includes CORS headers
- [ ] Typing endpoint forwards authorization
- [ ] Seen endpoint returns 200 on success
- [ ] Seen endpoint handles optional message_id
- [ ] Seen endpoint includes CORS headers
- [ ] Seen endpoint forwards authorization

### ChatAPI Method Tests
- [ ] sendTyping() calls correct endpoint
- [ ] sendTyping() includes authorization
- [ ] sendTyping() doesn't throw on error
- [ ] markAsSeen() calls correct endpoint
- [ ] markAsSeen() includes authorization
- [ ] markAsSeen() doesn't throw on error

### Manual Integration Tests
- [ ] Typing indicator appears in real-time
- [ ] Typing indicator disappears after inactivity
- [ ] Mark seen updates message status
- [ ] Mark seen broadcasts to other users
- [ ] WebSocket messages are correct format
- [ ] Error handling doesn't break chat
- [ ] Multiple chats work independently
- [ ] Rapid typing is handled correctly
- [ ] Long inactivity is handled correctly

## Debugging

### Enable Debug Logging
Add to `lib/chat/api.ts`:
```typescript
const DEBUG = true;

if (DEBUG) {
  console.log('Sending typing indicator:', { chatId, isTyping });
  console.log('Sending mark seen:', { chatId, messageId });
}
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "typing" or "seen"
4. Check request/response headers and body

### Check WebSocket Messages
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by WebSocket
4. Click on the WebSocket connection
5. Go to Messages tab
6. Look for messages with type "typing" or "seen"

### Check Console Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check if errors are from typing/seen endpoints

## Performance Metrics

### Expected Performance
- Typing indicator latency: < 500ms
- Mark seen latency: < 500ms
- WebSocket message delivery: < 100ms
- No memory leaks after 1 hour of usage

### Monitoring
- Check browser memory usage (DevTools > Memory)
- Check network requests (DevTools > Network)
- Check console for errors (DevTools > Console)

## Troubleshooting

### Typing Indicator Not Appearing
1. Check if WebSocket is connected (should show "connected" in UI)
2. Check if backend is running at `http://192.168.1.18:9001`
3. Check if WebSocket server is running at `ws://192.168.1.18:8080`
4. Check console for errors
5. Check network requests for 500 errors

### Mark Seen Not Working
1. Check if WebSocket is connected
2. Check if backend is running
3. Check if user has permission to mark messages as seen
4. Check console for errors
5. Check network requests for 500 errors

### CORS Errors
1. Check if backend allows CORS
2. Check if frontend is sending correct headers
3. Check if OPTIONS request is being handled

### Authorization Errors
1. Check if token is stored in localStorage
2. Check if token is valid
3. Check if token is being sent in Authorization header
4. Check if backend validates token correctly

## Next Steps

1. Run all tests: `npm test`
2. Run manual integration tests
3. Monitor performance metrics
4. Fix any issues found
5. Deploy to production
