import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeAmount } from '@/lib/currencyService';

let stripe: Stripe | null = null;

const getStripe = () => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    stripe = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }
  return stripe;
};

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const { amount, currency = 'usd', metadata, expectedItems, orderId } = await req.json();

    // CRITICAL: Validate amount with multiple safeguards
    if (!amount || amount <= 0) {
      console.error('CRITICAL: Invalid amount attempt:', amount);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // CRITICAL: Maximum amount limits to prevent catastrophic errors
    const MAX_AMOUNT_USD = 10000; // $10,000 limit
    const amountInUSD = currency.toLowerCase() === 'usd' ? amount : amount / (metadata?.exchangeRate || 1);
    
    if (amountInUSD > MAX_AMOUNT_USD) {
      console.error('CRITICAL: Amount exceeds maximum limit:', { amount, currency, amountInUSD });
      return NextResponse.json(
        { error: 'Amount exceeds maximum limit. Please contact support.' },
        { status: 400 }
      );
    }

    // CRITICAL: Validate expected items if provided
    if (expectedItems && Array.isArray(expectedItems)) {
      const calculatedTotal = expectedItems.reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity * (item.sizeModifier || 1));
      }, 0);
      
      // Allow small variance for currency conversion (5% tolerance)
      const variance = Math.abs(amount - calculatedTotal) / calculatedTotal;
      if (variance > 0.05) {
        console.error('CRITICAL: Amount mismatch detected:', {
          expected: calculatedTotal,
          received: amount,
          variance: (variance * 100).toFixed(2) + '%',
          items: expectedItems
        });
        return NextResponse.json(
          { error: 'Amount validation failed. Please refresh and try again.' },
          { status: 400 }
        );
      }
    }

    // CRITICAL: Enhanced logging for security
    console.log('PAYMENT ATTEMPT:', {
      amount,
      currency,
      orderId,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    });

    // Create Payment Intent with enhanced security
    const stripeInstance = getStripe();
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: getStripeAmount(amount, currency), // Convert to smallest unit (e.g. cents, paise, yen)
      currency,
      metadata: {
        ...metadata,
        orderId: orderId || metadata?.orderId,
        expectedAmount: amount.toString(),
        currency: currency.toUpperCase(),
        timestamp: new Date().toISOString(),
        validated: 'true',
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Add security settings
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
    });

    console.log('PAYMENT INTENT CREATED:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      orderId: orderId || metadata?.orderId
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}