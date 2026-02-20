"use client";

import { useState, useEffect } from 'react';
import { socialService, type SocialLink } from '@/lib/socialService';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  LinkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const ICON_OPTIONS = [
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'discord', label: 'Discord' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
];

export default function SocialsPage() {
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [socialForm, setSocialForm] = useState({
    name: '',
    url: '',
    icon: 'twitter',
    order: 0
  });

  const loadSocials = async () => {
    try {
      setLoading(true);
      const items = await socialService.getAll();
      setSocials(items);
    } catch (e) {
      console.error('Error loading socials:', e);
      setSocials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSocials();
  }, []);

  const resetSocialForm = () => {
    setSocialForm({ name: '', url: '', icon: 'twitter', order: 0 });
    setEditingSocial(null);
  };

  const submitSocial = async () => {
    try {
      if (editingSocial?.id) {
        await socialService.update(editingSocial.id, { ...socialForm });
      } else {
        await socialService.create({ ...socialForm });
      }
      await loadSocials();
      resetSocialForm();
    } catch (e) {
      console.error('Error saving social:', e);
      alert('Failed to save social link. Please try again.');
    }
  };

  const deleteSocial = async (id: string) => {
    try {
      await socialService.remove(id);
      await loadSocials();
    } catch (e) {
      console.error('Error deleting social:', e);
      alert('Failed to delete social link. Please try again.');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const filteredSocials = searchTerm 
    ? socials.filter(social => 
        social.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        social.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        social.icon.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : socials;

  const socialRequiredMissing = !socialForm.name || !socialForm.url || !socialForm.icon;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Social Media Management</h1>
          <p className="text-gray-400 mt-1">Manage social media links displayed on the website</p>
        </div>
        <button 
          onClick={resetSocialForm}
          className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Social Link
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
            placeholder="Search social links by name, URL or icon..."
            className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Socials List */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">Social Links</h2>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFFFFF] mx-auto mb-2"></div>
                <p>Loading social links...</p>
              </div>
            ) : filteredSocials.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No social links found</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {filteredSocials.map((social) => (
                  <div key={social.id ?? social.name} className="p-4 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition-all duration-300 transform hover:-translate-y-0.5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold">{social.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                            {social.icon}
                          </span>
                        </div>
                        <a 
                          href={social.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 truncate block"
                        >
                          {social.url}
                        </a>
                        <div className="text-xs text-gray-500 mt-1">Order: {social.order}</div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingSocial(social);
                            setSocialForm({
                              name: social.name,
                              url: social.url,
                              icon: social.icon,
                              order: social.order
                            });
                          }}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10 transition-all duration-300"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {social.id && (
                          <button
                            onClick={() => setShowDeleteConfirm(social.id!)}
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

        {/* Social Form */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">
              {editingSocial ? 'Edit Social Link' : 'Create Social Link'}
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <input 
                value={socialForm.name} 
                onChange={e=>setSocialForm(p=>({...p,name:e.target.value}))} 
                placeholder="Social Media Name (e.g., Twitter, Discord)" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
              />
              <select
                value={socialForm.icon}
                onChange={e=>setSocialForm(p=>({...p,icon:e.target.value}))}
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] text-white"
              >
                {ICON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value} className="bg-[#0F0F0F]">
                    {option.label}
                  </option>
                ))}
              </select>
              <input 
                value={socialForm.url} 
                onChange={e=>setSocialForm(p=>({...p,url:e.target.value}))} 
                placeholder="URL (e.g., https://twitter.com/voidesports)" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
              />
              <input 
                type="number" 
                value={socialForm.order} 
                onChange={e=>setSocialForm(p=>({...p,order:parseInt(e.target.value)||0}))} 
                placeholder="Display Order (lower numbers appear first)" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
              />
            </div>
            <div className="flex gap-2 pt-4">
              <button 
                onClick={submitSocial} 
                disabled={socialRequiredMissing} 
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex-1"
              >
                {editingSocial ? 'Update Social Link' : 'Create Social Link'}
              </button>
              <button 
                onClick={resetSocialForm} 
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
                <LinkIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Social Link</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this social link? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={()=>setShowDeleteConfirm(null)} 
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={()=>{ if (showDeleteConfirm) deleteSocial(showDeleteConfirm); }} 
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

