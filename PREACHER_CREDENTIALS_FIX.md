# Preacher Credentials Fix - Fatwas Page

## Problem
The preacher credentials were showing as empty `{name: '', hasAvatar: false}` in the fatwas page because the login response data wasn't being properly extracted and stored.

## Root Cause
The login page was storing the raw user object from the API response without normalizing the field names. Different backend responses use different field naming conventions:
- `firstName` vs `first_name`
- `lastName` vs `last_name`
- `profilePictureUrl` vs `profile_picture_url` vs `avatar` vs `avatar_url`

## Solution Implemented

### 1. Enhanced Login Page (`app/(Auth)/login/page.tsx`)
Added proper field extraction and normalization when storing user credentials:

```typescript
if (user) {
  // Extract preacher credentials for display in fatwas page
  const firstName = user.firstName || user.first_name || user.name?.split(' ')[0] || '';
  const lastName = user.lastName || user.last_name || user.name?.split(' ').slice(1).join(' ') || '';
  const profilePictureUrl = user.profilePictureUrl || user.profile_picture_url || user.avatar || user.avatar_url || '';
  
  const userWithId = {
    ...user,
    id: userId || user.id,
    role: userRole || user.role,
    firstName: firstName,
    lastName: lastName,
    profilePictureUrl: profilePictureUrl
  };
  
  localStorage.setItem("user", JSON.stringify(userWithId));
  
  // Log preacher credentials for debugging
  console.log('[Login] ✓ Preacher credentials stored:', {
    name: `${firstName} ${lastName}`.trim(),
    hasAvatar: !!profilePictureUrl,
    userId: userId || user.id,
    role: userRole || user.role
  });
}
```

### 2. New Helper Function (`lib/auth-helpers.ts`)
Added `getPreacherCredentials()` function to safely extract preacher info from localStorage:

```typescript
export function getPreacherCredentials(): { name: string; avatar: string } {
  // Handles various field name formats
  // Returns: { name: "Ahmed Al-Mansouri", avatar: "https://..." }
}
```

### 3. Updated Fatwas Page (`app/khateb_Studio/fatwas/page.tsx`)
Enhanced credential extraction with fallback handling:

```typescript
useEffect(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    
    // Extract with fallbacks for various field names
    const firstName = user.firstName || user.first_name || user.name?.split(' ')[0] || '';
    const lastName = user.lastName || user.last_name || user.name?.split(' ').slice(1).join(' ') || '';
    const avatar = user.profilePictureUrl || user.profile_picture_url || user.avatar || user.avatar_url || '';
    
    const fullName = `${firstName} ${lastName}`.trim();
    
    setPreacherInfo({
      name: fullName || "Preacher",
      avatar: avatar,
    });
    
    console.log("[Fatwas] ✓ Preacher credentials loaded:", {
      name: fullName || "Preacher",
      hasAvatar: !!avatar,
      userId: user.id,
      role: user.role
    });
  }
}, []);
```

## Field Name Mappings

The system now handles these field name variations:

| Purpose | Supported Field Names |
|---------|----------------------|
| First Name | `firstName`, `first_name`, `name` (first part) |
| Last Name | `lastName`, `last_name`, `name` (remaining parts) |
| Avatar | `profilePictureUrl`, `profile_picture_url`, `avatar`, `avatar_url` |

## Testing

### Step 1: Login with Preacher Account
1. Navigate to login page
2. Enter preacher credentials
3. Check browser console for logs:
   ```
   [Login] ✓ Preacher credentials stored: {
     name: "Ahmed Al-Mansouri",
     hasAvatar: true,
     userId: "preacher_123",
     role: "preacher"
   }
   ```

### Step 2: Verify Fatwas Page
1. After login, navigate to fatwas page
2. Check console for:
   ```
   [Fatwas] ✓ Preacher credentials loaded: {
     name: "Ahmed Al-Mansouri",
     hasAvatar: true,
     userId: "preacher_123",
     role: "preacher"
   }
   ```

### Step 3: Verify Display
1. Each fatwa card should show:
   - Preacher's actual name (e.g., "Ahmed Al-Mansouri")
   - Preacher's avatar (if available)
   - Console logs for each card:
     ```
     === FATWA CARD LOADED ===
     Logged-in Preacher Information:
       Name: Ahmed Al-Mansouri
       Avatar URL: https://...
       Fatwa ID: fatwa_123
       Question from: User Name
     ================================
     ```

## Debugging

### If credentials still show empty:

1. **Check localStorage after login:**
   ```javascript
   JSON.parse(localStorage.getItem('user'))
   // Should show: { firstName: "Ahmed", lastName: "Al-Mansouri", profilePictureUrl: "...", ... }
   ```

2. **Check backend response format:**
   - Open DevTools → Network tab
   - Look for login API call
   - Check response body for field names
   - Verify they match one of the supported formats

3. **Check console logs:**
   - Look for `[Login] ✓ Preacher credentials stored` message
   - Look for `[Fatwas] ✓ Preacher credentials loaded` message
   - If missing, check for errors in console

### Common Issues:

**Issue:** Name shows as empty
- **Solution:** Check if backend returns `firstName`/`lastName` or `first_name`/`last_name` or `name` field
- **Fix:** Add the field name to the extraction logic

**Issue:** Avatar shows as empty
- **Solution:** Check if backend returns `profilePictureUrl`, `profile_picture_url`, `avatar`, or `avatar_url`
- **Fix:** Add the field name to the extraction logic

**Issue:** Preacher name not updating in fatwas page
- **Solution:** Clear localStorage and login again
- **Command:** `localStorage.clear()` then refresh and login

## Files Modified

1. `quran-app/app/(Auth)/login/page.tsx` - Enhanced credential extraction
2. `quran-app/app/khateb_Studio/fatwas/page.tsx` - Improved credential loading
3. `quran-app/lib/auth-helpers.ts` - Added `getPreacherCredentials()` helper
4. `quran-app/app/khateb_Studio/fatwas/fatwaCard.tsx` - Already has logging

## Next Steps

If the preacher credentials still don't display correctly:
1. Check the actual backend response format
2. Add any missing field names to the extraction logic
3. Update the field name mappings table above
4. Test with the new field names
