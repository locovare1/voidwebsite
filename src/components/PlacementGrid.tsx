"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Pagination from './Pagination';

interface Placement {
  game: string;
  tournament: string;
  team: string;
  position: string;
  players: string[];
  prize?: string;
  logo: string;
}

interface PlacementGridProps {
  placements: Placement[];
  itemsPerPage?: number;
}

export default function PlacementGrid({ placements, itemsPerPage = 6 }: PlacementGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGame, setSelectedGame] = useState('All');

  // Filter placements by game
  const filteredPlacements = useMemo(() => {
    if (selectedGame === 'All') return placements;
    return placements.filter(placement => placement.game === selectedGame);
  }, [placements, selectedGame]);

  // Get unique games
  const games = useMemo(() => {
    return ['All', ...new Set(placements.map(placement => placement.game))];
  }, [placements]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPlacements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlacements = filteredPlacements.slice(startIndex, endIndex);

  // Reset to page 1 when game filter changes
  const handleGameChange = (game: string) => {
    setSelectedGame(game);
    setCurrentPage(1);
  };

  const getPositionColor = (position: string) => {
    const pos = parseInt(position);
    if (pos === 1) return 'text-yellow-400';
    if (pos === 2) return 'text-gray-300';
    if (pos === 3) return 'text-amber-600';
    if (pos <= 10) return 'text-green-400';
    return 'text-blue-400';
  };

  return (
    <div className="space-y-8">
      {/* Game Filter */}
      <div className="flex flex-wrap gap-2 justify-center scroll-reveal">
        <span className="text-sm font-medium text-gray-400 mr-2 self-center">Filter by game:</span>
        {games.map((game, index) => (
          <button
            key={game}
            onClick={() => handleGameChange(game)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 stagger-child gpu-accelerated ${
              selectedGame === game
                ? 'bg-[#FFFFFF] text-black shadow-lg'
                : 'bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A] hover:bg-[#2A2A2A] hover:text-white'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {game}
          </button>
        ))}
      </div>

      {/* Placements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-reveal">
        {currentPlacements.map((placement, index) => (
          <div
            key={`${placement.tournament}-${placement.team}-${currentPage}-${index}`}
            className={`void-card hover-lift stagger-child gpu-accelerated`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center mb-4">
              <div className="relative w-12 h-12 mr-4 rounded-lg overflow-hidden">
                <Image
                  src={placement.logo}
                  alt={placement.game}
                  fill
                  className="object-contain transition-transform duration-300 hover:scale-110 gpu-accelerated"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-xl">
                  {placement.game}
                </h3>
                <p className="text-[#bdbdbd] text-sm">{placement.team}</p>
              </div>
              <div className={`text-2xl font-bold ${getPositionColor(placement.position)}`}>
                #{placement.position.replace(/\D/g, '')}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Tournament</p>
                <p className="text-white font-medium">{placement.tournament}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-1">Position</p>
                <p className={`font-bold text-lg ${getPositionColor(placement.position)}`}>
                  {placement.position}
                </p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-2">Players</p>
                <div className="space-y-1">
                  {placement.players.map((player, idx) => (
                    <div key={idx} className="flex items-center text-white font-medium text-sm">
                      <span className="w-2 h-2 bg-[#FFFFFF] rounded-full mr-2 animate-pulse" />
                      {player}
                    </div>
                  ))}
                </div>
              </div>
              
              {placement.prize && (
                <div className="pt-2 border-t border-[#2A2A2A]">
                  <p className="text-gray-400 text-sm mb-1">Prize Earned</p>
                  <p className="text-[#a2a2a2] font-bold text-lg">
                    {placement.prize}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {currentPlacements.length === 0 && (
        <div className="text-center py-16 scroll-reveal">
          <div className="void-card max-w-md mx-auto animate-scale-in">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Placements Found</h3>
            <p className="text-gray-400">
              No placements found for the selected game. Try selecting a different game.
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="scroll-reveal">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-12"
          />
        </div>
      )}

      {/* Results Info */}
      {filteredPlacements.length > 0 && (
        <div className="text-center text-sm text-gray-400 scroll-reveal">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredPlacements.length)} of {filteredPlacements.length} placements
          {selectedGame !== 'All' && ` for ${selectedGame}`}
        </div>
      )}
    </div>
  );
}