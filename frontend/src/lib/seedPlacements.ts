import { placementService } from '@/lib/placementService';

// Hardcoded placements data
const placementsData = [
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

export const seedPlacements = async () => {
  try {
    console.log('Seeding placements data...');
    
    // Check if we already have placements
    const existingPlacements = await placementService.getAll();
    if (existingPlacements.length > 0) {
      console.log('Placements already exist, skipping seed.');
      return;
    }
    
    // Add the hardcoded placements to Firebase
    for (const placement of placementsData) {
      await placementService.create({
        game: placement.game,
        tournament: placement.tournament,
        team: placement.team,
        position: placement.position,
        players: placement.players,
        prize: placement.prize,
        logo: placement.logo
      });
    }
    
    console.log('Placements seeded successfully!');
  } catch (error) {
    console.error('Error seeding placements:', error);
  }
};

// Run the seed function if this file is executed directly
if (typeof window === 'undefined') {
  // This will run in Node.js environment
  seedPlacements().then(() => {
    console.log('Seeding complete');
  }).catch((error) => {
    console.error('Seeding failed:', error);
  });
}