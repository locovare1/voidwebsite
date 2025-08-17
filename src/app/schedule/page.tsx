import { AnimatedElement, useEnhancedAnimations } from '@/components/EnhancedAnimations';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Schedule',
  description: 'View upcoming matches and events for Void Esports teams.',
};

const upcomingMatches = [
  {
    game: 'TBD',
    event: 'TBD',
    opponent: 'TBD',
    date: 'TBD',
    time: 'TBD',
    streamLink: 'https://www.twitch.tv/voidfrankenstein',
  },
];

const upcomingEvents = [
  {
    name: 'Void Summer Showdown',
    game: 'Fortnite',
    date: 'TBD',
    type: 'Online Tournament',
    prizePool: 'TBD (USD)',
    registrationLink: 'https://discord.gg/voidesports2x',
  },
];

export default function SchedulePage() {
  // Initialize enhanced animations
  useEnhancedAnimations();

  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="void-container py-12">
        <AnimatedElement animation="bounceIn" delay={200}>
          <h1 className="text-4xl md:text-5xl font-bold mb-12 gradient-text text-center">Schedule</h1>
        </AnimatedElement>
        
        {/* Upcoming Matches */}
        <div className="mb-16">
          <AnimatedElement animation="slideInUp" delay={400}>
            <h2 className="text-2xl font-bold mb-6 text-white">Upcoming Matches</h2>
          </AnimatedElement>
          <div className="grid gap-4">
            {upcomingMatches.map((match) => (
              <AnimatedElement key={`${match.game}-${match.date}`} animation="scaleIn" delay={600}>
                <div className="void-card hover-lift">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-[#FFFFFF]/20 rounded-full text-[#FFFFFF] text-sm">
                        {match.game}
                      </span>
                      <span className="text-gray-400">{match.event}</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      Void vs {match.opponent}
                    </div>
                  </div>
                  
                </div>
              </AnimatedElement>
                    <div className="text-gray-400">
                      <div>{match.date}</div>
                      <div>{match.time}</div>
                    </div>
                      <a
                        href={match.streamLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="void-button"
                      >
                        Watch Stream
                      </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Upcoming Events */}
        <div>
          <AnimatedElement animation="slideInUp" delay={800}>
            <h2 className="text-2xl font-bold mb-6 text-white">Upcoming Events</h2>
          </AnimatedElement>
          <div className="grid gap-4">
            {upcomingEvents.map((event) => (
              <AnimatedElement key={event.name} animation="scaleIn" delay={1000}>
                <div className="void-card hover-lift">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-[#FFFFFF]/20 rounded-full text-[#FFFFFF] text-sm">
                        {event.game}
                      </span>
                      <span className="text-gray-400">{event.type}</span>
                    </div>
                    <div className="text-xl font-bold text-white mb-1">
                      {event.name}
                    </div>
                    {event.prizePool && (
                      <div className="text-[#a2a2a2]">Prize Pool: {event.prizePool}</div>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="text-gray-400">
                      <div>{event.date}</div>
                    </div>
                    <a
                      href={event.registrationLink}
                      className="void-button"
                    >
                      Register Now
                    </a>
                  </div>
                </div>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 