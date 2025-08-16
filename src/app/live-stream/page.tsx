"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Twitch API types
interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
}

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

// Void streamers configuration
const VOID_STREAMERS = [
  {
    username: 'voidfrankenstein',
    displayName: 'Void Frankenstein',
    description: 'Professional Fortnite player and content creator',
    primaryGame: 'Fortnite'
  },
  // Add more streamers as needed
];

export default function LiveStreamPage() {
  const [streams, setStreams] = useState<TwitchStream[]>([]);
  const [users, setUsers] = useState<TwitchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  // Fetch Twitch streams (Note: This would require a backend API in production)
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real implementation, you would call your backend API
        // which would handle Twitch API authentication and requests
        // For now, we'll simulate the API response
        
        // Simulated API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        const mockStreams: TwitchStream[] = [];
        const mockUsers: TwitchUser[] = VOID_STREAMERS.map((streamer, index) => ({
          id: `${index + 1}`,
          login: streamer.username,
          display_name: streamer.displayName,
          type: '',
          broadcaster_type: 'partner',
          description: streamer.description,
          profile_image_url: '/logo.png',
          offline_image_url: '/logo.png',
          view_count: Math.floor(Math.random() * 10000),
          created_at: '2020-01-01T00:00:00Z'
        }));

        setStreams(mockStreams);
        setUsers(mockUsers);
      } catch (err) {
        console.error('Error fetching streams:', err);
        setError('Failed to load stream data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchStreams, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatViewerCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getTimeSince = (dateString: string): string => {
    const now = new Date();
    const streamStart = new Date(dateString);
    const diffMs = now.getTime() - streamStart.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-[#0F0F0F] page-wrapper">
        <div className="void-container py-12">
          <h1 className="text-4xl font-bold mb-12 gradient-text text-center animate-slide-in-up">
            Live Streams
          </h1>
          <div className="flex items-center justify-center py-20">
            <div className="loading-spin w-12 h-12 border-4 border-[#FFFFFF]/20 border-t-[#FFFFFF] rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen bg-[#0F0F0F] page-wrapper">
        <div className="void-container py-12">
          <h1 className="text-4xl font-bold mb-12 gradient-text text-center animate-slide-in-up">
            Live Streams
          </h1>
          <div className="void-card text-center animate-scale-in">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Streams</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="void-button hover-lift"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F] page-wrapper gpu-accelerated">
      <div className="void-container py-12">
        {/* Header */}
        <div className="text-center mb-12 scroll-reveal">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text animate-bounce-in">
            Live Streams
          </h1>
          <p className="text-gray-300 text-lg animate-slide-in-up stagger-1">
            Watch our players compete live on Twitch
          </p>
        </div>

        {/* Live Streams Section */}
        {streams.length > 0 ? (
          <div className="mb-16 scroll-reveal">
            <h2 className="text-3xl font-bold mb-8 text-center gradient-text stagger-child">
              🔴 Currently Live
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {streams.map((stream, index) => (
                <div 
                  key={stream.id} 
                  className={`void-card group cursor-pointer hover-lift stagger-child gpu-accelerated`}
                  style={{animationDelay: `${index * 0.1}s`}}
                  onClick={() => setSelectedStream(stream.user_login)}
                >
                  <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={stream.thumbnail_url.replace('{width}', '640').replace('{height}', '360')}
                      alt={stream.title}
                      fill
                      className="object-cover transform group-hover:scale-110 transition-transform duration-500 gpu-accelerated"
                    />
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold animate-pulse">
                      LIVE
                    </div>
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {formatViewerCount(stream.viewer_count)} viewers
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {getTimeSince(stream.started_at)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#a6a6a6] transition-colors duration-300 line-clamp-2">
                      {stream.title}
                    </h3>
                    <p className="text-[#FFFFFF] font-semibold">{stream.user_name}</p>
                    <p className="text-gray-400">{stream.game_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-16 scroll-reveal">
            <div className="void-card text-center animate-scale-in">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">No Live Streams</h2>
              <p className="text-gray-400 mb-6">
                None of our streamers are currently live. Check back later or follow them on Twitch!
              </p>
            </div>
          </div>
        )}

        {/* All Streamers Section */}
        <div className="scroll-reveal">
          <h2 className="text-3xl font-bold mb-8 text-center gradient-text stagger-child">
            Our Streamers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {users.map((user, index) => {
              const streamerInfo = VOID_STREAMERS.find(s => s.username === user.login);
              const isLive = streams.some(s => s.user_login === user.login);
              
              return (
                <div 
                  key={user.id} 
                  className={`void-card group hover-lift stagger-child gpu-accelerated ${isLive ? 'ring-2 ring-red-500' : ''}`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <Image
                        src={user.profile_image_url}
                        alt={user.display_name}
                        width={64}
                        height={64}
                        className="rounded-full transform group-hover:scale-110 transition-transform duration-300 gpu-accelerated"
                      />
                      {isLive && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-[#a6a6a6] transition-colors duration-300">
                        {user.display_name}
                      </h3>
                      <p className="text-gray-400">{streamerInfo?.primaryGame}</p>
                      {isLive && (
                        <span className="inline-block bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                          LIVE NOW
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 mb-4 text-sm">
                    {user.description}
                  </p>
                  
                  <div className="flex space-x-2">
                    <a
                      href={`https://twitch.tv/${user.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 void-button text-center hover-lift"
                    >
                      Visit Channel
                    </a>
                    {isLive && (
                      <button
                        onClick={() => setSelectedStream(user.login)}
                        className="flex-1 void-button bg-red-600 hover:bg-red-700 text-white hover-lift"
                      >
                        Watch Live
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Embedded Stream Modal */}
        {selectedStream && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedStream(null)}
          >
            <div 
              className="bg-[#0F0F0F] rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-auto animate-scale-in gpu-accelerated"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">
                  {users.find(u => u.login === selectedStream)?.display_name}'s Stream
                </h3>
                <button
                  onClick={() => setSelectedStream(null)}
                  className="text-gray-400 hover:text-white transition-colors duration-300 hover:scale-110 gpu-accelerated"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://player.twitch.tv/?channel=${selectedStream}&parent=${window.location.hostname}&autoplay=true`}
                  className="absolute inset-0 w-full h-full rounded-lg"
                  allowFullScreen
                  title={`${selectedStream} Twitch Stream`}
                />
              </div>
              
              <div className="mt-4 text-center">
                <a
                  href={`https://twitch.tv/${selectedStream}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="void-button hover-lift"
                >
                  Open in Twitch
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}