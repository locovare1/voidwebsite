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
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { FirebaseError } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

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

const REVIEWS_COLLECTION = 'reviews';

export const reviewService = {
  // Add a new review
  async addReview(review: Omit<Review, 'id' | 'createdAt' | 'helpful' | 'verified'>): Promise<string> {
    // Skip if not in browser or db not available
    if (!isBrowser || !db) {
      console.log('Skipping review addition - not in browser or db not available');
      return 'mock-id';
    }
    
    try {
      console.log('Attempting to add review:', review);
      
      const reviewData = {
        ...review,
        createdAt: Timestamp.now(),
        helpful: 0,
        verified: false
      };
      
      console.log('Review data to be saved:', reviewData);
      
      const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), reviewData);
      console.log('Review added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error: unknown) {
      console.error('Detailed error adding review:', error);

      const firebaseError = error as FirebaseError;
      console.error('Error code:', firebaseError?.code);
      console.error('Error message:', firebaseError?.message);

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
      console.log('Returning empty reviews - not in browser or db not available');
      return [];
    }
    
    try {
      // First get all reviews for the product without orderBy to avoid index requirement
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('productId', '==', productId)
      );

      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];

      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data()
        } as Review);
      });

      // Sort the reviews by createdAt in memory
      return reviews.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  },

  // Get review statistics for a product
  async getReviewStats(productId: number): Promise<ReviewStats> {
    // Return mock data if not in browser or db not available
    if (!isBrowser || !db) {
      console.log('Returning mock review stats - not in browser or db not available');
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
      
      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw new Error('Failed to fetch review statistics');
    }
  },

  // Mark a review as helpful
  async markReviewHelpful(reviewId: string): Promise<void> {
    // Skip if not in browser or db not available
    if (!isBrowser || !db) {
      console.log('Skipping mark helpful - not in browser or db not available');
      return;
    }
    
    try {
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      await updateDoc(reviewRef, {
        helpful: increment(1)
      });
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw new Error('Failed to mark review as helpful');
    }
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    // Skip if not in browser or db not available
    if (!isBrowser || !db) {
      console.log('Skipping review deletion - not in browser or db not available');
      return;
    }
    
    try {
      const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
      await deleteDoc(reviewRef);
      console.log('Review deleted successfully:', reviewId);
    } catch (error: unknown) {
      console.error('Error deleting review:', error);
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
      console.log('Returning empty reviews list - not in browser or db not available');
      return [];
    }
    
    try {
      const q = query(
        collection(db as Firestore, REVIEWS_COLLECTION),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];

      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data()
        } as Review);
      });

      return reviews;
    } catch (error: unknown) {
      console.error('Error fetching all reviews:', error);
      const firebaseError = error as FirebaseError;
      if (firebaseError?.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firebase security rules.');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to fetch all reviews: ${errorMessage}`);
      }
    }
  }
};