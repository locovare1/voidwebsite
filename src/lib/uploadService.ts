import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const isBrowser = typeof window !== 'undefined';

export const uploadService = {
  async uploadImage(file: File, path: string): Promise<string> {
    if (!isBrowser) {
      throw new Error('Upload is only available in the browser');
    }
    
    if (!storage) {
      throw new Error('Firebase Storage is not initialized. Please refresh the page.');
    }

    // Validate file size (3GB limit)
    const maxSize = 3 * 1024 * 1024 * 1024; // 3GB
    if (file.size > maxSize) {
      const fileSizeGB = (file.size / 1024 / 1024 / 1024).toFixed(2);
      throw new Error(`File is too large. Maximum size is 3GB. Your file is ${fileSizeGB}GB.`);
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
      
      // Upload file
      let uploadTask: Promise<any>;
      try {
        uploadTask = uploadBytes(storageRef, file);
        
        // Wait for upload with timeout
        await Promise.race([
          uploadTask,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout - the file may be too large or there is a network issue')), uploadTimeout)
          )
        ]);
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        // Check if it's a timeout or other error
        if (uploadError instanceof Error && uploadError.message.includes('timeout')) {
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
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Full error object:', {
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        serverResponse: (error as any)?.serverResponse,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Provide more specific error messages
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        const errorCode = (error as any)?.code;
        
        // Check Firebase Storage error codes
        if (errorCode === 'storage/unauthorized' || errorCode === 'storage/permission-denied' || 
            errorMsg.includes('permission') || errorMsg.includes('unauthorized') || errorMsg.includes('403')) {
          throw new Error('Permission denied. Firebase Storage security rules are blocking the upload. Please configure Storage rules in Firebase Console to allow authenticated users to write to the dashboard folder.');
        } else if (errorCode === 'storage/quota-exceeded' || errorMsg.includes('quota') || errorMsg.includes('storage')) {
          throw new Error('Storage quota exceeded. Please contact the administrator.');
        } else if (errorCode === 'storage/network-request-failed' || errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('failed to fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else if (errorMsg.includes('timeout')) {
          throw error; // Re-throw timeout errors as-is
        }
      }
      
      throw error;
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
