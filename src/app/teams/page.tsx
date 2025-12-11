"use client";

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnimatedSection from '@/components/AnimatedSection';
import AdPlaceholder from '@/components/AdPlaceholder';
import PlayerCard from '@/components/PlayerCard';
import PlayerDetailModal from '@/components/PlayerDetailModal';
import { teamService, type Team as FSTeam, type Player } from '@/lib/teamService';
import { db } from '@/lib/firebase';

type DisplayTeam = {
  id?: string;
  name: string;
  image: string;
  description: string;
  players: Player[];
  achievements: string[];
};

// Fallback to previous hardcoded teams data when Firestore is unavailable or empty
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
                      <Image
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
                        <Image
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