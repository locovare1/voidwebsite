import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getStorage, type Storage } from 'firebase-admin/storage';

// Initialize Firebase Admin (server-side only)
let adminApp: App | null = null;
let adminStorage: Storage | null = null;
let adminInitialized = false;
let adminInitError: string | null = null;

// Only try to initialize if we have credentials
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    if (getApps().length === 0) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'transcend-application-bot.firebasestorage.app'
      });
    } else {
      adminApp = getApps()[0];
    }
    adminStorage = getStorage(adminApp);
    adminInitialized = true;
  } catch (error: any) {
    console.error('Firebase Admin initialization error:', error);
    adminInitError = error.message || 'Failed to initialize Firebase Admin';
  }
} else {
  // No credentials provided - server-side upload won't work
  adminInitError = 'FIREBASE_SERVICE_ACCOUNT_KEY not configured';
}

export async function POST(request: NextRequest) {
  try {
    // Check if Admin SDK is available
    if (!adminStorage || !adminInitialized) {
      // Return 503 so client knows to fall back to client-side upload
      return NextResponse.json(
        { 
          error: adminInitError || 'Server-side upload not configured. Please use the URL input field instead, or configure Firebase Admin SDK with FIREBASE_SERVICE_ACCOUNT_KEY environment variable.' 
        },
        { status: 503 } // Service Unavailable - indicates fallback should be used
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (3GB limit)
    const maxSize = 3 * 1024 * 1024 * 1024; // 3GB
    if (file.size > maxSize) {
      const fileSizeGB = (file.size / 1024 / 1024 / 1024).toFixed(2);
      return NextResponse.json(
        { error: `File is too large. Maximum size is 3GB. Your file is ${fileSizeGB}GB.` },
        { status: 400 }
      );
    }

    // Create a unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedName}`;
    const fullPath = `${path}/${filename}`;

    console.log('Server-side upload to path:', fullPath, 'File size:', file.size, 'bytes');

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get bucket reference
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(fullPath);

    // Upload file
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type || 'application/octet-stream',
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly readable
    await fileRef.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fullPath}`;

    console.log('Server-side upload successful, URL:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: fullPath
    });
  } catch (error: any) {
    console.error('Server-side upload error:', error);
    
    // Check if it's a credentials/auth error - return 503 so client falls back
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes('credentials') || errorMsg.includes('authentication') || 
        errorMsg.includes('Could not load the default credentials')) {
      return NextResponse.json(
        { 
          error: 'Server-side upload not configured. Please use the URL input field or configure Firebase Admin SDK credentials.' 
        },
        { status: 503 } // Service Unavailable - indicates fallback should be used
      );
    }
    
    let errorMessage = 'Upload failed';
    if (error.message) {
      errorMessage = error.message;
    }

    // For other errors, return 500 but client will still try to fall back
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

