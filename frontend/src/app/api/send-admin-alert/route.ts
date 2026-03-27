import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, just log the alert (you can integrate with your email service)
    console.log('ADMIN ALERT EMAIL:', {
      to,
      subject,
      body: body.substring(0, 500) + '...', // Truncate for logging
    });

    // TODO: Integrate with your email service (Resend, SendGrid, etc.)
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'alerts@voidwebsite.com',
    //   to: [to],
    //   subject,
    //   html: `<pre>${body}</pre>`
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending admin alert:', error);
    return NextResponse.json(
      { error: 'Failed to send alert' },
      { status: 500 }
    );
  }
}
