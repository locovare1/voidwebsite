"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NewspaperIcon } from '@heroicons/react/24/outline';
import { AnimatedCard } from '@/components/FramerAnimations';
import { newsService, type NewsArticle } from '@/lib/newsService';

interface NewsTabProps {
  onLogAction: (action: any, entity: any, entityId: string, details: string, options?: any) => Promise<string>;
}

export default function NewsTab({ onLogAction }: NewsTabProps) {
  const router = useRouter();

  // News modal state
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsMode, setNewsMode] = useState<'create' | 'edit'>('create');
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState<Omit<NewsArticle, 'id' | 'date'>>({
    title: '', image: '', description: '', content: '', category: ''
  });
  const [newsDate, setNewsDate] = useState<string>('');

  const openCreateNews = () => {
    setNewsMode('create');
    setEditingNewsId(null);
    setNewsForm({ title: '', image: '', description: '', content: '', category: '' });
    setNewsDate('');
    setShowNewsModal(true);
  };

  const submitNews = async () => {
    try {
      if (newsMode === 'create') {
        const newsId = await newsService.create({ ...newsForm, date: newsDate || undefined });
        await onLogAction('create', 'news', newsId, `Created news "${newsForm.title}"`, {
          level: 'info',
          status: 'success',
          metadata: { category: newsForm.category, hasImage: !!newsForm.image }
        });
      } else if (editingNewsId) {
        await newsService.update(editingNewsId, { ...newsForm, date: (newsDate as unknown) as any });
        await onLogAction('update', 'news', editingNewsId, `Updated news "${newsForm.title}"`, {
          level: 'info',
          status: 'success',
          metadata: { category: newsForm.category }
        });
      }
      setShowNewsModal(false);
    } catch (e) {
      console.error(e);
      await onLogAction('error', 'news', editingNewsId || 'unknown', `Failed to ${newsMode} news`, {
        level: 'error',
        status: 'error',
        errorMessage: e instanceof Error ? e.message : 'Unknown error'
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <AnimatedCard className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <NewspaperIcon className="w-6 h-6" />
              Manage News
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/adminpanel/news')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Open News Manager
              </button>
              <button
                onClick={openCreateNews}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Create News
              </button>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Create, edit, and delete news posts. Use the News Manager page for full controls.</p>
        </AnimatedCard>
      </div>

      {/* News Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">{newsMode === 'create' ? 'Create' : 'Edit'} News</h3>
                <button onClick={() => setShowNewsModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Title" value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} />
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Image URL" value={newsForm.image} onChange={e => setNewsForm({ ...newsForm, image: e.target.value })} />
                {newsForm.image?.trim() && (
                  <div className="h-40 rounded border border-[#2A2A2A] overflow-hidden"><img src={newsForm.image} className="object-contain w-full h-full" /></div>
                )}
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Category" value={newsForm.category} onChange={e => setNewsForm({ ...newsForm, category: e.target.value })} />
                <input type="datetime-local" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" value={newsDate} onChange={e => setNewsDate(e.target.value)} />
                <textarea className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white h-20" placeholder="Short Description (homepage preview)" value={newsForm.description} onChange={e => setNewsForm({ ...newsForm, description: e.target.value })} />
                <textarea className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white h-32" placeholder="Full Article Content (full news page view)" value={newsForm.content || ''} onChange={e => setNewsForm({ ...newsForm, content: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowNewsModal(false)} className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white py-2 rounded">Cancel</button>
                <button onClick={submitNews} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
