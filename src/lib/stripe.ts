import { loadStripe, Stripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      throw new Error('Stripe publishable key is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables.');
    }
    
    if (!publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_')) {
      throw new Error('Invalid Stripe publishable key format. Must start with pk_test_ or pk_live_.');
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

export default getStripe;