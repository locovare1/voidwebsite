import Image from 'next/image';

const teams = [
  {
    name: 'Fortnite',
    image: '/teams/fortnite.png',
    description: 'Our elite Fortnite squad competing at the highest level.',
    roster: ['Crzy'],
    achievements: ['The Best Fortnite Group in the World.'],
  },
  {
    name: 'Ownership',
    image: '/logo.png',
    description: 'Void Esports Ownership Team',
    roster: ['Gruun', 'Frankenstein', 'Bxezy', 'Dixuez'],
    achievements: ['The Owners of Void Esports'],
  },
  {
    name: 'Valorant',
    image: '/teams/valorant.png',
    description: 'Void Esports Ownership Team',
    roster: ['DrPuffin', 'Wrench', 'Cyber', 'Artic'],
    achievements: ['The Very Upper Executives of Void Esports'],
  },
];

export default function TeamsPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="void-container py-12">
        <h1 className="text-4xl font-bold mb-12 gradient-text text-center">Our Teams</h1>
        
        <div className="space-y-16">
          {teams.map((team) => (
            <div key={team.name} className="void-card">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative h-64 lg:h-full min-h-[300px] rounded-lg overflow-hidden">
                  <Image
                    src={team.image}
                    alt={team.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold gradient-text">{team.name}</h2>
                  <p className="text-gray-300 text-lg">{team.description}</p>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-white">Current Roster</h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {team.roster.map((player) => (
                        <li key={player} className="text-gray-400">{player}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-white">Role</h3>
                    <ul className="space-y-2">
                      {team.achievements.map((achievement) => (
                        <li key={achievement} className="text-gray-400">{achievement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
