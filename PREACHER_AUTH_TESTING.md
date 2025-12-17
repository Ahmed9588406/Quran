# Preacher Authentication Testing Guide

## Configuration

The login system is now configured to use the test backend at:
```
http://192.168.1.18:9001
```

## What Was Updated

### 1. Auth API Route (`app/api/auth/route.ts`)
- Base URL set to `http://192.168.1.18:9001`
- Login endpoint: `http://192.168.1.18:9001/auth/login`

### 2. Auth Helpers (`lib/auth-helpers.ts`)
- Added `extractUserRole()` function to extract role from login response
- Updated `getPostLoginRoute()` to accept role parameter
- Implements role-based routing:
  - `role: "preacher"` → `/khateb_Studio/{userId}`
  - Other roles → `/user/{userId}`

### 3. Login Page (`app/(Auth)/login/page.tsx`)
- Extracts user role from login response
- Stores role in localStorage with user object
- Stores user_id separately for quick access
- Passes role to routing function
- Includes console logs for debugging

## Testing Preacher Login

### Step 1: Prepare Test Account
Make sure you have a preacher account on the backend with:
```json
{
  "email": "preacher@example.com",
  "password": "your_password",
  "role": "preacher"
}
```

### Step 2: Login
1. Navigate to the login page
2. Enter preacher credentials
3. Click "Login"

### Step 3: Verify Routing
After successful login, you should:
1. See console logs:
   ```
   [Login] User role: preacher
   [Login] Target route: /khateb_Studio/{userId}
   ```
2. Be redirected to `/khateb_Studio/{userId}`
3. See the studio page load

### Step 4: Verify localStorage
Open DevTools Console and check:
```javascript
// Check stored user data
JSON.parse(localStorage.getItem('user'))
// Should show: { id: "...", name: "...", role: "preacher", ... }

// Check user ID
localStorage.getItem('user_id')
// Should show: "user_id_value"

// Check tokens
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')
```

## Expected Backend Response Format

The backend should return one of these formats:

### Format 1 (Recommended)
```json
{
  "data": {
    "user": {
      "id": "preacher_123",
      "name": "Sheikh Ahmed",
      "email": "ahmed@example.com",
      "role": "preacher",
      "avatar_url": "/uploads/avatar.jpg"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Format 2
```json
{
  "user": {
    "id": "preacher_123",
    "role": "preacher"
  },
  "access_token": "...",
  "refresh_token": "..."
}
```

### Format 3
```json
{
  "user_id": "preacher_123",
  "role": "preacher",
  "access_token": "...",
  "refresh_token": "..."
}
```

## Testing Different User Types

### Test 1: Preacher Login
```
Email: preacher@example.com
Expected: Redirect to /khateb_Studio/{userId}
```

### Test 2: Regular User Login
```
Email: user@example.com
Expected: Redirect to /user/{userId}
```

### Test 3: User Without Role
```
Email: norole@example.com
Expected: Redirect to /user/{userId} (default behavior)
```

## Troubleshooting

### Issue: Not redirecting to studio
**Check:**
1. Backend returns `role: "preacher"` (case-insensitive)
2. Console shows correct role extraction
3. User ID is present in response

**Debug:**
```javascript
// In browser console after login
const user = JSON.parse(localStorage.getItem('user'));
console.log('User role:', user.role);
console.log('User ID:', user.id);
```

### Issue: 404 on studio page
**Check:**
1. Dynamic route exists at `app/khateb_Studio/[id]/page.tsx`
2. User ID is valid
3. Authorization check passes

**Debug:**
Open browser DevTools and check Network tab for failed requests.

### Issue: Infinite redirect loop
**Check:**
1. localStorage has valid user data
2. User ID matches between localStorage and route
3. Role is correctly stored

**Fix:**
```javascript
// Clear localStorage and try again
localStorage.clear();
// Then login again
```

### Issue: Backend connection error
**Check:**
1. Backend is running at `http://192.168.1.18:9001`
2. Network can reach the backend
3. CORS is properly configured

**Test:**
```bash
# Test backend connectivity
curl http://192.168.1.18:9001/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Console Logs to Monitor

When testing, watch for these console logs:

### Login Page
```
[Login] User role: preacher
[Login] Target route: /khateb_Studio/preacher_123
```

### Studio Page (Dynamic Route)
```
Authorization check passed
User authorized for studio
```

### Redirect Page
```
Redirecting to: /khateb_Studio/preacher_123
```

## API Endpoints Being Used

### Login
```
POST http://192.168.1.18:9001/auth/login
Content-Type: application/json

{
  "email": "preacher@example.com",
  "password": "password"
}
```

### Expected Response
```json
{
  "data": {
    "user": {
      "id": "preacher_123",
      "role": "preacher",
      ...
    },
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

## Security Notes

1. **Role Validation**: Both client and server should validate roles
2. **Token Storage**: Tokens stored in both localStorage and httpOnly cookies
3. **Authorization**: Studio page validates user owns the studio
4. **Redirects**: Unauthorized users redirected appropriately

## Next Steps After Successful Test

1. Test with multiple preacher accounts
2. Test cross-preacher access (should redirect to own studio)
3. Test non-preacher trying to access studio
4. Test logout and re-login flow
5. Test token refresh flow

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Network tab for API responses
3. Verify backend is returning correct data format
4. Check localStorage contains expected data
5. Verify dynamic route files exist and are correct
