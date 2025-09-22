'use client';

import { useState } from 'react';
import { useReviews } from '@/contexts/ReviewContext';

export default function ReviewTest() {
  const [productId, setProductId] = useState(1);
  const [testResult, setTestResult] = useState<string>('');
  const { addReview, getProductReviews, getReviewStats } = useReviews();

  const testAddReview = async () => {
    try {
      setTestResult('Adding test review...');
      await addReview({
        productId,
        userName: 'Test User',
        userEmail: 'test@example.com',
        rating: 5,
        comment: 'This is a test review for the review system!'
      });
      setTestResult('✅ Review added successfully!');
    } catch (error) {
      setTestResult(`❌ Error: ${error}`);
    }
  };

  const testGetReviews = async () => {
    try {
      setTestResult('Fetching reviews...');
      const reviews = await getProductReviews(productId);
      setTestResult(`✅ Found ${reviews.length} reviews for product ${productId}`);
    } catch (error) {
      setTestResult(`❌ Error: ${error}`);
    }
  };

  const testGetStats = async () => {
    try {
      setTestResult('Fetching stats...');
      const stats = await getReviewStats(productId);
      setTestResult(`✅ Stats: ${stats.totalReviews} reviews, avg rating: ${stats.averageRating}`);
    } catch (error) {
      setTestResult(`❌ Error: ${error}`);
    }
  };

  return (
    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2A2A2A] max-w-md">
      <h3 className="text-white font-bold mb-4">Review System Test</h3>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Product ID:</label>
        <input
          type="number"
          value={productId}
          onChange={(e) => setProductId(parseInt(e.target.value))}
          className="w-full bg-[#2A2A2A] text-white p-2 rounded border border-[#3A3A3A]"
        />
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={testAddReview}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
        >
          Test Add Review
        </button>
        <button
          onClick={testGetReviews}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
        >
          Test Get Reviews
        </button>
        <button
          onClick={testGetStats}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
        >
          Test Get Stats
        </button>
      </div>

      {testResult && (
        <div className="bg-[#2A2A2A] p-3 rounded text-sm text-gray-300">
          {testResult}
        </div>
      )}
    </div>
  );
}