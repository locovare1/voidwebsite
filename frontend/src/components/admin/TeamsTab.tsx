"use client";

import { useState } from 'react';
import { UserIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { teamService, Team, Player } from '@/lib/teamService';
import { processExternalImageUrl } from '@/lib/imageUtils';

interface TeamsTabProps {
  teams: Team[];
  loadingTeams: boolean;
  setLoadingTeams: (loading: boolean) => void;
  setTeams: (teams: Team[]) => void;
  onLogAction: (action: any, entity: any, entityId: string, details: string, options?: any) => Promise<string>;
}

export default function TeamsTab({
  teams,
  loadingTeams,
  setLoadingTeams,
  setTeams,
  onLogAction
}: TeamsTabProps) {
  // Team management state
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<{ teamId: string; playerIndex: number; player: Player } | null>(null);
  const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'>>({
    name: '',
    role: '',
    image: '',
    game: '',
    achievements: [],
    socialLinks: {}
  });
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState<Omit<Team, 'id' | 'createdAt'>>({
    name: '',
    image: '',
    description: '',
    achievements: [],
    players: []
  });

  const handleAddPlayer = async (teamId: string) => {
    if (!newPlayer.name.trim() || !newPlayer.role.trim() || !newPlayer.game.trim()) {
      alert('Please fill in name, role, and game fields');
      return;
    }

    try {
      setLoadingTeams(true);
      console.log('Adding player to team:', teamId, newPlayer);

      await teamService.addPlayer(teamId, newPlayer as Player);

      // Reload teams
      const updatedTeams = await teamService.getAll();
      console.log('Reloaded teams after adding player:', updatedTeams);
      setTeams(updatedTeams);

      // Reset form
      setNewPlayer({
        name: '',
        role: '',
        image: '',
        game: '',
        achievements: [],
        socialLinks: {}
      });

      setShowAddPlayer(false);
      setSelectedTeam(null);

      alert('Player added successfully! Changes should appear on the teams page.');
      await onLogAction('update', 'team', teamId, `Added player "${newPlayer.name}" to team`, {
        level: 'info',
        status: 'success',
        metadata: { playerName: newPlayer.name, playerRole: newPlayer.role, playerGame: newPlayer.game }
      });
    } catch (error) {
      console.error('Error adding player:', error);
      alert(`Failed to add player: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await onLogAction('error', 'team', teamId, `Failed to add player "${newPlayer.name}" to team`, {
        level: 'error',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleEditPlayer = async (teamId: string, playerIndex: number, updatedPlayer: Player) => {
    try {
      setLoadingTeams(true);
      console.log('Updating player:', teamId, playerIndex, updatedPlayer);

      await teamService.updatePlayer(teamId, playerIndex, updatedPlayer);

      // Reload teams
      const updatedTeams = await teamService.getAll();
      console.log('Reloaded teams after player update:', updatedTeams);
      setTeams(updatedTeams);

      setEditingPlayer(null);
      alert('Player updated successfully! Changes should appear on the teams page.');
      await onLogAction('update', 'team', teamId, `Updated player "${updatedPlayer.name}" in team`, {
        level: 'info',
        status: 'success',
        metadata: { playerName: updatedPlayer.name, updatedFields: ['name', 'role', 'game', 'achievements'] }
      });
    } catch (error) {
      console.error('Error updating player:', error);
      alert(`Failed to update player: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await onLogAction('error', 'team', teamId, `Failed to update player "${updatedPlayer.name}" in team`, {
        level: 'error',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleDeletePlayer = async (teamId: string, playerIndex: number) => {
    if (!confirm('Are you sure you want to remove this player?')) return;

    try {
      setLoadingTeams(true);
      await teamService.removePlayer(teamId, playerIndex);

      // Reload teams
      const updatedTeams = await teamService.getAll();
      setTeams(updatedTeams);

      alert('Player removed successfully!');
      await onLogAction('update', 'team', teamId, `Removed player from team`, {
        level: 'warn',
        status: 'success',
        metadata: { playerIndex, removedBy: 'admin' }
      });
    } catch (error) {
      console.error('Error removing player:', error);
      alert('Failed to remove player');
      await onLogAction('error', 'team', teamId, `Failed to remove player from team`, {
        level: 'error',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim() || !newTeam.description.trim()) {
      alert('Please fill in team name and description');
      return;
    }

    try {
      setLoadingTeams(true);
      const teamId = await teamService.create(newTeam);

      // Reload teams
      const updatedTeams = await teamService.getAll();
      setTeams(updatedTeams);

      // Reset form
      setNewTeam({
        name: '',
        image: '',
        description: '',
        achievements: [],
        players: []
      });

      setShowCreateTeam(false);

      alert('Team created successfully!');
      await onLogAction('create', 'team', teamId, `Created team "${newTeam.name}"`, {
        level: 'info',
        status: 'success',
        metadata: { hasImage: !!newTeam.image, playerCount: 0 }
      });
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team');
      await onLogAction('error', 'team', 'unknown', `Failed to create team "${newTeam.name}"`, {
        level: 'error',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete the team "${teamName}"? This will remove all players and cannot be undone.`)) return;

    try {
      setLoadingTeams(true);
      await teamService.remove(teamId);

      // Reload teams
      const updatedTeams = await teamService.getAll();
      setTeams(updatedTeams);

      alert('Team deleted successfully!');
      await onLogAction('delete', 'team', teamId, `Deleted team "${teamName}"`, {
        level: 'warn',
        status: 'success',
        metadata: { teamName, deletedBy: 'admin' }
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
      await onLogAction('error', 'team', teamId, `Failed to delete team "${teamName}"`, {
        level: 'error',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setShowEditTeam(true);
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam || !editingTeam.name.trim() || !editingTeam.description.trim()) {
      alert('Please fill in team name and description');
      return;
    }

    try {
      setLoadingTeams(true);
      console.log('Updating team:', editingTeam.id, editingTeam);

      await teamService.update(editingTeam.id!, {
        name: editingTeam.name,
        image: editingTeam.image,
        description: editingTeam.description,
        achievements: editingTeam.achievements,
        players: editingTeam.players
      });

      console.log('Team updated in Firebase, reloading...');

      // Reload teams
      const updatedTeams = await teamService.getAll();
      console.log('Reloaded teams:', updatedTeams);
      setTeams(updatedTeams);

      setShowEditTeam(false);
      setEditingTeam(null);

      alert('Team updated successfully! Changes should appear on the teams page.');
      await onLogAction('update', 'team', editingTeam.id!, `Updated team "${editingTeam.name}"`, {
        level: 'info',
        status: 'success',
        metadata: { playerCount: editingTeam.players.length, updatedFields: ['name', 'description', 'image'] }
      });
    } catch (error) {
      console.error('Error updating team:', error);
      alert(`Failed to update team: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await onLogAction('error', 'team', editingTeam?.id || 'unknown', `Failed to update team "${editingTeam?.name}"`, {
        level: 'error',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleMovePlayer = async (teamId: string, playerIndex: number, direction: 'up' | 'down') => {
    try {
      setLoadingTeams(true);

      // Get the current team
      const team = teams.find(t => t.id === teamId);
      if (!team || !team.players) return;

      const newIndex = direction === 'up' ? playerIndex - 1 : playerIndex + 1;
      if (newIndex < 0 || newIndex >= team.players.length) return;

      // Create new players array with swapped positions
      const updatedPlayers = [...team.players];
      [updatedPlayers[playerIndex], updatedPlayers[newIndex]] = [updatedPlayers[newIndex], updatedPlayers[playerIndex]];

      // Update the team in Firebase
      await teamService.update(teamId, {
        players: updatedPlayers
      });

      // Reload teams to reflect changes
      const updatedTeams = await teamService.getAll();
      setTeams(updatedTeams);

    } catch (error) {
      console.error('Error moving player:', error);
      alert('Failed to move player');
    } finally {
      setLoadingTeams(false);
    }
    await onLogAction('update', 'team', teamId, `Moved player position in team`, {
      level: 'info',
      status: 'success',
      metadata: { movedBy: 'admin', direction }
    });
  };

  const movePlayer = (direction: 'up' | 'down', playerIndex: number) => {
    if (!editingTeam) return;

    const newIndex = direction === 'up' ? playerIndex - 1 : playerIndex + 1;
    if (newIndex < 0 || newIndex >= editingTeam.players.length) return;

    const updatedPlayers = [...editingTeam.players];
    [updatedPlayers[playerIndex], updatedPlayers[newIndex]] = [updatedPlayers[newIndex], updatedPlayers[playerIndex]];

    setEditingTeam({
      ...editingTeam,
      players: updatedPlayers
    });
  };

  const removePlayerFromTeam = (playerIndex: number) => {
    if (!editingTeam) return;

    const updatedPlayers = editingTeam.players.filter((_, index) => index !== playerIndex);
    setEditingTeam({
      ...editingTeam,
      players: updatedPlayers
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserIcon className="w-6 h-6" />
            Teams Management
          </h2>
          <button
            onClick={() => setShowCreateTeam(true)}
            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Create Team
          </button>
        </div>

        {loadingTeams ? (
          <div className="text-center py-8">
            <div className="text-white">Loading teams...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {teams.length === 0 ? (
              <p className="text-gray-400">No teams found.</p>
            ) : (
              teams.map((team) => (
                <div key={team.id} className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{team.description}</p>
                      <div className="text-xs text-gray-500">
                        Players: {team.players?.length || 0}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowAddPlayer(true);
                        }}
                        className="bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 text-green-400 px-3 py-2 rounded-lg text-sm font-medium"
                      >
                        Add Player
                      </button>
                      <button
                        onClick={() => handleEditTeam(team)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                        title="Edit Team & Reorder Players"
                      >
                        Edit Team
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id!, team.name)}
                        className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium"
                        title="Delete Team"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Players List */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-medium text-white">Players</h4>
                    {!team.players || team.players.length === 0 ? (
                      <p className="text-gray-400 text-sm">No players in this team yet.</p>
                    ) : (
                      team.players.map((player, index) => (
                        <div key={index} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                          {editingPlayer?.teamId === team.id && editingPlayer?.playerIndex === index ? (
                            // Edit Mode
                            <div className="space-y-4">
                              <div className="text-sm font-medium text-gray-300 mb-2">
                                Editing: {editingPlayer.player.name}
                              </div>

                              {/* Basic Info */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                  type="text"
                                  value={editingPlayer.player.name}
                                  onChange={(e) => setEditingPlayer({
                                    ...editingPlayer,
                                    player: { ...editingPlayer.player, name: e.target.value }
                                  })}
                                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                  placeholder="Player Name"
                                />
                                <input
                                  type="text"
                                  value={editingPlayer.player.role}
                                  onChange={(e) => setEditingPlayer({
                                    ...editingPlayer,
                                    player: { ...editingPlayer.player, role: e.target.value }
                                  })}
                                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                  placeholder="Role"
                                />
                                <input
                                  type="text"
                                  value={editingPlayer.player.game}
                                  onChange={(e) => setEditingPlayer({
                                    ...editingPlayer,
                                    player: { ...editingPlayer.player, game: e.target.value }
                                  })}
                                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                  placeholder="Game"
                                />
                              </div>

                              {/* Image URL */}
                              <div>
                                <input
                                  type="text"
                                  value={editingPlayer.player.image}
                                  onChange={(e) => setEditingPlayer({
                                    ...editingPlayer,
                                    player: { ...editingPlayer.player, image: e.target.value }
                                  })}
                                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                  placeholder="Player Image URL"
                                />
                                {editingPlayer.player.image?.trim() && (
                                  <div className="mt-2 rounded-lg overflow-hidden border border-[#2A2A2A] bg-black/40">
                                    <div className="h-32 w-full flex items-center justify-center">
                                      <img
                                        src={processExternalImageUrl(editingPlayer.player.image)}
                                        alt="Preview"
                                        className="object-contain w-full h-full"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          const parent = target.parentElement;
                                          if (parent && !parent.querySelector('.error-message')) {
                                            const errorDiv = document.createElement('div');
                                            errorDiv.className = 'error-message text-red-400 text-sm text-center';
                                            errorDiv.textContent = 'Failed to load image';
                                            parent.appendChild(errorDiv);
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

                              {/* Achievements */}
                              <div>
                                <input
                                  type="text"
                                  value={editingPlayer.player.achievements?.join(', ') || ''}
                                  onChange={(e) => setEditingPlayer({
                                    ...editingPlayer,
                                    player: {
                                      ...editingPlayer.player,
                                      achievements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                    }
                                  })}
                                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                  placeholder="Achievements (comma separated) - e.g. FNCS Grand Finals, 2500+ Earnings, Top 10 Placement"
                                />
                              </div>

                              {/* Social Links */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={editingPlayer.player.socialLinks?.twitter || ''}
                                  onChange={(e) => setEditingPlayer({
                                    ...editingPlayer,
                                    player: {
                                      ...editingPlayer.player,
                                      socialLinks: {
                                        ...editingPlayer.player.socialLinks,
                                        twitter: e.target.value
                                      }
                                    }
                                  })}
                                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                  placeholder="Twitter URL"
                                />
                                <input
                                  type="text"
                                  value={editingPlayer.player.socialLinks?.twitch || ''}
                                  onChange={(e) => setEditingPlayer({
                                    ...editingPlayer,
                                    player: {
                                      ...editingPlayer.player,
                                      socialLinks: {
                                        ...editingPlayer.player.socialLinks,
                                        twitch: e.target.value
                                      }
                                    }
                                  })}
                                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                  placeholder="Twitch URL"
                                />
                                <input
                                  type="text"
                                  value={editingPlayer.player.socialLinks?.youtube || ''}
                                  onChange={(e) => setEditingPlayer({
                                    ...editingPlayer,
                                    player: {
                                      ...editingPlayer.player,
                                      socialLinks: {
                                        ...editingPlayer.player.socialLinks,
                                        youtube: e.target.value
                                      }
                                    }
                                  })}
                                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                  placeholder="YouTube URL"
                                />
                              </div>

                              {/* Instagram Link */}
                              <div>
                                <input
                                  type="text"
                                  value={editingPlayer.player.socialLinks?.instagram || ''}
                                  onChange={(e) => setEditingPlayer({
                                    ...editingPlayer,
                                    player: {
                                      ...editingPlayer.player,
                                      socialLinks: {
                                        ...editingPlayer.player.socialLinks,
                                        instagram: e.target.value
                                      }
                                    }
                                  })}
                                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                                  placeholder="Instagram URL"
                                />
                              </div>

                              <div className="flex gap-3 pt-2 border-t border-[#2A2A2A]">
                                <button
                                  onClick={() => handleEditPlayer(team.id!, index, editingPlayer.player)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                                >
                                  Save Changes
                                </button>
                                <button
                                  onClick={() => setEditingPlayer(null)}
                                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="bg-gray-600/20 text-gray-400 px-2 py-1 rounded text-xs font-mono">
                                    #{index + 1}
                                  </span>
                                  <h5 className="text-white font-medium">{player.name}</h5>
                                  <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                                    {player.role}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-400 space-y-1">
                                  <div>Game: {player.game}</div>
                                  {player.achievements && player.achievements.length > 0 && (
                                    <div>Achievements: {player.achievements.slice(0, 2).join(', ')}{player.achievements.length > 2 ? '...' : ''}</div>
                                  )}
                                  {(player.socialLinks?.twitter || player.socialLinks?.twitch || player.socialLinks?.youtube || player.socialLinks?.instagram) && (
                                    <div className="flex gap-2 mt-1">
                                      {player.socialLinks?.twitter && (
                                        <a href={player.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                          className="text-blue-400 hover:text-blue-300 text-xs">Twitter</a>
                                      )}
                                      {player.socialLinks?.twitch && (
                                        <a href={player.socialLinks.twitch} target="_blank" rel="noopener noreferrer"
                                          className="text-purple-400 hover:text-purple-300 text-xs">Twitch</a>
                                      )}
                                      {player.socialLinks?.youtube && (
                                        <a href={player.socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                                          className="text-red-400 hover:text-red-300 text-xs">YouTube</a>
                                      )}
                                      {player.socialLinks?.instagram && (
                                        <a href={player.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                          className="text-pink-400 hover:text-pink-300 text-xs">Instagram</a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-1 items-center">
                                {/* Reorder buttons */}
                                <div className="flex flex-col">
                                  <button
                                    onClick={() => handleMovePlayer(team.id!, index, 'up')}
                                    disabled={index === 0}
                                    className="text-gray-400 hover:text-white p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move Up"
                                  >
                                    <ChevronUpIcon className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleMovePlayer(team.id!, index, 'down')}
                                    disabled={index === (team.players?.length || 0) - 1}
                                    className="text-gray-400 hover:text-white p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move Down"
                                  >
                                    <ChevronDownIcon className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Action buttons */}
                                <button
                                  onClick={() => {
                                    console.log('Edit button clicked for player:', player.name);
                                    setEditingPlayer({
                                      teamId: team.id!,
                                      playerIndex: index,
                                      player: { ...player }
                                    });
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                                  title="Edit Player"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeletePlayer(team.id!, index)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                                  title="Remove Player"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Create New Team</h3>
                <button onClick={() => setShowCreateTeam(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                  placeholder="Team Name"
                />
                <input
                  type="text"
                  value={newTeam.image}
                  onChange={(e) => setNewTeam({ ...newTeam, image: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                  placeholder="Team Image URL"
                />
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white h-24"
                  placeholder="Team Description"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowCreateTeam(false)} className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white py-2 rounded">Cancel</button>
                <button onClick={handleCreateTeam} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded">Create Team</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditTeam && editingTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Edit Team: {editingTeam.name}</h3>
                <button onClick={() => setShowEditTeam(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                  placeholder="Team Name"
                />
                <input
                  type="text"
                  value={editingTeam.image}
                  onChange={(e) => setEditingTeam({ ...editingTeam, image: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                  placeholder="Team Image URL"
                />
                <textarea
                  value={editingTeam.description}
                  onChange={(e) => setEditingTeam({ ...editingTeam, description: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white h-24"
                  placeholder="Team Description"
                />
                <textarea
                  value={editingTeam.achievements?.join(', ') || ''}
                  onChange={(e) => setEditingTeam({
                    ...editingTeam,
                    achievements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white h-24"
                  placeholder="Team Achievements (comma separated)"
                />

                {/* Players Management */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Players Management</h4>
                  <div className="space-y-3">
                    {editingTeam.players?.map((player, index) => (
                      <div key={index} className="bg-[#0F0F0F] rounded-lg p-4 border border-[#2A2A2A]">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-gray-600/20 text-gray-400 px-2 py-1 rounded text-xs">#{index + 1}</span>
                              <span className="text-white font-medium">{player.name}</span>
                              <span className="text-blue-400 text-sm">({player.role})</span>
                            </div>
                            <div className="text-sm text-gray-400">
                              Game: {player.game}
                              {player.achievements && player.achievements.length > 0 && (
                                <span> • Achievements: {player.achievements.join(', ')}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex flex-col">
                              <button
                                onClick={() => movePlayer('up', index)}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-white p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move Up"
                              >
                                <ChevronUpIcon className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => movePlayer('down', index)}
                                disabled={index === editingTeam.players.length - 1}
                                className="text-gray-400 hover:text-white p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move Down"
                              >
                                <ChevronDownIcon className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removePlayerFromTeam(index)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowEditTeam(false)} className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white py-2 rounded">Cancel</button>
                <button onClick={handleUpdateTeam} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {showAddPlayer && selectedTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Add Player to {selectedTeam.name}</h3>
                <button onClick={() => { setShowAddPlayer(false); setSelectedTeam(null); }} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                  placeholder="Player Name"
                />
                <input
                  type="text"
                  value={newPlayer.role}
                  onChange={(e) => setNewPlayer({ ...newPlayer, role: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                  placeholder="Role (e.g., IGL, AWPer)"
                />
                <input
                  type="text"
                  value={newPlayer.game}
                  onChange={(e) => setNewPlayer({ ...newPlayer, game: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                  placeholder="Game (e.g., Valorant, CS2)"
                />
                <input
                  type="text"
                  value={newPlayer.image}
                  onChange={(e) => setNewPlayer({ ...newPlayer, image: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                  placeholder="Player Image URL"
                />
                <textarea
                  value={newPlayer.achievements?.join(', ') || ''}
                  onChange={(e) => setNewPlayer({
                    ...newPlayer,
                    achievements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white h-24"
                  placeholder="Achievements (comma separated)"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setShowAddPlayer(false); setSelectedTeam(null); }}
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddPlayer(selectedTeam.id!)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  Add Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
