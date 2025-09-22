'use client';

import { useState } from 'react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useReviews } from '@/contexts/ReviewContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
}

export default function ReviewModal({ isOpen, onClose, productId, productName }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addReview } = useReviews();

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setUserName('');
    setUserEmail('');
    setComment('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || !userName.trim() || !userEmail.trim() || !comment.trim()) {
      alert('Please fill in all fields and select a rating.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addReview({
        productId,
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        rating,
        comment: comment.trim(),
      });
      
      alert('Review submitted successfully!');
      handleClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Write a Review</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">{productName}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rating *
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-colors duration-200"
                  >
                    {star <= (hoverRating || rating) ? (
                      <StarSolidIcon className="w-8 h-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="userEmail" className="block text-sm font-medium text-gray-300 mb-2">
                Your Email *
              </label>
              <input
                type="email"
                id="userEmail"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                placeholder="Enter your email"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your email will not be displayed publicly
              </p>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
                Your Review *
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Share your experience with this product..."
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white py-2 px-4 rounded-lg transition-all duration-300 font-medium border border-[#3A3A3A]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black py-2 px-4 rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}