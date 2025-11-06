import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Allow debug in production with special query parameter
  const url = new URL(request.url);
  const debugKey = url.searchParams.get('debug');
  const isDev = process.env.NODE_ENV === 'development';
  
  // Only allow if development OR with debug key "stripe123"
  if (!isDev && debugKey !== 'stripe123') {
    return NextResponse.json({ 
      error: 'Debug endpoint requires ?debug=stripe123 in production',
      production: true,
      hint: 'Add ?debug=stripe123 to the URL'
    });
  }

  return NextResponse.json({
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasStripePublic: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
    },
    stripeConfig: {
      publicKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) || 'missing',
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'missing',
      publicKeyLength: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.length || 0,
      secretKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
    },
    siteConfig: {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'missing',
    },
    timestamp: new Date().toISOString(),
  });
}