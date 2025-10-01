'use client';

import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useReviews } from '@/contexts/ReviewContext';
import Link from 'next/link';

interface ReviewButtonProps {
  productId: number;
  productName: string;
}

export default function ReviewButton({ productId, productName }: ReviewButtonProps) {
  const { getReviewStats } = useReviews();
  const [stats, setStats] = useState<{ totalReviews: number; averageRating: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const reviewStats = await getReviewStats(productId);
        setStats({
          totalReviews: reviewStats.totalReviews,
          averageRating: reviewStats.averageRating
        });
      } catch (error) {
        console.error('Error fetching review stats for product ID:', productId, error);
        setStats({ totalReviews: 0, averageRating: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [productId, getReviewStats]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <StarOutlineIcon className="w-4 h-4 text-gray-400 absolute" />
            <div className="overflow-hidden w-1/2">
              <StarIcon className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <StarOutlineIcon key={i} className="w-4 h-4 text-gray-400" />
        );
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="w-full mt-2">
        <div className="animate-pulse bg-[#2A2A2A] h-10 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="w-full mt-2">
      <Link
        href={`/reviews/${productId}?name=${encodeURIComponent(productName)}`}
        className="w-full bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white text-center py-2.5 px-4 rounded-lg transition-all duration-300 font-medium border border-[#3A3A3A] hover:border-[#4A4A4A] flex items-center justify-center gap-2 group"
      >
        <div className="flex items-center gap-1">
          {renderStars(stats?.averageRating || 0)}
        </div>
        <span className="text-sm">
          {stats?.totalReviews === 0 
            ? 'Be the first to review' 
            : `${stats?.totalReviews} review${stats?.totalReviews !== 1 ? 's' : ''}`
          }
        </span>
        <svg 
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}