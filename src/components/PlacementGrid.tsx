'use client';

import { useState } from 'react';
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

interface PlacementGridProps {
  placements: Placement[];
  itemsPerPage: number;
}

export default function PlacementGrid({ placements, itemsPerPage }: PlacementGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(placements.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPlacements = placements.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedPlacements.map((placement, index) => (
          <div 
            key={index}
            className="bg-[#1A1A1A] rounded-lg p-6 hover:bg-[#252525] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 relative">
                <Image
                  src={placement.logo}
                  alt={`${placement.game} logo`}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-white font-semibold text-xl">
                  {placement.game}
                </h3>
                <p className="text-[#bdbdbd]">{placement.team}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Tournament</p>
                <p className="text-white font-medium">{placement.tournament}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Position</p>
                <p className="text-white font-medium">{placement.position}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Players</p>
                <div className="grid grid-cols-1 gap-1">
                  {placement.players.map((player, idx) => (
                    <p key={idx} className="text-white font-medium">{player}</p>
                  ))}
                </div>
              </div>
              {placement.prize && placement.prize !== "$0" && (
                <div className="pt-2">
                  <p className="text-gray-400 text-sm">Prize</p>
                  <p className="text-[#FFD700] font-semibold">
                    {placement.prize}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[#252525] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-[#252525] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
