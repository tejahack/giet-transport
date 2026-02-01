# Firebase Security Rules

This document contains the security rules for both Firestore and Realtime Database that should be configured in the Firebase Console.

## Firestore Security Rules

Navigate to **Firestore Database → Rules** in Firebase Console and apply these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is driver
    function isDriver() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'driver';
    }
    
    // Helper function to check if user is student
    function isStudent() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student';
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read user documents
      allow read: if isSignedIn();
      
      // Only admins can create new users (drivers, students)
      allow create: if isAdmin();
      
      // Admins can update any user, users can update their own profile
      allow update: if isAdmin() || request.auth.uid == userId;
      
      // Only admins can delete users
      allow delete: if isAdmin();
    }
    
    // Routes collection
    match /routes/{routeId} {
      // Anyone authenticated can read routes
      allow read: if isSignedIn();
      
      // Only admins can create, update, or delete routes
      allow create, update, delete: if isAdmin();
    }
    
    // Alerts collection
    match /alerts/{alertId} {
      // Anyone authenticated can read alerts
      allow read: if isSignedIn();
      
      // Only admins can create alerts
      allow create: if isAdmin();
      
      // Only admins can update or delete alerts
      allow update, delete: if isAdmin();
    }
  }
}
```

## Realtime Database Security Rules

Navigate to **Realtime Database → Rules** in Firebase Console and apply these rules:

```json
{
  "rules": {
    "live_locations": {
      // Anyone authenticated can read live locations
      ".read": "auth != null",
      
      "$busId": {
        // Only authenticated drivers can write to live_locations
        // In production, you'd want to verify the driver's specific bus assignment
        ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'driver'",
        
        // Validate data structure
        ".validate": "newData.hasChildren(['lat', 'lng', 'speed', 'driver_name', 'last_updated'])",
        
        "lat": {
          ".validate": "newData.isNumber() && newData.val() >= -90 && newData.val() <= 90"
        },
        "lng": {
          ".validate": "newData.isNumber() && newData.val() >= -180 && newData.val() <= 180"
        },
        "speed": {
          ".validate": "newData.isNumber() && newData.val() >= 0"
        },
        "driver_name": {
          ".validate": "newData.isString()"
        },
        "last_updated": {
          ".validate": "newData.isNumber()"
        }
      }
    }
  }
}
```

## Testing Security Rules

### For Admins
- ✅ Can read all users, routes, alerts
- ✅ Can create drivers and students
- ✅ Can update/delete users, routes, alerts
- ✅ Can view live bus locations

### For Drivers
- ✅ Can read their own profile
- ✅ Can update their location in Realtime Database
- ✅ Can view routes and alerts
- ❌ Cannot create/update/delete users or routes

### For Students
- ✅ Can read their own profile
- ✅ Can view routes, alerts, and live bus locations
- ❌ Cannot modify any data except their own profile
- ❌ Cannot write to Realtime Database

## Important Notes

1. **Production Considerations**:
   - The current rules are suitable for a prototype
   - For production, add more granular permissions
   - Validate data types and required fields more strictly
   - Implement rate limiting to prevent abuse

2. **Driver Location Updates**:
   - Currently, any authenticated driver can write to any bus location
   - In production, implement bus-to-driver assignment validation
   - Consider adding timestamps to prevent stale data

3. **Admin Operations**:
   - Deleting users from Firestore doesn't delete their Auth account
   - For complete deletion, use Firebase Admin SDK on a backend server
   - Client-side apps can only remove Firestore documents

4. **Testing**:
   - Test rules in Firebase Console using the Rules Playground
   - Simulate requests as different user roles
   - Verify that unauthorized access is properly denied

## Deploying Rules

### Using Firebase Console (Recommended for beginners)
1. Go to Firebase Console
2. Navigate to Firestore Database → Rules or Realtime Database → Rules
3. Copy and paste the rules above
4. Click "Publish"

### Using Firebase CLI
```bash
# Initialize Firebase (if not already done)
firebase init

# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Deploy Realtime Database rules only
firebase deploy --only database

# Deploy both
firebase deploy --only firestore:rules,database
```

## Monitoring

- Enable Firebase Audit Logs to monitor security rule violations
- Set up alerts for suspicious activity
- Regularly review access patterns in Firebase Console
