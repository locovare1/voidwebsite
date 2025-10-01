"use client";

import { useState, useEffect } from 'react';
import { updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrashIcon, UserIcon, StarIcon, FolderIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useOrders, Order, OrderSet } from '@/contexts/OrderContext';
import { reviewService, Review } from '@/lib/reviewService';
import { newsService, type NewsArticle } from '@/lib/newsService';
import { teamService, type Team, type Player } from '@/lib/teamService';
import { productService, type Product } from '@/lib/productService';
import { scheduleService, type Match, type Event } from '@/lib/scheduleService';
import { uploadService } from '@/lib/uploadService';
import { formatOrderNumber } from '@/lib/orderUtils';
import Image from 'next/image';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}



// Review interface imported from '@/lib/reviewService'

const statusColors = {
  pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20',
  accepted: 'bg-blue-900/20 text-blue-400 border-blue-500/20',
  processing: 'bg-purple-900/20 text-purple-400 border-purple-500/20',
  delivered: 'bg-green-900/20 text-green-400 border-green-500/20',
  declined: 'bg-red-900/20 text-red-400 border-red-500/20',
  canceled: 'bg-gray-900/20 text-gray-400 border-gray-500/20',
};

const statusOptions: Order['status'][] = ['pending', 'accepted', 'processing', 'delivered', 'declined', 'canceled'];

