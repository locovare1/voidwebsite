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
      const reviewData = {
        ...review,
        createdAt: Timestamp.now(),
        helpful: 0,
        verified: false
      };
      
      const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), reviewData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding review:', error);
      throw new Error('Failed to add review');
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