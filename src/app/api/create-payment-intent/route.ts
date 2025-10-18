import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', metadata } = await request.json();

    // Check if Stripe secret key is properly configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey || stripeSecretKey === 'sk_test_51234567890abcdef') {
      // Return a mock client secret for development/testing
      console.log('⚠️ Using mock payment intent - Stripe not configured');
      return NextResponse.json({
        clientSecret: 'pi_mock_client_secret_for_testing',
        mock: true
      });
    }

    if (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_')) {
      return NextResponse.json(
        { error: 'Invalid Stripe secret key format.' },
        { status: 500 }
      );
    }

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
    
    // Fallback to mock for development
    console.log('⚠️ Stripe error, using mock payment intent');
    return NextResponse.json({
      clientSecret: 'pi_mock_client_secret_for_testing',
      mock: true
    });
  }
}