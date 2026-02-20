'use client';

import { useState, useEffect } from 'react';
import { StarIcon, HandThumbUpIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon, HandThumbUpIcon as HandThumbUpOutlineIcon } from '@heroicons/react/24/outline';
import { useReviews } from '@/contexts/ReviewContext';
import { Review } from '@/lib/reviewService';

interface ReviewListProps {
  productId: number;
  showAll?: boolean;
  limit?: number;
}

export default function ReviewList({ productId, showAll = false, limit = 5 }: ReviewListProps) {
  const { getProductReviews, markReviewHelpful, loading } = useReviews();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [helpfulClicks, setHelpfulClicks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const productReviews = await getProductReviews(productId);
        setReviews(productReviews);
        
        if (showAll) {
          setDisplayedReviews(productReviews);
        } else {
          setDisplayedReviews(productReviews.slice(0, limit));
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [productId, getProductReviews, showAll, limit]);

  const handleShowMore = () => {
    if (showMore) {
      setDisplayedReviews(reviews.slice(0, limit));
    } else {
      setDisplayedReviews(reviews);
    }
    setShowMore(!showMore);
  };

  const handleHelpfulClick = async (reviewId: string) => {
    if (helpfulClicks.has(reviewId)) return;
    
    try {
      await markReviewHelpful(reviewId);
      setHelpfulClicks(prev => new Set([...prev, reviewId]));
      
      // Update local state
      setReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, helpful: review.helpful + 1 }
          : review
      ));
      setDisplayedReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, helpful: review.helpful + 1 }
          : review
      ));
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
        ) : (
          <StarOutlineIcon key={i} className="w-4 h-4 text-gray-400" />
        )
      );
    }
    return stars;
  };

  const formatDate = (timestamp: { toDate?: () => Date } | string | Date) => {
    if (!timestamp) return '';
    let date: Date;
    
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp && timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp as string);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A] animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#2A2A2A] rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-[#2A2A2A] rounded w-24 mb-1"></div>
                <div className="h-3 bg-[#2A2A2A] rounded w-32"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-[#2A2A2A] rounded w-full"></div>
              <div className="h-4 bg-[#2A2A2A] rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <StarOutlineIcon className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
        <p className="text-gray-400">Be the first to share your experience with this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {displayedReviews.map((review) => (
        <div
          key={review.id}
          className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFFFFF] to-[#CCCCCC] rounded-full flex items-center justify-center text-black font-bold text-sm">
                {review.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-semibold text-white">{review.userName}</h4>
                <div className="flex items-center gap-2">
                  <div className="flex">{renderStars(review.rating)}</div>
                  <span className="text-sm text-gray-400">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            {review.verified && (
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                Verified Purchase
              </span>
            )}
          </div>

          <p className="text-gray-300 mb-4 leading-relaxed">{review.comment}</p>

          <div className="flex items-center justify-between">
            <button
              onClick={() => handleHelpfulClick(review.id!)}
              disabled={helpfulClicks.has(review.id!)}
              className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                helpfulClicks.has(review.id!)
                  ? 'text-blue-400 cursor-not-allowed'
                  : 'text-gray-400 hover:text-blue-400'
              }`}
            >
              {helpfulClicks.has(review.id!) ? (
                <HandThumbUpIcon className="w-4 h-4" />
              ) : (
                <HandThumbUpOutlineIcon className="w-4 h-4" />
              )}
              <span>
                Helpful ({review.helpful})
              </span>
            </button>
          </div>
        </div>
      ))}

      {!showAll && reviews.length > limit && (
        <div className="text-center">
          <button
            onClick={handleShowMore}
            className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium border border-[#3A3A3A]"
          >
            {showMore ? `Show Less` : `Show ${reviews.length - limit} More Reviews`}
          </button>
        </div>
      )}
    </div>
  );
}