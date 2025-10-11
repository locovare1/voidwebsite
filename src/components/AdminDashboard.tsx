"use client";

import { useState, useEffect } from 'react';
import { useOrders, Order } from '@/contexts/OrderContext';
import { reviewService, Review } from '@/lib/reviewService';
import { formatOrderNumber } from '@/lib/orderUtils';
import { products, Product } from '@/data/products';
import { teamService, Team, Player } from '@/lib/teamService';
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
  ChevronRightIcon,
  ChevronUpIcon
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
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'reviews' | 'products' | 'teams'>('overview');

  // Team management state
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<{ teamId: string; playerIndex: number; player: Player } | null>(null);
  const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'>>({
    name: '',
    role: '',
    image: '',
    game: '',
    achievements: [],
    socialLinks: {}
  });
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState<Omit<Team, 'id' | 'createdAt'>>({
    name: '',
    image: '',
    description: '',
    achievements: [],
    players: []
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reviewsData, teamsData] = await Promise.all([
          reviewService.getAllReviews(),
          teamService.getAll()
        ]);
        setReviews(reviewsData);
        setTeams(teamsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  // Team management functions
  const handleAddPlayer = async (teamId: string) => {
    if (!newPlayer.name.trim() || !newPlayer.role.trim() || !newPlayer.game.trim()) {
      alert('Please fill in name, role, and game fields');
      return;
    }

    try {
      setLoadingTeams(true);
      await teamService.addPlayer(teamId, newPlayer as Player);

      // Reload teams
      const updatedTeams = await teamService.getAll();
      setTeams(updatedTeams);

      // Reset form
      setNewPlayer({
        name: '',
        role: '',
        image: '',
        game: '',
        achievements: [],
        socialLinks: {}
      });
      setShowAddPlayer(false);
      setSelectedTeam(null);

      alert('Player added successfully!');
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Failed to add player');
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleEditPlayer = async (teamId: string, playerIndex: number, updatedPlayer: Player) => {
    try {
      setLoadingTeams(true);
      await teamService.updatePlayer(teamId, playerIndex, updatedPlayer);

      // Reload teams
      const updatedTeams = await teamService.getAll();
      setTeams(updatedTeams);

      setEditingPlayer(null);
      alert('Player updated successfully!');
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Failed to update player');
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleDeletePlayer = async (teamId: string, playerIndex: number) => {
    if (!confirm('Are you sure you want to remove this player?')) return;

    try {
      setLoadingTeams(true);
      await teamService.removePlayer(teamId, playerIndex);

      // Reload teams
      const updatedTeams = await teamService.getAll();
      setTeams(updatedTeams);

      alert('Player removed successfully!');
    } catch (error) {
      console.error('Error removing player:', error);
      alert('Failed to remove player');
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim() || !newTeam.description.trim()) {
      alert('Please fill in team name and description');
      return;
    }

    try {
      setLoadingTeams(true);
      await teamService.create(newTeam);
      
      // Reload teams
      const updatedTeams = await teamService.getAll();
      setTeams(updatedTeams);
      
      // Reset form
      setNewTeam({
        name: '',
        image: '',
        description: '',
        achievements: [],
        players: []
      });
      setShowCreateTeam(false);
      
      alert('Team created successfully!');
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team');
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete the team "${teamName}"? This will remove all players and cannot be undone.`)) return;

    try {
      setLoadingTeams(true);
      await teamService.remove(teamId);
      
      // Reload teams
      const updatedTeams = await teamService.getAll();
      setTeams(updatedTeams);
      
      alert('Team deleted successfully!');
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setShowEditTeam(true);
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam || !editingTeam.name.trim() || !editingTeam.description.trim()) {
      alert('Please fill in team name and description');
      return;
    }

    try {
      setLoadingTeams(true);
      await teamService.update(editingTeam.id!, {
        name: editingTeam.name,
        image: editingTeam.image,
        description: editingTeam.description,
        achievements: editingTeam.achievements,
        players: editingTeam.players
      });
      
      // Reload teams
      const updatedTeams = await teamService.getAll();
      setTeams(updatedTeams);
      
      setShowEditTeam(false);
      setEditingTeam(null);
      
      alert('Team updated successfully!');
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Failed to update team');
    } finally {
      setLoadingTeams(false);
    }
  };

  const movePlayer = (direction: 'up' | 'down', playerIndex: number) => {
    if (!editingTeam) return;
    
    const newIndex = direction === 'up' ? playerIndex - 1 : playerIndex + 1;
    if (newIndex < 0 || newIndex >= editingTeam.players.length) return;
    
    const updatedPlayers = [...editingTeam.players];
    [updatedPlayers[playerIndex], updatedPlayers[newIndex]] = [updatedPlayers[newIndex], updatedPlayers[playerIndex]];
    
    setEditingTeam({
      ...editingTeam,
      players: updatedPlayers
    });
  };

  const removePlayerFromTeam = (playerIndex: number) => {
    if (!editingTeam) return;
    
    const updatedPlayers = editingTeam.players.filter((_, index) => index !== playerIndex);
    setEditingTeam({
      ...editingTeam,
      players: updatedPlayers
    });
  };

  const handleMovePlayer = async (teamId: string, playerIndex: number, direction: 'up' | 'down') => {
    try {
      setLoadingTeams(true);
      
      // Get the current team
      const team = teams.find(t => t.id === teamId);
      if (!team || !team.players) return;
      
      const newIndex = direction === 'up' ? playerIndex - 1 : playerIndex + 1;
      if (newIndex < 0 || newIndex >= team.players.length) return;
      
      // Create new players array with swapped positions
      const updatedPlayers = [...team.players];
      [updatedPlayers[playerIndex], updatedPlayers[newIndex]] = [updatedPlayers[newIndex], updatedPlayers[playerIndex]];
      
      // Update the team in Firebase
      await teamService.update(teamId, {
        players: updatedPlayers
      });
      
      // Reload teams to reflect changes
      const updatedTeams = await teamService.getAll();
      setTeams(updatedTeams);
      
    } catch (error) {
      console.error('Error moving player:', error);
      alert('Failed to move player');
    } finally {
      setLoadingTeams(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0F0F0F] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Navigation Tabs */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'orders', label: 'Orders', icon: ShoppingBagIcon },
            { id: 'reviews', label: 'Reviews', icon: StarIcon },
            { id: 'products', label: 'Products', icon: UserIcon },
            { id: 'teams', label: 'Teams', icon: UserIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${activeTab === tab.id
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
          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-white mt-2">${totalRevenue.toFixed(2)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs">Active</span>
                  </div>
                </div>
                <div className="bg-green-500/20 p-3 rounded-xl group-hover:bg-green-500/30 transition-colors">
                  <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Orders</p>
                  <p className="text-3xl font-bold text-white mt-2">{totalOrders}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-400 text-xs">{pendingOrders} pending</span>
                  </div>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                  <ShoppingBagIcon className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Avg Order Value</p>
                  <p className="text-3xl font-bold text-white mt-2">${averageOrderValue.toFixed(2)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-purple-400 text-xs">Per order</span>
                  </div>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                  <ChartBarIcon className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Avg Rating</p>
                  <p className="text-3xl font-bold text-white mt-2">{averageRating.toFixed(1)}/5</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-yellow-400 text-xs">{reviews.length} reviews</span>
                  </div>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-xl group-hover:bg-yellow-500/30 transition-colors">
                  <StarIcon className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                Order Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-[#0F0F0F]/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="text-gray-300">Pending</span>
                  </div>
                  <span className="text-yellow-400 font-bold text-lg">{pendingOrders}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#0F0F0F]/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Completed</span>
                  </div>
                  <span className="text-green-400 font-bold text-lg">{completedOrders}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#0F0F0F]/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Total Reviews</span>
                  </div>
                  <span className="text-blue-400 font-bold text-lg">{reviews.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
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
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-xl">
                    <ShoppingBagIcon className="w-6 h-6 text-green-400" />
                  </div>
                  Orders Management
                </h2>
                <p className="text-gray-400 text-sm mt-2">Manage and track all customer orders</p>
              </div>
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
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#3A3A3A] rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="bg-yellow-500/20 p-2 rounded-xl">
                    <StarIcon className="w-6 h-6 text-yellow-400" />
                  </div>
                  Reviews Management
                </h2>
                <p className="text-gray-400 text-sm mt-2">Monitor and manage customer feedback</p>
              </div>
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
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
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

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserIcon className="w-6 h-6" />
                Teams Management
              </h2>
              <button
                onClick={() => setShowCreateTeam(true)}
                className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Create Team
              </button>
            </div>

            {loadingTeams ? (
              <div className="text-center py-8">
                <div className="text-white">Loading teams...</div>
              </div>
            ) : (
              <div className="space-y-6">
                {teams.length === 0 ? (
                  <p className="text-gray-400">No teams found.</p>
                ) : (
                  teams.map((team) => (
                    <div key={team.id} className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                          <p className="text-gray-400 text-sm mb-2">{team.description}</p>
                          <div className="text-xs text-gray-500">
                            Players: {team.players?.length || 0}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowAddPlayer(true);
                            }}
                            className="bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 text-green-400 px-3 py-2 rounded-lg text-sm font-medium"
                          >
                            Add Player
                          </button>
                          <button
                            onClick={() => handleEditTeam(team)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                            title="Edit Team & Reorder Players"
                          >
                            Edit Team
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team.id!, team.name)}
                            className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium"
                            title="Delete Team"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Players List */}
                      <div className="space-y-3">
                        <h4 className="text-lg font-medium text-white">Players</h4>
                        {!team.players || team.players.length === 0 ? (
                          <p className="text-gray-400 text-sm">No players in this team yet.</p>
                        ) : (
                          team.players.map((player, index) => (
                            <div key={index} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                              {editingPlayer?.teamId === team.id && editingPlayer?.playerIndex === index ? (
                                // Edit Mode
                                <div className="space-y-4">
                                  <div className="text-sm font-medium text-gray-300 mb-2">
                                    Editing: {editingPlayer.player.name}
                                  </div>
                                  
                                  {/* Basic Info */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                      type="text"
                                      value={editingPlayer.player.name}
                                      onChange={(e) => setEditingPlayer({
                                        ...editingPlayer,
                                        player: { ...editingPlayer.player, name: e.target.value }
                                      })}
                                      className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                      placeholder="Player Name"
                                    />
                                    <input
                                      type="text"
                                      value={editingPlayer.player.role}
                                      onChange={(e) => setEditingPlayer({
                                        ...editingPlayer,
                                        player: { ...editingPlayer.player, role: e.target.value }
                                      })}
                                      className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                      placeholder="Role"
                                    />
                                    <input
                                      type="text"
                                      value={editingPlayer.player.game}
                                      onChange={(e) => setEditingPlayer({
                                        ...editingPlayer,
                                        player: { ...editingPlayer.player, game: e.target.value }
                                      })}
                                      className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                      placeholder="Game"
                                    />
                                  </div>

                                  {/* Image URL */}
                                  <div>
                                    <input
                                      type="text"
                                      value={editingPlayer.player.image}
                                      onChange={(e) => setEditingPlayer({
                                        ...editingPlayer,
                                        player: { ...editingPlayer.player, image: e.target.value }
                                      })}
                                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                      placeholder="Player Image URL"
                                    />
                                  </div>

                                  {/* Achievements */}
                                  <div>
                                    <input
                                      type="text"
                                      value={editingPlayer.player.achievements?.join(', ') || ''}
                                      onChange={(e) => setEditingPlayer({
                                        ...editingPlayer,
                                        player: { 
                                          ...editingPlayer.player, 
                                          achievements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                        }
                                      })}
                                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                      placeholder="Achievements (comma separated) - e.g. Champion 2023, MVP Award, Top Fragger"
                                    />
                                  </div>

                                  {/* Social Links */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                      type="text"
                                      value={editingPlayer.player.socialLinks?.twitter || ''}
                                      onChange={(e) => setEditingPlayer({
                                        ...editingPlayer,
                                        player: { 
                                          ...editingPlayer.player, 
                                          socialLinks: {
                                            ...editingPlayer.player.socialLinks,
                                            twitter: e.target.value
                                          }
                                        }
                                      })}
                                      className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                      placeholder="Twitter URL"
                                    />
                                    <input
                                      type="text"
                                      value={editingPlayer.player.socialLinks?.twitch || ''}
                                      onChange={(e) => setEditingPlayer({
                                        ...editingPlayer,
                                        player: { 
                                          ...editingPlayer.player, 
                                          socialLinks: {
                                            ...editingPlayer.player.socialLinks,
                                            twitch: e.target.value
                                          }
                                        }
                                      })}
                                      className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                      placeholder="Twitch URL"
                                    />
                                  </div>

                                  {/* Instagram Link */}
                                  <div>
                                    <input
                                      type="text"
                                      value={editingPlayer.player.socialLinks?.instagram || ''}
                                      onChange={(e) => setEditingPlayer({
                                        ...editingPlayer,
                                        player: { 
                                          ...editingPlayer.player, 
                                          socialLinks: {
                                            ...editingPlayer.player.socialLinks,
                                            instagram: e.target.value
                                          }
                                        }
                                      })}
                                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                      placeholder="Instagram URL"
                                    />
                                  </div>
                                  <div className="flex gap-3 pt-2 border-t border-[#2A2A2A]">
                                    <button
                                      onClick={() => handleEditPlayer(team.id!, index, editingPlayer.player)}
                                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                                    >
                                      Save Changes
                                    </button>
                                    <button
                                      onClick={() => setEditingPlayer(null)}
                                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                // View Mode
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="bg-gray-600/20 text-gray-400 px-2 py-1 rounded text-xs font-mono">
                                        #{index + 1}
                                      </span>
                                      <h5 className="text-white font-medium">{player.name}</h5>
                                      <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                                        {player.role}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-400 space-y-1">
                                      <div>Game: {player.game}</div>
                                      {player.achievements && player.achievements.length > 0 && (
                                        <div>Achievements: {player.achievements.slice(0, 2).join(', ')}{player.achievements.length > 2 ? '...' : ''}</div>
                                      )}
                                      {(player.socialLinks?.twitter || player.socialLinks?.twitch || player.socialLinks?.instagram) && (
                                        <div className="flex gap-2 mt-1">
                                          {player.socialLinks?.twitter && (
                                            <a href={player.socialLinks.twitter} target="_blank" rel="noopener noreferrer" 
                                               className="text-blue-400 hover:text-blue-300 text-xs">Twitter</a>
                                          )}
                                          {player.socialLinks?.twitch && (
                                            <a href={player.socialLinks.twitch} target="_blank" rel="noopener noreferrer" 
                                               className="text-purple-400 hover:text-purple-300 text-xs">Twitch</a>
                                          )}
                                          {player.socialLinks?.instagram && (
                                            <a href={player.socialLinks.instagram} target="_blank" rel="noopener noreferrer" 
                                               className="text-pink-400 hover:text-pink-300 text-xs">Instagram</a>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-1 items-center">
                                    {/* Reorder buttons */}
                                    <div className="flex flex-col">
                                      <button
                                        onClick={() => handleMovePlayer(team.id!, index, 'up')}
                                        disabled={index === 0}
                                        className="text-gray-400 hover:text-white p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Move Up"
                                      >
                                        <ChevronUpIcon className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleMovePlayer(team.id!, index, 'down')}
                                        disabled={index === (team.players?.length || 0) - 1}
                                        className="text-gray-400 hover:text-white p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Move Down"
                                      >
                                        <ChevronDownIcon className="w-3 h-3" />
                                      </button>
                                    </div>
                                    
                                    {/* Action buttons */}
                                    <button
                                      onClick={() => {
                                        console.log('Edit button clicked for player:', player.name);
                                        setEditingPlayer({
                                          teamId: team.id!,
                                          playerIndex: index,
                                          player: { ...player }
                                        });
                                      }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                                      title="Edit Player"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeletePlayer(team.id!, index)}
                                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                                      title="Remove Player"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {showAddPlayer && selectedTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  Add Player to {selectedTeam.name}
                </h3>
                <button
                  onClick={() => {
                    setShowAddPlayer(false);
                    setSelectedTeam(null);
                    setNewPlayer({
                      name: '',
                      role: '',
                      image: '',
                      game: '',
                      achievements: [],
                      socialLinks: {}
                    });
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white"
                    placeholder="Enter player name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role *
                  </label>
                  <input
                    type="text"
                    value={newPlayer.role}
                    onChange={(e) => setNewPlayer({ ...newPlayer, role: e.target.value })}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white"
                    placeholder="e.g. Entry Fragger, IGL, AWPer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Game *
                  </label>
                  <input
                    type="text"
                    value={newPlayer.game}
                    onChange={(e) => setNewPlayer({ ...newPlayer, game: e.target.value })}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white"
                    placeholder="e.g. Fortnite, CS2, Valorant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={newPlayer.image}
                    onChange={(e) => setNewPlayer({ ...newPlayer, image: e.target.value })}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white"
                    placeholder="Player image URL"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Achievements (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newPlayer.achievements?.join(', ') || ''}
                    onChange={(e) => setNewPlayer({
                      ...newPlayer, 
                      achievements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white"
                    placeholder="e.g. Champion 2023, MVP Award, Top Fragger"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Twitter URL
                    </label>
                    <input
                      type="text"
                      value={newPlayer.socialLinks?.twitter || ''}
                      onChange={(e) => setNewPlayer({
                        ...newPlayer, 
                        socialLinks: {...newPlayer.socialLinks, twitter: e.target.value}
                      })}
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white"
                      placeholder="Twitter profile URL"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Twitch URL
                    </label>
                    <input
                      type="text"
                      value={newPlayer.socialLinks?.twitch || ''}
                      onChange={(e) => setNewPlayer({
                        ...newPlayer, 
                        socialLinks: {...newPlayer.socialLinks, twitch: e.target.value}
                      })}
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white"
                      placeholder="Twitch channel URL"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="text"
                    value={newPlayer.socialLinks?.instagram || ''}
                    onChange={(e) => setNewPlayer({
                      ...newPlayer, 
                      socialLinks: {...newPlayer.socialLinks, instagram: e.target.value}
                    })}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white"
                    placeholder="Instagram profile URL"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddPlayer(false);
                      setSelectedTeam(null);
                      setNewPlayer({
                        name: '',
                        role: '',
                        image: '',
                        game: '',
                        achievements: [],
                        socialLinks: {}
                      });
                    }}
                    className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddPlayer(selectedTeam.id!)}
                    disabled={loadingTeams}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    {loadingTeams ? 'Adding...' : 'Add Player'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Create New Team</h3>
                <button
                  onClick={() => {
                    setShowCreateTeam(false);
                    setNewTeam({
                      name: '',
                      image: '',
                      description: '',
                      achievements: [],
                      players: []
                    });
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white"
                    placeholder="Enter team name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white h-20 resize-none"
                    placeholder="Enter team description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Team Logo URL
                  </label>
                  <input
                    type="text"
                    value={newTeam.image}
                    onChange={(e) => setNewTeam({...newTeam, image: e.target.value})}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white"
                    placeholder="Team logo image URL"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowCreateTeam(false);
                      setNewTeam({
                        name: '',
                        image: '',
                        description: '',
                        achievements: [],
                        players: []
                      });
                    }}
                    className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTeam}
                    disabled={loadingTeams}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    {loadingTeams ? 'Creating...' : 'Create Team'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditTeam && editingTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Edit Team: {editingTeam.name}</h3>
                <button
                  onClick={() => {
                    setShowEditTeam(false);
                    setEditingTeam(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Team Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      value={editingTeam.name}
                      onChange={(e) => setEditingTeam({...editingTeam, name: e.target.value})}
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={editingTeam.description}
                      onChange={(e) => setEditingTeam({...editingTeam, description: e.target.value})}
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white h-20 resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Team Logo URL
                    </label>
                    <input
                      type="text"
                      value={editingTeam.image}
                      onChange={(e) => setEditingTeam({...editingTeam, image: e.target.value})}
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Players Management */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Players Management</h4>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {editingTeam.players.length === 0 ? (
                      <p className="text-gray-400 text-sm">No players in this team yet.</p>
                    ) : (
                      editingTeam.players.map((player, index) => (
                        <div key={index} className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-medium">{player.name}</span>
                                <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                                  {player.role}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400">
                                Game: {player.game}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {/* Move Up */}
                              <button
                                onClick={() => movePlayer('up', index)}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-white p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move Up"
                              >
                                <ChevronUpIcon className="w-4 h-4" />
                              </button>
                              
                              {/* Move Down */}
                              <button
                                onClick={() => movePlayer('down', index)}
                                disabled={index === editingTeam.players.length - 1}
                                className="text-gray-400 hover:text-white p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move Down"
                              >
                                <ChevronDownIcon className="w-4 h-4" />
                              </button>
                              
                              {/* Remove Player */}
                              <button
                                onClick={() => removePlayerFromTeam(index)}
                                className="text-red-400 hover:text-red-300 p-1 ml-2"
                                title="Remove Player"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Use the up/down arrows to reorder players. The first player will appear first on the team page.
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-6 border-t border-[#2A2A2A] mt-6">
                <button
                  onClick={() => {
                    setShowEditTeam(false);
                    setEditingTeam(null);
                  }}
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTeam}
                  disabled={loadingTeams}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
                >
                  {loadingTeams ? 'Updating...' : 'Update Team'}
                </button>
              </div>
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
    </div>
  );
}