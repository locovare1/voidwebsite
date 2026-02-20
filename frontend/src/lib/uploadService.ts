import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const isBrowser = typeof window !== 'undefined';

export const uploadService = {
  async uploadImage(file: File, path: string): Promise<string> {
    if (!isBrowser) {
      throw new Error('Upload is only available in the browser');
    }

    // Validate file size (3GB limit)
    const maxSize = 3 * 1024 * 1024 * 1024; // 3GB
    if (file.size > maxSize) {
      const fileSizeGB = (file.size / 1024 / 1024 / 1024).toFixed(2);
      throw new Error(`File is too large. Maximum size is 3GB. Your file is ${fileSizeGB}GB.`);
    }

    // Try server-side upload first (bypasses auth issues)
    try {
      console.log('Attempting server-side upload via API route...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          console.log('Server-side upload successful:', data.url);
          return data.url;
        }
      } else {
        // If service unavailable (503), it means Admin SDK isn't configured - that's okay, fall through
        // For other errors, also fall through to client-side
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (response.status === 503) {
          console.log('Server-side upload not configured, trying client-side upload...');
        } else {
          console.warn('Server-side upload failed, trying client-side:', errorData.error);
        }
        // Fall through to client-side upload
      }
    } catch (apiError) {
      // Network errors, etc. - fall through to client-side
      console.warn('API route upload failed, trying client-side upload:', apiError);
      // Fall through to client-side upload
    }

    // Fallback to client-side upload
    if (!storage) {
      throw new Error('Firebase Storage is not initialized and server-side upload failed. Please refresh the page or configure the server-side upload API.');
    }

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${sanitizedName}`;
      const fullPath = `${path}/${filename}`;

      console.log('Uploading to path:', fullPath, 'File size:', file.size, 'bytes');

      // Upload file with timeout (dynamic based on file size)
      const storageRef = ref(storage, fullPath);
      
      // Calculate timeout based on file size (minimum 30s, add 0.5s per MB for large files)
      // For 3GB files, this gives about 25 minutes which should be sufficient
      const uploadTimeout = Math.max(30000, 30000 + (file.size / 1024 / 1024) * 500);
      
      console.log('Upload timeout set to:', uploadTimeout / 1000, 'seconds');
      
      // Upload file with timeout handling
      let timeoutHandle: NodeJS.Timeout | null = null;
      let timeoutRejected = false;
      
      try {
        const uploadPromise = uploadBytes(storageRef, file);
        
        // Set up timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutHandle = setTimeout(() => {
            timeoutRejected = true;
            reject(new Error('Upload timeout - the file may be too large or there is a network issue'));
          }, uploadTimeout);
        });
        
        // Wait for either upload or timeout
        await Promise.race([uploadPromise, timeoutPromise]);
        
        // Clear timeout if upload succeeded
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
      } catch (uploadError: any) {
        // Clear timeout if it was set
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
        
        console.error('Upload error caught:', uploadError);
        console.error('Error type:', typeof uploadError);
        console.error('Error constructor:', uploadError?.constructor?.name);
        console.error('Error keys:', Object.keys(uploadError || {}));
        
        // Try to extract all error properties
        const errorDetails: any = {
          message: uploadError?.message || String(uploadError),
          name: uploadError?.name,
          code: uploadError?.code,
          serverResponse: uploadError?.serverResponse,
          stack: uploadError?.stack
        };
        
        // Try to get all properties (including non-enumerable)
        if (uploadError) {
          try {
            errorDetails.allProperties = Object.getOwnPropertyNames(uploadError);
            errorDetails.toString = uploadError.toString();
          } catch (e) {
            console.error('Error extracting properties:', e);
          }
        }
        
        console.error('Full error details:', errorDetails);
        
        // Check if it's a timeout or other error
        if (timeoutRejected || (uploadError instanceof Error && uploadError.message.includes('timeout'))) {
          throw uploadError;
        }
        throw uploadError;
      }

      console.log('File uploaded successfully, getting download URL...');

      // Get download URL with timeout
      const downloadURL = await Promise.race([
        getDownloadURL(storageRef),
        new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('Failed to get download URL')), 15000)
        )
      ]);
      
      console.log('Download URL obtained:', downloadURL);
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading image (outer catch):', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      
      // Extract all possible error information
      const errorInfo: any = {
        message: error?.message || String(error),
        name: error?.name,
        code: error?.code,
        serverResponse: error?.serverResponse,
        stack: error?.stack,
        toString: error?.toString?.()
      };
      
      // Try to get all properties
      if (error) {
        try {
          errorInfo.allProperties = Object.getOwnPropertyNames(error);
          // Try to get prototype properties too
          if (error.constructor && error.constructor.prototype) {
            errorInfo.prototypeProperties = Object.getOwnPropertyNames(error.constructor.prototype);
          }
        } catch (e) {
          console.error('Error extracting error properties:', e);
        }
      }
      
      console.error('Complete error information:', errorInfo);
      console.error('Raw error object:', error);
      
      // Provide more specific error messages
      const errorMsg = (error?.message || String(error) || '').toLowerCase();
      const errorCode = error?.code;
      
      // Check Firebase Storage error codes
      if (errorCode === 'storage/unauthorized' || errorCode === 'storage/permission-denied' || 
          errorMsg.includes('permission') || errorMsg.includes('unauthorized') || errorMsg.includes('403')) {
        throw new Error('Permission denied. File upload failed due to authentication issues.\n\n💡 Tip: Use the URL input field instead! Upload your image to a service like Imgur (imgur.com) and paste the direct image URL.');
      } else if (errorCode === 'storage/quota-exceeded' || errorMsg.includes('quota')) {
        throw new Error('Storage quota exceeded. Please contact the administrator.\n\n💡 Tip: Use the URL input field with an external image hosting service.');
      } else if (errorCode === 'storage/network-request-failed' || errorCode === 'storage/retry-limit-exceeded' ||
                 errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('failed to fetch') ||
                 errorMsg.includes('network request failed') || errorMsg.includes('cors')) {
        throw new Error('Network error. File upload failed.\n\n💡 Tip: Use the URL input field instead! Upload your image to Imgur (imgur.com) or another image host and paste the URL.');
      } else if (errorMsg.includes('timeout')) {
        throw new Error('Upload timed out. The file may be too large.\n\n💡 Tip: Use the URL input field with an external image hosting service for large files.');
      } else if (errorCode) {
        // If we have a Firebase error code, include it in the message
        throw new Error(`Upload failed: ${errorCode} - ${error?.message || 'Unknown error'}\n\n💡 Tip: Use the URL input field as an alternative!`);
      }
      
      // Generic error with helpful tip
      const genericError = error instanceof Error ? error : new Error(String(error));
      throw new Error(`${genericError.message}\n\n💡 Tip: If uploads aren't working, use the URL input field instead! Upload images to Imgur (imgur.com) and paste the direct image URL.`);
    }
  },

  async uploadTeamImage(file: File): Promise<string> {
    return this.uploadImage(file, 'teams');
  },

  async uploadPlayerImage(file: File): Promise<string> {
    return this.uploadImage(file, 'players');
  },

  async uploadNewsImage(file: File): Promise<string> {
    return this.uploadImage(file, 'news');
  },

  async uploadProductImage(file: File): Promise<string> {
    return this.uploadImage(file, 'products');
  },

  async uploadDashboardFile(file: File): Promise<string> {
    return this.uploadImage(file, 'dashboard');
  }
};
