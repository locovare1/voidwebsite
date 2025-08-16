import TeamGrid from '@/components/TeamGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Teams',
  description: 'Meet the elite teams representing Void Esports across multiple gaming titles.',
};

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
];

export default function TeamsPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F] page-wrapper gpu-accelerated">
      <div className="void-container py-12">
        <h1 className="text-4xl font-bold mb-12 gradient-text text-center animate-bounce-in gpu-accelerated">Our Teams</h1>
        
        <TeamGrid teams={teams} itemsPerPage={2} />
      </div>
    </div>
  );
} 
