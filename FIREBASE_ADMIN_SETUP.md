# Firebase Admin Authentication Setup

This guide will help you set up proper admin authentication for the admin panel using Firebase Authentication.

## Prerequisites

1. Firebase Project (already configured)
2. Access to Firebase Console

## Setup Steps

### 1. Enable Email/Password Authentication

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `transcend-application-bot`
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Email/Password** provider
5. Save the changes

### 2. Create Admin User

1. In the Firebase Console, go to **Authentication** > **Users**
2. Click **Add user**
3. Enter an email and password for your admin account
4. Click **Add user**

Example:
- Email: `admin@voidesports.com`
- Password: `SecurePassword123!`

### 3. Optional: Set up Custom Claims for Admin Role

For better security, you can set up custom claims to identify admin users:

1. Install Firebase CLI tools if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Create a script to set custom claims:
   ```javascript
   // set-admin-claims.js
   const admin = require('firebase-admin');
   
   // Initialize the Admin SDK
   admin.initializeApp({
     // Your service account credentials
   });
   
   const uid = 'USER_UID'; // Replace with actual user UID
   
   admin.auth().setCustomUserClaims(uid, { admin: true })
     .then(() => {
       console.log('Custom claims set for user:', uid);
     })
     .catch(error => {
       console.log('Error setting custom claims:', error);
     });
   ```

3. Run the script:
   ```bash
   node set-admin-claims.js
   ```

### 4. Enhanced Security Rules (Optional)

Update your Firestore security rules to restrict admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users for reviews
    match /reviews/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Restrict orders collection to admin users only
    match /orders/{document} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## Testing the Setup

1. Navigate to your admin panel: `/adminpanel`
2. Enter the admin credentials you created
3. You should be successfully logged in to the admin dashboard

## Troubleshooting

### Common Issues

1. **"Firebase Auth not initialized"**
   - Make sure you're running the app in a browser environment
   - Check that Firebase config is correct in `src/lib/firebase.ts`

2. **"Invalid credentials"**
   - Double-check email and password
   - Ensure the user exists in Firebase Authentication

3. **"PERMISSION_DENIED"**
   - Check Firestore security rules
   - Ensure the user has proper permissions

### Need Help?

If you encounter any issues:
1. Check browser console for detailed error messages
2. Verify Firebase project settings
3. Ensure billing is enabled for your Firebase project