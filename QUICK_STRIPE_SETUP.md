# 🚀 Quick Stripe Setup - Fix Right Now!

## 🔥 **The Problem**
Your `.env.local` file has placeholder keys, not real Stripe keys!

## ✅ **Quick Fix (2 minutes)**

### 1. **Get Your Stripe Keys**
- Go to: https://dashboard.stripe.com/apikeys
- Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
- Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

### 2. **Update .env.local File**
Replace these lines in your `.env.local`:

```bash
# REPLACE THESE WITH YOUR ACTUAL KEYS:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_actual_publishable_key_here
STRIPE_SECRET_KEY=your_actual_secret_key_here
```

### 3. **Restart Your Dev Server**
```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. **Test Immediately**
- Go to your checkout
- Click "Pay with Stripe"
- Should now show real Stripe form instead of "Test Mode"

## 🎯 **For Production (Vercel)**
Do the same in Vercel Dashboard → Settings → Environment Variables

---
**That's it! Your Stripe should work immediately after updating the keys.**