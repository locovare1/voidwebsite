# Vercel Stripe Environment Variables Fix Guide

## 🚨 Problem Identified
Your Stripe checkout isn't working in Vercel production because environment variables aren't properly configured or accessible. Here's the complete fix:

## 🔧 Step-by-Step Solution

### 1. **Vercel Environment Variables Setup**

Go to your Vercel dashboard → Your Project → Settings → Environment Variables

Add these **EXACT** variable names:

**For Production:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_your_actual_live_key
STRIPE_SECRET_KEY = sk_live_your_actual_secret_key
NEXT_PUBLIC_SITE_URL = https://voidesports.org
NODE_ENV = production
```

**For Preview/Development:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_your_actual_test_key
STRIPE_SECRET_KEY = sk_test_your_actual_secret_key
NEXT_PUBLIC_SITE_URL = https://voidesports.org
NODE_ENV = development
```

### 2. **Critical Vercel Settings**

**Environment Selection:**
- ✅ Production: Check "Production" 
- ✅ Preview: Check "Preview" 
- ✅ Development: Check "Development"

**Important:** Make sure you select the correct environments for each variable!

### 3. **Common Vercel Issues & Fixes**

#### Issue A: Variables Not Showing
- **Cause:** Variables added after deployment
- **Fix:** Redeploy after adding variables

#### Issue B: NEXT_PUBLIC_ Variables Not Working
- **Cause:** Build-time vs Runtime confusion
- **Fix:** Ensure `NEXT_PUBLIC_` prefix for client-side variables

#### Issue C: Variables Cached
- **Cause:** Vercel caching old environment
- **Fix:** Clear deployment cache and redeploy

### 4. **Verification Steps**

After setting up variables in Vercel:

1. **Trigger New Deployment:**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - OR push a new commit to trigger deployment

2. **Check Build Logs:**
   - Look for environment variable warnings
   - Ensure no "undefined" values in logs

3. **Test in Production:**
   - Visit your live site
   - Try checkout process
   - Check browser console for errors

### 5. **Debug Your Current Setup**

Add this temporary debug endpoint to verify variables are loaded:

```typescript
// src/app/api/debug-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development or with special header
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev) {
    return NextResponse.json({ error: 'Not available in production' });
  }

  return NextResponse.json({
    hasStripePublic: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    stripePublicPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7),
    stripeSecretPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
    nodeEnv: process.env.NODE_ENV,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  });
}
```

Visit `/api/debug-env` to check if variables are loaded.

## 🎯 Most Likely Causes

1. **Missing NEXT_PUBLIC_ prefix** for client-side variables
2. **Wrong environment selection** in Vercel dashboard
3. **Variables added after deployment** (need redeploy)
4. **Cached build** with old environment

## 🚀 Quick Fix Commands

If you have Vercel CLI installed:

```bash
# Set environment variables via CLI
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_SITE_URL

# Redeploy
vercel --prod
```

## ✅ Final Checklist

- [ ] Environment variables added to Vercel dashboard
- [ ] Correct environment scopes selected (Production/Preview/Development)
- [ ] NEXT_PUBLIC_ prefix used for client-side variables
- [ ] New deployment triggered after adding variables
- [ ] Build logs checked for errors
- [ ] Production site tested

## 🔍 Still Not Working?

If variables still don't work after following this guide:

1. **Check Vercel Function Logs:**
   - Go to Functions tab in Vercel dashboard
   - Check logs for your API routes

2. **Verify Variable Names:**
   - Ensure exact spelling (case-sensitive)
   - No extra spaces or characters

3. **Test with Simple Variable:**
   - Add a test variable like `TEST_VAR=hello`
   - Verify it appears in your app

4. **Contact Vercel Support:**
   - If all else fails, Vercel support can check your specific deployment

---

**Remember:** Environment variables in Vercel are case-sensitive and must be redeployed to take effect!