# Stripe Setup for Production (voidesports.org)

## Environment Variables Required

For the Stripe payment system to work correctly in production, you need to set the following environment variables:

### 1. Stripe Publishable Key (Frontend)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXX
```

### 2. Stripe Secret Key (Backend)
```
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXXXXXX
```

## Deployment Configuration

When deploying to Vercel or any other hosting platform, make sure to:

1. Add these environment variables in your hosting platform's settings
2. Ensure the keys are for the LIVE mode, not test mode
3. Verify that your Stripe account is properly configured for production

## Domain Configuration

The payment system is now configured to work with your production domain `voidesports.org`. The return URLs for Stripe payments will automatically use:
- `https://voidesports.org/payment-success` for successful payments
- `https://voidesports.org/cart` for cancelled payments

## Testing in Production

After deployment:
1. Test a small purchase to ensure payments work correctly
2. Verify that order data is saved to Firebase
3. Check that email confirmations are sent properly

## Troubleshooting

If payments don't work in production:
1. Double-check that you're using LIVE keys, not TEST keys
2. Ensure your Stripe account is activated for live payments
3. Check the browser console for any JavaScript errors
4. Verify that the environment variables are correctly set in your hosting platform