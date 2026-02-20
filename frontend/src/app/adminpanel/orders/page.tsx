"use client";

import { useState, useEffect } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { formatOrderNumber } from '@/lib/orderUtils';
import { 
  TrashIcon, 
  FolderIcon, 
  ChevronDownIcon, 
  ChevronRightIcon,
  MagnifyingGlassIcon
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

export default function OrdersPage() {
  const { orders, sets, updateOrderStatus, deleteOrder, toggleSet, deleteSet, getUnsetOrders } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showDeleteSetConfirm, setShowDeleteSetConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const unsetOrders = getUnsetOrders();
  const filteredUnsetOrders = filterStatus === 'all' 
    ? unsetOrders 
    : unsetOrders.filter((order: any) => order.status === filterStatus);
  
  const filteredSets = sets.map((set: any) => ({
    ...set,
    orders: filterStatus === 'all' 
      ? set.orders 
      : set.orders.filter((order: any) => order.status === filterStatus)
  })).filter((set: any) => set.orders.length > 0);

  // Filter by search term
  const searchedUnsetOrders = searchTerm 
    ? filteredUnsetOrders.filter((order: any) => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredUnsetOrders;

  const searchedSets = searchTerm 
    ? filteredSets.map((set: any) => ({
        ...set,
        orders: set.orders.filter((order: any) => 
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter((set: any) => set.orders.length > 0)
    : filteredSets;

  const handleStatusUpdate = async (orderId: string, newStatus: 'pending' | 'accepted' | 'processing' | 'delivered' | 'declined' | 'canceled') => {
    try {
      // Update local state
      updateOrderStatus(orderId, newStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      // Delete from local state
      deleteOrder(orderId);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const confirmDelete = (orderId: string) => {
    setShowDeleteConfirm(orderId);
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllOrders = () => {
    const allOrderIds = [
      ...searchedUnsetOrders.map((order: any) => order.id),
      ...searchedSets.flatMap((set: any) => set.orders.map((order: any) => order.id))
    ];
    
    if (selectedOrders.size === allOrderIds.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(allOrderIds));
    }
  };

  const handleBulkDelete = async () => {
    // Delete from local state
    selectedOrders.forEach(orderId => deleteOrder(orderId));
    setSelectedOrders(new Set());
    setShowBulkDelete(false);
    if (selectedOrder && selectedOrders.has(selectedOrder.id)) {
      setSelectedOrder(null);
    }
  };

  const handleDeleteSet = (setId: string) => {
    deleteSet(setId);
    setShowDeleteSetConfirm(null);
  };

  const getStatusCount = (status: string) => {
    return orders.filter(order => order.status === status).length;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Orders Management</h1>
          <p className="text-gray-400 mt-1">Manage customer orders and track sales</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statusOptions.map(status => (
          <div key={status} className="bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A]">
            <div className="text-2xl font-bold text-white">{getStatusCount(status)}</div>
            <div className={`text-sm capitalize ${statusColors[status].split(' ')[1]}`}>
              {status}
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders by ID, customer name or email..."
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-[#0F0F0F] border border-[#2A2A2A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] transition-all duration-300"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Table */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Orders</h2>
              {(searchedUnsetOrders.length > 0 || searchedSets.length > 0) && (
                <div className="flex items-center gap-2">
                  {selectedOrders.size > 0 && (
                    <button
                      onClick={() => setShowBulkDelete(true)}
                      className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 font-medium py-1 px-3 rounded-lg transition-all duration-300 text-sm flex items-center gap-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete ({selectedOrders.size})
                    </button>
                  )}
                  <button
                    onClick={selectAllOrders}
                    className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-1 px-3 rounded-lg transition-all duration-300 text-sm"
                  >
                    Select All
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {searchedUnsetOrders.length === 0 && searchedSets.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No orders found</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {/* Display Sets */}
                {searchedSets.map((set: any) => (
                  <div key={set.id} className="border border-[#2A2A2A] rounded-lg">
                    {/* Set Header */}
                    <div className="p-3 bg-[#1A1A1A] rounded-t-lg border-b border-[#2A2A2A]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleSet(set.id)}
                            className="text-gray-400 hover:text-white transition-colors duration-300"
                          >
                            {set.isExpanded ? (
                              <ChevronDownIcon className="w-4 h-4" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4" />
                            )}
                          </button>
                          <FolderIcon className="w-5 h-5 text-yellow-400" />
                          <span className="text-white font-medium">{set.name}</span>
                          <span className="text-gray-400 text-sm">({set.orders.length} orders)</span>
                        </div>
                        <button
                          onClick={() => setShowDeleteSetConfirm(set.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-all duration-300"
                          title="Delete set"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Set Orders (Expandable) */}
                    {set.isExpanded && (
                      <div className="space-y-1 p-2">
                        {set.orders.map((order: any) => (
                          <div
                            key={order.id}
                            className={`p-2 rounded border transition-all duration-300 hover:bg-[#2A2A2A] ${
                              selectedOrder?.id === order.id 
                                ? 'border-[#FFFFFF] bg-[#2A2A2A]' 
                                : 'border-[#3A3A3A]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedOrders.has(order.id)}
                                  onChange={() => toggleOrderSelection(order.id)}
                                  className="w-3 h-3 text-[#FFFFFF] bg-[#0F0F0F] border-[#2A2A2A] rounded focus:ring-[#FFFFFF] focus:ring-1"
                                />
                                <span 
                                  className="text-white text-sm font-medium cursor-pointer"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  #{formatOrderNumber(order.id, true)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`px-1.5 py-0.5 rounded-full text-xs border ${statusColors[order.status]}`}>
                                  {order.status}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(order.id);
                                  }}
                                  className="text-red-400 hover:text-red-300 p-0.5 rounded hover:bg-red-400/10 transition-all duration-300"
                                  title="Delete order"
                                >
                                  <TrashIcon className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            
                            <div 
                              className="text-xs text-gray-400 cursor-pointer ml-5"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <p>{order.customerInfo.name}</p>
                              <p>{order.total === 0 ? 'FREE' : `$${order.total.toFixed(2)}`} • {order.items.length} items</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Display Individual Orders (not in sets) */}
                {searchedUnsetOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className={`p-3 rounded-lg border transition-all duration-300 hover:bg-[#2A2A2A] ${
                      selectedOrder?.id === order.id 
                        ? 'border-[#FFFFFF] bg-[#2A2A2A]' 
                        : 'border-[#2A2A2A]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="w-4 h-4 text-[#FFFFFF] bg-[#0F0F0F] border-[#2A2A2A] rounded focus:ring-[#FFFFFF] focus:ring-2"
                        />
                        <span 
                          className="text-white font-medium cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          #{formatOrderNumber(order.id, true)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs border ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(order.id);
                          }}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-all duration-300"
                          title="Delete order"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div 
                      className="text-sm text-gray-400 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <p>{order.customerInfo.name}</p>
                      <p>{order.total === 0 ? 'FREE' : `$${order.total.toFixed(2)}`} • {order.items.length} items</p>
                      <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">Order Details</h2>
          </div>
          
          {selectedOrder ? (
            <div className="p-4 space-y-6">
              {/* Order Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Order #{formatOrderNumber(selectedOrder.id, true)}
                </h3>
                <p className="text-gray-500 text-xs mb-1">
                  Full Order ID: {selectedOrder.id}
                </p>
                <p className="text-gray-400 text-sm">
                  Created: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Update Status
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value as 'pending' | 'accepted' | 'processing' | 'delivered' | 'declined' | 'canceled')}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] transition-all duration-300"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delete Order */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Danger Zone
                </label>
                {showDeleteConfirm === selectedOrder.id ? (
                  <div className="space-y-2">
                    <p className="text-red-400 text-sm">Are you sure you want to delete this order? This action cannot be undone.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteOrder(selectedOrder.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 text-sm"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => confirmDelete(selectedOrder.id)}
                    className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 font-medium py-2 px-3 rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete Order
                  </button>
                )}
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="text-md font-semibold text-white mb-2">Customer Information</h4>
                <div className="space-y-1 text-sm text-gray-400">
                  <p><span className="text-gray-300">Name:</span> {selectedOrder.customerInfo.name}</p>
                  <p><span className="text-gray-300">Email:</span> {selectedOrder.customerInfo.email}</p>
                  <p><span className="text-gray-300">Phone:</span> {selectedOrder.customerInfo.phone}</p>
                  <p><span className="text-gray-300">Address:</span> {selectedOrder.customerInfo.address}</p>
                  <p><span className="text-gray-300">ZIP:</span> {selectedOrder.customerInfo.zipCode}</p>
                  <p><span className="text-gray-300">Country:</span> {selectedOrder.customerInfo.country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-md font-semibold text-white mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-[#0F0F0F] rounded-lg">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        {/* Using a placeholder since we don't have Image component here */}
                        <div className="bg-gray-700 w-full h-full rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">IMG</span>
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.name}</p>
                        <p className="text-gray-400 text-xs">
                          {item.quantity} × ${item.price.toFixed(2)} = ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
                  <div className="flex justify-between text-white font-semibold">
                    <span>Total:</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <TrashIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Order</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete order #{formatOrderNumber(showDeleteConfirm, true)}? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteOrder(showDeleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <TrashIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Multiple Orders</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete {selectedOrders.size} selected orders? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDelete(false)}
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Delete {selectedOrders.size} Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Set Confirmation Modal */}
      {showDeleteSetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <FolderIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Order Set</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this set? The orders will be moved back to individual orders. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteSetConfirm(null)}
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteSet(showDeleteSetConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Delete Set
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}