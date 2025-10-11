"use client";

import { useState, useEffect } from 'react';
import { useOrders, Order } from '@/contexts/OrderContext';
import { reviewService, Review } from '@/lib/reviewService';
import { formatOrderNumber } from '@/lib/orderUtils';
import { products, Product } from '@/data/products';
import { 
  TrashIcon, 
  UserIcon, 
  StarIcon, 
  ShoppingBagIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

const statusColors = {
  pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20',
  accepted: 'bg-blue-900/20 text-blue-400 border-blue-500/20',
  processing: 'bg-purple-900/20 text-purple-400 border-purple-500/20',
  delivered: 'bg-green-900/20 text-green-400 border-green-500/20',
  declined: 'bg-red-900/20 text-red-400 border-red-500/20',
  canceled: 'bg-gray-900/20 text-gray-400 border-gray-500/20',
};

export default function AdminDashboard() {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'reviews' | 'products'>('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const reviewsData = await reviewService.getAllReviews();
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: any) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewService.deleteReview(reviewId);
        setReviews(reviews.filter(review => review.id !== reviewId));
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const handleBulkDeleteReviews = async () => {
    if (confirm(`Are you sure you want to delete ${selectedReviews.size} reviews?`)) {
      try {
        const deletePromises = Array.from(selectedReviews).map(reviewId => 
          reviewService.deleteReview(reviewId)
        );
        await Promise.all(deletePromises);
        setReviews(reviews.filter(review => !selectedReviews.has(review.id || '')));
        setSelectedReviews(new Set());
        setShowBulkActions(false);
      } catch (error) {
        console.error('Error bulk deleting reviews:', error);
      }
    }
  };

  const toggleReviewSelection = (reviewId: string) => {
    const newSelection = new Set(selectedReviews);
    if (newSelection.has(reviewId)) {
      newSelection.delete(reviewId);
    } else {
      newSelection.add(reviewId);
    }
    setSelectedReviews(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  // Statistics calculations
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const getStatusColor = (status: Order['status']) => {
    return statusColors[status] || 'bg-gray-900/20 text-gray-400 border-gray-500/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'orders', label: 'Orders', icon: ShoppingBagIcon },
            { id: 'reviews', label: 'Reviews', icon: StarIcon },
            { id: 'products', label: 'Products', icon: UserIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[#FFFFFF] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                </div>
                <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{totalOrders}</p>
                </div>
                <ShoppingBagIcon className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Order Value</p>
                  <p className="text-2xl font-bold text-white">${averageOrderValue.toFixed(2)}</p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Rating</p>
                  <p className="text-2xl font-bold text-white">{averageRating.toFixed(1)}/5</p>
                </div>
                <StarIcon className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Order Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Pending</span>
                  <span className="text-yellow-400 font-medium">{pendingOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-green-400 font-medium">{completedOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Reviews</span>
                  <span className="text-blue-400 font-medium">{reviews.length}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      Order {formatOrderNumber(order.id)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Orders Header */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBagIcon className="w-6 h-6" />
                Orders Management
              </h2>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="declined">Declined</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <p className="text-gray-400">No orders found.</p>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-medium">
                            Order {formatOrderNumber(order.id)}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {order.customerInfo.name} - {order.customerInfo.email}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="bg-[#2A2A2A] border border-[#3A3A3A] rounded px-2 py-1 text-xs text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="processing">Processing</option>
                          <option value="delivered">Delivered</option>
                          <option value="declined">Declined</option>
                          <option value="canceled">Canceled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Delete Order"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Total:</span>
                        <span className="text-white font-medium ml-2">${order.total.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Items:</span>
                        <span className="text-white font-medium ml-2">{order.items.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Country:</span>
                        <span className="text-white font-medium ml-2">{order.customerInfo.country}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Zip:</span>
                        <span className="text-white font-medium ml-2">{order.customerInfo.zipCode}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <StarIcon className="w-6 h-6" />
                Reviews Management
              </h2>
              {showBulkActions && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">
                    {selectedReviews.size} selected
                  </span>
                  <button
                    onClick={handleBulkDeleteReviews}
                    className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 px-3 py-1 rounded text-sm"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-400">No reviews found.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedReviews.has(review.id || '')}
                        onChange={() => review.id && toggleReviewSelection(review.id)}
                        className="mt-1 rounded border-[#2A2A2A] bg-[#0F0F0F] text-white"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-white font-medium">{review.userName}</h3>
                            <p className="text-gray-500 text-sm">{review.userEmail}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                  }`}
                                />
                              ))}
                              <span className="text-gray-400 text-sm ml-2">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => review.id && handleDeleteReview(review.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-2">{review.comment}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Product ID: {review.productId}</span>
                          <span>{review.createdAt.toDate().toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded ${review.verified ? 'bg-green-900/20 text-green-400' : 'bg-gray-900/20 text-gray-400'}`}>
                            {review.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserIcon className="w-6 h-6" />
              Products Catalog
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4">
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-white font-medium mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-bold">${product.price.toFixed(2)}</span>
                    <span className="text-gray-500 text-xs bg-[#2A2A2A] px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
                    <p className="text-gray-500 text-xs">Product ID: {product.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  Order {formatOrderNumber(selectedOrder.id)}
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Customer Information</h4>
                  <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4 space-y-2">
                    <p className="text-gray-300"><span className="text-gray-400">Name:</span> {selectedOrder.customerInfo.name}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Email:</span> {selectedOrder.customerInfo.email}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Phone:</span> {selectedOrder.customerInfo.phone}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Address:</span> {selectedOrder.customerInfo.address}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Zip Code:</span> {selectedOrder.customerInfo.zipCode}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Country:</span> {selectedOrder.customerInfo.country}</p>
                  </div>
                </div>
                
                {/* Order Items */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4 flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-white font-medium">{item.name}</h5>
                          <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-gray-400 text-sm">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Order Summary */}
                <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4">
                  <div className="flex justify-between items-center text-lg font-bold text-white">
                    <span>Total:</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400 mt-1">
                    <span>Order Date:</span>
                    <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}