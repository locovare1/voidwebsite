'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  TrashIcon, 
  EyeIcon, 
  FlagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { Review, ReviewResponse, reviewService } from '@/lib/reviewService';

interface ReviewWithDetails extends Review {
  deviceInfo?: {
    userAgent: string;
    platform: string;
    screenResolution: string;
    language: string;
  };
  ipAddress?: string;
  sessionId?: string;
  lastModified?: string;
}

interface ActivityLog {
  id: string;
  reviewId: string;
  action: string;
  adminEmail: string;
  timestamp: Date;
  details: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified' | 'flagged'>('all');
  const [selectedReview, setSelectedReview] = useState<ReviewWithDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [adminResponse, setAdminResponse] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchActivityLogs();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchTerm, statusFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const allReviews = await reviewService.getAllReviews();
      
      // Enhance reviews with mock device info and IP (in real implementation, this would come from your backend)
      const enhancedReviews: ReviewWithDetails[] = allReviews.map((review, index) => ({
        ...review,
        deviceInfo: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          platform: 'Windows',
          screenResolution: '1920x1080',
          language: 'en-US'
        },
        ipAddress: `192.168.1.${100 + (index % 155)}`,
        sessionId: `session_${Date.now()}_${index}`,
        lastModified: review.createdAt?.toDate()?.toISOString() || new Date().toISOString()
      }));
      
      setReviews(enhancedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    // Mock activity logs - in real implementation, this would come from your backend
    const mockLogs: ActivityLog[] = [
      {
        id: '1',
        reviewId: 'review_1',
        action: 'VIEWED',
        adminEmail: 'admin@void.com',
        timestamp: new Date(Date.now() - 3600000),
        details: 'Viewed review details'
      },
      {
        id: '2',
        reviewId: 'review_2',
        action: 'RESPONDED',
        adminEmail: 'admin@void.com',
        timestamp: new Date(Date.now() - 7200000),
        details: 'Posted official response'
      }
    ];
    setActivityLogs(mockLogs);
  };

  const filterReviews = () => {
    let filtered = reviews;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    switch (statusFilter) {
      case 'verified':
        filtered = filtered.filter(review => review.verified);
        break;
      case 'unverified':
        filtered = filtered.filter(review => !review.verified);
        break;
      case 'flagged':
        filtered = filtered.filter(review => review.rating <= 2);
        break;
    }

    setFilteredReviews(filtered);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      
      // Log the action
      logActivity(reviewId, 'DELETED', 'Review deleted by admin');
      
      // Refresh reviews
      await fetchReviews();
      
      alert('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const handleVerifyReview = async (reviewId: string, verified: boolean) => {
    try {
      // In a real implementation, you'd have a verifyReview function
      // For now, we'll just log the action
      logActivity(reviewId, verified ? 'VERIFIED' : 'UNVERIFIED', `Review ${verified ? 'verified' : 'unverified'} by admin`);
      
      alert(`Review ${verified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Error updating review verification:', error);
      alert('Failed to update review');
    }
  };

  const handleAdminResponse = async (reviewId: string) => {
    if (!adminResponse.trim()) return;

    setSubmittingResponse(true);
    try {
      await reviewService.addReviewResponse(reviewId, {
        reviewId,
        userName: 'VOID Admin',
        userEmail: 'admin@void.com',
        comment: adminResponse.trim(),
        isOfficial: true
      });

      // Log the action
      logActivity(reviewId, 'RESPONDED', 'Admin posted official response');

      setAdminResponse('');
      setSelectedReview(null);
      setShowDetails(false);
      
      // Refresh reviews
      await fetchReviews();
      
      alert('Response posted successfully');
    } catch (error) {
      console.error('Error posting response:', error);
      alert('Failed to post response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const logActivity = (reviewId: string, action: string, details: string) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      reviewId,
      action,
      adminEmail: 'admin@void.com',
      timestamp: new Date(),
      details
    };
    
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const getDeviceIcon = (platform: string) => {
    if (platform.toLowerCase().includes('mobile') || platform.toLowerCase().includes('android') || platform.toLowerCase().includes('ios')) {
      return <DevicePhoneMobileIcon className="w-4 h-4" />;
    }
    return <ComputerDesktopIcon className="w-4 h-4" />;
  };

  const formatDate = (date: Date | string | { toDate: () => Date }) => {
    let d: Date;
    if (typeof date === 'object' && 'toDate' in date) {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else {
      d = new Date(date);
    }
    return d.toLocaleString();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-600'}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Review Management</h1>
        <p className="text-gray-400">Monitor and manage customer reviews with detailed analytics</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reviews by name, email, or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Reviews</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="flagged">Flagged (≤2 stars)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-700">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">{review.userName}</div>
                      <div className="text-xs text-gray-400">{review.userEmail}</div>
                      {review.verified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                          Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-400">({review.rating})</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-300 max-w-xs truncate">
                      {review.comment}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>👍 {review.likes || 0}</span>
                      <span>👤 {review.helpful}</span>
                      {review.responses && review.responses.length > 0 && (
                        <span>💬 {review.responses.length}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {getDeviceIcon(review.deviceInfo?.platform || 'Unknown')}
                      <span>{review.deviceInfo?.platform || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-400">{review.ipAddress}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-400">
                      {formatDate(review.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowDetails(true);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleVerifyReview(review.id!, !review.verified)}
                        className={review.verified ? "text-green-400 hover:text-green-300" : "text-yellow-400 hover:text-yellow-300"}
                        title={review.verified ? "Unverify" : "Verify"}
                      >
                        {review.verified ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id!)}
                        className="text-red-400 hover:text-red-300"
                        title="Delete Review"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Details Modal */}
      {showDetails && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Review Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-400">Name:</span>
                    <p className="text-white">{selectedReview.userName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Email:</span>
                    <p className="text-white">{selectedReview.userEmail}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">IP Address:</span>
                    <p className="text-white">{selectedReview.ipAddress}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Session ID:</span>
                    <p className="text-white font-mono text-xs">{selectedReview.sessionId}</p>
                  </div>
                </div>
              </div>

              {/* Device Information */}
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">Device Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-400">Platform:</span>
                    <p className="text-white flex items-center gap-2">
                      {getDeviceIcon(selectedReview.deviceInfo?.platform || 'Unknown')}
                      {selectedReview.deviceInfo?.platform || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Screen Resolution:</span>
                    <p className="text-white">{selectedReview.deviceInfo?.screenResolution || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Language:</span>
                    <p className="text-white">{selectedReview.deviceInfo?.language || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">User Agent:</span>
                    <p className="text-white text-xs font-mono break-all">{selectedReview.deviceInfo?.userAgent || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">Review Content</h3>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(selectedReview.rating)}
                  <span className="text-white">({selectedReview.rating} stars)</span>
                </div>
                <p className="text-gray-300 mb-4">{selectedReview.comment}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>👍 {selectedReview.likes || 0} likes</span>
                  <span>👤 {selectedReview.helpful} helpful</span>
                  <span>📅 {formatDate(selectedReview.createdAt)}</span>
                </div>
              </div>

              {/* Responses */}
              {selectedReview.responses && selectedReview.responses.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Responses</h3>
                  <div className="space-y-3">
                    {selectedReview.responses.map((response, index) => (
                      <div key={index} className="bg-gray-600 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-medium">{response.userName}</span>
                          {response.isOfficial && (
                            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                              Official
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm">{response.comment}</p>
                        <p className="text-gray-500 text-xs mt-1">{formatDate(response.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Response */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Admin Response</h3>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Write an official response..."
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAdminResponse(selectedReview.id!)}
                    disabled={submittingResponse || !adminResponse.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    {submittingResponse ? 'Posting...' : 'Post Response'}
                  </button>
                  <button
                    onClick={() => setAdminResponse('')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Activity Logs</h2>
        <div className="space-y-3">
          {activityLogs.map((log) => (
            <div key={log.id} className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{log.action}</span>
                  <span className="text-gray-400 text-sm">by {log.adminEmail}</span>
                </div>
                <p className="text-gray-400 text-sm">{log.details}</p>
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(log.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
