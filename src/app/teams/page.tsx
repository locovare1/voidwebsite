"use client";

import Image from 'next/image';
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
        name: 'Void Fx1ine',
        role: 'Player',
        image: '/teams/players/fxing.png',
        game: 'Fortnite',
        achievements: ['30k+ PR', 'Major 3 Qualifier', 'Future Champion'],
        socialLinks: {
          twitter: 'https://x.com/Forest_veroo'
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
        role: 'Founder & CTO',
        image: '/teams/players/gruun.png',
        game: 'Management',
        achievements: ['Founder', 'Developer', 'Technical Director'],
        socialLinks: {
          twitter: 'https://x.com/gruunvfx'
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
        name: 'Bxezy',
        role: 'Management',
        image: '/teams/players/bxezy.jpg',
        game: 'Management',
        achievements: ['Innovation', 'Community Manager', 'Manager'],
        socialLinks: {
          twitter: 'https://x.com/bxezyfnx'
        }
      },
      {
        name: 'Dixuez',
        role: 'Management',
        image: '/teams/players/dix.png',
        game: 'Management',
        achievements: ['Team Manager', 'Infrastructure', 'Innovation'],
        socialLinks: {
          twitter: 'https://www.twitch.tv/dixuez'
        }
      },
    ],
    achievements: ['The Owners of Void Esports'],
  },
];

export default function TeamsPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="void-container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text">Our Teams</h1>
        </div>
        
        <div className="space-y-20">
          {teams.map((team) => (
            <div key={team.name} className="void-card">
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
                </div>
              </div>

              {/* Player Cards Grid */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-8 gradient-text text-center">Meet the Team</h3>
                
                <div className={team.name === 'Ownership' 
                  ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6" 
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                }>
                  {team.players.map((player) => (
                    <div key={player.name}>
                      <PlayerCard
                        name={player.name}
                        role={player.role}
                        image={player.image}
                        game={player.game}
                        achievements={player.achievements}
                        socialLinks={player.socialLinks}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
