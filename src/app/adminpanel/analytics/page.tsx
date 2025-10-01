"use client";

import { useState, useEffect } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { reviewService } from '@/lib/reviewService';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  StarIcon, 
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const { orders } = useOrders();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
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

    loadReviews();
  }, []);

  // Calculate analytics data
  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  };

  const getTotalOrders = () => {
    return orders.length;
  };

  const getAverageOrderValue = () => {
    if (orders.length === 0) return 0;
    return getTotalRevenue() / orders.length;
  };

  const getTotalReviews = () => {
    return reviews.length;
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  };

  const getStatusCounts = () => {
    const statusCounts: Record<string, number> = {};
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    return statusCounts;
  };

  const getRevenueByMonth = () => {
    const monthlyRevenue: Record<string, number> = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + order.total;
    });
    
    return Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const stats = [
    { 
      name: 'Total Revenue', 
      value: `$${getTotalRevenue().toFixed(2)}`, 
      icon: ChartBarIcon, 
      change: '+12.5%',
      changeType: 'positive'
    },
    { 
      name: 'Total Orders', 
      value: getTotalOrders(), 
      icon: ShoppingBagIcon, 
      change: '+8.2%',
      changeType: 'positive'
    },
    { 
      name: 'Average Order Value', 
      value: `$${getAverageOrderValue().toFixed(2)}`, 
      icon: ArrowTrendingUpIcon, 
      change: '+3.1%',
      changeType: 'positive'
    },
    { 
      name: 'Total Reviews', 
      value: getTotalReviews(), 
      icon: StarIcon, 
      change: '+5.7%',
      changeType: 'positive'
    },
    { 
      name: 'Average Rating', 
      value: getAverageRating().toFixed(1), 
      icon: UserGroupIcon, 
      change: '+0.2',
      changeType: 'positive'
    },
  ];

  const statusCounts = getStatusCounts();
  const revenueByMonth = getRevenueByMonth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFFFFF]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={stat.name}
            className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-5 hover:border-[#FFFFFF]/20 transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.name}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.changeType === 'positive' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-xs ${stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="bg-[#2A2A2A] p-3 rounded-lg">
                <stat.icon className="w-6 h-6 text-[#FFFFFF]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Overview</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {revenueByMonth.slice(-12).map((data, index) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-[#FFFFFF] to-[#dedede] rounded-t transition-all duration-500 hover:opacity-75"
                  style={{ 
                    height: `${Math.max(20, (data.revenue / Math.max(...revenueByMonth.map(d => d.revenue))) * 100)}%` 
                  }}
                ></div>
                <p className="text-xs text-gray-400 mt-2">
                  {data.month.split('-')[1]}/{data.month.split('-')[0].slice(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Order Status Distribution</h3>
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = getTotalOrders() > 0 ? (count / getTotalOrders()) * 100 : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300 capitalize">{status}</span>
                    <span className="text-white">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-[#2A2A2A] rounded-full h-2">
                    <div 
                      className="bg-[#FFFFFF] h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left py-3 text-gray-400 font-medium">Order ID</th>
                <th className="text-left py-3 text-gray-400 font-medium">Customer</th>
                <th className="text-left py-3 text-gray-400 font-medium">Date</th>
                <th className="text-left py-3 text-gray-400 font-medium">Amount</th>
                <th className="text-left py-3 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-[#2A2A2A] hover:bg-[#2A2A2A] transition-colors duration-200">
                  <td className="py-3 text-white">#{order.id.slice(-8)}</td>
                  <td className="py-3 text-gray-300">{order.customerInfo.name}</td>
                  <td className="py-3 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-white">${order.total.toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                      order.status === 'delivered' ? 'bg-green-900/20 text-green-400 border border-green-500/20' :
                      order.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/20' :
                      order.status === 'processing' ? 'bg-purple-900/20 text-purple-400 border border-purple-500/20' :
                      order.status === 'accepted' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20' :
                      'bg-red-900/20 text-red-400 border border-red-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}