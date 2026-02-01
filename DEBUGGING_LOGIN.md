# Troubleshooting Guide: Login Not Working

## Issue: Cannot Login to Dashboard

### Root Cause Checklist

1. **Supabase Table Setup** ⚠️ CRITICAL
   - Have you created the `users` table in Supabase?
   - SQL to run in Supabase SQL Editor:
   ```sql
   CREATE TABLE users (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL,
     role TEXT NOT NULL CHECK (role IN ('admin', 'driver', 'student')),
     photo_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Admin Record in Supabase** ⚠️ CRITICAL
   - You MUST insert your Firebase UID into Supabase before you can login.
   - Steps:
     a. Login to Firebase Console → Authentication → Users
     b. Copy your User UID (long string like "abc123xyz...")
     c. Run this SQL in Supabase:
     ```sql
     INSERT INTO users (id, email, role) 
     VALUES ('YOUR_FIREBASE_UID_HERE', 'your_email@example.com', 'admin');
     ```

3. **Google Sign-In Enabled**
   - Go to Firebase Console → Authentication → Sign-in method
   - Ensure "Google" is enabled
   - Add your domain to authorized domains

4. **Environment Variables**
   - `.env` file must have both Firebase AND Supabase credentials
   - Server must be restarted after `.env` changes (already done)

### How to Debug:

**Step 1**: Open browser console (F12) when on login page
**Step 2**: Try logging in
**Step 3**: Check for error messages:
   - "Access Denied: User record not found" → You haven't inserted your UID in Supabase
   - "Access Denied: Admins only" → Your role is not 'admin' in Supabase
   - Firebase errors → Check Firebase Console for issues

### Quick Test:

1. Go to http://localhost:5173 (or 5174)
2. Try "Sign in with Google"
3. Open Browser Console (F12)
4. Look for red errors

If you see: **"User record not found"** or similar → You need to add your UID to Supabase `users` table with `role: 'admin'`

### Getting Your Firebase UID:

**Method 1**: Console Log (Temporary)
- Add this to AuthContext.jsx after Firebase login (line ~73):
  ```javascript
  console.log("Firebase UID:", result.user.uid);
  ```
  
**Method 2**: Firebase Console
- Firebase Console → Authentication → Users tab
- Your UID is in the "User UID" column
