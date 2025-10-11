import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
  });
}

export async function POST() {
  return NextResponse.json({
    message: 'Webhook endpoint is ready to receive Stripe events',
    timestamp: new Date().toISOString(),
  });
}