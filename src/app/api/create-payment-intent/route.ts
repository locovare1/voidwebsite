import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', metadata } = await request.json();

    // Check if Stripe secret key is properly configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe secret key is not configured. Please add STRIPE_SECRET_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    if (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_')) {
      return NextResponse.json(
        { error: 'Invalid Stripe secret key format. Must start with sk_test_ or sk_live_.' },
        { status: 500 }
      );
    }

    console.log('✅ Stripe configured successfully with key:', stripeSecretKey.substring(0, 12) + '...');
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
      typescript: true,
    });

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ Payment intent created successfully:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid API Key')) {
        return NextResponse.json(
          { error: 'Invalid Stripe API key. Please check your configuration.' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create payment intent. Please try again.' },
      { status: 500 }
    );
  }
}