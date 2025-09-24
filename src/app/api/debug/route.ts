import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// GET /api/debug - Debug endpoint for checking system status
export async function GET() {
  try {
    // Check Firebase connection
    let firebaseStatus = 'unknown';
    let documentCount = 0;
    
    if (db) {
      try {
        const testQuery = collection(db, 'reviews');
        const snapshot = await getDocs(testQuery);
        documentCount = snapshot.size;
        firebaseStatus = 'connected';
      } catch (error) {
        firebaseStatus = `error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    } else {
      firebaseStatus = 'not initialized';
    }
    
    // System info
    const systemInfo = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
    };
    
    // Environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      nextPublicStripeKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
      stripeSecretKey: process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET',
    };
    
    return NextResponse.json({
      status: 'success',
      message: 'Debug endpoint is working',
      system: systemInfo,
      environment: envInfo,
      firebase: {
        status: firebaseStatus,
        documentCount: documentCount,
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Debug endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// POST /api/debug - Test endpoint for submitting debug information
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log the debug information
    console.log('[API Debug] Received debug information:', body);
    
    return NextResponse.json({
      status: 'success',
      message: 'Debug information received',
      receivedAt: new Date().toISOString(),
      data: body,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to process debug information',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}