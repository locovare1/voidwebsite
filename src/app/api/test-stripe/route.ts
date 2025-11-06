import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const debugKey = url.searchParams.get('debug');
  
  // Only allow with debug key
  if (debugKey !== 'stripe123') {
    return NextResponse.json({ 
      error: 'Add ?debug=stripe123 to test Stripe configuration' 
    });
  }

  try {
    // Test the same logic as create-payment-intent
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    const result = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      stripe: {
        hasSecretKey: !!stripeSecretKey,
        hasPublicKey: !!stripePublicKey,
        secretKeyPrefix: stripeSecretKey?.substring(0, 7) || 'missing',
        publicKeyPrefix: stripePublicKey?.substring(0, 7) || 'missing',
        secretKeyLength: stripeSecretKey?.length || 0,
        publicKeyLength: stripePublicKey?.length || 0,
        isPlaceholderSecret: stripeSecretKey === 'sk_test_51234567890abcdef',
        isPlaceholderPublic: stripePublicKey === 'pk_test_51234567890abcdef',
        keysValid: !!(
          stripeSecretKey && 
          stripePublicKey && 
          stripeSecretKey !== 'sk_test_51234567890abcdef' &&
          stripePublicKey !== 'pk_test_51234567890abcdef' &&
          (stripeSecretKey.startsWith('sk_test_') || stripeSecretKey.startsWith('sk_live_')) &&
          (stripePublicKey.startsWith('pk_test_') || stripePublicKey.startsWith('pk_live_'))
        )
      },
      wouldUseMock: !stripeSecretKey || 
                    stripeSecretKey === 'sk_test_51234567890abcdef' ||
                    (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_'))
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check Stripe configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}