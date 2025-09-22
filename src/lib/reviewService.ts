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
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { FirebaseError } from 'firebase/app';

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
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('productId', '==', productId),
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
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  },

  // Get review statistics for a product
  async getReviewStats(productId: number): Promise<ReviewStats> {
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

  // Get all reviews (for admin purposes)
  async getAllReviews(): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
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
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw new Error('Failed to fetch all reviews');
    }
  }
};