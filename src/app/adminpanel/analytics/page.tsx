"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingScreen from '@/components/LoadingScreen';

interface AnalyticsData {
  totalNewsArticles: number;
  totalTeams: number;
  totalPlayers: number;
  totalProducts: number;
  totalOrders: number;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>;
  pageViews?: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        if (!db) {
          setLoading(false);
          return;
        }

        // Get counts from different collections
        const [newsSnap, teamsSnap, productsSnap, ordersSnap] = await Promise.all([
          getDocs(collection(db, 'newsArticles')),
          getDocs(collection(db, 'teams')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'orders')).catch(() => ({ size: 0 }))
        ]);

        // Calculate total players across all teams
        let totalPlayers = 0;
        teamsSnap.forEach((doc) => {
          const team = doc.data();
          totalPlayers += (team.players || []).length;
        });

        // Get recent news articles for activity feed
        const recentNewsQuery = query(
          collection(db, 'newsArticles'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentNewsSnap = await getDocs(recentNewsQuery);

        const recentActivity = recentNewsSnap.docs.map(doc => {
          const data = doc.data();
          return {
            type: 'news',
            description: `New article: ${data.title}`,
            timestamp: data.createdAt?.toDate() || new Date()
          };
        });

        setAnalytics({
          totalNewsArticles: newsSnap.size,
          totalTeams: teamsSnap.size,
          totalPlayers,
          totalProducts: productsSnap.size,
          totalOrders: ordersSnap.size || 0,
          recentActivity,
          pageViews: {
            today: 0, // Would need Google Analytics integration
            thisWeek: 0,
            thisMonth: 0
          }
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return <LoadingScreen message="ANALYZING DATA" />;
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Unable to load analytics data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Analytics Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of your website statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <div className="text-gray-400 text-sm mb-2">News Articles</div>
          <div className="text-3xl font-bold text-white">{analytics.totalNewsArticles}</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <div className="text-gray-400 text-sm mb-2">Teams</div>
          <div className="text-3xl font-bold text-white">{analytics.totalTeams}</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <div className="text-gray-400 text-sm mb-2">Players</div>
          <div className="text-3xl font-bold text-white">{analytics.totalPlayers}</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <div className="text-gray-400 text-sm mb-2">Products</div>
          <div className="text-3xl font-bold text-white">{analytics.totalProducts}</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <div className="text-gray-400 text-sm mb-2">Orders</div>
          <div className="text-3xl font-bold text-white">{analytics.totalOrders}</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {analytics.recentActivity.length > 0 ? (
            analytics.recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-lg">
                <div>
                  <div className="text-white font-medium">{activity.description}</div>
                  <div className="text-gray-400 text-sm">
                    {activity.timestamp.toLocaleDateString()} {activity.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                  {activity.type}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No recent activity</p>
          )}
        </div>
      </div>

      {/* Page Views (Placeholder for future integration) */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Page Views</h2>
        <div className="text-gray-400 text-sm">
          <p>Google Analytics integration coming soon. Connect your GA4 property to see detailed page view statistics.</p>
        </div>
      </div>
    </div>
  );
}

