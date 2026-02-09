import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Extract order data from metadata
        const metadata = paymentIntent.metadata;
        const orderId = paymentIntent.id;
        
        // Update order status in Firebase
        if (db) {
          try {
            await updateDoc(doc(db, 'orders', orderId), {
              status: 'accepted',
              paymentIntentId: paymentIntent.id,
              updatedAt: new Date(),
            });
            console.log('Order status updated successfully:', orderId);
          } catch (error) {
            console.error('Error updating order in Firebase:', error);
          }
        }
        
        console.log('Payment succeeded for order:', orderId);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        const failedOrderId = failedPaymentIntent.id;
        
        // Update order status to failed
        if (db) {
          try {
            await updateDoc(doc(db, 'orders', failedOrderId), {
              status: 'declined',
              paymentIntentId: failedPaymentIntent.id,
              updatedAt: new Date(),
            });
            console.log('Order marked as failed:', failedOrderId);
          } catch (error) {
            console.error('Error updating failed order:', error);
          }
        }
        
        console.log('Payment failed for order:', failedOrderId);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};