import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development or with special debug header
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev) {
    return NextResponse.json({ 
      error: 'Debug endpoint only available in development',
      production: true 
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