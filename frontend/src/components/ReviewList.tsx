'use client';

import { useState, useEffect } from 'react';
import { StarIcon, HandThumbUpIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon, HandThumbUpIcon as HandThumbUpOutlineIcon, ChatBubbleLeftIcon as ChatBubbleLeftOutlineIcon } from '@heroicons/react/24/outline';
import { useReviews } from '@/contexts/ReviewContext';
import { Review, ReviewResponse } from '@/lib/reviewService';

interface ReviewListProps {
  productId: number;
  showAll?: boolean;
  limit?: number;
  currentUserEmail?: string;
  isOfficial?: boolean; // For admin responses
}

export default function ReviewList({ productId, showAll = false, limit = 5, currentUserEmail, isOfficial = false }: ReviewListProps) {
  const { getProductReviews, markReviewHelpful, toggleLikeReview, addReviewResponse, loading } = useReviews();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [helpfulClicks, setHelpfulClicks] = useState<Set<string>>(new Set());
  const [likeStatuses, setLikeStatuses] = useState<Map<string, boolean>>(new Map());
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const productReviews = await getProductReviews(productId);
        setReviews(productReviews);
        
        // Check like status for each review if user is logged in
        if (currentUserEmail) {
          const statusMap = new Map<string, boolean>();
          for (const review of productReviews) {
            if (review.id) {
              statusMap.set(review.id, review.userLiked || false);
            }
          }
          setLikeStatuses(statusMap);
        }
        
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
  }, [productId, getProductReviews, showAll, limit, currentUserEmail]);

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

  const handleLikeClick = async (reviewId: string) => {
    if (!currentUserEmail) {
      alert('Please log in to like reviews');
      return;
    }
    
    try {
      const result = await toggleLikeReview(reviewId, currentUserEmail);
      
      // Update local state
      setReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, likes: result.likes, userLiked: result.liked }
          : review
      ));
      setDisplayedReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, likes: result.likes, userLiked: result.liked }
          : review
      ));
      
      // Update like status
      setLikeStatuses(prev => new Map(prev).set(reviewId, result.liked));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleResponseSubmit = async (reviewId: string) => {
    if (!responseText.trim()) return;
    if (!currentUserEmail) {
      alert('Please log in to respond to reviews');
      return;
    }
    
    setSubmittingResponse(true);
    try {
      await addReviewResponse(reviewId, {
        reviewId,
        userName: currentUserEmail.split('@')[0], // Extract name from email
        userEmail: currentUserEmail,
        comment: responseText.trim(),
        isOfficial: isOfficial
      });
      
      setResponseText('');
      setRespondingTo(null);
      
      // Refresh reviews to show the new response
      const updatedReviews = await getProductReviews(productId);
      setReviews(updatedReviews);
      setDisplayedReviews(showAll ? updatedReviews : updatedReviews.slice(0, limit));
      
    } catch (error) {
      console.error('Error adding response:', error);
      alert('Failed to add response. Please try again.');
    } finally {
      setSubmittingResponse(false);
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

          {/* Display responses */}
          {review.responses && review.responses.length > 0 && (
            <div className="mb-4 space-y-3">
              {review.responses.map((response, index) => (
                <div key={index} className="bg-[#2A2A2A] rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {response.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="font-semibold text-white text-sm">
                        {response.userName}
                        {response.isOfficial && (
                          <span className="ml-2 bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                            Official Response
                          </span>
                        )}
                      </h5>
                      <span className="text-xs text-gray-400">
                        {formatDate(response.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{response.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Response form */}
          {respondingTo === review.id && (
            <div className="mb-4 p-4 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response..."
                className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleResponseSubmit(review.id!)}
                  disabled={submittingResponse || !responseText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                >
                  {submittingResponse ? 'Posting...' : 'Post Response'}
                </button>
                <button
                  onClick={() => {
                    setRespondingTo(null);
                    setResponseText('');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Like button */}
              <button
                onClick={() => handleLikeClick(review.id!)}
                disabled={!currentUserEmail}
                className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                  currentUserEmail
                    ? likeStatuses.get(review.id!)
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-gray-400 hover:text-red-400'
                    : 'text-gray-500 cursor-not-allowed'
                }`}
                title={currentUserEmail ? 'Like this review' : 'Log in to like reviews'}
              >
                {likeStatuses.get(review.id!) ? (
                  <HandThumbUpIcon className="w-4 h-4" />
                ) : (
                  <HandThumbUpOutlineIcon className="w-4 h-4" />
                )}
                <span>{review.likes || 0}</span>
              </button>

              {/* Helpful button */}
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

              {/* Response button */}
              <button
                onClick={() => setRespondingTo(respondingTo === review.id ? null : review.id!)}
                className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                  respondingTo === review.id
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-blue-400'
                }`}
              >
                {respondingTo === review.id ? (
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                ) : (
                  <ChatBubbleLeftOutlineIcon className="w-4 h-4" />
                )}
                <span>Respond</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {!showAll && reviews.length > limit && (
        <div className="text-center">
          <button
            onClick={handleShowMore}
            className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium border border-[#3A3A3A]"
          >
            {showMore ? 'Show Less' : `Show More (${reviews.length - limit} more)`}
          </button>
        </div>
      )}
    </div>
  );
}