import { loadStripe, Stripe } from '@stripe/stripe-js';

// Get the publishable key from environment variables
const getStripePublishableKey = (): string => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (!key) {
    console.error('Stripe publishable key is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.');
    return '';
  }
  
  if (!key.startsWith('pk_')) {
    console.error('Invalid Stripe publishable key format. Key should start with "pk_"');
    return '';
  }
  
  return key;
};

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = getStripePublishableKey();
    
    if (!publishableKey) {
      // Return a resolved promise with null if no key is available
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(publishableKey);
    }
  }
  
  return stripePromise;
};

export default getStripe();