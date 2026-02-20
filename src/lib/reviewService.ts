import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  doc,
  updateDoc,
  increment,
  deleteDoc,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { FirebaseError } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Debug logging utility
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ReviewService] ${message}`, data || '');
  }
};

export interface Review {
  id?: string;
  productId: number;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
  helpful: number;
  verified: boolean;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Type for review data when storing in Firestore (without id)
type ReviewData = Omit<Review, 'id'>;

const REVIEWS_COLLECTION = 'reviews';

export const reviewService = {
  // Add a new review
  async addReview(review: Omit<Review, 'id' | 'createdAt' | 'helpful' | 'verified'>): Promise<string> {
    // Skip if not in browser or db not available
    if (!isBrowser || !db) {
      debugLog('Skipping review addition - not in browser or db not available');
      return 'mock-id';
    }
    
    try {
      debugLog('Attempting to add review:', review);
      
      const reviewData: ReviewData = {
        ...review,
        createdAt: Timestamp.now(),
        helpful: 0,
        verified: false
      };
      
      debugLog('Review data to be saved:', reviewData);
      
      const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), reviewData);
      debugLog('Review added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error: unknown) {
      debugLog('Detailed error adding review:', error);

      const firebaseError = error as FirebaseError;
      debugLog('Error code:', firebaseError?.code);
      debugLog('Error message:', firebaseError?.message);

      // Provide more specific error messages
      if (firebaseError?.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firebase security rules.');
      } else if (firebaseError?.code === 'unavailable') {
        throw new Error('Firebase service is currently unavailable. Please try again later.');
      } else if (firebaseError?.code === 'invalid-argument') {
        throw new Error('Invalid data provided. Please check your input.');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to add review: ${errorMessage}`);
      }
    }
  },

  // Get reviews for a specific product
  async getProductReviews(productId: number): Promise<Review[]> {
    // Return empty array if not in browser or db not available
    if (!isBrowser || !db) {
      debugLog('Returning empty reviews - not in browser or db not available');
      return [];
    }
    
    try {
      debugLog(`Fetching reviews for product ID: ${productId}`);
      
      // First get all reviews for the product without orderBy to avoid index requirement
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('productId', '==', productId)
      );

      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as ReviewData;
        reviews.push({
          id: doc.id,
          ...data
        });
      });

      debugLog(`Found ${reviews.length} reviews for product ${productId}`);
      
      // Sort the reviews by createdAt in memory
      const sortedReviews = reviews.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      
      debugLog(`Sorted reviews for product ${productId}`);
      return sortedReviews;
    } catch (error) {
      debugLog('Error fetching reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  },

  // Get review statistics for a product
  async getReviewStats(productId: number): Promise<ReviewStats> {
    // Return mock data if not in browser or db not available
    if (!isBrowser || !db) {
      debugLog('Returning mock review stats - not in browser or db not available');
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        }
      };
    }
    
    try {
      debugLog(`Fetching review stats for product ID: ${productId}`);
      const reviews = await this.getProductReviews(productId);
      
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;
      
      const ratingDistribution = {
        1: reviews.filter(r => r.rating === 1).length,
        2: reviews.filter(r => r.rating === 2).length,
        3: reviews.filter(r => r.rating === 3).length,
        4: reviews.filter(r => r.rating === 4).length,
        5: reviews.filter(r => r.rating === 5).length,
      };
      
      const stats = {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution
      };
      
      debugLog(`Review stats for product ${productId}:`, stats);
      return stats;
    } catch (error) {
      debugLog('Error fetching review stats:', error);
      throw new Error('Failed to fetch review statistics');
    }
  },

  // Mark a review as helpful
  async markReviewHelpful(reviewId: string): Promise<void> {
    // Skip if not in browser or db not available
    if (!isBrowser || !db) {
      debugLog('Skipping mark helpful - not in browser or db not available');
      return;
    }
    
    try {
      debugLog(`Marking review ${reviewId} as helpful`);
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      await updateDoc(reviewRef, {
        helpful: increment(1)
      });
      debugLog(`Review ${reviewId} marked as helpful successfully`);
    } catch (error) {
      debugLog('Error marking review as helpful:', error);
      throw new Error('Failed to mark review as helpful');
    }
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    // Skip if not in browser or db not available
    if (!isBrowser || !db) {
      debugLog('Skipping review deletion - not in browser or db not available');
      return;
    }
    
    try {
      debugLog(`Deleting review with ID: ${reviewId}`);
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      await deleteDoc(reviewRef);
      debugLog('Review deleted successfully:', reviewId);
    } catch (error: unknown) {
      debugLog('Error deleting review:', error);
      const firebaseError = error as FirebaseError;
      if (firebaseError?.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firebase security rules.');
      } else if (firebaseError?.code === 'not-found') {
        throw new Error('Review not found.');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to delete review: ${errorMessage}`);
      }
    }
  },

  // Get all reviews (for admin purposes)
  async getAllReviews(): Promise<Review[]> {
    // Return empty array if not in browser or db not available
    if (!isBrowser || !db) {
      debugLog('Returning empty reviews list - not in browser or db not available');
      return [];
    }
    
    try {
      debugLog('Fetching all reviews');
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as ReviewData;
        reviews.push({
          id: doc.id,
          ...data
        });
      });

      debugLog(`Found ${reviews.length} total reviews`);
      return reviews;
    } catch (error: unknown) {
      debugLog('Error fetching all reviews:', error);
      const firebaseError = error as FirebaseError;
      if (firebaseError?.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firebase security rules.');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to fetch all reviews: ${errorMessage}`);
      }
    }
  },
  
  // Debug method to check Firebase connection
  async debugConnection(): Promise<{ status: string; details: any }> {
    if (!isBrowser || !db) {
      return { 
        status: 'error', 
        details: { message: 'Firebase not initialized or not in browser environment' } 
      };
    }
    
    try {
      debugLog('Testing Firebase connection');
      const testQuery = query(collection(db, REVIEWS_COLLECTION));
      const snapshot = await getDocs(testQuery);
      
      return { 
        status: 'success', 
        details: { 
          message: 'Firebase connection successful', 
          documentCount: snapshot.size,
          collection: REVIEWS_COLLECTION
        } 
      };
    } catch (error) {
      debugLog('Firebase connection test failed:', error);
      return { 
        status: 'error', 
        details: { 
          message: 'Firebase connection failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        } 
      };
    }
  }
};