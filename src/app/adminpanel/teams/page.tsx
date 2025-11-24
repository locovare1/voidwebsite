"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { teamService } from '@/lib/teamService';
import { uploadService } from '@/lib/uploadService';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  UserIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [teamForm, setTeamForm] = useState({
    name: '',
    image: '',
    description: '',
    achievements: [] as string[],
    players: [] as any[]
  });
  const [playerDraft, setPlayerDraft] = useState({
    name: '',
    role: '',
    image: '',
    game: '',
    description: '',
    stats: [] as { label: string; value: string }[],
    achievements: [] as string[],
    socialLinks: {} as any
  });
  const [statDraft, setStatDraft] = useState({ label: '', value: '' });
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);

  // Refs for file inputs
  const teamImageFileRef = useRef<HTMLInputElement>(null);
  const playerImageFileRef = useRef<HTMLInputElement>(null);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const all = await teamService.getAll();
      setTeams(all);
    } catch (e) {
      console.error('Error loading teams:', e);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const resetTeamForm = () => {
    setTeamForm({ name: '', image: '', description: '', achievements: [], players: [] });
    setPlayerDraft({ name: '', role: '', image: '', game: '', description: '', stats: [], achievements: [], socialLinks: {} });
    setStatDraft({ label: '', value: '' });
    setEditingPlayerIndex(null);
    setEditingTeam(null);
    // Reset file inputs
    if (teamImageFileRef.current) teamImageFileRef.current.value = '';
    if (playerImageFileRef.current) playerImageFileRef.current.value = '';
  };

  const addPlayerToForm = () => {
    if (!playerDraft.name || !playerDraft.role) return;

    if (editingPlayerIndex !== null) {
      // Update existing player
      setTeamForm(prev => {
        const updatedPlayers = [...prev.players];
        updatedPlayers[editingPlayerIndex] = { ...playerDraft };
        return { ...prev, players: updatedPlayers };
      });
      setEditingPlayerIndex(null);
    } else {
      // Add new player
      setTeamForm(prev => ({
        ...prev,
        players: [...(prev.players || []), { ...playerDraft }]
      }));
    }

    setPlayerDraft({ name: '', role: '', image: '', game: '', description: '', stats: [], achievements: [], socialLinks: {} });
    setStatDraft({ label: '', value: '' });
    // Reset player image file input
    if (playerImageFileRef.current) playerImageFileRef.current.value = '';
  };

  const editPlayer = (index: number) => {
    const player = teamForm.players[index];
    setPlayerDraft({
      name: player.name || '',
      role: player.role || '',
      image: player.image || '',
      game: player.game || '',
      description: player.description || '',
      stats: player.stats || [],
      achievements: player.achievements || [],
      socialLinks: player.socialLinks || {}
    });
    setEditingPlayerIndex(index);
  };

  const cancelEditPlayer = () => {
    setPlayerDraft({ name: '', role: '', image: '', game: '', description: '', stats: [], achievements: [], socialLinks: {} });
    setStatDraft({ label: '', value: '' });
    setEditingPlayerIndex(null);
    if (playerImageFileRef.current) playerImageFileRef.current.value = '';
  };

  const removePlayerFromForm = (index: number) => {
    setTeamForm(prev => ({
      ...prev,
      players: prev.players.filter((_, i) => i !== index)
    }));
  };

  const handleTeamImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const downloadURL = await uploadService.uploadTeamImage(file);
      setTeamForm(prev => ({ ...prev, image: downloadURL }));
    } catch (error) {
      console.error('Error uploading team image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handlePlayerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const downloadURL = await uploadService.uploadPlayerImage(file);
      setPlayerDraft(prev => ({ ...prev, image: downloadURL }));
    } catch (error) {
      console.error('Error uploading player image:', error);
      alert('Failed to upload image. Please try again.');
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
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const teamRequiredMissing = !teamForm.name || !teamForm.description;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Teams Management</h1>
          <p className="text-gray-400 mt-1">Manage teams and player roster</p>
        </div>
        <button
          onClick={resetTeamForm}
          className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Team
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teams List */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">Teams</h2>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFFFFF] mx-auto mb-2"></div>
                <p>Loading teams...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No teams found</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {teams.map(team => (
                  <div key={team.id ?? team.name} className="p-4 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition-all duration-300 transform hover:-translate-y-0.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                          {team.image ? (
                            <Image src={team.image} alt={team.name} width={48} height={48} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <UserGroupIcon className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{team.name}</h3>
                          <p className="text-gray-400 text-sm">{team.description}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            Players: {team.players?.length || 0} • Achievements: {team.achievements?.length || 0}
                          </p>
                        </div>
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
                          className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10 transition-all duration-300"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {team.id && (
                          <button
                            onClick={() => setShowDeleteConfirm(team.id!)}
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

        {/* Team Form */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">
              {editingTeam ? 'Edit Team' : 'Create Team'}
            </h2>
          </div>
          <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={teamForm.name}
                onChange={e => setTeamForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Team name"
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
              />
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Team Image URL</label>
                <input
                  value={teamForm.image}
                  onChange={e => setTeamForm(p => ({ ...p, image: e.target.value }))}
                  placeholder="Team image URL"
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                />
              </div>

              {/* File Upload for Team Image */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Or Upload Team Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={teamImageFileRef}
                    onChange={handleTeamImageUpload}
                    accept="image/*"
                    className="hidden"
                    id="team-image-upload"
                  />
                  <label
                    htmlFor="team-image-upload"
                    className="flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-3 py-2 rounded cursor-pointer transition-colors"
                  >
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Choose File</span>
                  </label>
                  <span className="text-gray-400 text-sm">
                    {teamImageFileRef.current?.files?.[0]?.name || 'No file chosen'}
                  </span>
                </div>
              </div>

              {teamForm.image && (
                <div className="md:col-span-2">
                  <div className="bg-gray-700 w-full h-32 rounded-lg flex items-center justify-center">
                    <Image
                      src={teamForm.image}
                      alt="Team preview"
                      width={200}
                      height={128}
                      className="max-h-32 max-w-full object-contain rounded"
                    />
                  </div>
                </div>
              )}
              <textarea
                value={teamForm.description}
                onChange={e => setTeamForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Description"
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] md:col-span-2"
                rows={3}
              />
              <input
                value={(teamForm.achievements || []).join(', ')}
                onChange={e => setTeamForm(p => ({ ...p, achievements: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                placeholder="Achievements (comma separated)"
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] md:col-span-2"
              />
            </div>

            {/* Players sub-form */}
            <div className="border border-[#2A2A2A] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{editingPlayerIndex !== null ? 'Edit Player' : 'Add Player'}</h4>
                <div className="flex gap-2">
                  {editingPlayerIndex !== null && (
                    <button
                      onClick={cancelEditPlayer}
                      className="text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={addPlayerToForm}
                    disabled={!playerDraft.name || !playerDraft.role}
                    className={`text-sm px-2 py-1 rounded disabled:opacity-50 ${editingPlayerIndex !== null
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white'
                      }`}
                  >
                    {editingPlayerIndex !== null ? 'Update Player' : 'Add Player'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  value={playerDraft.name}
                  onChange={e => setPlayerDraft(p => ({ ...p, name: e.target.value }))}
                  placeholder="Name"
                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                />
                <input
                  value={playerDraft.role}
                  onChange={e => setPlayerDraft(p => ({ ...p, role: e.target.value }))}
                  placeholder="Role"
                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                />
                <input
                  value={playerDraft.game}
                  onChange={e => setPlayerDraft(p => ({ ...p, game: e.target.value }))}
                  placeholder="Game"
                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Player Image URL</label>
                  <input
                    value={playerDraft.image}
                    onChange={e => setPlayerDraft(p => ({ ...p, image: e.target.value }))}
                    placeholder="Image URL"
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                  />
                </div>

                {/* File Upload for Player Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Or Upload Player Image</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={playerImageFileRef}
                      onChange={handlePlayerImageUpload}
                      accept="image/*"
                      className="hidden"
                      id="player-image-upload"
                    />
                    <label
                      htmlFor="player-image-upload"
                      className="flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-3 py-2 rounded cursor-pointer transition-colors"
                    >
                      <CloudArrowUpIcon className="w-5 h-5" />
                      <span>Choose File</span>
                    </label>
                    <span className="text-gray-400 text-sm">
                      {playerImageFileRef.current?.files?.[0]?.name || 'No file chosen'}
                    </span>
                  </div>
                </div>

                {playerDraft.image && (
                  <div className="md:col-span-2">
                    <div className="bg-gray-700 w-16 h-16 rounded-lg flex items-center justify-center">
                      <Image
                        src={playerDraft.image}
                        alt="Player preview"
                        width={64}
                        height={64}
                        className="max-h-16 max-w-full object-contain rounded"
                      />
                    </div>
                  </div>
                )}
                <input
                  value={(playerDraft.achievements || []).join(', ')}
                  onChange={e => setPlayerDraft(p => ({ ...p, achievements: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  placeholder="Achievements (comma)"
                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] md:col-span-2"
                />
                <input
                  value={playerDraft.socialLinks?.twitter || ''}
                  onChange={e => setPlayerDraft(p => ({ ...p, socialLinks: { ...(p.socialLinks || {}), twitter: e.target.value } }))}
                  placeholder="Twitter URL"
                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                />
                <input
                  value={playerDraft.socialLinks?.twitch || ''}
                  onChange={e => setPlayerDraft(p => ({ ...p, socialLinks: { ...(p.socialLinks || {}), twitch: e.target.value } }))}
                  placeholder="Twitch URL"
                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                />
              </div>

              {/* Player Description */}
              <div className="mb-3">
                <textarea
                  value={playerDraft.description}
                  onChange={e => setPlayerDraft(p => ({ ...p, description: e.target.value }))}
                  placeholder="Player Description"
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                  rows={3}
                />
              </div>

              {/* Player Stats */}
              <div className="mb-3 border border-[#2A2A2A] rounded p-2 bg-[#0F0F0F]/50">
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Player Stats</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={statDraft.label}
                    onChange={e => setStatDraft(p => ({ ...p, label: e.target.value }))}
                    placeholder="Label (e.g. K/D)"
                    className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFFFFF]"
                  />
                  <input
                    value={statDraft.value}
                    onChange={e => setStatDraft(p => ({ ...p, value: e.target.value }))}
                    placeholder="Value (e.g. 2.5)"
                    className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFFFFF]"
                  />
                  <button
                    onClick={() => {
                      if (statDraft.label && statDraft.value) {
                        setPlayerDraft(p => ({
                          ...p,
                          stats: [...(p.stats || []), { ...statDraft }]
                        }));
                        setStatDraft({ label: '', value: '' });
                      }
                    }}
                    disabled={!statDraft.label || !statDraft.value}
                    className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {playerDraft.stats?.map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#2A2A2A] px-2 py-1 rounded text-xs text-gray-300">
                      <span>{stat.label}: {stat.value}</span>
                      <button
                        onClick={() => setPlayerDraft(p => ({
                          ...p,
                          stats: p.stats.filter((_, i) => i !== idx)
                        }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Existing players list */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {teamForm.players.map((pl, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <div className="truncate">
                        <span className="text-white font-medium">{pl.name}</span>
                        <span className="text-gray-400 ml-2">{pl.role} • {pl.game}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editPlayer(idx)}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removePlayerFromForm(idx)}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {teamForm.players.length === 0 && (
                  <div className="text-gray-500 text-sm">No players added yet</div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={submitTeam}
                disabled={teamRequiredMissing}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex-1"
              >
                {editingTeam ? 'Update Team' : 'Create Team'}
              </button>
              <button
                onClick={resetTeamForm}
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
                <UserGroupIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Team</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this team? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { if (showDeleteConfirm) deleteTeam(showDeleteConfirm); }}
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