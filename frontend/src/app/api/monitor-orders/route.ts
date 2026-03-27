import { NextRequest, NextResponse } from 'next/server';
import OrderMonitor from '@/lib/orderMonitor';

export async function GET(req: NextRequest) {
  try {
    const monitor = OrderMonitor;
    
    // Check if the request has a secret key for security
    const authHeader = req.headers.get('authorization');
    const secretKey = process.env.ORDER_MONITOR_SECRET || 'default-secret-key';
    
    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized access to order monitoring' },
        { status: 401 }
      );
    }

    const alerts = await monitor.checkOrderIntegrity();
    const report = await monitor.generateReport();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      alerts: alerts,
      criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL'),
      totalAlerts: alerts.length,
      lastCheck: monitor.getLastCheck(),
      report
    });

  } catch (error: any) {
    console.error('Order monitoring API error:', error);
    return NextResponse.json(
      { 
        error: 'Order monitoring failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const monitor = OrderMonitor;
    
    // Check if the request has a secret key for security
    const authHeader = req.headers.get('authorization');
    const secretKey = process.env.ORDER_MONITOR_SECRET || 'default-secret-key';
    
    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized access to order monitoring' },
        { status: 401 }
      );
    }

    // Force immediate check
    const alerts = await monitor.checkOrderIntegrity();
    const report = await monitor.generateReport();
    
    // If there are critical alerts, send notifications
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
    
    if (criticalAlerts.length > 0) {
      // Here you could add email/SMS notifications
      console.error('CRITICAL ORDER ALERTS DETECTED:', criticalAlerts);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Order monitoring check completed',
      timestamp: new Date().toISOString(),
      alerts,
      criticalAlerts,
      totalAlerts: alerts.length,
      report
    });

  } catch (error: any) {
    console.error('Order monitoring POST error:', error);
    return NextResponse.json(
      { 
        error: 'Order monitoring failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
