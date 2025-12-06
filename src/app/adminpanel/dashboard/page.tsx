"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { DocumentIcon, CurrencyDollarIcon, FolderIcon, LightBulbIcon, XMarkIcon, PencilIcon, MagnifyingGlassIcon, ChartBarIcon, CloudArrowUpIcon, CheckIcon } from '@heroicons/react/24/outline';
import { uploadService } from '@/lib/uploadService';

// Accessible to all authenticated admin users

interface DashboardItem {
  id?: string;
  type: 'contract' | 'asset' | 'finance' | 'idea' | 'file';
  title: string;
  description: string;
  content?: string;
  fileUrl?: string;
  amount?: number;
  category?: string;
  createdAt: Timestamp;
  createdBy: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [selectedType, setSelectedType] = useState<'contract' | 'asset' | 'finance' | 'idea' | 'file'>('idea');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<DashboardItem | null>(null);
  const [editingField, setEditingField] = useState<{ itemId: string; field: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    fileUrl: '',
    amount: '',
    category: ''
  });

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Allow all authenticated admin users
        setHasAccess(true);
      } else {
        router.push('/adminpanel');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (hasAccess && db) {
      loadItems();
    }
  }, [hasAccess]);

  const loadItems = async () => {
    if (!db) return;
    try {
      const q = query(collection(db, 'dashboardItems'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const loadedItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DashboardItem[];
      setItems(loadedItems);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed, files:', e.target.files);
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    console.log('File selected:', file.name, 'Size:', file.size, 'bytes', 'Type:', file.type);
    
    // Prevent multiple simultaneous uploads
    if (uploading) {
      console.log('Upload already in progress, ignoring');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);
    console.log('Starting upload process...');
    
    // Add timeout to prevent infinite hanging (30 minutes to allow for very large files up to 3GB)
    const timeoutId = setTimeout(() => {
      console.error('Upload timeout reached');
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      alert('Upload timed out. Please check your connection and try again.');
    }, 1800000); // 30 minute timeout for large files
    
    try {
      console.log('Starting file upload:', file.name, file.size, 'bytes');
      
      // Check if storage is available
      const { storage } = await import('@/lib/firebase');
      if (!storage) {
        throw new Error('Firebase Storage is not initialized. Please refresh the page.');
      }
      
      console.log('Storage available, uploading to dashboard folder...');
      const url = await uploadService.uploadDashboardFile(file);
      clearTimeout(timeoutId);
      
      console.log('Upload successful, URL:', url);
      setFormData(prev => ({ ...prev, fileUrl: url }));
      alert('File uploaded successfully!');
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error uploading file:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        code: (error as any)?.code,
        serverResponse: (error as any)?.serverResponse
      });
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for common Firebase errors
        if (errorMessage.includes('permission') || errorMessage.includes('unauthorized') || errorMessage.includes('403') || (error as any)?.code === 'storage/unauthorized') {
          errorMessage = 'Permission denied. Firebase Storage security rules are blocking the upload. Please configure Storage rules to allow authenticated users to write to the dashboard folder.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (errorMessage.includes('timeout')) {
          errorMessage = 'Upload timed out. The file may be too large or there is a network issue.';
        }
      }
      
      alert(`Failed to upload file: ${errorMessage}\n\nCheck the browser console for more details.`);
    } finally {
      setUploading(false);
      // Reset the file input after upload attempt
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    try {
      if (editingItem && editingItem.id) {
        // Update existing item
        const updateData: Partial<DashboardItem> = {
          type: selectedType,
          title: formData.title,
          description: formData.description,
          content: formData.content || undefined,
          amount: selectedType === 'finance' && formData.amount ? parseFloat(formData.amount) : undefined,
          category: formData.category || undefined,
        };
        // Only include fileUrl if it has a value
        if (formData.fileUrl && formData.fileUrl.trim()) {
          updateData.fileUrl = formData.fileUrl.trim();
        }
        await updateDoc(doc(db, 'dashboardItems', editingItem.id), updateData);
      } else {
        // Create new item
        const newItem: any = {
          type: selectedType,
          title: formData.title,
          description: formData.description,
          content: formData.content || undefined,
          amount: selectedType === 'finance' && formData.amount ? parseFloat(formData.amount) : undefined,
          category: formData.category || undefined,
          createdAt: Timestamp.now(),
          createdBy: user.email || 'Unknown'
        };
        // Only include fileUrl if it has a value
        if (formData.fileUrl && formData.fileUrl.trim()) {
          newItem.fileUrl = formData.fileUrl.trim();
        }
        await addDoc(collection(db, 'dashboardItems'), newItem);
      }
      
      setFormData({ title: '', description: '', content: '', fileUrl: '', amount: '', category: '' });
      setShowForm(false);
      setEditingItem(null);
      loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item. Please try again.');
    }
  };

  const handleEdit = (item: DashboardItem) => {
    // Only use form for finances and ideas
    if (item.type === 'finance' || item.type === 'idea') {
      setEditingItem(item);
      setSelectedType(item.type);
      setFormData({
        title: item.title,
        description: item.description,
        content: item.content || '',
        fileUrl: item.fileUrl || '',
        amount: item.amount?.toString() || '',
        category: item.category || ''
      });
      setShowForm(true);
    }
  };

  const startInlineEdit = (itemId: string, field: string, currentValue: string) => {
    setEditingField({ itemId, field });
    setEditingValue(currentValue || '');
  };

  const cancelInlineEdit = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const saveInlineEdit = async (item: DashboardItem) => {
    if (!db || !editingField || !item.id) return;

    try {
      const updateData: any = {};
      updateData[editingField.field] = editingValue;

      // Handle special cases
      if (editingField.field === 'amount') {
        updateData.amount = editingValue ? parseFloat(editingValue) : undefined;
      }

      await updateDoc(doc(db, 'dashboardItems', item.id), updateData);
      setEditingField(null);
      setEditingValue('');
      loadItems();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData({ title: '', description: '', content: '', fileUrl: '', amount: '', category: '' });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'dashboardItems', id));
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };


  // Statistics
  const stats = useMemo(() => {
    const totalFinance = items
      .filter(item => item.type === 'finance' && item.amount)
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    
    return {
      total: items.length,
      contracts: items.filter(i => i.type === 'contract').length,
      assets: items.filter(i => i.type === 'asset').length,
      finances: items.filter(i => i.type === 'finance').length,
      ideas: items.filter(i => i.type === 'idea').length,
      files: items.filter(i => i.type === 'file').length,
      totalFinance
    };
  }, [items]);

  // Filter items by type and search query
  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => item.type === selectedType);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.content?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [items, selectedType, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFFFFF]"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Access Denied. This area is restricted to authorized personnel only.</p>
      </div>
    );
  }

  const typeConfig = {
    contract: { icon: DocumentIcon, label: 'Contracts', color: 'blue' },
    asset: { icon: FolderIcon, label: 'Assets', color: 'green' },
    finance: { icon: CurrencyDollarIcon, label: 'Finances', color: 'yellow' },
    idea: { icon: LightBulbIcon, label: 'Ideas', color: 'purple' },
    file: { icon: DocumentIcon, label: 'Files', color: 'gray' }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Void Management Hub</h1>
          <p className="text-gray-400 mt-1">Contracts, Assets, Finances, Ideas & Files</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
          className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300"
        >
          {showForm ? 'Cancel' : 'Add New'}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-4">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">Total Items</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.contracts}</div>
          <div className="text-xs text-gray-400">Contracts</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-4">
          <div className="text-2xl font-bold text-green-400">{stats.assets}</div>
          <div className="text-xs text-gray-400">Assets</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-4">
          <div className="text-2xl font-bold text-yellow-400">{stats.finances}</div>
          <div className="text-xs text-gray-400">Finances</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-4">
          <div className="text-2xl font-bold text-purple-400">{stats.ideas}</div>
          <div className="text-xs text-gray-400">Ideas</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-4">
          <div className="text-2xl font-bold text-gray-400">{stats.files}</div>
          <div className="text-xs text-gray-400">Files</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-4">
          <div className="text-2xl font-bold text-yellow-400">${stats.totalFinance.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Total Finance</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
        />
      </div>

      {/* Type Selector */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(typeConfig) as Array<keyof typeof typeConfig>).map((type) => {
          const config = typeConfig[type];
          const Icon = config.icon;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedType === type
                  ? 'bg-[#FFFFFF] text-black'
                  : 'bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            {editingItem && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                required
              />
              {selectedType === 'finance' && (
                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                />
              )}
              <input
                type="text"
                placeholder="Category (optional)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
              rows={3}
              required
            />
            <textarea
              placeholder="Content/Notes (optional)"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
              rows={4}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">File URL or Upload</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="File URL (optional)"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    disabled={uploading}
                    id="dashboard-file-upload"
                  />
                  <label
                    htmlFor="dashboard-file-upload"
                    className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <CloudArrowUpIcon className="w-5 h-5" />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </label>
                </div>
              </div>
              {formData.fileUrl && (
                <a
                  href={formData.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm inline-block"
                >
                  View uploaded file →
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
              >
                {editingItem ? 'Update' : 'Add'} {typeConfig[selectedType].label}
              </button>
              {editingItem && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;
            return (
              <div key={item.id} className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6 hover:border-[#3A3A3A] transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className={`w-6 h-6 text-${config.color}-400`} />
                    <div className="flex-1">
                      {editingField && editingField.itemId === item.id && editingField.field === 'title' ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveInlineEdit(item);
                              if (e.key === 'Escape') cancelInlineEdit();
                            }}
                            className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-xl font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                            autoFocus
                          />
                          <button
                            onClick={() => saveInlineEdit(item)}
                            className="text-green-400 hover:text-green-300 p-1"
                            title="Save"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={cancelInlineEdit}
                            className="text-gray-400 hover:text-gray-300 p-1"
                            title="Cancel"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <h3 
                          className={`text-xl font-semibold text-white ${['contract', 'asset', 'file'].includes(item.type) ? 'cursor-pointer hover:text-blue-400 transition-colors' : ''}`}
                          onClick={() => ['contract', 'asset', 'file'].includes(item.type) && item.id && startInlineEdit(item.id, 'title', item.title)}
                          title={['contract', 'asset', 'file'].includes(item.type) ? 'Click to edit' : ''}
                        >
                          {item.title}
                        </h3>
                      )}
                      {editingField && editingField.itemId === item.id && editingField.field === 'category' ? (
                        <div className="flex gap-2 items-center mt-1">
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveInlineEdit(item);
                              if (e.key === 'Escape') cancelInlineEdit();
                            }}
                            className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                            autoFocus
                          />
                          <button
                            onClick={() => saveInlineEdit(item)}
                            className="text-green-400 hover:text-green-300 p-1"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelInlineEdit}
                            className="text-gray-400 hover:text-gray-300 p-1"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        item.category && (
                          <span 
                            className={`text-xs text-gray-400 ${['contract', 'asset', 'file'].includes(item.type) ? 'cursor-pointer hover:text-blue-400 transition-colors' : ''}`}
                            onClick={() => ['contract', 'asset', 'file'].includes(item.type) && item.id && startInlineEdit(item.id, 'category', item.category || '')}
                            title={['contract', 'asset', 'file'].includes(item.type) ? 'Click to edit' : ''}
                          >
                            {item.category}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['contract', 'asset', 'file'].includes(item.type) ? null : (
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10 transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => item.id && handleDelete(item.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-colors"
                      title="Delete"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {editingField && editingField.itemId === item.id && editingField.field === 'description' ? (
                  <div className="mb-3">
                    <textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') cancelInlineEdit();
                      }}
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveInlineEdit(item)}
                        className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
                      >
                        <CheckIcon className="w-4 h-4" /> Save
                      </button>
                      <button
                        onClick={cancelInlineEdit}
                        className="text-gray-400 hover:text-gray-300 text-sm flex items-center gap-1"
                      >
                        <XMarkIcon className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p 
                    className={`text-gray-300 mb-3 ${['contract', 'asset', 'file'].includes(item.type) ? 'cursor-pointer hover:text-blue-400 transition-colors' : ''}`}
                    onClick={() => ['contract', 'asset', 'file'].includes(item.type) && item.id && startInlineEdit(item.id, 'description', item.description)}
                    title={['contract', 'asset', 'file'].includes(item.type) ? 'Click to edit' : ''}
                  >
                    {item.description}
                  </p>
                )}
                {editingField && editingField.itemId === item.id && editingField.field === 'content' ? (
                  <div className="mb-3">
                    <textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') cancelInlineEdit();
                      }}
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                      rows={4}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveInlineEdit(item)}
                        className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
                      >
                        <CheckIcon className="w-4 h-4" /> Save
                      </button>
                      <button
                        onClick={cancelInlineEdit}
                        className="text-gray-400 hover:text-gray-300 text-sm flex items-center gap-1"
                      >
                        <XMarkIcon className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  item.content && (
                    <div 
                      className={`bg-[#0F0F0F] rounded p-3 mb-3 ${['contract', 'asset', 'file'].includes(item.type) ? 'cursor-pointer hover:border border-[#2A2A2A] transition-colors' : ''}`}
                      onClick={() => ['contract', 'asset', 'file'].includes(item.type) && item.id && startInlineEdit(item.id, 'content', item.content || '')}
                      title={['contract', 'asset', 'file'].includes(item.type) ? 'Click to edit' : ''}
                    >
                      <p className="text-sm text-gray-400 whitespace-pre-wrap">{item.content}</p>
                    </div>
                  )
                )}
                {item.amount && (
                  <div className="text-2xl font-bold text-yellow-400 mb-3">
                    ${item.amount.toLocaleString()}
                  </div>
                )}
                {editingField && editingField.itemId === item.id && editingField.field === 'fileUrl' ? (
                  <div className="mb-3">
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveInlineEdit(item);
                          if (e.key === 'Escape') cancelInlineEdit();
                        }}
                        className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-blue-400 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                        autoFocus
                      />
                      <button
                        onClick={() => saveInlineEdit(item)}
                        className="text-green-400 hover:text-green-300 p-1"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={cancelInlineEdit}
                        className="text-gray-400 hover:text-gray-300 p-1"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    {item.fileUrl ? (
                      <>
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View File →
                        </a>
                        {['contract', 'asset', 'file'].includes(item.type) && (
                          <button
                            onClick={() => item.id && startInlineEdit(item.id, 'fileUrl', item.fileUrl || '')}
                            className="ml-3 text-gray-400 hover:text-gray-300 text-sm"
                            title="Edit file URL"
                          >
                            <PencilIcon className="w-4 h-4 inline" />
                          </button>
                        )}
                      </>
                    ) : (
                      ['contract', 'asset', 'file'].includes(item.type) && (
                        <button
                          onClick={() => item.id && startInlineEdit(item.id, 'fileUrl', '')}
                          className="text-gray-400 hover:text-blue-400 text-sm flex items-center gap-1 transition-colors"
                          title="Add file URL"
                        >
                          <PencilIcon className="w-4 h-4" /> Add File URL
                        </button>
                      )
                    )}
                  </div>
                )}
                <div className="mt-4 text-xs text-gray-500">
                  Created by {item.createdBy} on {item.createdAt?.toDate().toLocaleDateString()}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-400">
            {searchQuery 
              ? `No ${typeConfig[selectedType].label.toLowerCase()} found matching "${searchQuery}".`
              : `No ${typeConfig[selectedType].label.toLowerCase()} found. Add one to get started.`
            }
          </div>
        )}
      </div>
    </div>
  );
}
