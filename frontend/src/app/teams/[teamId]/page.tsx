"use client";

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { AnimatePresence } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';
import PlayerCard from '@/components/PlayerCard';
import PlayerDetailModal from '@/components/PlayerDetailModal';
import LoadingScreen from '@/components/LoadingScreen';
import { teamService, type Player } from '@/lib/teamService';
import { fallbackTeams, type DisplayTeam } from '@/data/teamsData';

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<DisplayTeam | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [currentTeamPlayers, setCurrentTeamPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Check fallback teams first
      const fallbackTeam = fallbackTeams.find(t =>
        t.name.toLowerCase().replace(/\s+/g, '-') === teamId || t.id === teamId
      );

      if (fallbackTeam) {
        setTeam(fallbackTeam);
        setCurrentTeamPlayers(fallbackTeam.players);
        setLoading(false);
        return;
      }

      // 2. Check Firestore
      const fsTeam = await teamService.getById(teamId);
      if (fsTeam) {
        const mapped: DisplayTeam = {
          id: fsTeam.id,
          name: fsTeam.name,
          image: fsTeam.image,
          description: fsTeam.description,
          achievements: fsTeam.achievements || [],
          players: (fsTeam.players || []).map(p => ({
            ...p,
            achievements: p.achievements || [],
            socialLinks: p.socialLinks || {},
            stats: p.stats || [],
            description: p.description || ''
          })),
        };
        setTeam(mapped);
        setCurrentTeamPlayers(mapped.players);
      }
    } catch (error) {
      console.error('❌ Error loading team:', error);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const openPlayerModal = (player: Player, teamPlayers: Player[]) => {
    setSelectedPlayer(player);
    setCurrentTeamPlayers(teamPlayers);
  };

  const handleNextPlayer = () => {
    if (!selectedPlayer || currentTeamPlayers.length === 0) return;
    const currentIndex = currentTeamPlayers.findIndex(p => p.name === selectedPlayer.name);
    if (currentIndex < currentTeamPlayers.length - 1) {
      setSelectedPlayer(currentTeamPlayers[currentIndex + 1]);
    }
  };

  const handlePrevPlayer = () => {
    if (!selectedPlayer || currentTeamPlayers.length === 0) return;
    const currentIndex = currentTeamPlayers.findIndex(p => p.name === selectedPlayer.name);
    if (currentIndex > 0) {
      setSelectedPlayer(currentTeamPlayers[currentIndex - 1]);
    }
  };

  if (loading) {
    return <LoadingScreen message="LOADING ROSTER" />;
  }

  if (!team) {
    return (
      <div className="pt-20 min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-white mb-4">Team Not Found</h1>
        <p className="text-gray-400 mb-8">The team you're looking for doesn't exist or has been removed.</p>
        <Link
          href="/teams"
          className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          Back to Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F] relative">
      {/* Player Detail Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <PlayerDetailModal
            player={selectedPlayer}
            isOpen={!!selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
            onNext={handleNextPlayer}
            onPrev={handlePrevPlayer}
            hasNext={currentTeamPlayers.findIndex(p => p.name === selectedPlayer.name) < currentTeamPlayers.length - 1}
            hasPrev={currentTeamPlayers.findIndex(p => p.name === selectedPlayer.name) > 0}
          />
        )}
      </AnimatePresence>

      <div className="void-container py-8 sm:py-12">
        {/* Back Button */}
        <AnimatedSection animationType="fadeIn" delay={50}>
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Teams</span>
          </Link>
        </AnimatedSection>

        {/* Team Header */}
        <AnimatedSection animationType="fadeIn" delay={100}>
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                <SafeImage
                  src={team.image}
                  alt={team.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-3">
                  {team.name}
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl">
                  {team.description}
                </p>
              </div>
            </div>

            {team.achievements.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {team.achievements.map((achievement, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium"
                  >
                    {achievement}
                  </span>
                ))}
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* Players Grid */}
        <AnimatedSection animationType="fadeIn" delay={150}>
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-6">
            Roster
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {team.players.map((player, pIdx) => (
              <AnimatedSection key={player.name} animationType="slideUp" delay={pIdx * 100}>
                <div onClick={() => openPlayerModal(player, team.players)} className="cursor-pointer">
                  <PlayerCard
                    name={player.name}
                    role={player.role}
                    image={player.image}
                    game={player.game}
                    achievements={player.achievements}
                    socialLinks={player.socialLinks}
                  />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
