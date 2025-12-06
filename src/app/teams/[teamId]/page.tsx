"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AnimatedSection from '@/components/AnimatedSection';
import PlayerCard from '@/components/PlayerCard';
import PlayerDetailModal from '@/components/PlayerDetailModal';
import { teamService, type Team as FSTeam, type Player } from '@/lib/teamService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

type DisplayTeam = {
  id?: string;
  name: string;
  image: string;
  description: string;
  players: Player[];
  achievements: string[];
};

// Fallback teams data
const fallbackTeams: DisplayTeam[] = [
  {
    name: 'Fortnite',
    image: '/teams/fortnite.png',
    description: 'Our elite Fortnite squad competing at the highest level.',
    players: [
      {
        name: 'Void Blu',
        role: 'Player',
        image: '/teams/players/blu.png',
        game: 'Fortnite',
        description: 'A highly skilled Fortnite competitor known for aggressive playstyle and strategic rotations. Blu has been a dominant force in the competitive scene.',
        stats: [
          { label: 'Earnings', value: '$2,500+' },
          { label: 'PR', value: '50k+' },
          { label: 'Win Rate', value: '15%' }
        ],
        achievements: ['FNCS Grand Finals', '2500+ Earnings', 'Top 10 Placement'],
        socialLinks: {
          twitter: 'https://x.com/D1_Blu',
          twitch: 'https://www.twitch.tv/d1blu'
        }
      },
      {
        name: 'Void Drvzy',
        role: 'Player',
        image: '/teams/players/drvzy.jpg',
        game: 'Fortnite',
        description: 'Consistent and mechanical, Drvzy brings a level of precision to the team that is unmatched. Known for clutch plays in high-pressure situations.',
        stats: [
          { label: 'Earnings', value: '$1,000+' },
          { label: 'PR', value: '30k+' },
          { label: 'K/D', value: '4.5' }
        ],
        achievements: ['FNCS Grand Finals', 'Major 3 Qualifier', 'Elite Player'],
        socialLinks: {
          twitter: 'https://x.com/drvzyfn',
        }
      },
      {
        name: 'Void Jayse1x',
        role: 'Player',
        image: '/teams/players/jayse.jpg',
        game: 'Fortnite',
        description: 'A rising star in the Fortnite community. Jayse combines raw mechanical talent with a deep understanding of the meta.',
        stats: [
          { label: 'Earnings', value: '$500+' },
          { label: 'PR', value: '15k+' },
          { label: 'Avg Place', value: '#12' }
        ],
        achievements: ['Rising Star', 'Tournament Player', 'Future Champion'],
        socialLinks: {
          twitter: 'https://x.com/Jaysekbm'
        }
      },
      {
        name: 'Void Golden',
        role: 'Player',
        image: '/teams/players/1xGolden.jpg',
        game: 'Fortnite',
        description: 'With over 100k PR, Golden is a veteran of the scene. His experience and leadership are vital to the team\'s success.',
        stats: [
          { label: 'Earnings', value: '$11,000+' },
          { label: 'PR', value: '100k+' },
          { label: 'Wins', value: '500+' }
        ],
        achievements: ['100k+ PR', '11K+ earned', 'Future Champion'],
        socialLinks: {
          twitter: 'https://x.com/1xgolden'
        }
      }
    ],
    achievements: ['2x FNCS Grand Finals', '200K+ PR', '5k+ Earnings'],
  },
  {
    name: 'Ownership',
    image: '/logo.png',
    description: 'Void Esports Ownership Team',
    players: [
      {
        name: 'Frankenstein',
        role: 'Founder',
        image: '/teams/players/frank.png',
        game: 'Management',
        description: 'The visionary behind Void Esports. Frankenstein oversees all operations and strategic direction of the organization.',
        stats: [
          { label: 'Founded', value: '2020' },
          { label: 'Role', value: 'Founder' }
        ],
        achievements: ['Founder', 'Team Management', 'Business Development'],
        socialLinks: {
          twitter: 'https://x.com/VoidFrankenste1',
          twitch: 'https://www.twitch.tv/voidfrankenstein'
        }
      },
      {
        name: 'Gruun',
        role: 'Founder',
        image: '/teams/players/gruun.png',
        game: 'Management',
        description: 'Technical Director and Co-Founder. Gruun ensures the organization stays ahead of the curve with technology and infrastructure.',
        stats: [
          { label: 'Role', value: 'Tech Lead' },
          { label: 'Exp', value: '5+ Years' }
        ],
        achievements: ['Founder', 'Developer', 'Technical Director'],
        socialLinks: {
          twitter: 'https://x.com/gruunvfx'
        }
      },
      {
        name: 'Dixuez',
        role: 'Ownership',
        image: '/teams/players/dix.png',
        game: 'Management',
        description: 'Managing the day-to-day operations and ensuring smooth execution of team activities.',
        stats: [
          { label: 'Role', value: 'Manager' }
        ],
        achievements: ['Team Manager', 'Infrastructure', 'Innovation'],
        socialLinks: {
          twitter: 'https://www.twitch.tv/dixuez'
        }
      },
      {
        name: 'Jah',
        role: 'CFO',
        image: '/logo.png',
        game: 'Management',
        description: 'Chief Financial Officer. Jah manages the financial health and sponsorship acquisitions for Void Esports.',
        stats: [
          { label: 'Role', value: 'CFO' }
        ],
        achievements: ['Financial Director', 'Sponsorship', 'Growth Strategy'],
        socialLinks: {
          twitter: 'https://twitter.com/voiddrpuffin'
        }
      },
      {
        name: 'Nick',
        role: 'CEO',
        image: '/teams/players/nick.png',
        game: 'Management',
        description: 'Chief Executive Officer. Nick leads the community engagement and overall management of the organization.',
        stats: [
          { label: 'Role', value: 'CEO' }
        ],
        achievements: ['Innovation', 'Community Manager', 'Manager'],
        socialLinks: {
          twitter: 'https://x.com/void_nicholas'
        }
      },
    ],
    achievements: ['The Owners of Void Esports'],
  },
];

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params?.teamId as string;
  const [team, setTeam] = useState<DisplayTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [currentTeamPlayers, setCurrentTeamPlayers] = useState<Player[]>([]);

  const loadTeam = useCallback(async () => {
    try {
      setLoading(true);
      // Try to get team by ID first
      let foundTeam: DisplayTeam | null = null;
      
      if (teamId) {
        // First, try to get team by Firebase ID (Firebase IDs are alphanumeric)
        // Try this first regardless of length, as Firebase IDs can vary
        if (/^[a-zA-Z0-9]+$/.test(teamId)) {
          try {
            const firebaseTeam = await teamService.getById(teamId);
            if (firebaseTeam) {
              foundTeam = {
                id: firebaseTeam.id,
                name: firebaseTeam.name,
                image: firebaseTeam.image,
                description: firebaseTeam.description,
                achievements: firebaseTeam.achievements || [],
                players: (firebaseTeam.players || []).map(p => ({
                  ...p,
                  achievements: p.achievements || [],
                  socialLinks: p.socialLinks || {},
                  stats: p.stats || [],
                  description: p.description || ''
                })),
              };
            }
          } catch (error) {
            // If getById fails, continue to try by name
            console.log('Team not found by ID, trying by name...');
          }
        }
        
        // If not found by ID, try to find by name slug
        if (!foundTeam) {
          try {
            const allTeams = await teamService.getAll();
            const teamName = teamId.replace(/-/g, ' ');
            const matchedTeam = allTeams.find((t: FSTeam) => 
              t.name.toLowerCase() === teamName.toLowerCase()
            );
            
            if (matchedTeam) {
              foundTeam = {
                id: matchedTeam.id,
                name: matchedTeam.name,
                image: matchedTeam.image,
                description: matchedTeam.description,
                achievements: matchedTeam.achievements || [],
                players: (matchedTeam.players || []).map(p => ({
                  ...p,
                  achievements: p.achievements || [],
                  socialLinks: p.socialLinks || {},
                  stats: p.stats || [],
                  description: p.description || ''
                })),
              };
            }
          } catch (error) {
            console.log('Error fetching teams, will try fallback...');
          }
        }
      }
      
      // Fallback to hardcoded teams if not found
      if (!foundTeam) {
        const teamName = teamId?.replace(/-/g, ' ') || '';
        foundTeam = fallbackTeams.find(t => 
          t.name.toLowerCase() === teamName.toLowerCase()
        ) || null;
      }
      
      setTeam(foundTeam);
    } catch (error) {
      console.error('Error loading team:', error);
      // Try fallback
      const teamName = teamId?.replace(/-/g, ' ') || '';
      const fallbackTeam = fallbackTeams.find(t => 
        t.name.toLowerCase() === teamName.toLowerCase()
      );
      setTeam(fallbackTeam || null);
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
    return (
      <div className="pt-20 min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="pt-20 min-h-screen bg-[#0F0F0F]">
        <div className="void-container py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold gradient-text mb-4">Team Not Found</h1>
            <p className="text-gray-400 mb-6">The team you're looking for doesn't exist.</p>
            <Link href="/teams" className="void-button inline-block">
              Back to Teams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F] relative">
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
                <Image
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
                <div onClick={() => openPlayerModal(player, team.players)}>
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

