# Quickstart: Authentication Error Fix and Page Redirection

## Overview
This quickstart guide explains how to implement the fix for the `getTokenWithExpiryCheck` ReferenceError and set up proper page redirection in the Next.js authentication system.

## Prerequisites
- Node.js and npm installed
- Next.js project with authentication system
- TypeScript configured
- Existing auth-utils.ts with authentication utility functions
- AuthProvider context already set up

## Steps to Apply Fix

### 1. Verify the Error
First, confirm the runtime error exists:
```bash
npm run dev
```
Navigate to the application and observe the ReferenceError in the console.

### 2. Locate the AuthProvider Component
Find the AuthProvider in `frontend/src/lib/auth/auth-context.tsx`

### 3. Add Missing Imports
Add the import statement at the top of the file:
```typescript
import { getTokenWithExpiryCheck, isTokenExpired, storeTokenWithExpiry } from '@/lib/auth/auth-utils';
```

### 4. Update the Root Page for Redirection
Modify `frontend/src/app/page.tsx` to redirect based on authentication status:
- Unauthenticated users → redirect to `/login`
- Authenticated users → redirect to `/dashboard`

### 5. Verify Implementation
Confirm the following functionality:
- `getTokenWithExpiryCheck()` - for initial token validation
- `isTokenExpired(token)` - for checking token expiration
- `storeTokenWithExpiry(token)` - for storing tokens with expiration info
- Root page redirects properly based on authentication status

### 6. Test the Fix
Restart the development server:
```bash
npm run dev
```
Verify that:
- No ReferenceError occurs
- Authentication state is properly restored
- Expired tokens are handled correctly
- Unauthenticated users are redirected to login page
- Authenticated users are redirected to dashboard page
- Login/logout functionality works as expected

## Files Modified
- `frontend/src/lib/auth/auth-context.tsx` - Added import statement
- `frontend/src/app/page.tsx` - Added redirection logic
- `frontend/src/app/dashboard/page.tsx` - Protected dashboard page

## Verification Checklist
- [ ] Application loads without ReferenceError
- [ ] Existing tokens are properly validated on load
- [ ] Expired tokens are cleared from storage
- [ ] New login sessions work correctly
- [ ] Session persistence functions properly
- [ ] Root page redirects unauthenticated users to login
- [ ] Root page redirects authenticated users to dashboard
- [ ] Dashboard page is protected and requires authentication