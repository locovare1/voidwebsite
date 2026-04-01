import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({
    message: 'Debug environment endpoint is disabled for security.',
    timestamp: new Date().toISOString(),
  }, { status: 403 });
}