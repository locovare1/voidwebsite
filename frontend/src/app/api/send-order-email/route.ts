import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/mailService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, orderId, customerName, total, currency } = body;

    if (!email || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await sendOrderConfirmationEmail({
      email,
      orderId,
      customerName,
      total,
      currency
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending order email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
