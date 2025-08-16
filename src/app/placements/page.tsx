import PlacementGrid from '@/components/PlacementGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recent Placements',
  description: 'View our teams\' latest achievements and tournament placements across various esports titles.',
};

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
    tournament: "FNCS Grand Finals",
    team: "Void Fortnite",
    position: "24th Place",
    players: ["Void Blu, Powerxfn, 2AM Zandaa"],
    prize: "$850",
    logo: "/logos/fortnite.jpg"
  },
  {
    game: "Fortnite",
    tournament: "FNCS Grand Finals",
    team: "Void Fortnite",
    position: "33rd Place",
    players: ["Void Drvzy, EXE Liam, Maddenv_"],
    prize: "$0",
    logo: "/logos/fortnite.jpg"
  },
  {
    game: "Fortnite",
    tournament: "Ranked Cup",
    team: "Void Fortnite",
    position: "10th Place",
    players: ["Void Dixuez"],
    prize: "$0",
    logo: "/logos/fortnite.jpg"
  },
  {
    game: "Fortnite",
    tournament: "FNCS Group 3",
    team: "Void Fortnite",
    position: "7th Place",
    players: ["Void Blu, EXE Zanda, PowerFN"],
    prize: "$0",
    logo: "/logos/fortnite.jpg"
  },

  {
    game: "Fortnite",
    tournament: "FNCS Group 3",
    team: "Void Fortnite",
    position: "10th Place",
    players: ["Void Drvzy, Maddenv_, Liam"],
    prize: "$0",
    logo: "/logos/fortnite.jpg"
  },
  
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

        <PlacementGrid placements={recentPlacements} itemsPerPage={6} />
      </div>
    </div>
  );
} 
