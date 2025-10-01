# 🚀 Quick Migration Instructions

## Run this ONCE to move all your data to Firestore:

```bash
node src/scripts/migrateData.mjs
```

## That's it! ✨

After running this command:
- All your news articles will be in Firestore
- All your teams and players will be in Firestore  
- All your products will be in Firestore
- All your matches and events will be in Firestore

## What happens next?

1. Your website will load data from Firestore instead of hardcoded arrays
2. When you add new items in the admin panel, old items will stay
3. Everything persists - no more data disappearing!

## Verify it worked

1. Go to `/adminpanel`
2. Check all sections have your data
3. Try adding a new item - old items should still be there!

## Product Reviews

Reviews are already product-specific! Each review is linked to its product via `productId`. You can see product-specific reviews at `/reviews/[productId]`.

---

**Need help?** Check `MIGRATION_README.md` for detailed instructions.
