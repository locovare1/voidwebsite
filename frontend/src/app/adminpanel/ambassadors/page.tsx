"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ambassadorService, type Ambassador } from '@/lib/ambassadorService';
import { uploadService } from '@/lib/uploadService';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

export default function AmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAmbassador, setEditingAmbassador] = useState<Ambassador | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ambassadorForm, setAmbassadorForm] = useState({
    name: '',
    role: '',
    image: '',
    game: '',
    achievements: [] as string[],
    socialLinks: {
      twitter: '',
      twitch: '',
      instagram: '',
      youtube: '',
      tiktok: ''
    }
  });
  
  // Ref for file input
  const imageFileRef = useRef<HTMLInputElement>(null);

  const loadAmbassadors = async () => {
    try {
      setLoading(true);
      const all = await ambassadorService.getAll();
      setAmbassadors(all);
    } catch (e) {
      console.error('Error loading ambassadors:', e);
      setAmbassadors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAmbassadors();
  }, []);

  const resetAmbassadorForm = () => {
    setAmbassadorForm({ 
      name: '', 
      role: '', 
      image: '', 
      game: '', 
      achievements: [],
      socialLinks: {
        twitter: '',
        twitch: '',
        instagram: '',
        youtube: '',
        tiktok: ''
      }
    });
    setEditingAmbassador(null);
    // Reset file input
    if (imageFileRef.current) imageFileRef.current.value = '';
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const downloadURL = await uploadService.uploadPlayerImage(file);
      setAmbassadorForm(prev => ({ ...prev, image: downloadURL }));
    } catch (error) {
      console.error('Error uploading ambassador image:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to upload image: ${errorMsg}\n\n💡 Tip: Use the Image URL field above instead! Upload to Imgur (imgur.com) and paste the direct image URL.`);
    }
  };

  const submitAmbassador = async () => {
    try {
      // Clean up social links - remove empty strings
      const cleanedSocialLinks: any = {};
      Object.entries(ambassadorForm.socialLinks).forEach(([key, value]) => {
        if (value && value.trim()) {
          cleanedSocialLinks[key] = value.trim();
        }
      });

      const payload = {
        name: ambassadorForm.name,
        role: ambassadorForm.role,
        image: ambassadorForm.image,
        game: ambassadorForm.game,
        achievements: ambassadorForm.achievements,
        socialLinks: Object.keys(cleanedSocialLinks).length > 0 ? cleanedSocialLinks : undefined
      };

      if (editingAmbassador?.id) {
        await ambassadorService.update(editingAmbassador.id, payload);
      } else {
        await ambassadorService.create(payload);
      }
      await loadAmbassadors();
      resetAmbassadorForm();
    } catch (e) {
      console.error('Error saving ambassador:', e);
      alert('Failed to save ambassador. Please try again.');
    }
  };

  const deleteAmbassador = async (id: string) => {
    try {
      await ambassadorService.remove(id);
      await loadAmbassadors();
    } catch (e) {
      console.error('Error deleting ambassador:', e);
      alert('Failed to delete ambassador. Please try again.');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const filteredAmbassadors = searchTerm 
    ? ambassadors.filter(ambassador => 
        ambassador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ambassador.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ambassador.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ambassador.achievements || []).some(ach => ach.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : ambassadors;

  const ambassadorRequiredMissing = !ambassadorForm.name || !ambassadorForm.role || !ambassadorForm.game;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Ambassadors Management</h1>
          <p className="text-gray-400 mt-1">Manage brand ambassadors and outreach program members</p>
        </div>
        <button 
          onClick={resetAmbassadorForm}
          className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Ambassador
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
            placeholder="Search ambassadors by name, role, game, or achievements..."
            className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ambassadors List */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">Ambassadors ({filteredAmbassadors.length})</h2>
          </div>
          <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFFFFF] mx-auto mb-2"></div>
                <p>Loading ambassadors...</p>
              </div>
            ) : filteredAmbassadors.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>{searchTerm ? 'No ambassadors found matching your search' : 'No ambassadors found'}</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {filteredAmbassadors.map(ambassador => (
                  <div key={ambassador.id} className="p-4 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition-all duration-300 transform hover:-translate-y-0.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {ambassador.image ? (
                            <Image src={ambassador.image} alt={ambassador.name} width={48} height={48} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate">{ambassador.name}</h3>
                          <p className="text-gray-400 text-sm">{ambassador.role}</p>
                          <p className="text-gray-500 text-xs mt-1">{ambassador.game}</p>
                          {ambassador.achievements && ambassador.achievements.length > 0 && (
                            <p className="text-gray-500 text-xs mt-1">
                              {ambassador.achievements.length} achievement{ambassador.achievements.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingAmbassador(ambassador);
                            setAmbassadorForm({
                              name: ambassador.name,
                              role: ambassador.role,
                              image: ambassador.image,
                              game: ambassador.game,
                              achievements: ambassador.achievements || [],
                              socialLinks: {
                                twitter: ambassador.socialLinks?.twitter || '',
                                twitch: ambassador.socialLinks?.twitch || '',
                                instagram: ambassador.socialLinks?.instagram || '',
                                youtube: ambassador.socialLinks?.youtube || '',
                                tiktok: ambassador.socialLinks?.tiktok || ''
                              }
                            });
                          }}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10 transition-all duration-300"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {ambassador.id && (
                          <button
                            onClick={() => setShowDeleteConfirm(ambassador.id!)}
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

        {/* Ambassador Form */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">
              {editingAmbassador ? 'Edit Ambassador' : 'Create Ambassador'}
            </h2>
          </div>
          <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={ambassadorForm.name}
                onChange={e => setAmbassadorForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Name *"
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
              />
              <input
                value={ambassadorForm.role}
                onChange={e => setAmbassadorForm(p => ({ ...p, role: e.target.value }))}
                placeholder="Role * (e.g. Ambassador, Lead Ambassador)"
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
              />
              <input
                value={ambassadorForm.game}
                onChange={e => setAmbassadorForm(p => ({ ...p, game: e.target.value }))}
                placeholder="Game *"
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] md:col-span-2"
              />
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                <input
                  value={ambassadorForm.image}
                  onChange={e => setAmbassadorForm(p => ({ ...p, image: e.target.value }))}
                  placeholder="Image URL"
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                />
              </div>
              
              {/* File Upload for Image */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Or Upload Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={imageFileRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    id="ambassador-image-upload"
                  />
                  <label 
                    htmlFor="ambassador-image-upload"
                    className="flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-3 py-2 rounded cursor-pointer transition-colors"
                  >
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Choose File</span>
                  </label>
                  <span className="text-gray-400 text-sm">
                    {imageFileRef.current?.files?.[0]?.name || 'No file chosen'}
                  </span>
                </div>
              </div>
              
              {ambassadorForm.image && (
                <div className="md:col-span-2">
                  <div className="bg-gray-700 w-full h-32 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image
                      src={ambassadorForm.image}
                      alt="Ambassador preview"
                      width={200}
                      height={128}
                      className="max-h-32 max-w-full object-contain rounded"
                    />
                  </div>
                </div>
              )}
              
              <input
                value={(ambassadorForm.achievements || []).join(', ')}
                onChange={e => setAmbassadorForm(p => ({ ...p, achievements: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                placeholder="Achievements (comma separated)"
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] md:col-span-2"
              />
              
              {/* Social Links */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Social Links</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    value={ambassadorForm.socialLinks.twitter}
                    onChange={e => setAmbassadorForm(p => ({ ...p, socialLinks: { ...p.socialLinks, twitter: e.target.value } }))}
                    placeholder="Twitter/X URL"
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                  />
                  <input
                    value={ambassadorForm.socialLinks.twitch}
                    onChange={e => setAmbassadorForm(p => ({ ...p, socialLinks: { ...p.socialLinks, twitch: e.target.value } }))}
                    placeholder="Twitch URL"
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                  />
                  <input
                    value={ambassadorForm.socialLinks.youtube}
                    onChange={e => setAmbassadorForm(p => ({ ...p, socialLinks: { ...p.socialLinks, youtube: e.target.value } }))}
                    placeholder="YouTube URL"
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                  />
                  <input
                    value={ambassadorForm.socialLinks.instagram}
                    onChange={e => setAmbassadorForm(p => ({ ...p, socialLinks: { ...p.socialLinks, instagram: e.target.value } }))}
                    placeholder="Instagram URL"
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                  />
                  <input
                    value={ambassadorForm.socialLinks.tiktok}
                    onChange={e => setAmbassadorForm(p => ({ ...p, socialLinks: { ...p.socialLinks, tiktok: e.target.value } }))}
                    placeholder="TikTok URL"
                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] md:col-span-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={submitAmbassador}
                disabled={ambassadorRequiredMissing}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex-1"
              >
                {editingAmbassador ? 'Update Ambassador' : 'Create Ambassador'}
              </button>
              <button
                onClick={resetAmbassadorForm}
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
                <UserIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Ambassador</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this ambassador? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { if (showDeleteConfirm) deleteAmbassador(showDeleteConfirm); }}
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

