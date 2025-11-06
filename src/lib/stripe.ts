import { loadStripe, Stripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey || publishableKey === 'pk_test_51234567890abcdef') {
      // Only show warning when actually trying to use Stripe (not during build)
      if (typeof window !== 'undefined') {
        console.warn('🔧 Stripe publishable key is not configured or using placeholder. Stripe functionality will be disabled.');
        console.warn('📝 Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables');
        console.warn('🌐 In Vercel: Dashboard → Project → Settings → Environment Variables');
      }
      stripePromise = Promise.resolve(null);
    } else if (!publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_')) {
      // Invalid key format
      if (typeof window !== 'undefined') {
        console.error('❌ Invalid Stripe publishable key format. Must start with pk_test_ or pk_live_');
      }
      stripePromise = Promise.resolve(null);
    } else {
      // Valid key, load Stripe
      if (typeof window !== 'undefined') {
        console.log('✅ Stripe configured with key:', publishableKey.substring(0, 12) + '...');
      }
      stripePromise = loadStripe(publishableKey);
    }
  }
  
  return stripePromise;
};

export default getStripe;