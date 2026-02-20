'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Review, ReviewStats, reviewService } from '@/lib/reviewService';

interface ReviewContextType {
  reviews: { [productId: number]: Review[] };
  reviewStats: { [productId: number]: ReviewStats };
  loading: boolean;
  error: string | null;
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'helpful' | 'verified'>) => Promise<void>;
  getProductReviews: (productId: number) => Promise<Review[]>;
  getReviewStats: (productId: number) => Promise<ReviewStats>;
  markReviewHelpful: (reviewId: string) => Promise<void>;
  clearError: () => void;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<{ [productId: number]: Review[] }>({});
  const [reviewStats, setReviewStats] = useState<{ [productId: number]: ReviewStats }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const addReview = useCallback(async (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpful' | 'verified'>) => {
    try {
      setLoading(true);
      setError(null);
      
      await reviewService.addReview(reviewData);
      
      // Refresh reviews and stats for this product
      const updatedReviews = await reviewService.getProductReviews(reviewData.productId);
      const updatedStats = await reviewService.getReviewStats(reviewData.productId);
      
      setReviews(prev => ({
        ...prev,
        [reviewData.productId]: updatedReviews
      }));
      
      setReviewStats(prev => ({
        ...prev,
        [reviewData.productId]: updatedStats
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add review');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductReviews = useCallback(async (productId: number): Promise<Review[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // Return cached reviews if available
      if (reviews[productId]) {
        return reviews[productId];
      }
      
      const productReviews = await reviewService.getProductReviews(productId);
      
      setReviews(prev => ({
        ...prev,
        [productId]: productReviews
      }));
      
      return productReviews;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [reviews]);

  const getReviewStats = useCallback(async (productId: number): Promise<ReviewStats> => {
    try {
      setLoading(true);
      setError(null);
      
      // Return cached stats if available
      if (reviewStats[productId]) {
        return reviewStats[productId];
      }
      
      const stats = await reviewService.getReviewStats(productId);
      
      setReviewStats(prev => ({
        ...prev,
        [productId]: stats
      }));
      
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch review stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [reviewStats]);

  const markReviewHelpful = useCallback(async (reviewId: string) => {
    try {
      setError(null);
      await reviewService.markReviewHelpful(reviewId);
      
      // Update the helpful count in local state
      setReviews(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(productId => {
          updated[parseInt(productId)] = updated[parseInt(productId)].map(review =>
            review.id === reviewId
              ? { ...review, helpful: review.helpful + 1 }
              : review
          );
        });
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark review as helpful');
      throw err;
    }
  }, []);

  const value: ReviewContextType = {
    reviews,
    reviewStats,
    loading,
    error,
    addReview,
    getProductReviews,
    getReviewStats,
    markReviewHelpful,
    clearError,
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
}