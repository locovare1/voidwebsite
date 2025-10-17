# Teams Data Debugging Guide

## Issue: Changes in Admin Panel Not Reflecting on Teams Page

### What I've Added for Debugging:

1. **Console Logging**: Added detailed logs to track data flow
2. **Refresh Button**: Added a refresh button on teams page (development only)
3. **Auto-refresh**: Teams page now refreshes when you switch back to the tab
4. **Better Error Messages**: More detailed success/error messages

### How to Debug:

1. **Open Browser Console** (F12 → Console tab)
2. **Make changes in Admin Panel**
3. **Check console for logs**:
   - "Updating team: [id] [data]"
   - "Team updated in Firebase, reloading..."
   - "Reloaded teams: [data]"

4. **Go to Teams Page**
5. **Check console for**:
   - "Loading teams from Firebase... [timestamp]"
   - "Loaded teams: X teams found"

### Quick Fixes to Try:

1. **Hard Refresh**: Ctrl+F5 on teams page
2. **Clear Cache**: Browser settings → Clear browsing data
3. **Use Refresh Button**: Click the blue "🔄 Refresh Teams Data" button (dev mode only)
4. **Check Firebase Console**: Go to Firebase console to verify data is actually saved

### Common Issues:

1. **Browser Caching**: Teams page might be cached
2. **Firebase Connection**: Check if Firebase is properly connected
3. **Data Structure**: Verify the data structure matches expected format

### If Still Not Working:

1. Check browser console for any error messages
2. Verify Firebase rules allow read/write
3. Check if you're logged into the correct Firebase project
4. Try logging out and back into admin panel

### Environment Variables Issue:

For Stripe warnings, add this to your `.env.local`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

Or ignore the warning - it won't affect functionality if you're not using Stripe locally.