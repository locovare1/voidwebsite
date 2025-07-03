import Image from 'next/image';

interface Placement {
  game: string;
  tournament: string;
  team: string;
  position: string;
  players: string[];
  prize?: string;
  logo: string;
}

const recentPlacements: Placement[] = [
  {
    game: "Fortnite",
    tournament: "Platinum & Diamond Ranked Cup (Solos)",
    team: "Void Fortnite",
    position: "11th Place",
    players: ["Void Cronus"],
    prize: "$0",
    logo: "/logos/fortnite.jpg"
  },
  
  {
    game: "Fortnite",
    tournament: "OG Cup Builds",
    team: "Void Fortnite",
    position: "12-15th Place",
    players: ["Void Frankenstein ", "Void Bob ", "Void Pistol ", "Void Iced "],
    prize: "$0",
    logo: "/logos/fortnite.jpg"
  },
];

export default function Placements() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-24 pb-16">
      <div className="void-container">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Recent Placements
          </h1>
          <p className="text-gray-400 text-lg">
            Our teams&apos; latest achievements across various esports titles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentPlacements.map((placement, index) => (
            <div
              key={index}
              className="bg-[#1A1A1A] rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 border border-[#2A2A2A]"
            >
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 mr-4">
                  <Image
                    src={placement.logo}
                    alt={placement.game}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-xl">
                    {placement.game}
                  </h3>
                  <p className="text-[#8A2BE2]">{placement.team}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-gray-400">Tournament</p>
                  <p className="text-white font-medium">{placement.tournament}</p>
                </div>
                <div>
                  <p className="text-gray-400">Position</p>
                  <p className="text-white font-medium">{placement.position}</p>
                </div>
                <div>
                  <p className="text-gray-400">Players</p>
                  <div className="grid grid-cols-2 gap-2">
                    {placement.players.map((player, idx) => (
                      <p key={idx} className="text-white font-medium">{player}</p>
                    ))}
                  </div>
                </div>
                {placement.prize && (
                  <div>
                    <p className="text-gray-400">Prize</p>
                    <p className="text-[#8A2BE2] font-semibold">
                      {placement.prize}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 