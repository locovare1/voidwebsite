"use client";

import { useState, useEffect } from 'react';
import { reviewService } from '@/lib/reviewService';
import { 
  TrashIcon,
  UserIcon,
  StarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [showReviewDetails, setShowReviewDetails] = useState(false);
  const [showDeleteReviewConfirm, setShowDeleteReviewConfirm] = useState<string | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [showBulkReviewDelete, setShowBulkReviewDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadReviews = async () => {
    try {
      setLoading(true);
      const allReviews = await reviewService.getAllReviews();
      setReviews(allReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      if (selectedReview && selectedReview.id === reviewId) {
        setSelectedReview(null);
        setShowReviewDetails(false);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
    setShowDeleteReviewConfirm(null);
  };

  const toggleReviewSelection = (reviewId: string) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedReviews(newSelected);
  };

  const selectAllReviews = () => {
    if (selectedReviews.size === reviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(reviews.map(review => review.id || '')));
    }
  };

  const handleBulkDeleteReviews = async () => {
    try {
      const deletePromises = Array.from(selectedReviews).map(async (reviewId) => {
        await reviewService.deleteReview(reviewId);
      });

      await Promise.all(deletePromises);

      setReviews(prev => prev.filter(review => !selectedReviews.has(review.id || '')));
      setSelectedReviews(new Set());
      setShowBulkReviewDelete(false);

      if (selectedReview && selectedReviews.has(selectedReview.id || '')) {
        setSelectedReview(null);
        setShowReviewDetails(false);
      }
    } catch (error) {
      console.error('Error bulk deleting reviews:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
      />
    ));
  };

  const filteredReviews = searchTerm 
    ? reviews.filter(review => 
        review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.productId.toString().includes(searchTerm)
      )
    : reviews;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Reviews Management</h1>
          <p className="text-gray-400 mt-1">Manage customer reviews and feedback</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadReviews}
            className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
          >
            Refresh
          </button>
          <button 
            onClick={selectAllReviews}
            className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
          >
            Select All
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reviews by user name, email, comment or product ID..."
            className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Customer Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                {selectedReviews.size > 0 && (
                  <button
                    onClick={() => setShowBulkReviewDelete(true)}
                    className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 font-medium py-1 px-3 rounded-lg transition-all duration-300 text-sm flex items-center gap-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete ({selectedReviews.size})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFFFFF] mx-auto mb-2"></div>
              <p>Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No reviews found</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className={`p-4 rounded-lg border transition-all duration-300 hover:bg-[#2A2A2A] ${
                    selectedReview?.id === review.id
                      ? 'border-[#FFFFFF] bg-[#2A2A2A]'
                      : 'border-[#3A3A3A]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedReviews.has(review.id || '')}
                        onChange={() => toggleReviewSelection(review.id || '')}
                        className="w-4 h-4 text-[#FFFFFF] bg-[#0F0F0F] border-[#2A2A2A] rounded focus:ring-[#FFFFFF] focus:ring-2 mt-1"
                      />
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-400">
                            Product ID: {review.productId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <UserIcon className="w-4 h-4" />
                          <span>{review.userName}</span>
                          <span>•</span>
                          <span>{review.userEmail}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowReviewDetails(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10 transition-all duration-300"
                        title="View details"
                      >
                        <UserIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteReviewConfirm(review.id || '');
                        }}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-all duration-300"
                        title="Delete review"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    className="cursor-pointer ml-7"
                    onClick={() => {
                      setSelectedReview(review);
                      setShowReviewDetails(true);
                    }}
                  >
                    <p className="text-white text-sm font-medium mb-1">&quot;{review.comment}&quot;</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {review.verified ? '✓ Verified Purchase' : '○ Unverified'} •
                        {review.helpful > 0 && ` ${review.helpful} helpful`}
                      </span>
                      <span>{new Date(review.createdAt.toMillis ? review.createdAt.toMillis() : review.createdAt.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Details Modal */}
      {showReviewDetails && selectedReview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="p-6 border-b border-[#2A2A2A]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Review Details</h3>
                <button
                  onClick={() => {
                    setShowReviewDetails(false);
                    setSelectedReview(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Review Info */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Review Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Review ID</p>
                    <p className="text-white font-mono text-sm">{selectedReview.id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Product ID</p>
                    <p className="text-white">{selectedReview.productId}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Rating</p>
                    <div className="flex items-center gap-1">
                      {renderStars(selectedReview.rating)}
                      <span className="text-white ml-2">{selectedReview.rating}/5</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Status</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs border ${
                        selectedReview.verified
                          ? 'bg-green-900/20 text-green-400 border-green-500/20'
                          : 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {selectedReview.verified ? '✓ Verified' : '○ Unverified'}
                      </span>
                      {selectedReview.helpful > 0 && (
                        <span className="text-xs text-gray-400">
                          {selectedReview.helpful} helpful
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">User Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-medium">{selectedReview.userName}</span>
                  </div>
                  <p className="text-gray-400 ml-7">{selectedReview.userEmail}</p>
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Review Comment</h4>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                  <p className="text-white italic">&quot;{selectedReview.comment}&quot;</p>
                </div>
              </div>

              {/* Review Metadata */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Metadata</h4>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Created:</span>
                      <p className="text-white">{new Date(selectedReview.createdAt.toMillis ? selectedReview.createdAt.toMillis() : selectedReview.createdAt.seconds * 1000).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Helpful Votes:</span>
                      <p className="text-white">{selectedReview.helpful}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
                <button
                  onClick={() => {
                    setShowReviewDetails(false);
                    setSelectedReview(null);
                  }}
                  className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDeleteReviewConfirm(selectedReview.id || '');
                    setShowReviewDetails(false);
                  }}
                  className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Delete Confirmation Modal */}
      {showDeleteReviewConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <StarIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Review</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteReviewConfirm(null)}
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteReview(showDeleteReviewConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Delete Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Review Delete Confirmation Modal */}
      {showBulkReviewDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <StarIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Multiple Reviews</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete {selectedReviews.size} selected reviews? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkReviewDelete(false)}
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDeleteReviews}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Delete {selectedReviews.size} Reviews
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}