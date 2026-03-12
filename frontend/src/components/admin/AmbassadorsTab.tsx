"use client";

import { useState } from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { AnimatedCard } from '@/components/FramerAnimations';
import { ambassadorService, Ambassador } from '@/lib/ambassadorService';
import { processExternalImageUrl } from '@/lib/imageUtils';

interface AmbassadorsTabProps {
  ambassadors: Ambassador[];
  loadingAmbassadors: boolean;
  setLoadingAmbassadors: (loading: boolean) => void;
  setAmbassadors: (ambassadors: Ambassador[]) => void;
  onLogAction: (action: any, entity: any, entityId: string, details: string, options?: any) => Promise<string>;
}

export default function AmbassadorsTab({
  ambassadors,
  loadingAmbassadors,
  setLoadingAmbassadors,
  setAmbassadors,
  onLogAction
}: AmbassadorsTabProps) {
  // Ambassador modal state
  const [showCreateAmbassador, setShowCreateAmbassador] = useState(false);
  const [editingAmbassador, setEditingAmbassador] = useState<Ambassador | null>(null);
  const [ambassadorForm, setAmbassadorForm] = useState<Omit<Ambassador, 'id' | 'createdAt'>>({
    name: '',
    role: 'Ambassador',
    image: '',
    game: '',
    achievements: [],
    socialLinks: {}
  });

  const openCreateAmbassadorModal = () => {
    setEditingAmbassador(null);
    setAmbassadorForm({
      name: '',
      role: 'Ambassador',
      image: '',
      game: '',
      achievements: [],
      socialLinks: {}
    });
    setShowCreateAmbassador(true);
  };

  const openEditAmbassadorModal = (ambassador: Ambassador) => {
    setEditingAmbassador(ambassador);
    setAmbassadorForm({
      name: ambassador.name,
      role: ambassador.role,
      image: ambassador.image,
      game: ambassador.game,
      achievements: ambassador.achievements,
      socialLinks: ambassador.socialLinks
    });
    setShowCreateAmbassador(true);
  };

  const handleCreateAmbassador = async () => {
    try {
      setLoadingAmbassadors(true);
      const ambassadorId = await ambassadorService.create(ambassadorForm);
      const updatedAmbassadors = await ambassadorService.getAll();
      setAmbassadors(updatedAmbassadors);
      setShowCreateAmbassador(false);
      await onLogAction('create', 'ambassador', ambassadorId, `Created ambassador "${ambassadorForm.name}"`, {
        level: 'info',
        status: 'success',
        metadata: { role: ambassadorForm.role, game: ambassadorForm.game, hasImage: !!ambassadorForm.image }
      });
    } catch (error) {
      console.error('Error creating ambassador:', error);
      alert('Failed to create ambassador');
      await onLogAction('error', 'ambassador', 'unknown', `Failed to create ambassador "${ambassadorForm.name}"`, {
        level: 'error',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoadingAmbassadors(false);
    }
  };

  const handleUpdateAmbassador = async () => {
    if (!editingAmbassador) return;
    try {
      setLoadingAmbassadors(true);
      await ambassadorService.update(editingAmbassador.id!, ambassadorForm);
      const updatedAmbassadors = await ambassadorService.getAll();
      setAmbassadors(updatedAmbassadors);
      setShowCreateAmbassador(false);
      setEditingAmbassador(null);
      await onLogAction('update', 'ambassador', editingAmbassador.id!, `Updated ambassador "${ambassadorForm.name}"`, {
        level: 'info',
        status: 'success',
        metadata: { updatedFields: ['name', 'role', 'game', 'achievements', 'socialLinks'] }
      });
    } catch (error) {
      console.error('Error updating ambassador:', error);
      alert('Failed to update ambassador');
      await onLogAction('error', 'ambassador', editingAmbassador.id!, `Failed to update ambassador "${ambassadorForm.name}"`, {
        level: 'error',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoadingAmbassadors(false);
    }
  };

  const handleDeleteAmbassador = async (ambassadorId: string) => {
    if (!confirm('Are you sure you want to delete this ambassador?')) return;

    try {
      setLoadingAmbassadors(true);
      await ambassadorService.remove(ambassadorId);
      setAmbassadors(ambassadors.filter(a => a.id !== ambassadorId));
      await onLogAction('delete', 'ambassador', ambassadorId, `Deleted ambassador`, {
        level: 'warn',
        status: 'success',
        metadata: { deletedBy: 'admin' }
      });
    } catch (error) {
      console.error('Error deleting ambassador:', error);
      alert('Failed to delete ambassador');
      await onLogAction('error', 'ambassador', ambassadorId, `Failed to delete ambassador`, {
        level: 'error',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoadingAmbassadors(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserGroupIcon className="w-6 h-6" />
              Ambassadors Management
            </h2>
            <button
              onClick={openCreateAmbassadorModal}
              className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Add Ambassador
            </button>
          </div>

          {loadingAmbassadors ? (
            <div className="text-center py-8">
              <div className="text-white">Loading ambassadors...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ambassadors.length === 0 ? (
                <p className="text-gray-400 col-span-full">No ambassadors found.</p>
              ) : (
                ambassadors.map((ambassador) => (
                  <AnimatedCard key={ambassador.id} className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/40 flex-shrink-0">
                        {ambassador.image && ambassador.image.trim() ? (
                          <img
                            src={processExternalImageUrl(ambassador.image)}
                            alt={ambassador.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{ambassador.name}</h3>
                        <p className="text-blue-400 text-xs">{ambassador.role}</p>
                        <p className="text-gray-500 text-xs truncate">{ambassador.game}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openEditAmbassadorModal(ambassador)}
                        className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 py-1.5 rounded text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAmbassador(ambassador.id!)}
                        className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-1.5 rounded text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </AnimatedCard>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Ambassador Modal */}
      {showCreateAmbassador && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">{editingAmbassador ? 'Edit' : 'Create'} Ambassador</h3>
                <button onClick={() => setShowCreateAmbassador(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={ambassadorForm.name}
                  onChange={(e) => setAmbassadorForm({ ...ambassadorForm, name: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                  placeholder="Ambassador Name"
                />
                <input
                  type="text"
                  value={ambassadorForm.role}
                  onChange={(e) => setAmbassadorForm({ ...ambassadorForm, role: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                  placeholder="Role"
                />
                <input
                  type="text"
                  value={ambassadorForm.game}
                  onChange={(e) => setAmbassadorForm({ ...ambassadorForm, game: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                  placeholder="Game"
                />
                <input
                  type="text"
                  value={ambassadorForm.image}
                  onChange={(e) => setAmbassadorForm({ ...ambassadorForm, image: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                  placeholder="Image URL"
                />
                {ambassadorForm.image?.trim() && (
                  <div className="h-32 rounded border border-[#2A2A2A] overflow-hidden">
                    <img src={ambassadorForm.image} className="object-contain w-full h-full" />
                  </div>
                )}
                <textarea
                  value={ambassadorForm.achievements?.join(', ') || ''}
                  onChange={(e) => setAmbassadorForm({
                    ...ambassadorForm,
                    achievements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white h-20"
                  placeholder="Achievements (comma separated)"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowCreateAmbassador(false)} className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white py-2 rounded">Cancel</button>
                <button
                  onClick={editingAmbassador ? handleUpdateAmbassador : handleCreateAmbassador}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  {editingAmbassador ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
