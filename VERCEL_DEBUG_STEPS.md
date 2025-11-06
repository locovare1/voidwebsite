# 🔍 Debug Your Live Vercel Site

## 🚀 **Step 1: Deploy Debug Endpoint**
I've updated the debug endpoint to work in production. Deploy this change:

```bash
git add .
git commit -m "Add production debug endpoint"
git push
```

## 🔍 **Step 2: Check Your Live Environment**
Once deployed, visit:
```
https://your-site.com/api/debug-env?debug=stripe123
```

This will show you exactly what environment variables Vercel has loaded.

## 🎯 **Step 3: Fix Based on Results**

### If you see "Missing" keys:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add your Stripe keys:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = your actual publishable key
   - `STRIPE_SECRET_KEY` = your actual secret key
3. **Important:** Select "Production" environment
4. Redeploy

### If you see "Placeholder" keys:
Your Vercel environment variables are set to placeholder values. Update them with real keys.

### If you see "Valid" keys:
The issue might be elsewhere - let me know what the debug shows!

## 🔧 **Quick Vercel Fix Commands**

If you have Vercel CLI:
```bash
# Add environment variables
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Enter your actual publishable key when prompted

vercel env add STRIPE_SECRET_KEY  
# Enter your actual secret key when prompted

# Redeploy
vercel --prod
```

## 📱 **What to Look For**

The debug endpoint will show:
- ✅ `hasStripePublic: true` - Good!
- ❌ `hasStripePublic: false` - Missing in Vercel
- ⚠️ `publicKeyPrefix: "pk_test"` - Placeholder value

---

**Next:** Deploy the debug endpoint and check your live site!