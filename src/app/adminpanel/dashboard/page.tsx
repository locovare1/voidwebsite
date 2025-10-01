"use client";

import { useState, useEffect } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { reviewService } from '@/lib/reviewService';
import { newsService } from '@/lib/newsService';
import { teamService } from '@/lib/teamService';
import { productService } from '@/lib/productService';
import { scheduleService } from '@/lib/scheduleService';
import { 
  ShoppingBagIcon, 
  UserGroupIcon, 
  NewspaperIcon, 
  CalendarIcon, 
  StarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const statusOptions = ['pending', 'accepted', 'processing', 'delivered', 'declined', 'canceled'];

const statusColors: any = {
  pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20',
  accepted: 'bg-blue-900/20 text-blue-400 border-blue-500/20',
  processing: 'bg-purple-900/20 text-purple-400 border-purple-500/20',
  delivered: 'bg-green-900/20 text-green-400 border-green-500/20',
  declined: 'bg-red-900/20 text-red-400 border-red-500/20',
  canceled: 'bg-gray-900/20 text-gray-400 border-gray-500/20',
};

export default function DashboardPage() {
  const { orders, sets } = useOrders();
  const [reviews, setReviews] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [reviewsData, newsData, teamsData, productsData, matchesData, eventsData] = await Promise.all([
          reviewService.getAllReviews(),
          newsService.getAll(),
          teamService.getAll(),
          productService.getAll(),
          scheduleService.getAllMatches(),
          scheduleService.getAllEvents()
        ]);
        
        setReviews(reviewsData);
        setNews(newsData);
        setTeams(teamsData);
        setProducts(productsData);
        setMatches(matchesData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusCount = (status: string) => {
    return orders.filter(order => order.status === status).length;
  };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalProducts = products.length;
  const totalReviews = reviews.length;

  const stats = [
    { name: 'Total Orders', value: totalOrders, icon: ShoppingBagIcon, color: 'bg-blue-500' },
    { name: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: ChartBarIcon, color: 'bg-green-500' },
    { name: 'Products', value: totalProducts, icon: NewspaperIcon, color: 'bg-purple-500' },
    { name: 'Reviews', value: totalReviews, icon: StarIcon, color: 'bg-yellow-500' },
    { name: 'Teams', value: teams.length, icon: UserGroupIcon, color: 'bg-red-500' },
    { name: 'News Articles', value: news.length, icon: NewspaperIcon, color: 'bg-indigo-500' },
  ];

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
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome to your admin dashboard</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
            Generate Report
          </button>
          <button className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300">
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={stat.name}
            className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-5 hover:border-[#FFFFFF]/20 transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.name}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statusOptions.map((status, index) => (
          <div 
            key={status}
            className="bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A] hover:border-[#FFFFFF]/20 transition-all duration-300"
            style={{ animationDelay: `${(index + 6) * 100}ms` }}
          >
            <div className="text-2xl font-bold text-white">{getStatusCount(status)}</div>
            <div className={`text-sm capitalize ${statusColors[status].split(' ')[1]}`}>
              {status}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {orders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="p-4 border-b border-[#2A2A2A] hover:bg-[#2A2A2A] transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">#{order.id.slice(-8)}</p>
                    <p className="text-gray-400 text-sm">{order.customerInfo.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs border ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <p className="text-white font-medium">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <p>No orders found</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">Recent Reviews</h2>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {reviews.slice(0, 5).map((review: any) => (
              <div key={review.id} className="p-4 border-b border-[#2A2A2A] hover:bg-[#2A2A2A] transition-colors duration-300">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">{review.userName.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium truncate">{review.userName}</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1 truncate">"{review.comment}"</p>
                    <p className="text-gray-500 text-xs mt-1">{new Date(review.createdAt.toMillis ? review.createdAt.toMillis() : review.createdAt.seconds * 1000).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <p>No reviews found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}