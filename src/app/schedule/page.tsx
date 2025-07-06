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
  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="void-container py-12">
        <h1 className="text-4xl font-bold mb-12 gradient-text text-center">Schedule</h1>
        
        {/* Upcoming Matches */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-white">Upcoming Matches</h2>
          <div className="grid gap-4">
            {upcomingMatches.map((match) => (
              <div key={`${match.game}-${match.date}`} className="void-card">
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
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">Upcoming Events</h2>
          <div className="grid gap-4">
            {upcomingEvents.map((event) => (
              <div key={event.name} className="void-card">
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