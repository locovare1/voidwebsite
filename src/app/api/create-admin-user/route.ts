import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!auth) {
      return NextResponse.json(
        { error: 'Firebase Auth not initialized' },
        { status: 500 }
      );
    }

    // Create the user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    return NextResponse.json({
      success: true,
      message: `User ${email} created successfully`,
      uid: userCredential.user.uid
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    let errorMessage = 'Failed to create user';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}


