import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const isBrowser = typeof window !== 'undefined';

export const uploadService = {
  async uploadImage(file: File, path: string): Promise<string> {
    if (!isBrowser || !storage) {
      throw new Error('Storage not available');
    }

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${sanitizedName}`;
      const fullPath = `${path}/${filename}`;

      // Upload file
      const storageRef = ref(storage, fullPath);
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
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
  }
};
