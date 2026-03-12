"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { AnimatedCard } from '@/components/FramerAnimations';
import { placementService, type Placement } from '@/lib/placementService';

interface PlacementsTabProps {
  onLogAction: (action: any, entity: any, entityId: string, details: string, options?: any) => Promise<string>;
}

export default function PlacementsTab({ onLogAction }: PlacementsTabProps) {
  const router = useRouter();

  // Placement modal state
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [placementMode, setPlacementMode] = useState<'create' | 'edit'>('create');
  const [editingPlacementId, setEditingPlacementId] = useState<string | null>(null);
  const [placementForm, setPlacementForm] = useState<Omit<Placement, 'id' | 'createdAt'>>({
    game: '', tournament: '', team: '', position: '', players: [], prize: '', logo: ''
  });
  const [placementPlayersText, setPlacementPlayersText] = useState<string>('');

  const openCreatePlacement = () => {
    setPlacementMode('create');
    setEditingPlacementId(null);
    setPlacementForm({ game: '', tournament: '', team: '', position: '', players: [], prize: '', logo: '' });
    setPlacementPlayersText('');
    setShowPlacementModal(true);
  };

  const submitPlacement = async () => {
    try {
      const payload = { ...placementForm, players: placementPlayersText.split(',').map(s => s.trim()).filter(Boolean) };

      if (placementMode === 'create') {
        const placementId = await placementService.create(payload);
        await onLogAction('create', 'placement', placementId, `Created placement "${placementForm.tournament} - ${placementForm.team}"`, {
          level: 'info',
          status: 'success',
          metadata: { game: placementForm.game, position: placementForm.position, prize: placementForm.prize }
        });
      } else if (editingPlacementId) {
        await placementService.update(editingPlacementId, payload);
        await onLogAction('update', 'placement', editingPlacementId, `Updated placement "${placementForm.tournament} - ${placementForm.team}"`, {
          level: 'info',
          status: 'success',
          metadata: { game: placementForm.game, position: placementForm.position }
        });
      }

      setShowPlacementModal(false);
    } catch (e) {
      console.error(e);
      await onLogAction('error', 'placement', editingPlacementId || 'unknown', `Failed to ${placementMode} placement`, {
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
              <TrophyIcon className="w-6 h-6" />
              Manage Placements
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/adminpanel/placements')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Open Placements Manager
              </button>
              <button
                onClick={openCreatePlacement}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Add Placement
              </button>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Add new tournament placements or edit existing results and metadata.</p>
        </AnimatedCard>
      </div>

      {/* Placement Modal */}
      {showPlacementModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">{placementMode === 'create' ? 'Add' : 'Edit'} Placement</h3>
                <button onClick={() => setShowPlacementModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Game" value={placementForm.game} onChange={e => setPlacementForm({ ...placementForm, game: e.target.value })} />
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Tournament" value={placementForm.tournament} onChange={e => setPlacementForm({ ...placementForm, tournament: e.target.value })} />
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Team" value={placementForm.team} onChange={e => setPlacementForm({ ...placementForm, team: e.target.value })} />
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Position" value={placementForm.position} onChange={e => setPlacementForm({ ...placementForm, position: e.target.value })} />
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Prize (optional)" value={placementForm.prize || ''} onChange={e => setPlacementForm({ ...placementForm, prize: e.target.value })} />
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Logo URL" value={placementForm.logo} onChange={e => setPlacementForm({ ...placementForm, logo: e.target.value })} />
                {placementForm.logo?.trim() && (<div className="h-32 rounded border border-[#2A2A2A] overflow-hidden"><img src={placementForm.logo} className="object-contain w-full h-full" /></div>)}
                <textarea className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white h-20" placeholder="Players (comma separated)" value={placementPlayersText} onChange={e => setPlacementPlayersText(e.target.value)} />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowPlacementModal(false)} className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white py-2 rounded">Cancel</button>
                <button onClick={submitPlacement} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
