"use client";

import { useEffect, useState, useCallback } from 'react';
import SafeImage from '@/components/SafeImage';
import Link from 'next/link';
import AnimatedSection from '@/components/AnimatedSection';
import AdPlaceholder from '@/components/AdPlaceholder';
import PlayerCard from '@/components/PlayerCard';
import PlayerDetailModal from '@/components/PlayerDetailModal';
import { teamService, type Team as FSTeam, type Player } from '@/lib/teamService';
import { db } from '@/lib/firebase';

import { fallbackTeams, type DisplayTeam } from '@/data/teamsData';


export default function TeamsPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [currentTeamPlayers, setCurrentTeamPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<DisplayTeam[]>(fallbackTeams);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadTeams = useCallback(async () => {
    try {
      const items = await teamService.getAll().catch(error => {
        console.error('Firebase getAll error:', error);
        return [];
      });

      if (items && items.length > 0) {
        const mapped: DisplayTeam[] = items.map((t: FSTeam) => ({
          id: t.id,
          name: t.name,
          image: t.image,
          description: t.description,
          achievements: t.achievements || [],
          players: (t.players || []).map(p => ({
            ...p,
            achievements: p.achievements || [],
            socialLinks: p.socialLinks || {},
            stats: p.stats || [],
            description: p.description || ''
          })),
        }));
        setTeams(mapped);
      } else {
        setTeams(fallbackTeams);
      }
    } catch (error) {
      console.error('❌ Error loading teams:', error);
      setTeams(fallbackTeams);
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [refreshKey, loadTeams]);

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

  return (
    <div className="pt-20 min-h-screen bg-[#1a0a2e] relative">
      {/* Player Detail Modal */}
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

      <div className="void-container py-8 sm:py-12">
        <AnimatedSection animationType="fadeIn" delay={100}>
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">Our Rosters</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Meet the elite players and staff representing Void Esports across various titles.
            </p>
          </div>
        </AnimatedSection>

        {/* Ad Spot - Banner at top of teams page */}
        <div className="mb-8">
          <AdPlaceholder size="banner" />
        </div>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-6xl mx-auto">
          {teams.map((team, idx) => {
            // Create a URL-friendly slug from team name
            const teamSlug = team.name.toLowerCase().replace(/\s+/g, '-');
            const teamId = (team as any).id || teamSlug;

            return (
              <AnimatedSection key={team.name} animationType="slideUp" delay={idx * 100}>
                <Link
                  href={`/teams/${teamId}`}
                  className="block group"
                >
                  <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10 hover:scale-105 aspect-square relative w-[280px] sm:w-[320px] lg:w-[340px]">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                      <SafeImage
                        src={team.image}
                        alt={team.name}
                        fill
                        className="object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/60 to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/10 shadow-lg mb-4">
                        <SafeImage
                          src={team.image}
                          alt={team.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                        {team.name}
                      </h2>
                      <p className="text-gray-400 text-sm sm:text-base mb-3 line-clamp-2">
                        {team.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{team.players.length} Members</span>
                        <span>•</span>
                        <span className="text-purple-400 group-hover:text-purple-300 transition-colors">
                          View Roster →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </div>
  );
}