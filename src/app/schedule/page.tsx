"use client";

import { useEffect, useState } from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import { scheduleService, type Match, type Event } from '@/lib/scheduleService';

const fallbackMatches = [
  {
    game: 'TBD',
    event: 'TBD',
    opponent: 'TBD',
    date: 'TBD',
    time: 'TBD',
    streamLink: 'https://www.twitch.tv/voidfrankenstein',
  },
];

const fallbackEvents = [
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
  const [upcomingMatches, setUpcomingMatches] = useState(fallbackMatches);
  const [upcomingEvents, setUpcomingEvents] = useState(fallbackEvents);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [matches, events] = await Promise.all([
          scheduleService.getAllMatches(),
          scheduleService.getAllEvents()
        ]);
        if (!mounted) return;
        if (matches && matches.length > 0) {
          setUpcomingMatches(matches.map(m => ({
            game: m.game,
            event: m.event,
            opponent: m.opponent,
            date: m.date,
            time: m.time,
            streamLink: m.streamLink
          })));
        } else {
          setUpcomingMatches(fallbackMatches);
        }
        if (events && events.length > 0) {
          setUpcomingEvents(events.map(e => ({
            name: e.name,
            game: e.game,
            date: e.date,
            type: e.type,
            prizePool: e.prizePool,
            registrationLink: e.registrationLink
          })));
        } else {
          setUpcomingEvents(fallbackEvents);
        }
      } catch {
        setUpcomingMatches(fallbackMatches);
        setUpcomingEvents(fallbackEvents);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="void-container py-12">
        <AnimatedSection animationType="fadeIn" delay={100}>
          <h1 className="text-4xl font-bold mb-12 gradient-text text-center">Schedule</h1>
        </AnimatedSection>
        
        {/* Upcoming Matches */}
        <AnimatedSection animationType="slideUp" delay={150}>
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-white">Upcoming Matches</h2>
          <div className="grid gap-4">
            {upcomingMatches.map((match, idx) => (
              <AnimatedSection key={`${match.game}-${match.date}`} animationType="fadeIn" delay={idx * 100}>
              <div className="void-card">
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
              </AnimatedSection>
            ))}
          </div>
        </div>
        </AnimatedSection>
        
        {/* Upcoming Events */}
        <AnimatedSection animationType="slideUp" delay={250}>
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">Upcoming Events</h2>
          <div className="grid gap-4">
            {upcomingEvents.map((event, idx) => (
              <AnimatedSection key={event.name} animationType="fadeIn" delay={idx * 100}>
              <div className="void-card">
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
              </AnimatedSection>
            ))}
          </div>
        </div>
        </AnimatedSection>
      </div>
    </div>
  );
} 