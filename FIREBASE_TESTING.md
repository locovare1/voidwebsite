# Firebase Integration Test Guide

This guide explains how to test the Firebase integration in the admin panel.

## Testing Firebase Operations

1. Navigate to `/adminpanel/test-firebase` in your browser
2. Click the "Run Firebase Test" button
3. The test will perform the following operations:
   - Create a test document in Firebase
   - Read documents from Firebase
   - Update the test document
   - Delete the test document

## Expected Results

If Firebase is properly configured, you should see:
```
✅ All Firebase operations completed successfully!
```

## Troubleshooting

### Common Issues

1. **"Firebase not initialized"**
   - Make sure you're running in a browser environment
   - Check that Firebase config in `src/lib/firebase.ts` is correct

2. **Permission denied errors**
   - Check Firebase security rules in the Firebase Console
   - Make sure your Firebase project has proper permissions set

3. **Network errors**
   - Check your internet connection
   - Verify Firebase services are accessible

### Checking Browser Console

Open the browser console (F12) to see detailed logs:
- Successful operations will be logged with timestamps
- Errors will show detailed error messages
- Network requests to Firebase will be visible

## Verifying Admin Panel Operations

1. Log in to the admin panel at `/adminpanel`
2. Navigate to the Orders section
3. Try changing an order status - this should update in Firebase
4. Try deleting an order - this should remove it from Firebase
5. Refresh the page to verify changes persist

## Security Rules

Make sure your Firestore security rules allow read/write access for authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /reviews/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /test-collection/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```