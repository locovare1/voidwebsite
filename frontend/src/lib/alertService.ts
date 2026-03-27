// Critical alert service for payment and order security issues

interface CriticalAlert {
  type: 'PAYMENT_AMOUNT_MISMATCH' | 'ORDER_CREATION_FAILED' | 'SECURITY_VIOLATION';
  paymentIntentId?: string;
  orderId?: string;
  expected?: number;
  actual?: number;
  currency?: string;
  error?: string;
  metadata?: any;
  retryCount?: number;
}

export async function sendCriticalAlert(alert: CriticalAlert) {
  try {
    // Log critical error with maximum detail
    console.error('🚨 CRITICAL ALERT 🚨:', {
      alertType: alert.type,
      timestamp: new Date().toISOString(),
      ...alert
    });

    // Send email notification to admin
    if (process.env.ADMIN_EMAIL) {
      const emailBody = `
CRITICAL PAYMENT SYSTEM ALERT

Type: ${alert.type}
Timestamp: ${new Date().toISOString()}
Payment Intent ID: ${alert.paymentIntentId || 'N/A'}
Order ID: ${alert.orderId || 'N/A'}

${alert.expected !== undefined ? `Expected Amount: ${alert.expected} ${alert.currency || 'USD'}` : ''}
${alert.actual !== undefined ? `Actual Amount: ${alert.actual} ${alert.currency || 'USD'}` : ''}
${alert.error ? `Error: ${alert.error}` : ''}
${alert.retryCount ? `Retry Count: ${alert.retryCount}` : ''}

Metadata: ${JSON.stringify(alert.metadata, null, 2)}

IMMEDIATE ACTION REQUIRED!
      `;

      await fetch('/api/send-admin-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.ADMIN_EMAIL,
          subject: `🚨 CRITICAL: ${alert.type} - ${alert.paymentIntentId || alert.orderId}`,
          body: emailBody
        })
      });
    }

    // Store alert in Firebase for audit trail
    if (typeof window === 'undefined') { // Server-side only
      const { db } = await import('@/lib/firebase');
      if (db) {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'critical_alerts', `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`), {
          ...alert,
          timestamp: new Date(),
          resolved: false
        });
      }
    }
  } catch (error) {
    console.error('Failed to send critical alert:', error);
  }
}
