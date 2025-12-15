# Quick Test Guide - Typing Indicator & Mark Seen

## TL;DR - Run Tests Now

```bash
# Install dependencies (if not already done)
npm install

# Run all tests
npm test

# Run specific tests
npm test -- typing/route.test.ts
npm test -- seen/route.test.ts
npm test -- api.typing-seen.test.ts

# Run with coverage report
npm test -- --coverage
```

## What Was Tested

### ✅ Typing Indicator
- REST API endpoint: `POST /api/chats/:chatId/typing`
- ChatAPI method: `chatAPI.sendTyping(chatId, isTyping)`
- WebSocket integration
- Error handling
- Authorization

### ✅ Mark Seen
- REST API endpoint: `POST /api/chats/:chatId/seen`
- ChatAPI method: `chatAPI.markAsSeen(chatId, messageId?)`
- WebSocket integration
- Error handling
- Authorization

## Test Files

| File | Tests | Purpose |
|------|-------|---------|
| `app/api/chats/[chatId]/typing/route.test.ts` | 7 | REST API endpoint tests |
| `app/api/chats/[chatId]/seen/route.test.ts` | 7 | REST API endpoint tests |
| `lib/chat/api.typing-seen.test.ts` | 17 | ChatAPI method tests |

**Total: 31 test cases**

## Expected Test Results

```
✓ All 31 tests should pass
✓ No console errors
✓ No TypeScript errors
✓ Coverage > 80%
```

## Quick Manual Test

### Test Typing Indicator
1. Open two browser windows with the same chat
2. In Window 1, type a message
3. In Window 2, you should see "typing..." indicator
4. Stop typing and wait 1.5 seconds
5. Indicator should disappear

### Test Mark Seen
1. Open two browser windows with different users
2. User A sends a message to User B
3. User B opens the chat
4. Message should be marked as read in both windows

## API Endpoints

### Typing Indicator
```
POST /api/chats/:chatId/typing
Content-Type: application/json
Authorization: Bearer {token}

{
  "is_typing": true
}
```

### Mark Seen
```
POST /api/chats/:chatId/seen
Content-Type: application/json
Authorization: Bearer {token}

{
  "message_id": "optional_message_id"
}
```

## Debugging

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "typing" or "seen"
4. Check request/response

### Check WebSocket Messages
1. Open DevTools (F12)
2. Go to Network > WebSocket
3. Click on WebSocket connection
4. Go to Messages tab
5. Look for "typing" or "seen" messages

### Check Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check if endpoints are being called

## Common Issues

| Issue | Solution |
|-------|----------|
| Tests fail | Run `npm install` first |
| Backend errors | Check if backend is running at `http://192.168.1.18:9001` |
| WebSocket errors | Check if WebSocket server is running at `ws://192.168.1.18:8080` |
| Authorization errors | Check if token is in localStorage |
| CORS errors | Check if backend allows CORS |

## Files Created

1. **Test Files**
   - `app/api/chats/[chatId]/typing/route.test.ts`
   - `app/api/chats/[chatId]/seen/route.test.ts`
   - `lib/chat/api.typing-seen.test.ts`

2. **Documentation**
   - `TYPING_SEEN_INTEGRATION_TEST.md` - Detailed manual tests
   - `TEST_SUMMARY.md` - Complete test summary
   - `CHAT_FIXES.md` - What was fixed
   - `QUICK_TEST_GUIDE.md` - This file

3. **Scripts**
   - `test-typing-seen.sh` - Test runner script

## Next Steps

1. ✅ Run tests: `npm test`
2. ✅ Check results
3. ✅ Run manual tests (see TYPING_SEEN_INTEGRATION_TEST.md)
4. ✅ Deploy to production

## Support

- **Test Issues**: Check test files for examples
- **Manual Test Issues**: Check TYPING_SEEN_INTEGRATION_TEST.md
- **API Issues**: Check CHAT_FIXES.md
- **General Issues**: Check console for error messages

---

**Status**: ✅ Ready for testing
**Last Updated**: 2024
**Test Coverage**: 31 test cases
