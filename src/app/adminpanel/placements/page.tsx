"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { placementService } from '@/lib/placementService';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  TrophyIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function PlacementsPage() {
  const [placements, setPlacements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlacement, setEditingPlacement] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'placements'>('placements');
  
  const [placementForm, setPlacementForm] = useState({
    game: '',
    tournament: '',
    team: '',
    position: '',
    players: '',
    prize: '',
    logo: ''
  });

  const loadPlacements = async () => {
    try {
      setLoading(true);
      const items = await placementService.getAll();
      setPlacements(items);
    } catch (e) {
      console.error('Error loading placements:', e);
      setPlacements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlacements();
  }, []);

  const resetPlacementForm = () => {
    setPlacementForm({ 
      game: '', 
      tournament: '', 
      team: '', 
      position: '', 
      players: '', 
      prize: '', 
      logo: '' 
    });
    setEditingPlacement(null);
  };

  const submitPlacement = async () => {
    try {
      // Convert players string to array
      const playersArray = placementForm.players.split(',').map(p => p.trim()).filter(Boolean);
      
      if (editingPlacement?.id) {
        await placementService.update(editingPlacement.id, { 
          ...placementForm,
          players: playersArray
        });
      } else {
        await placementService.create({ 
          ...placementForm,
          players: playersArray
        });
      }
      await loadPlacements();
      resetPlacementForm();
    } catch (e) {
      console.error('Error saving placement:', e);
      alert('Failed to save placement. Please try again.');
    }
  };

  const deletePlacement = async (id: string) => {
    try {
      await placementService.remove(id);
      await loadPlacements();
    } catch (e) {
      console.error('Error deleting placement:', e);
      alert('Failed to delete placement. Please try again.');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const filteredPlacements = searchTerm 
    ? placements.filter(placement => 
        placement.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
        placement.tournament.toLowerCase().includes(searchTerm.toLowerCase()) ||
        placement.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        placement.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        placement.players.some((p: string) => p.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : placements;

  const placementRequiredMissing = !placementForm.game || !placementForm.tournament || !placementForm.team;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Placements Management</h1>
          <p className="text-gray-400 mt-1">Manage team placements and achievements</p>
        </div>
        <button 
          onClick={resetPlacementForm}
          className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Placement
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
            placeholder="Search placements by game, tournament, team, or player..."
            className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placements List */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">Placements</h2>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFFFFF] mx-auto mb-2"></div>
                <p>Loading placements...</p>
              </div>
            ) : filteredPlacements.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No placements found</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {filteredPlacements.map(placement => (
                  <div key={placement.id ?? `${placement.game}-${placement.tournament}`} className="p-4 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition-all duration-300 transform hover:-translate-y-0.5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate">{placement.tournament}</h3>
                        <p className="text-gray-400 text-sm truncate">{placement.team} • {placement.game}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{placement.position}</span>
                          {placement.prize && placement.prize !== "$0" && (
                            <span className="text-xs text-[#FFD700] font-bold">{placement.prize}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingPlacement(placement);
                            setPlacementForm({
                              game: placement.game,
                              tournament: placement.tournament,
                              team: placement.team,
                              position: placement.position,
                              players: placement.players.join(', '),
                              prize: placement.prize || '',
                              logo: placement.logo
                            });
                          }}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10 transition-all duration-300"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {placement.id && (
                          <button
                            onClick={() => setShowDeleteConfirm(placement.id!)}
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

        {/* Placement Form */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">
              {editingPlacement ? 'Edit Placement' : 'Create Placement'}
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input 
                value={placementForm.game} 
                onChange={e=>setPlacementForm(p=>({...p,game:e.target.value}))} 
                placeholder="Game" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] md:col-span-2" 
              />
              <input 
                value={placementForm.tournament} 
                onChange={e=>setPlacementForm(p=>({...p,tournament:e.target.value}))} 
                placeholder="Tournament" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] md:col-span-2" 
              />
              <input 
                value={placementForm.team} 
                onChange={e=>setPlacementForm(p=>({...p,team:e.target.value}))} 
                placeholder="Team" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
              />
              <input 
                value={placementForm.position} 
                onChange={e=>setPlacementForm(p=>({...p,position:e.target.value}))} 
                placeholder="Position" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
              />
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Players (comma separated)</label>
                <input 
                  value={placementForm.players} 
                  onChange={e=>setPlacementForm(p=>({...p,players:e.target.value}))} 
                  placeholder="Player1, Player2, Player3" 
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                />
              </div>
              <input 
                value={placementForm.prize} 
                onChange={e=>setPlacementForm(p=>({...p,prize:e.target.value}))} 
                placeholder="Prize (e.g. $1000)" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
              />
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Logo URL</label>
                <input 
                  value={placementForm.logo} 
                  onChange={e=>setPlacementForm(p=>({...p,logo:e.target.value}))} 
                  placeholder="Logo URL" 
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                />
                {placementForm.logo && placementForm.logo.trim() && (
                  <div className="mt-2 p-2 bg-[#2A2A2A] rounded-lg">
                    <p className="text-xs text-gray-400 mb-2">Logo Preview:</p>
                    <div className="w-10 h-10 relative">
                      <img
                        src={placementForm.logo}
                        alt="Logo preview"
                        className="w-full h-full object-contain rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.error-message')) {
                            const errorMsg = document.createElement('span');
                            errorMsg.className = 'error-message text-red-400 text-xs';
                            errorMsg.textContent = 'Invalid image URL';
                            parent.appendChild(errorMsg);
                          }
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          const errorMsg = parent?.querySelector('.error-message');
                          if (errorMsg) {
                            errorMsg.remove();
                          }
                          target.style.display = 'block';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button 
                onClick={submitPlacement} 
                disabled={placementRequiredMissing} 
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex-1"
              >
                {editingPlacement ? 'Update Placement' : 'Create Placement'}
              </button>
              <button 
                onClick={resetPlacementForm} 
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
                <TrophyIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Placement</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this placement? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={()=>setShowDeleteConfirm(null)} 
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={()=>{ if (showDeleteConfirm) deletePlacement(showDeleteConfirm); }} 
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