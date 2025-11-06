import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', metadata } = await request.json();

    // Check if Stripe secret key is properly configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    // Debug logging for environment variables
    console.log('🔍 Environment check:', {
      hasSecretKey: !!stripeSecretKey,
      keyPrefix: stripeSecretKey?.substring(0, 7) || 'missing',
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
    
    if (!stripeSecretKey || stripeSecretKey === 'sk_test_51234567890abcdef') {
      // Return a mock client secret for development/testing
      console.log('⚠️ Using mock payment intent - Stripe secret key not configured or using placeholder');
      console.log('📝 Add STRIPE_SECRET_KEY to your Vercel environment variables');
      return NextResponse.json({
        clientSecret: 'pi_mock_client_secret_for_testing',
        mock: true,
        debug: {
          reason: 'Missing or placeholder Stripe secret key',
          hasKey: !!stripeSecretKey,
          keyPrefix: stripeSecretKey?.substring(0, 7) || 'missing'
        }
      });
    }

    if (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_')) {
      console.error('❌ Invalid Stripe secret key format:', stripeSecretKey.substring(0, 7));
      return NextResponse.json(
        { 
          error: 'Invalid Stripe secret key format. Must start with sk_test_ or sk_live_',
          debug: {
            keyPrefix: stripeSecretKey.substring(0, 7),
            expectedFormat: 'sk_test_* or sk_live_*'
          }
        },
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
      debug: {
        paymentIntentId: paymentIntent.id,
        amount: Math.round(amount * 100),
        currency,
        keyType: stripeSecretKey.startsWith('sk_live_') ? 'live' : 'test'
      }
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