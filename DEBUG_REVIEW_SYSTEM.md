# Debug Review System Issues

## Quick Fix Steps

### 1. Check Firebase Security Rules
The most common issue is Firebase security rules blocking writes. 

**Solution:** Update your Firestore security rules in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `transcend-application-bot`
3. Go to Firestore Database → Rules
4. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reviews/{reviewId} {
      allow read, write: if true;
    }
  }
}
```

5. Click "Publish"

### 2. Test the System
1. Navigate to `/debug` page on your website
2. Click "Test Firebase Connection" - this should work
3. Click "Test Review Service" - this should also work
4. If both work, try submitting a review normally

### 3. Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Try submitting a review
4. Look for error messages - they will be more detailed now

### 4. Common Error Messages & Solutions

**"Permission denied"**
- Solution: Update Firebase security rules (see step 1)

**"Firebase service is currently unavailable"**
- Solution: Check internet connection, try again later

**"Invalid data provided"**
- Solution: Make sure all form fields are filled correctly

**Network errors**
- Solution: Check if Firebase project is active and billing is set up

### 5. Verify Firebase Project
1. Go to Firebase Console
2. Check that the project `transcend-application-bot` exists
3. Verify Firestore is enabled
4. Check if there's a billing account attached (required for external API calls)

### 6. Test with Simple Data
Try submitting a review with:
- Name: "Test User"
- Email: "test@example.com" 
- Rating: 5 stars
- Comment: "This is a test review to check if the system works"

## Advanced Debugging

### Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try submitting a review
4. Look for requests to `firestore.googleapis.com`
5. Check if they return errors (red status codes)

### Firebase Emulator (Optional)
If you want to test locally:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run: `firebase emulators:start --only firestore`
3. Update Firebase config to use emulator

## Files Modified for Better Debugging

1. **Enhanced Error Messages**: `src/lib/reviewService.ts`
2. **Better Validation**: `src/components/ReviewModal.tsx`
3. **Debug Components**: `src/components/FirebaseTest.tsx`
4. **Debug Page**: `src/app/debug/page.tsx`
5. **Permissive Rules**: `firestore.rules`

## Expected Behavior

When working correctly:
1. User fills out review form
2. Clicks "Submit Review"
3. Loading spinner appears
4. Success message shows: "Review submitted successfully!"
5. Modal closes
6. Review appears in the review list immediately

## Contact Support

If none of these steps work:
1. Check Firebase Console for any service outages
2. Verify your Firebase project has proper billing setup
3. Try creating a new test document directly in Firebase Console
4. Check if your domain is whitelisted in Firebase project settings