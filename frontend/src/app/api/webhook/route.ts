import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { sendOrderConfirmationEmail } from '@/lib/mailService';

let stripe: Stripe | null = null;
let webhookSecret: string | undefined;

const getStripe = () => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    stripe = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }
  return stripe;
};

const getWebhookSecret = () => {
  if (!webhookSecret) {
    webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }
  }
  return webhookSecret;
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;

  try {
    const stripeInstance = getStripe();
    const secret = getWebhookSecret();
    event = stripeInstance.webhooks.constructEvent(body, sig!, secret);
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
        const firestoreOrderId = metadata.orderId; // Get Firestore order ID from metadata
        
        // Update order status in Firebase
        if (db && firestoreOrderId) {
          try {
            await updateDoc(doc(db, 'orders', firestoreOrderId), {
              status: 'accepted',
              paymentIntentId: paymentIntent.id,
              updatedAt: new Date(),
            });
            console.log('Order updated successfully:', firestoreOrderId);
          } catch (error) {
            console.error('Error updating order in Firebase:', error);
          }
        }
        
        // Send confirmation email
        if (metadata.customerEmail) {
          try {
             await sendOrderConfirmationEmail({
              email: metadata.customerEmail,
              orderId: firestoreOrderId || paymentIntent.id,
              customerName: metadata.customerName || 'Customer',
              total: (paymentIntent.amount / 100).toFixed(2), // Approximate display
              currency: paymentIntent.currency.toUpperCase(),
            });
            console.log('Confirmation email sent for order:', firestoreOrderId);
          } catch (emailError) {
            console.error('Error sending confirmation email from webhook:', emailError);
          }
        }
        
        console.log('Payment succeeded for order:', firestoreOrderId || paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        const failedFirestoreId = failedPaymentIntent.metadata.orderId; // Get Firestore order ID from metadata
        
        // Update order status to failed
        if (db && failedFirestoreId) {
          try {
            await updateDoc(doc(db, 'orders', failedFirestoreId), {
              status: 'declined',
              paymentIntentId: failedPaymentIntent.id,
              updatedAt: new Date(),
            });
            console.log('Order marked as failed:', failedFirestoreId);
          } catch (error) {
            console.error('Error updating failed order:', error);
          }
        }
        
        console.log('Payment failed for order:', failedFirestoreId || failedPaymentIntent.id);
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