export default function AdminDashboard() {
  const { orders, sets, updateOrderStatus, deleteOrder, toggleSet, deleteSet, getUnsetOrders } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showDeleteSetConfirm, setShowDeleteSetConfirm] = useState<string | null>(null);

  // Review management state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReviewDetails, setShowReviewDetails] = useState(false);
  const [showDeleteReviewConfirm, setShowDeleteReviewConfirm] = useState<string | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [showBulkReviewDelete, setShowBulkReviewDelete] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // News management state
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    date: '',
    image: '',
    description: '',
    category: ''
  });
  const [showDeleteNewsConfirm, setShowDeleteNewsConfirm] = useState<string | null>(null);

  // Teams (roster) management state
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showDeleteTeamConfirm, setShowDeleteTeamConfirm] = useState<string | null>(null);
  const [teamForm, setTeamForm] = useState<Omit<Team, 'id' | 'createdAt'>>({
    name: '',
    image: '',
    description: '',
    achievements: [],
    players: []
  });
  const [playerDraft, setPlayerDraft] = useState<Player>({
    name: '', role: '', image: '', game: '', achievements: [], socialLinks: {}
  });
  const [uploadingTeamImage, setUploadingTeamImage] = useState(false);
  const [uploadingPlayerImage, setUploadingPlayerImage] = useState(false);
  const [uploadingNewsImage, setUploadingNewsImage] = useState(false);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);

  // Shop (Products) management state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    image: '',
    category: '',
    description: '',
    link: ''
  });
  const [showDeleteProductConfirm, setShowDeleteProductConfirm] = useState<string | null>(null);

  // Schedule management state
  const [matches, setMatches] = useState<Match[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [matchForm, setMatchForm] = useState({
    game: '',
    event: '',
    opponent: '',
    date: '',
    time: '',
    streamLink: ''
  });
  const [eventForm, setEventForm] = useState({
    name: '',
    game: '',
    date: '',
    type: '',
    prizePool: '',
    registrationLink: ''
  });
  const [showDeleteMatchConfirm, setShowDeleteMatchConfirm] = useState<string | null>(null);
  const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState<string | null>(null);

  const unsetOrders = getUnsetOrders();
  const filteredUnsetOrders = filterStatus === 'all' 
    ? unsetOrders 
    : unsetOrders.filter((order: Order) => order.status === filterStatus);
  
  const filteredSets = sets.map((set: OrderSet) => ({
    ...set,
    orders: filterStatus === 'all' 
      ? set.orders 
      : set.orders.filter((order: Order) => order.status === filterStatus)
  })).filter((set: OrderSet) => set.orders.length > 0);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Update in Firebase
      if (db) {
        await updateDoc(doc(db, 'orders', orderId), {
          status: newStatus
        });
      }
      
      // Update local state
      updateOrderStatus(orderId, newStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status in Firebase:', error);
      // Still update locally as fallback
      updateOrderStatus(orderId, newStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  // Load news
  const loadNews = async () => {
    setIsLoadingNews(true);
    try {
      const items = await newsService.getAll();
      setNews(items);
    } catch (e) {
      console.error('Error loading news:', e);
      setNews([]);
    } finally {
      setIsLoadingNews(false);
    }
  };

  // Load teams
  const loadTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const all = await teamService.getAll();
      setTeams(all);
    } catch (e) {
      console.error('Error loading teams:', e);
      setTeams([]);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  // News CRUD
  const resetNewsForm = () => {
    setNewsForm({ title: '', date: '', image: '', description: '', category: '' });
    setEditingArticle(null);
  };

  const submitNews = async () => {
    try {
      const resolvedDate = newsForm.date
        ? Timestamp.fromDate(new Date(newsForm.date))
        : Timestamp.now();

      if (editingArticle?.id) {
        await newsService.update(editingArticle.id, {
          title: newsForm.title,
          image: newsForm.image,
          description: newsForm.description,
          category: newsForm.category,
          date: resolvedDate
        });
      } else {
        await newsService.create({
          title: newsForm.title,
          image: newsForm.image,
          description: newsForm.description,
          category: newsForm.category,
          date: resolvedDate
        });
      }
      await loadNews();
      resetNewsForm();
    } catch (e) {
      console.error('Error saving news:', e);
    }
  };

  const deleteNews = async (id: string) => {
    try {
      await newsService.remove(id);
      await loadNews();
    } catch (e) {
      console.error('Error deleting news:', e);
    } finally {
      setShowDeleteNewsConfirm(null);
    }
  };

  // Teams CRUD
  const resetTeamForm = () => {
    setTeamForm({ name: '', image: '', description: '', achievements: [], players: [] });
    setPlayerDraft({ name: '', role: '', image: '', game: '', achievements: [], socialLinks: {} });
    setEditingTeam(null);
  };

  const handleTeamImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingTeamImage(true);
    try {
      const url = await uploadService.uploadTeamImage(file);
      setTeamForm(p => ({ ...p, image: url }));
    } catch (error) {
      console.error('Error uploading team image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingTeamImage(false);
    }
  };

  const handlePlayerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingPlayerImage(true);
    try {
      const url = await uploadService.uploadPlayerImage(file);
      setPlayerDraft(p => ({ ...p, image: url }));
    } catch (error) {
      console.error('Error uploading player image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingPlayerImage(false);
    }
  };

  const handleNewsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingNewsImage(true);
    try {
      const url = await uploadService.uploadNewsImage(file);
      setNewsForm(p => ({ ...p, image: url }));
    } catch (error) {
      console.error('Error uploading news image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingNewsImage(false);
    }
  };

  const submitTeam = async () => {
    try {
      if (editingTeam?.id) {
        await teamService.update(editingTeam.id, { ...teamForm });
      } else {
        await teamService.create({ ...teamForm });
      }
      await loadTeams();
      resetTeamForm();
    } catch (e) {
      console.error('Error saving team:', e);
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      await teamService.remove(id);
      await loadTeams();
    } catch (e) {
      console.error('Error deleting team:', e);
    }
  };

  const addPlayerToForm = () => {
    setTeamForm(prev => ({ ...prev, players: [...(prev.players || []), playerDraft] }));
    setPlayerDraft({ name: '', role: '', image: '', game: '', achievements: [], socialLinks: {} });
  };

  const removePlayerFromForm = (index: number) => {
    setTeamForm(prev => ({ ...prev, players: prev.players.filter((_, i) => i !== index) }));
  };

  // Products CRUD
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const all = await productService.getAll();
      setProducts(all);
    } catch (e) {
      console.error('Error loading products:', e);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({ name: '', price: 0, image: '', category: '', description: '', link: '' });
    setEditingProduct(null);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingProductImage(true);
    try {
      const url = await uploadService.uploadProductImage(file);
      setProductForm(p => ({ ...p, image: url }));
    } catch (error) {
      console.error('Error uploading product image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingProductImage(false);
    }
  };

  const submitProduct = async () => {
    try {
      if (editingProduct?.id) {
        await productService.update(editingProduct.id, { ...productForm });
      } else {
        await productService.create({ ...productForm });
      }
      await loadProducts();
      resetProductForm();
    } catch (e) {
      console.error('Error saving product:', e);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.remove(id);
      await loadProducts();
    } catch (e) {
      console.error('Error deleting product:', e);
    } finally {
      setShowDeleteProductConfirm(null);
    }
  };

  // Schedule CRUD
  const loadSchedule = async () => {
    setIsLoadingSchedule(true);
    try {
      const [allMatches, allEvents] = await Promise.all([
        scheduleService.getAllMatches(),
        scheduleService.getAllEvents()
      ]);
      setMatches(allMatches);
      setEvents(allEvents);
    } catch (e) {
      console.error('Error loading schedule:', e);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const resetMatchForm = () => {
    setMatchForm({ game: '', event: '', opponent: '', date: '', time: '', streamLink: '' });
    setEditingMatch(null);
  };

  const submitMatch = async () => {
    try {
      if (editingMatch?.id) {
        await scheduleService.updateMatch(editingMatch.id, { ...matchForm });
      } else {
        await scheduleService.createMatch({ ...matchForm });
      }
      await loadSchedule();
      resetMatchForm();
    } catch (e) {
      console.error('Error saving match:', e);
    }
  };

  const deleteMatch = async (id: string) => {
    try {
      await scheduleService.removeMatch(id);
      await loadSchedule();
    } catch (e) {
      console.error('Error deleting match:', e);
    } finally {
      setShowDeleteMatchConfirm(null);
    }
  };

  const resetEventForm = () => {
    setEventForm({ name: '', game: '', date: '', type: '', prizePool: '', registrationLink: '' });
    setEditingEvent(null);
  };

  const submitEvent = async () => {
    try {
      if (editingEvent?.id) {
        await scheduleService.updateEvent(editingEvent.id, { ...eventForm });
      } else {
        await scheduleService.createEvent({ ...eventForm });
      }
      await loadSchedule();
      resetEventForm();
    } catch (e) {
      console.error('Error saving event:', e);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await scheduleService.removeEvent(id);
      await loadSchedule();
    } catch (e) {
      console.error('Error deleting event:', e);
    } finally {
      setShowDeleteEventConfirm(null);
    }
  };

  const getStatusCount = (status: Order['status']) => {
    return orders.filter(order => order.status === status).length;
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      // Delete from Firebase
      if (db) {
        await deleteDoc(doc(db, 'orders', orderId));
      }
    } catch (error) {
      console.error('Error deleting order from Firebase:', error);
    }
    
    // Delete from local state
    deleteOrder(orderId);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
    }
    setShowDeleteConfirm(null);
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
      ...filteredUnsetOrders.map(order => order.id),
      ...filteredSets.flatMap(set => set.orders.map(order => order.id))
    ];
    
    if (selectedOrders.size === allOrderIds.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(allOrderIds));
    }
  };

  const handleBulkDelete = async () => {
    // Delete from Firebase
    const deletePromises = Array.from(selectedOrders).map(async (orderId) => {
      try {
        if (db) {
          await deleteDoc(doc(db, 'orders', orderId));
        }
      } catch (error) {
        console.error(`Error deleting order ${orderId} from Firebase:`, error);
      }
    });
    
    await Promise.all(deletePromises);
    
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

  // Load reviews on component mount
  useEffect(() => {
    loadReviews();
    loadNews();
    loadTeams();
    loadProducts();
    loadSchedule();
  }, []);

  const loadReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const allReviews = await reviewService.getAllReviews();
      setReviews(allReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      if (selectedReview && selectedReview.id === reviewId) {
        setSelectedReview(null);
        setShowReviewDetails(false);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
    setShowDeleteReviewConfirm(null);
  };

  const toggleReviewSelection = (reviewId: string) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedReviews(newSelected);
  };

  const selectAllReviews = () => {
    if (selectedReviews.size === reviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(reviews.map(review => review.id || '')));
    }
  };

  const handleBulkDeleteReviews = async () => {
    try {
      const deletePromises = Array.from(selectedReviews).map(async (reviewId) => {
        await reviewService.deleteReview(reviewId);
      });

      await Promise.all(deletePromises);

      setReviews(prev => prev.filter(review => !selectedReviews.has(review.id || '')));
      setSelectedReviews(new Set());
      setShowBulkReviewDelete(false);

      if (selectedReview && selectedReviews.has(selectedReview.id || '')) {
        setSelectedReview(null);
        setShowReviewDetails(false);
      }
    } catch (error) {
      console.error('Error bulk deleting reviews:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
      />
    ));
  };

  // Simple required-field checks for forms
  const newsRequiredMissing = !newsForm.title || !newsForm.description || !newsForm.category;
  const teamRequiredMissing = !teamForm.name || !teamForm.description;
  const productRequiredMissing = !productForm.name || !productForm.category || productForm.price <= 0;
  const matchRequiredMissing = !matchForm.game || !matchForm.opponent;
  const eventRequiredMissing = !eventForm.name || !eventForm.game;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage orders and track sales</p>
        </div>
      </div>

      {/* Teams Management (Roster) */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Teams & Roster</h2>
          <button
            onClick={resetTeamForm}
            className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-1 px-3 rounded-lg text-sm"
          >
            New Team
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
          {/* Teams List */}
          <div className="max-h-[28rem] overflow-y-auto space-y-3">
            {isLoadingTeams ? (
              <div className="p-8 text-center text-gray-400">Loading teams...</div>
            ) : teams.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No teams found</div>
            ) : (
              teams.map(team => (
                <div key={team.id ?? team.name} className="p-4 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{team.name}</h3>
                      <p className="text-gray-400 text-sm">{team.description}</p>
                      <p className="text-gray-500 text-xs mt-1">Players: {team.players?.length || 0} • Achievements: {team.achievements?.length || 0}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTeam(team);
                          setTeamForm({
                            name: team.name,
                            image: team.image,
                            description: team.description,
                            achievements: team.achievements || [],
                            players: team.players || []
                          });
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10"
                      >
                        Edit
                      </button>
                      {team.id && (
                        <button
                          onClick={() => setShowDeleteTeamConfirm(team.id!)}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Team Form */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">{editingTeam ? 'Edit Team' : 'Create Team'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={teamForm.name} onChange={e=>setTeamForm(p=>({...p,name:e.target.value}))} placeholder="Team name" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Team Image</label>
                <div className="flex gap-2">
                  <input value={teamForm.image} onChange={e=>setTeamForm(p=>({...p,image:e.target.value}))} placeholder="Team image URL" className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                  <label className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-4 py-2 rounded cursor-pointer text-sm flex items-center gap-2">
                    {uploadingTeamImage ? 'Uploading...' : 'Upload'}
                    <input type="file" accept="image/*" onChange={handleTeamImageUpload} disabled={uploadingTeamImage} className="hidden" />
                  </label>
                </div>
              </div>
              {teamForm.image && (
                <div className="md:col-span-2">
                  <img src={teamForm.image} alt="Team preview" className="h-20 w-full max-w-xs object-cover rounded border border-[#2A2A2A]" />
                </div>
              )}
              <input value={teamForm.description} onChange={e=>setTeamForm(p=>({...p,description:e.target.value}))} placeholder="Description" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm md:col-span-2" />
              <input
                value={(teamForm.achievements||[]).join(', ')}
                onChange={e=>setTeamForm(p=>({...p,achievements:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))}
                placeholder="Achievements (comma separated)"
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm md:col-span-2"
              />
            </div>

            {/* Players sub-form */}
            <div className="border border-[#2A2A2A] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">Players</h4>
                <button onClick={addPlayerToForm} className="text-sm bg-[#2A2A2A] hover:bg-[#3A3A3A] px-2 py-1 rounded">Add Player</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input value={playerDraft.name} onChange={e=>setPlayerDraft(p=>({...p,name:e.target.value}))} placeholder="Name" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                <input value={playerDraft.role} onChange={e=>setPlayerDraft(p=>({...p,role:e.target.value}))} placeholder="Role" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                <input value={playerDraft.game} onChange={e=>setPlayerDraft(p=>({...p,game:e.target.value}))} placeholder="Game" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Player Image</label>
                  <div className="flex gap-2">
                    <input value={playerDraft.image} onChange={e=>setPlayerDraft(p=>({...p,image:e.target.value}))} placeholder="Image URL" className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                    <label className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-4 py-2 rounded cursor-pointer text-sm flex items-center gap-2">
                      {uploadingPlayerImage ? 'Uploading...' : 'Upload'}
                      <input type="file" accept="image/*" onChange={handlePlayerImageUpload} disabled={uploadingPlayerImage} className="hidden" />
                    </label>
                  </div>
                  {playerDraft.image && (
                    <img src={playerDraft.image} alt="Player preview" className="h-16 w-16 object-cover rounded border border-[#2A2A2A] mt-2" />
                  )}
                </div>
                <input value={(playerDraft.achievements||[]).join(', ')} onChange={e=>setPlayerDraft(p=>({...p,achievements:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} placeholder="Achievements (comma)" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm md:col-span-2" />
                <input value={playerDraft.socialLinks?.twitter||''} onChange={e=>setPlayerDraft(p=>({...p,socialLinks:{...(p.socialLinks||{}),twitter:e.target.value}}))} placeholder="Twitter URL" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                <input value={playerDraft.socialLinks?.twitch||''} onChange={e=>setPlayerDraft(p=>({...p,socialLinks:{...(p.socialLinks||{}),twitch:e.target.value}}))} placeholder="Twitch URL" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
              </div>
              {/* Existing players list */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {teamForm.players.map((pl, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm">
                    <div className="truncate">
                      <span className="text-white font-medium">{pl.name}</span>
                      <span className="text-gray-400 ml-2">{pl.role} • {pl.game}</span>
                    </div>
                    <button onClick={()=>removePlayerFromForm(idx)} className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10">Remove</button>
                  </div>
                ))}
                {teamForm.players.length === 0 && (
                  <div className="text-gray-500 text-sm">No players added yet</div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={submitTeam} disabled={teamRequiredMissing} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg text-sm">{editingTeam ? 'Update Team' : 'Create Team'}</button>
              <button onClick={resetTeamForm} className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg text-sm">Clear</button>
            </div>
          </div>
        </div>
      </div>

      {/* News Management */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">News Articles</h2>
          <button
            onClick={resetNewsForm}
            className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-1 px-3 rounded-lg text-sm"
          >
            New Article
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
          {/* News List */}
          <div className="max-h-[28rem] overflow-y-auto space-y-3">
            {isLoadingNews ? (
              <div className="p-8 text-center text-gray-400">Loading news...</div>
            ) : news.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No news found</div>
            ) : (
              news.map(article => (
                <div key={article.id ?? article.title} className="p-4 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold truncate">{article.title}</h3>
                      <p className="text-gray-400 text-sm truncate">{article.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingArticle(article);
                          setNewsForm({
                            title: article.title,
                            date: (article.date as any)?.toDate ? (article.date as any).toDate().toISOString().slice(0,10) : '',
                            image: article.image,
                            description: article.description,
                            category: article.category
                          });
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10"
                      >
                        Edit
                      </button>
                      {article.id && (
                        <button
                          onClick={() => setShowDeleteNewsConfirm(article.id!)}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{article.category}</div>
                </div>
              ))
            )}
          </div>

          {/* News Form */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">{editingArticle ? 'Edit Article' : 'Create Article'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={newsForm.title} onChange={e=>setNewsForm(p=>({...p,title:e.target.value}))} placeholder="Title" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm md:col-span-2" />
              <input type="date" value={newsForm.date} onChange={e=>setNewsForm(p=>({...p,date:e.target.value}))} placeholder="Date" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
              <input value={newsForm.category} onChange={e=>setNewsForm(p=>({...p,category:e.target.value}))} placeholder="Category" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">News Image</label>
                <div className="flex gap-2">
                  <input value={newsForm.image} onChange={e=>setNewsForm(p=>({...p,image:e.target.value}))} placeholder="Image URL" className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                  <label className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-4 py-2 rounded cursor-pointer text-sm flex items-center gap-2">
                    {uploadingNewsImage ? 'Uploading...' : 'Upload'}
                    <input type="file" accept="image/*" onChange={handleNewsImageUpload} disabled={uploadingNewsImage} className="hidden" />
                  </label>
                </div>
              </div>
              {newsForm.image && (
                <div className="md:col-span-2">
                  <img src={newsForm.image} alt="News preview" className="h-20 w-full max-w-xs object-cover rounded border border-[#2A2A2A]" />
                </div>
              )}
              <textarea value={newsForm.description} onChange={e=>setNewsForm(p=>({...p,description:e.target.value}))} placeholder="Description" rows={5} className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm md:col-span-2" />
            </div>
            <div className="flex gap-2">
              <button onClick={submitNews} disabled={newsRequiredMissing} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg text-sm">{editingArticle ? 'Update Article' : 'Create Article'}</button>
              <button onClick={resetNewsForm} className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg text-sm">Clear</button>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Management */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Shop Products</h2>
          <button onClick={resetProductForm} className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-1 px-3 rounded-lg text-sm">New Product</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
          <div className="max-h-[28rem] overflow-y-auto space-y-3">
            {isLoadingProducts ? (
              <div className="p-8 text-center text-gray-400">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No products found</div>
            ) : (
              products.map((product) => (
                <div key={product.id ?? product.name} className="p-4 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold truncate">{product.name}</h3>
                      <p className="text-gray-400 text-sm truncate">{product.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-green-400 font-bold">${product.price.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">{product.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setProductForm({
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            category: product.category,
                            description: product.description,
                            link: product.link
                          });
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10"
                      >
                        Edit
                      </button>
                      {product.id && (
                        <button
                          onClick={() => setShowDeleteProductConfirm(product.id!)}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-semibold">{editingProduct ? 'Edit Product' : 'Create Product'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={productForm.name} onChange={e=>setProductForm(p=>({...p,name:e.target.value}))} placeholder="Product name" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm md:col-span-2" />
              <input type="number" step="0.01" value={productForm.price} onChange={e=>setProductForm(p=>({...p,price:parseFloat(e.target.value)||0}))} placeholder="Price" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
              <input value={productForm.category} onChange={e=>setProductForm(p=>({...p,category:e.target.value}))} placeholder="Category" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Product Image</label>
                <div className="flex gap-2">
                  <input value={productForm.image} onChange={e=>setProductForm(p=>({...p,image:e.target.value}))} placeholder="Image URL" className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                  <label className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-4 py-2 rounded cursor-pointer text-sm flex items-center gap-2">
                    {uploadingProductImage ? 'Uploading...' : 'Upload'}
                    <input type="file" accept="image/*" onChange={handleProductImageUpload} disabled={uploadingProductImage} className="hidden" />
                  </label>
                </div>
              </div>
              {productForm.image && (
                <div className="md:col-span-2">
                  <img src={productForm.image} alt="Product preview" className="h-20 w-full max-w-xs object-cover rounded border border-[#2A2A2A]" />
                </div>
              )}
              <input value={productForm.link} onChange={e=>setProductForm(p=>({...p,link:e.target.value}))} placeholder="Purchase link" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm md:col-span-2" />
              <textarea value={productForm.description} onChange={e=>setProductForm(p=>({...p,description:e.target.value}))} placeholder="Description" rows={3} className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm md:col-span-2" />
            </div>
            <div className="flex gap-2">
              <button onClick={submitProduct} disabled={productRequiredMissing} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg text-sm">{editingProduct ? 'Update Product' : 'Create Product'}</button>
              <button onClick={resetProductForm} className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg text-sm">Clear</button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Management */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A]">
          <h2 className="text-xl font-semibold text-white">Schedule Management</h2>
        </div>
        <div className="p-4 space-y-6">
          {/* Matches Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Matches</h3>
              <button onClick={resetMatchForm} className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-1 px-3 rounded-lg text-sm">New Match</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="max-h-[20rem] overflow-y-auto space-y-3">
                {isLoadingSchedule ? (
                  <div className="p-8 text-center text-gray-400">Loading matches...</div>
                ) : matches.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No matches found</div>
                ) : (
                  matches.map((match) => (
                    <div key={match.id ?? `${match.game}-${match.date}`} className="p-3 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-medium">{match.game}: vs {match.opponent}</div>
                          <div className="text-sm text-gray-400">{match.event}</div>
                          <div className="text-xs text-gray-500 mt-1">{match.date} • {match.time}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingMatch(match);
                              setMatchForm({
                                game: match.game,
                                event: match.event,
                                opponent: match.opponent,
                                date: match.date,
                                time: match.time,
                                streamLink: match.streamLink
                              });
                            }}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10 text-sm"
                          >
                            Edit
                          </button>
                          {match.id && (
                            <button
                              onClick={() => setShowDeleteMatchConfirm(match.id!)}
                              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-medium text-sm">{editingMatch ? 'Edit Match' : 'Create Match'}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input value={matchForm.game} onChange={e=>setMatchForm(p=>({...p,game:e.target.value}))} placeholder="Game" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                  <input value={matchForm.opponent} onChange={e=>setMatchForm(p=>({...p,opponent:e.target.value}))} placeholder="Opponent" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                  <input value={matchForm.event} onChange={e=>setMatchForm(p=>({...p,event:e.target.value}))} placeholder="Event" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm col-span-2" />
                  <input value={matchForm.date} onChange={e=>setMatchForm(p=>({...p,date:e.target.value}))} placeholder="Date" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                  <input value={matchForm.time} onChange={e=>setMatchForm(p=>({...p,time:e.target.value}))} placeholder="Time" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                  <input value={matchForm.streamLink} onChange={e=>setMatchForm(p=>({...p,streamLink:e.target.value}))} placeholder="Stream link" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm col-span-2" />
                </div>
                <div className="flex gap-2">
                  <button onClick={submitMatch} disabled={matchRequiredMissing} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg text-sm">{editingMatch ? 'Update' : 'Create'}</button>
                  <button onClick={resetMatchForm} className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg text-sm">Clear</button>
                </div>
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="border-t border-[#2A2A2A] pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Events</h3>
              <button onClick={resetEventForm} className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-1 px-3 rounded-lg text-sm">New Event</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="max-h-[20rem] overflow-y-auto space-y-3">
                {isLoadingSchedule ? (
                  <div className="p-8 text-center text-gray-400">Loading events...</div>
                ) : events.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No events found</div>
                ) : (
                  events.map((event) => (
                    <div key={event.id ?? event.name} className="p-3 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-medium">{event.name}</div>
                          <div className="text-sm text-gray-400">{event.game} • {event.type}</div>
                          <div className="text-xs text-gray-500 mt-1">{event.date} • {event.prizePool}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingEvent(event);
                              setEventForm({
                                name: event.name,
                                game: event.game,
                                date: event.date,
                                type: event.type,
                                prizePool: event.prizePool,
                                registrationLink: event.registrationLink
                              });
                            }}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10 text-sm"
                          >
                            Edit
                          </button>
                          {event.id && (
                            <button
                              onClick={() => setShowDeleteEventConfirm(event.id!)}
                              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-medium text-sm">{editingEvent ? 'Edit Event' : 'Create Event'}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input value={eventForm.name} onChange={e=>setEventForm(p=>({...p,name:e.target.value}))} placeholder="Event name" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm col-span-2" />
                  <input value={eventForm.game} onChange={e=>setEventForm(p=>({...p,game:e.target.value}))} placeholder="Game" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                  <input value={eventForm.type} onChange={e=>setEventForm(p=>({...p,type:e.target.value}))} placeholder="Type" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                  <input value={eventForm.date} onChange={e=>setEventForm(p=>({...p,date:e.target.value}))} placeholder="Date" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                  <input value={eventForm.prizePool} onChange={e=>setEventForm(p=>({...p,prizePool:e.target.value}))} placeholder="Prize pool" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm" />
                  <input value={eventForm.registrationLink} onChange={e=>setEventForm(p=>({...p,registrationLink:e.target.value}))} placeholder="Registration link" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm col-span-2" />
                </div>
                <div className="flex gap-2">
                  <button onClick={submitEvent} disabled={eventRequiredMissing} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg text-sm">{editingEvent ? 'Update' : 'Create'}</button>
                  <button onClick={resetEventForm} className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg text-sm">Clear</button>
                </div>
              </div>
            </div>
          </div>
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

      {/* Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Table */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Orders</h2>
              {(filteredUnsetOrders.length > 0 || filteredSets.length > 0) && (
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
            {filteredUnsetOrders.length === 0 && filteredSets.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No orders found</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {/* Display Sets */}
                {filteredSets.map((set) => (
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
                        {set.orders.map((order) => (
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
                {filteredUnsetOrders.map((order) => (
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
                  onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value as Order['status'])}
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
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-[#0F0F0F] rounded-lg">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain rounded"
                        />
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

      {/* Review Management Section */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Review Management</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                {selectedReviews.size > 0 && (
                  <button
                    onClick={() => setShowBulkReviewDelete(true)}
                    className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 font-medium py-1 px-3 rounded-lg transition-all duration-300 text-sm flex items-center gap-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete ({selectedReviews.size})
                  </button>
                )}
                <button
                  onClick={selectAllReviews}
                  className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-1 px-3 rounded-lg transition-all duration-300 text-sm"
                >
                  Select All
                </button>
                <button
                  onClick={loadReviews}
                  className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-1 px-3 rounded-lg transition-all duration-300 text-sm"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoadingReviews ? (
            <div className="p-8 text-center text-gray-400">
              <p>Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No reviews found</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className={`p-4 rounded-lg border transition-all duration-300 hover:bg-[#2A2A2A] ${
                    selectedReview?.id === review.id
                      ? 'border-[#FFFFFF] bg-[#2A2A2A]'
                      : 'border-[#3A3A3A]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedReviews.has(review.id || '')}
                        onChange={() => toggleReviewSelection(review.id || '')}
                        className="w-4 h-4 text-[#FFFFFF] bg-[#0F0F0F] border-[#2A2A2A] rounded focus:ring-[#FFFFFF] focus:ring-2 mt-1"
                      />
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-400">
                            Product ID: {review.productId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <UserIcon className="w-4 h-4" />
                          <span>{review.userName}</span>
                          <span>•</span>
                          <span>{review.userEmail}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowReviewDetails(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10 transition-all duration-300"
                        title="View details"
                      >
                        <UserIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteReviewConfirm(review.id || '');
                        }}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-all duration-300"
                        title="Delete review"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    className="cursor-pointer ml-7"
                    onClick={() => {
                      setSelectedReview(review);
                      setShowReviewDetails(true);
                    }}
                  >
                    <p className="text-white text-sm font-medium mb-1">&quot;{review.comment}&quot;</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {review.verified ? '✓ Verified Purchase' : '○ Unverified'} •
                        {review.helpful > 0 && ` ${review.helpful} helpful`}
                      </span>
                      <span>{new Date(review.createdAt.toMillis ? review.createdAt.toMillis() : review.createdAt.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6">
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

      {/* Team Delete Confirmation Modal */}
      {showDeleteTeamConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <FolderIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Team</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this team? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={()=>setShowDeleteTeamConfirm(null)} className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg">Cancel</button>
                <button onClick={()=>{ if (showDeleteTeamConfirm) deleteTeam(showDeleteTeamConfirm); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6">
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

      {/* Review Details Modal */}
      {showReviewDetails && selectedReview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#2A2A2A]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Review Details</h3>
                <button
                  onClick={() => {
                    setShowReviewDetails(false);
                    setSelectedReview(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Review Info */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Review Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Review ID</p>
                    <p className="text-white font-mono text-sm">{selectedReview.id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Product ID</p>
                    <p className="text-white">{selectedReview.productId}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Rating</p>
                    <div className="flex items-center gap-1">
                      {renderStars(selectedReview.rating)}
                      <span className="text-white ml-2">{selectedReview.rating}/5</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Status</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs border ${
                        selectedReview.verified
                          ? 'bg-green-900/20 text-green-400 border-green-500/20'
                          : 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {selectedReview.verified ? '✓ Verified' : '○ Unverified'}
                      </span>
                      {selectedReview.helpful > 0 && (
                        <span className="text-xs text-gray-400">
                          {selectedReview.helpful} helpful
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">User Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-medium">{selectedReview.userName}</span>
                  </div>
                  <p className="text-gray-400 ml-7">{selectedReview.userEmail}</p>
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Review Comment</h4>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                  <p className="text-white italic">&quot;{selectedReview.comment}&quot;</p>
                </div>
              </div>

              {/* Review Metadata */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Metadata</h4>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Created:</span>
                      <p className="text-white">{new Date(selectedReview.createdAt.toMillis ? selectedReview.createdAt.toMillis() : selectedReview.createdAt.seconds * 1000).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Helpful Votes:</span>
                      <p className="text-white">{selectedReview.helpful}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
                <button
                  onClick={() => {
                    setShowReviewDetails(false);
                    setSelectedReview(null);
                  }}
                  className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDeleteReviewConfirm(selectedReview.id || '');
                    setShowReviewDetails(false);
                  }}
                  className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Delete Confirmation Modal */}
      {showDeleteReviewConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <StarIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Review</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteReviewConfirm(null)}
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteReview(showDeleteReviewConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Delete Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Review Delete Confirmation Modal */}
      {showBulkReviewDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <StarIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Multiple Reviews</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete {selectedReviews.size} selected reviews? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkReviewDelete(false)}
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDeleteReviews}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Delete {selectedReviews.size} Reviews
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Delete Confirmation Modal */}
      {showDeleteNewsConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <StarIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Article</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this article? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteNewsConfirm(null)} className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg">Cancel</button>
                <button onClick={() => { if (showDeleteNewsConfirm) deleteNews(showDeleteNewsConfirm); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Delete Confirmation Modal */}
      {showDeleteTeamConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <FolderIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Team</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this team? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteTeamConfirm(null)} className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg">Cancel</button>
                <button onClick={() => { if (showDeleteTeamConfirm) { deleteTeam(showDeleteTeamConfirm); setShowDeleteTeamConfirm(null); } }} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Delete Confirmation Modal */}
      {showDeleteProductConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <TrashIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Product</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteProductConfirm(null)} className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg">Cancel</button>
                <button onClick={() => { if (showDeleteProductConfirm) deleteProduct(showDeleteProductConfirm); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Delete Confirmation Modal */}
      {showDeleteMatchConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <TrashIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Match</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this match? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteMatchConfirm(null)} className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg">Cancel</button>
                <button onClick={() => { if (showDeleteMatchConfirm) deleteMatch(showDeleteMatchConfirm); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Delete Confirmation Modal */}
      {showDeleteEventConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <TrashIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Event</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteEventConfirm(null)} className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg">Cancel</button>
                <button onClick={() => { if (showDeleteEventConfirm) deleteEvent(showDeleteEventConfirm); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}