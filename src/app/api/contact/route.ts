import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to Firestore
    if (db) {
      try {
        await addDoc(collection(db, 'contactMessages'), {
          name,
          email,
          subject,
          message,
          status: 'unread',
          createdAt: Timestamp.now()
        });
      } catch (firestoreError) {
        console.error('Error saving to Firestore:', firestoreError);
        // Continue with email even if Firestore fails
      }
    }

    // Send email (if configured)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: email,
          to: process.env.EMAIL_USER,
          subject: `New contact from ${name}`,
          text: `From: ${name} (${email})\nSubject: ${subject}\n\n${message}`,
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Still return success if Firestore save worked
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Error processing contact form' },
      { status: 500 }
    );
  }
} 