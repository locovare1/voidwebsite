"use client";

import { useState } from 'react';
import Image from 'next/image';
import AnimatedSection from '@/components/AnimatedSection';
import PlayerCard from '@/components/PlayerCard';

const teams = [
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
  const [ownershipClicks, setOwnershipClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [clickProgress, setClickProgress] = useState(0); // Track click progress for visual feedback

  const handleOwnershipClick = () => {
    const newClickCount = ownershipClicks + 1;
    setOwnershipClicks(newClickCount);
    setClickProgress((newClickCount / 4) * 100); // Update progress bar

    if (newClickCount === 4) {
      setShowEasterEgg(true);
      setOwnershipClicks(0);
      setClickProgress(0);

      // Hide the easter egg after 5 seconds
      setTimeout(() => {
        setShowEasterEgg(false);
      }, 5000);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F] relative">
      {/* Easter Egg Message */}
      {showEasterEgg && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className="text-4xl md:text-6xl font-bold gradient-text text-center px-4 transition-all duration-1000 ease-in-out transform"
            style={{
              animation: 'easterEggAppear 2s ease-in-out forwards'
            }}
          >
            <div className="mb-4">👑 The Legend 👑</div>
            <div className="text-3xl md:text-5xl">DrPuffin</div>
            <div className="mt-4 text-xl md:text-2xl">Rules Them All!</div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes easterEggAppear {
          0% { 
            opacity: 0; 
            transform: scale(0.5) rotate(0deg); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2) rotate(5deg); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) rotate(0deg); 
          }
        }
        
        .click-progress {
          height: 4px;
          background: linear-gradient(90deg, #FFFFFF, #dedede);
          transition: width 0.3s ease;
        }
      `}</style>

      <div className="void-container py-12">
        <AnimatedSection animationType="fadeIn" delay={100}>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text">Our Teams</h1>
          </div>
        </AnimatedSection>

        <div className="space-y-20">
          {teams.map((team, idx) => (
            <AnimatedSection key={team.name} animationType="slideUp" delay={idx * 100}>
              <div
                className={`void-card ${team.name === 'Ownership' ? 'cursor-pointer relative' : ''}`}
                onClick={team.name === 'Ownership' ? handleOwnershipClick : undefined}
              >
                {/* Progress bar for easter egg clicks */}
                {team.name === 'Ownership' && (
                  <div className="absolute top-0 left-0 w-full bg-gray-700 rounded-t-lg">
                    <div 
                      className="click-progress rounded-t-lg" 
                      style={{ width: `${clickProgress}%` }}
                    ></div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  <div className="relative h-64 lg:h-full min-h-[300px] rounded-lg overflow-hidden group">
                    <Image
                      src={team.image}
                      alt={team.name}
                      fill
                      className={team.name === 'Fortnite' ? 'object-cover object-[50%_15%] w-full h-full' : 'object-cover w-full h-full'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold gradient-text">{team.name}</h2>
                    <p className="text-gray-300 text-lg">{team.description}</p>

                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-white">Team Achievements</h3>
                      <ul className="space-y-2">
                        {team.achievements.map((achievement) => (
                          <li key={achievement} className="text-gray-400 flex items-center">
                            <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Hint for easter egg */}
                    {team.name === 'Ownership' && (
                      <div className="mt-4 text-sm text-gray-500 italic">
                        {ownershipClicks > 0 
                          ? `Click ${4 - ownershipClicks} more times...` 
                          : 'Click the team card 4 times to unlock a secret!'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Player Cards Grid */}
                <div className="mt-12">
                  <h3 className="text-2xl font-bold mb-8 gradient-text text-center">Meet the Team</h3>

                  <div className={team.name === 'Ownership'
                    ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
                    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  }>
                    {team.players.map((player, pIdx) => (
                      <AnimatedSection key={player.name} animationType="fadeIn" delay={pIdx * 100}>
                        <div>
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
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}