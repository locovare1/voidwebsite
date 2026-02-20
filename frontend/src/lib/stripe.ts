import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;
let stripeInstance: Stripe | null = null;

const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Stripe publishable key not found in environment');
      stripePromise = Promise.resolve(null);
    } else {
      console.log('Loading Stripe with publishable key:', publishableKey.substring(0, 7) + '...');
      stripePromise = loadStripe(publishableKey);
    }
  }
  return stripePromise;
};

// Synchronous method to get the already-loaded stripe instance
export const getStripeSync = async (): Promise<Stripe | null> => {
  const stripe = await getStripe();
  return stripe;
};

export default getStripe;

