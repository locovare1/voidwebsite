"use client";

import { useEffect, useState } from 'react';

const upcomingMatches = [
  {
    game: 'Fortnite',
    event: 'FNCS Qualifiers',
    opponent: 'TBD',
    date: '2025-01-15',
    time: '7:00 PM EST',
    streamLink: 'https://www.twitch.tv/voidfrankenstein'
  },
  {
    game: 'Valorant',
    event: 'Community Tournament',
    opponent: 'TBD',
    date: '2025-01-20',
    time: '6:00 PM EST',
    streamLink: 'https://www.twitch.tv/voidfrankenstein'
  }
];

const upcomingEvents = [
  {
    name: 'FNCS Major 4',
    game: 'Fortnite',
    type: 'Major Tournament',
    date: '2025-02-01',
    prizePool: '$100,000',
    registrationLink: '#'
  },
  {
    name: 'Valorant Open',
    game: 'Valorant',
    type: 'Open Tournament',
    date: '2025-02-15',
    prizePool: '$5,000',
    registrationLink: '#'
  }
];

export default function SchedulePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`pt-20 min-h-screen bg-[#0F0F0F] transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="void-container py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white text-center stagger-child stagger-1">Schedule</h1>
        
        {/* Upcoming Matches */}
        <div className="mb-16 scroll-reveal">
          <h2 className="text-2xl font-bold mb-6 text-white stagger-child">Upcoming Matches</h2>
          <div className="grid gap-4">
            {upcomingMatches.map((match) => (
              <div key={`${match.game}-${match.date}`} className="void-card hover-lift stagger-child">
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
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
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
        <div className="scroll-reveal">
          <h2 className="text-2xl font-bold mb-6 text-white stagger-child">Upcoming Events</h2>
          <div className="grid gap-4">
            {upcomingEvents.map((event) => (
              <div key={event.name} className="void-card hover-lift stagger-child">
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 