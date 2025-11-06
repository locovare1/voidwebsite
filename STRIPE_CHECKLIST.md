# 🚀 Stripe Production Fix Checklist

## ✅ Immediate Actions Required

### 1. **Verify Local Environment First**
```bash
npm run verify-stripe
```
This will show you exactly what's missing.

### 2. **Add Environment Variables to Vercel**

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these **exact** variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_your_actual_key` | Production |
| `STRIPE_SECRET_KEY` | `sk_live_your_actual_secret` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://voidesports.org` | Production |

**⚠️ Important:** 
- Use your **LIVE** keys for production (pk_live_* and sk_live_*)
- Use your **TEST** keys for preview/development (pk_test_* and sk_test_*)

### 3. **Redeploy After Adding Variables**
- Go to **Deployments** tab in Vercel
- Click **"Redeploy"** on your latest deployment
- OR push a new commit to trigger deployment

### 4. **Test Your Fix**

**Local Testing:**
```bash
npm run verify-stripe
```

**Production Testing:**
1. Visit your live site
2. Try to make a purchase
3. Check browser console for errors
4. Check Vercel function logs

## 🔍 Debug Tools Added

### Debug API Endpoint (Development Only)
Visit: `https://your-site.com/api/debug-env`
- Shows if environment variables are loaded
- Only works in development mode

### Enhanced Logging
Your Stripe API now logs detailed information:
- ✅ Success messages when Stripe is configured
- ⚠️ Warnings when using mock payments
- ❌ Error details when configuration fails

## 🚨 Common Issues & Solutions

### Issue: "Variables not showing in production"
**Solution:** Redeploy after adding variables to Vercel

### Issue: "Still using mock payments"
**Solution:** Check that you're using real Stripe keys, not placeholders

### Issue: "Invalid key format error"
**Solution:** Ensure keys start with `pk_live_` or `sk_live_` for production

### Issue: "Key type mismatch"
**Solution:** Both keys must be same type (both live OR both test)

## 📞 Need Help?

1. **Run verification script:** `npm run verify-stripe`
2. **Check Vercel function logs** in your dashboard
3. **Look at browser console** for client-side errors
4. **Check the fix guide:** `VERCEL_STRIPE_FIX.md`

## 🎯 Expected Results

**Before Fix:**
- Checkout shows "Test Mode" 
- Mock payments only
- No real Stripe processing

**After Fix:**
- Real Stripe checkout form
- Actual payment processing
- Production-ready payments

---

**Next Step:** Run `npm run verify-stripe` to see exactly what needs to be fixed!