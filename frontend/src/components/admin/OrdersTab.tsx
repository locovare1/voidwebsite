"use client";

import { useRouter } from 'next/navigation';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useOrders, Order } from '@/contexts/OrderContext';
import { formatOrderNumber } from '@/lib/orderUtils';
import { AnimatedCard } from '@/components/FramerAnimations';

const statusColors = {
  pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20',
  accepted: 'bg-blue-900/20 text-blue-400 border-blue-500/20',
  processing: 'bg-purple-900/20 text-purple-400 border-purple-500/20',
  delivered: 'bg-green-900/20 text-green-400 border-green-500/20',
  declined: 'bg-red-900/20 text-red-400 border-red-500/20',
  canceled: 'bg-gray-900/20 text-gray-400 border-gray-500/20',
};

export default function OrdersTab() {
  const router = useRouter();
  const { orders } = useOrders();

  const getStatusColor = (status: Order['status']) => {
    return statusColors[status] || 'bg-gray-900/20 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="space-y-6">
      <AnimatedCard className="admin-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBagIcon className="w-6 h-6" />
            Order Management
          </h2>
          <button
            onClick={() => router.push('/adminpanel/orders')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Open Orders Manager
          </button>
        </div>

        <p className="text-gray-400 text-sm">Manage customer orders, update order statuses, and track deliveries.</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#2A2A2A]">
            <div className="text-2xl font-bold text-white">{orders.length}</div>
            <div className="text-gray-400 text-sm">Total Orders</div>
          </div>
          <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#2A2A2A]">
            <div className="text-2xl font-bold text-yellow-400">{orders.filter(o => o.status === 'pending').length}</div>
            <div className="text-gray-400 text-sm">Pending</div>
          </div>
          <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#2A2A2A]">
            <div className="text-2xl font-bold text-blue-400">{orders.filter(o => o.status === 'processing').length}</div>
            <div className="text-gray-400 text-sm">Processing</div>
          </div>
          <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#2A2A2A]">
            <div className="text-2xl font-bold text-green-400">{orders.filter(o => o.status === 'delivered').length}</div>
            <div className="text-gray-400 text-sm">Delivered</div>
          </div>
        </div>

        {/* Recent Orders Preview */}
        {orders.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
            <div className="bg-[#0F0F0F] rounded-lg border border-[#2A2A2A] overflow-hidden">
              <div className="divide-y divide-[#2A2A2A]">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-4 hover:bg-[#1A1A1A] transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">Order #{formatOrderNumber(order.id, true)}</div>
                        <div className="text-sm text-gray-400">{order.customerInfo.name}</div>
                        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">${order.total.toFixed(2)}</div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}
