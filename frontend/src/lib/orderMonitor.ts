import { collection, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface OrderAlert {
  type: 'CRITICAL_PAYMENT_MISMATCH' | 'DUPLICATE_ORDER' | 'ORPHANED_PAYMENT' | 'UNUSUAL_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  orderId?: string;
  paymentIntentId?: string;
  data: any;
  timestamp: Date;
}

export class OrderMonitor {
  private static instance: OrderMonitor;
  private alerts: OrderAlert[] = [];
  private lastCheck: Date | null = null;

  static getInstance(): OrderMonitor {
    if (!OrderMonitor.instance) {
      OrderMonitor.instance = new OrderMonitor();
    }
    return OrderMonitor.instance;
  }

  async checkOrderIntegrity(): Promise<OrderAlert[]> {
    const alerts: OrderAlert[] = [];
    
    if (!db) {
      alerts.push({
        type: 'CRITICAL_PAYMENT_MISMATCH',
        severity: 'CRITICAL',
        message: 'Firebase not connected - cannot monitor orders',
        timestamp: new Date(),
        data: {}
      });
      return alerts;
    }

    try {
      // Get all orders from the last 48 hours
      const twoDaysAgo = new Date();
      twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
      
      const ordersQuery = query(
        collection(db, 'orders'),
        where('createdAt', '>=', Timestamp.fromDate(twoDaysAgo)),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(ordersQuery);
      const orders: any[] = [];
      
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        });
      });

      // CRITICAL: Check for payment amount mismatches
      const paymentMismatches = orders.filter(order => {
        if (!order.paidAmount || !order.total) return false;
        const difference = Math.abs(order.paidAmount - order.total);
        const threshold = order.total * 0.05; // 5% threshold
        return difference > threshold && order.total > 100; // Only flag high-value orders
      });

      paymentMismatches.forEach(order => {
        alerts.push({
          type: 'CRITICAL_PAYMENT_MISMATCH',
          severity: 'CRITICAL',
          message: `Payment amount mismatch: Expected $${order.total}, Paid $${order.paidAmount}`,
          orderId: order.id,
          paymentIntentId: order.paymentIntentId,
          data: {
            expected: order.total,
            paid: order.paidAmount,
            difference: Math.abs(order.paidAmount - order.total),
            currency: order.currency
          },
          timestamp: new Date()
        });
      });

      // Check for duplicate orders (same paymentIntentId)
      const paymentIntentIds = orders.map(o => o.paymentIntentId).filter(Boolean);
      const duplicates = paymentIntentIds.filter((id, index) => paymentIntentIds.indexOf(id) !== index);
      
      duplicates.forEach(paymentIntentId => {
        const duplicateOrders = orders.filter(o => o.paymentIntentId === paymentIntentId);
        alerts.push({
          type: 'DUPLICATE_ORDER',
          severity: 'HIGH',
          message: `Duplicate orders found for payment intent ${paymentIntentId}`,
          paymentIntentId,
          data: {
            orders: duplicateOrders.map(o => ({ id: o.id, total: o.total, status: o.status }))
          },
          timestamp: new Date()
        });
      });

      // Check for orders with unusually low amounts
      const suspiciousLowOrders = orders.filter(order => {
        return order.total > 100 && order.paidAmount && order.paidAmount < 10;
      });

      suspiciousLowOrders.forEach(order => {
        alerts.push({
          type: 'UNUSUAL_ACTIVITY',
          severity: 'HIGH',
          message: `Suspicious payment: Order total $${order.total} but paid $${order.paidAmount}`,
          orderId: order.id,
          paymentIntentId: order.paymentIntentId,
          data: {
            total: order.total,
            paid: order.paidAmount,
            ratio: order.paidAmount / order.total
          },
          timestamp: new Date()
        });
      });

      // Check for orders that keep getting updated (potential stuck orders)
      const recentOrders = orders.filter(order => {
        const updatedAt = order.updatedAt?.toDate?.() || order.createdAt;
        const hoursSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceUpdate < 2 && order.updatedAt;
      });

      const frequentlyUpdatedOrders = recentOrders.filter(order => {
        // This would need update count tracking in the actual order document
        return order.updateCount && order.updateCount > 5;
      });

      frequentlyUpdatedOrders.forEach(order => {
        alerts.push({
          type: 'UNUSUAL_ACTIVITY',
          severity: 'MEDIUM',
          message: `Order ${order.id} has been updated ${order.updateCount} times recently`,
          orderId: order.id,
          data: {
            updateCount: order.updateCount,
            lastUpdate: order.updatedAt?.toDate?.() || order.createdAt
          },
          timestamp: new Date()
        });
      });

    } catch (error) {
      alerts.push({
        type: 'CRITICAL_PAYMENT_MISMATCH',
        severity: 'CRITICAL',
        message: `Order monitoring failed: ${error.message}`,
        timestamp: new Date(),
        data: { error: error.message }
      });
    }

    this.alerts = alerts;
    this.lastCheck = new Date();
    return alerts;
  }

  getAlerts(): OrderAlert[] {
    return this.alerts;
  }

  getCriticalAlerts(): OrderAlert[] {
    return this.alerts.filter(alert => alert.severity === 'CRITICAL');
  }

  getLastCheck(): Date | null {
    return this.lastCheck;
  }

  async generateReport(): Promise<string> {
    const alerts = await this.checkOrderIntegrity();
    
    if (alerts.length === 0) {
      return `✅ Order System Health Check - ${new Date().toISOString()}\n\nNo issues detected. All systems operating normally.`;
    }

    let report = `🚨 ORDER SYSTEM ALERT - ${new Date().toISOString()}\n\n`;
    
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
    const highAlerts = alerts.filter(a => a.severity === 'HIGH');
    const mediumAlerts = alerts.filter(a => a.severity === 'MEDIUM');
    const lowAlerts = alerts.filter(a => a.severity === 'LOW');

    if (criticalAlerts.length > 0) {
      report += `🔴 CRITICAL ISSUES (${criticalAlerts.length}):\n`;
      criticalAlerts.forEach(alert => {
        report += `  - ${alert.message}\n`;
        if (alert.orderId) report += `    Order ID: ${alert.orderId}\n`;
        if (alert.paymentIntentId) report += `    Payment Intent: ${alert.paymentIntentId}\n`;
      });
      report += '\n';
    }

    if (highAlerts.length > 0) {
      report += `🟠 HIGH PRIORITY (${highAlerts.length}):\n`;
      highAlerts.forEach(alert => {
        report += `  - ${alert.message}\n`;
      });
      report += '\n';
    }

    if (mediumAlerts.length > 0) {
      report += `🟡 MEDIUM PRIORITY (${mediumAlerts.length}):\n`;
      mediumAlerts.forEach(alert => {
        report += `  - ${alert.message}\n`;
      });
      report += '\n';
    }

    if (lowAlerts.length > 0) {
      report += `🟢 LOW PRIORITY (${lowAlerts.length}):\n`;
      lowAlerts.forEach(alert => {
        report += `  - ${alert.message}\n`;
      });
    }

    report += `\n📊 SUMMARY:\n`;
    report += `  Total Alerts: ${alerts.length}\n`;
    report += `  Critical: ${criticalAlerts.length}\n`;
    report += `  High: ${highAlerts.length}\n`;
    report += `  Medium: ${mediumAlerts.length}\n`;
    report += `  Low: ${lowAlerts.length}\n`;

    return report;
  }
}

export default OrderMonitor.getInstance();
