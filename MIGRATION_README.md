# Data Migration Guide

## Overview
This guide will help you migrate all hardcoded data to Firestore so your website loads data dynamically.

## Prerequisites
- Node.js installed
- Firebase project configured
- Internet connection

## Migration Steps

### 1. Install ts-node (if not already installed)
```bash
npm install -D ts-node
```

### 2. Run the migration script
```bash
npx ts-node src/scripts/migrateData.ts
```

### 3. Verify the migration
After running the script, you should see output like:
```
🚀 Starting data migration...

📰 Migrating news articles...
  ✅ Added: Void Announces 1v1 Map Challenge Giveaway
  ✅ Added: Void Announces Fortnite Battle Pass Giveaway
  ...

👥 Migrating teams...
  ✅ Added: Fortnite
  ✅ Added: Ownership

🛍️  Migrating products...
  ✅ Added: FREE Test Product
  ✅ Added: VOID Esports Premium Jersey
  ...

⚔️  Migrating matches...
  ✅ Added: TBD vs TBD

🎉 Migrating events...
  ✅ Added: Void Summer Showdown

✨ Migration completed successfully!
```

### 4. Check Firestore Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `transcend-application-bot`
3. Navigate to Firestore Database
4. Verify the following collections exist with data:
   - `newsArticles` (8 documents)
   - `teams` (2 documents)
   - `products` (5+ documents)
   - `matches` (1 document)
   - `events` (1 document)

### 5. Test Your Website
1. Visit your admin panel at `/adminpanel`
2. Check that all sections show the migrated data:
   - Teams & Roster
   - News Articles
   - Shop Products
   - Schedule Management (Matches & Events)

3. Visit public pages:
   - `/teams` - Should show Fortnite and Ownership teams
   - `/news` - Should show all news articles
   - `/shop` - Should show all products
   - `/schedule` - Should show matches and events

## What Changed

### Before Migration
- Data was hardcoded in component files
- Adding new items would hide old hardcoded data
- No persistence between sessions

### After Migration
- All data stored in Firestore
- Adding new items keeps existing data
- Data persists across sessions
- Easy to manage via Admin Panel

## Managing Data

### Adding New Items
Use the Admin Panel at `/adminpanel`:
- **News**: Click "New Article" in News Articles section
- **Teams**: Click "New Team" in Teams & Roster section
- **Products**: Click "New Product" in Shop Products section
- **Matches**: Click "New Match" in Schedule Management
- **Events**: Click "New Event" in Schedule Management

### Editing Items
Click the "Edit" button next to any item in the admin panel

### Deleting Items
Click the "Delete" button next to any item (confirmation required)

### Image Uploads
All sections support uploading images from your PC:
- Click the "Upload" button next to image URL fields
- Select an image file
- Image will be uploaded to Firebase Storage
- URL will auto-populate

## Product Reviews
Reviews are now product-specific:
- Each review is linked to a specific product via `productId`
- Reviews display on the product's review page: `/reviews/[productId]`
- Manage all reviews in the Admin Panel under "Reviews" section

## Troubleshooting

### Migration fails with "Permission denied"
- Check your Firestore security rules
- Ensure you're authenticated (if required)

### Data not showing on website
- Clear browser cache
- Check browser console for errors
- Verify Firestore collections have data

### Images not loading
- Ensure Firebase Storage is enabled
- Check Storage security rules
- Verify image URLs are correct

## Support
If you encounter issues, check:
1. Browser console for errors
2. Firebase Console for data
3. Network tab for failed requests
