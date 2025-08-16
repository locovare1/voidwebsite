import Image from 'next/image';

const teams = [
  {
    name: 'Fortnite',
    image: '/teams/fortnite.png',
    description: 'Our elite Fortnite squad competing at the highest level.',
    roster: ['Void Blu', 'Void Drvzy', 'Void Crzy', 'Void Jayse1x'],
    achievements: ['The Best Fortnite Group in the World.'],
  },
  {
    name: 'Ownership',
    image: '/logo.png',
    description: 'Void Esports Ownership Team',
    roster: ['Gruun', 'Frankenstein', 'Dixuez', 'DrPuffin'],
    achievements: ['The Owners of Void Esports'],
  },
]
export default function TeamsPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F] page-wrapper gpu-accelerated">
      <div className="void-container py-12">
        <h1 className="text-4xl font-bold mb-12 gradient-text text-center animate-bounce-in gpu-accelerated">Our Teams</h1>
        
        <div className="space-y-16">
          {teams.map((team, index) => (
            <div key={team.name} className={`void-card scroll-reveal hover-lift gpu-accelerated`} style={{animationDelay: `${index * 0.2}s`}}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative h-64 lg:h-full min-h-[300px] rounded-lg overflow-hidden">
                  <Image
                    src={team.image}
                    alt={team.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110 gpu-accelerated"
                  />
                </div>
                
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold gradient-text stagger-child">{team.name}</h2>
                  <p className="text-gray-300 text-lg stagger-child">{team.description}</p>
                  
                  <div className="stagger-child">
                    <h3 className="text-xl font-semibold mb-3 text-white">Current Roster</h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {team.roster.map((player, playerIndex) => (
                        <li key={player} className={`text-gray-400 transition-colors duration-300 hover:text-white cursor-pointer hover:translate-x-1 gpu-accelerated`} style={{animationDelay: `${playerIndex * 0.05}s`}}>{player}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="stagger-child">
                    <h3 className="text-xl font-semibold mb-3 text-white">Role</h3>
                    <ul className="space-y-2">
                      {team.achievements.map((achievement, achIndex) => (
                        <li key={achievement} className={`text-gray-400 gpu-accelerated`} style={{animationDelay: `${achIndex * 0.05}s`}}>{achievement}</li>
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
