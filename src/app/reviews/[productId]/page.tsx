'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import ReviewList from '@/components/ReviewList';
import ReviewModal from '@/components/ReviewModal';
import { useReviews } from '@/contexts/ReviewContext';
import { products, Product } from '@/data/products';
import { ReviewStats } from '@/lib/reviewService';

export default function ReviewPage() {
  const params = useParams();
  const productId = parseInt(params.productId as string);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const { getReviewStats } = useReviews();

  useEffect(() => {
    const foundProduct = products.find(p => p.id === productId);
    setProduct(foundProduct || null);
  }, [productId]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const reviewStats = await getReviewStats(productId);
        setStats(reviewStats);
      } catch (error) {
        console.error('Error fetching review stats:', error);
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
        stars.push(<StarSolidIcon key={i} className="w-5 h-5 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-5 h-5">
            <StarIcon className="w-5 h-5 text-gray-400 absolute" />
            <div className="overflow-hidden w-1/2">
              <StarSolidIcon className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<StarIcon key={i} className="w-5 h-5 text-gray-400" />);
      }
    }
    return stars;
  };

  if (!product) {
    return (
      <div className="pt-20 min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
          <Link href="/shop" className="text-blue-400 hover:text-blue-300">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 mb-8"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Shop
        </Link>

        {/* Product Header */}
        <div className="bg-[#1A1A1A] rounded-xl p-8 border border-[#2A2A2A] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative h-64 md:h-80">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain rounded-lg"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="px-3 py-1 bg-[#FFFFFF]/10 rounded-full text-[#FFFFFF] text-sm font-medium">
                  {product.category}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-white">{product.name}</h1>
              
              <p className="text-gray-400 text-lg">{product.description}</p>
              
              <div className="text-2xl font-bold text-white">
                {product.price === 0 ? 'FREE' : `$${product.price.toFixed(2)}`}
              </div>

              {/* Review Summary */}
              {stats && (
                <div className="flex items-center gap-4 pt-4 border-t border-[#2A2A2A]">
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(stats.averageRating)}</div>
                    <span className="text-white font-semibold">
                      {stats.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-400">
                    ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Review Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A] sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Customer Reviews</h2>
              
              {stats ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-2">
                      {renderStars(stats.averageRating)}
                    </div>
                    <p className="text-gray-400 text-sm">
                      Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Rating Distribution */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 w-2">{rating}</span>
                        <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                        <div className="flex-1 bg-[#2A2A2A] rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{
                              width: `${stats.totalReviews > 0 
                                ? (stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100 
                                : 0}%`
                            }}
                          />
                        </div>
                        <span className="text-gray-400 text-xs w-8">
                          {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <p>No reviews yet</p>
                </div>
              )}

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 mt-6"
              >
                Write a Review
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-3">
            <ReviewList productId={productId} showAll={true} />
          </div>
        </div>

        {/* Review Modal */}
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          productId={productId}
          productName={product.name}
        />
      </div>
    </div>
  );
}