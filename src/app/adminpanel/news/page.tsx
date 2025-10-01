"use client";

import { useState, useEffect } from 'react';
import { newsService } from '@/lib/newsService';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  NewspaperIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newsForm, setNewsForm] = useState({
    title: '',
    date: '',
    image: '',
    description: '',
    category: ''
  });

  const loadNews = async () => {
    try {
      setLoading(true);
      const items = await newsService.getAll();
      setNews(items);
    } catch (e) {
      console.error('Error loading news:', e);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const resetNewsForm = () => {
    setNewsForm({ title: '', date: '', image: '', description: '', category: '' });
    setEditingArticle(null);
  };

  const submitNews = async () => {
    try {
      const resolvedDate = newsForm.date
        ? new Date(newsForm.date)
        : new Date();

      if (editingArticle?.id) {
        await newsService.update(editingArticle.id, {
          title: newsForm.title,
          image: newsForm.image,
          description: newsForm.description,
          category: newsForm.category,
          date: resolvedDate as any
        });
      } else {
        await newsService.create({
          title: newsForm.title,
          image: newsForm.image,
          description: newsForm.description,
          category: newsForm.category,
          date: resolvedDate as any
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
      setShowDeleteConfirm(null);
    }
  };

  const filteredNews = searchTerm 
    ? news.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : news;

  const newsRequiredMissing = !newsForm.title || !newsForm.description || !newsForm.category;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">News Management</h1>
          <p className="text-gray-400 mt-1">Manage news articles and announcements</p>
        </div>
        <button 
          onClick={resetNewsForm}
          className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Article
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search articles by title, description or category..."
            className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* News List */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">News Articles</h2>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFFFFF] mx-auto mb-2"></div>
                <p>Loading news...</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No news found</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {filteredNews.map(article => (
                  <div key={article.id ?? article.title} className="p-4 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition-all duration-300 transform hover:-translate-y-0.5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate">{article.title}</h3>
                        <p className="text-gray-400 text-sm truncate">{article.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{article.category}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            {article.date ? new Date(article.date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingArticle(article);
                            setNewsForm({
                              title: article.title,
                              date: article.date ? new Date(article.date).toISOString().split('T')[0] : '',
                              image: article.image,
                              description: article.description,
                              category: article.category
                            });
                          }}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10 transition-all duration-300"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {article.id && (
                          <button
                            onClick={() => setShowDeleteConfirm(article.id!)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-all duration-300"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* News Form */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">
              {editingArticle ? 'Edit Article' : 'Create Article'}
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input 
                value={newsForm.title} 
                onChange={e=>setNewsForm(p=>({...p,title:e.target.value}))} 
                placeholder="Title" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] md:col-span-2" 
              />
              <input 
                type="date" 
                value={newsForm.date} 
                onChange={e=>setNewsForm(p=>({...p,date:e.target.value}))} 
                placeholder="Date" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
              />
              <input 
                value={newsForm.category} 
                onChange={e=>setNewsForm(p=>({...p,category:e.target.value}))} 
                placeholder="Category" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
              />
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">News Image URL</label>
                <input 
                  value={newsForm.image} 
                  onChange={e=>setNewsForm(p=>({...p,image:e.target.value}))} 
                  placeholder="Image URL" 
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                />
              </div>
              {newsForm.image && (
                <div className="md:col-span-2">
                  <div className="bg-gray-700 w-full h-32 rounded-lg flex items-center justify-center">
                    <img 
                      src={newsForm.image} 
                      alt="News preview" 
                      className="max-h-32 max-w-full object-contain rounded" 
                    />
                  </div>
                </div>
              )}
              <textarea 
                value={newsForm.description} 
                onChange={e=>setNewsForm(p=>({...p,description:e.target.value}))} 
                placeholder="Description" 
                rows={5} 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] md:col-span-2" 
              />
            </div>
            <div className="flex gap-2 pt-4">
              <button 
                onClick={submitNews} 
                disabled={newsRequiredMissing} 
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex-1"
              >
                {editingArticle ? 'Update Article' : 'Create Article'}
              </button>
              <button 
                onClick={resetNewsForm} 
                className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <NewspaperIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Article</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this article? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={()=>setShowDeleteConfirm(null)} 
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={()=>{ if (showDeleteConfirm) deleteNews(showDeleteConfirm); }} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}