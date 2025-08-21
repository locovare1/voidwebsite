'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnimatedSection from '@/components/AnimatedSection';
import Badge from '@/components/Badge';

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
          <AnimatedSection key={`${placement.game}-${index}`} animationType="slideUp" delay={index * 100}>
          <div 
            className="bg-[#1A1A1A] rounded-lg p-6 hover:bg-[#252525] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border border-[#2A2A2A] hover:border-[#3A3A3A]"
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
              <div className="ml-auto">
                {placement.position.includes('1st') || placement.position.includes('2nd') || placement.position.includes('3rd') ? (
                  <Badge
                    color={placement.position.includes('1st') ? 'gold' : placement.position.includes('2nd') ? 'silver' : 'bronze'}
                    className="text-lg md:text-xl"
                  >
                    #{placement.position.split(' ')[0].replace(/\D/g, '')}
                  </Badge>
                ) : (
                  <Badge color="green" className="text-lg md:text-xl">
                    #{placement.position.split(' ')[0].replace(/\D/g, '')}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Tournament</p>
                <p className="text-white font-medium">{placement.tournament}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Position</p>
                <p className="text-white font-medium">
                  {placement.position.includes('1st') || placement.position.includes('2nd') || placement.position.includes('3rd') ? (
                    <span
                      className={
                        placement.position.includes('1st')
                          ? 'text-[#FFD700]'
                          : placement.position.includes('2nd')
                          ? 'text-[#C0C0C0]'
                          : 'text-[#CD7F32]'
                      }
                    >
                      {placement.position}
                    </span>
                  ) : (
                    placement.position
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Players</p>
                <p className="text-white font-medium">
                  {placement.players.join(', ')}
                </p>
              </div>
              {placement.prize && placement.prize !== "$0" && (
                <div className="pt-2">
                  <p className="text-gray-400 text-sm mb-1">Prize Earned</p>
                  <p className="text-[#FFD700] font-semibold">
                    {placement.prize}
                  </p>
                </div>
              )}
            </div>
          </div>
          </AnimatedSection>
        ))}
      </div>

      {totalPages > 1 && (
        <AnimatedSection animationType="fadeIn" delay={100}>
          <div className="flex flex-col items-center mt-8 space-y-3">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 h-10 flex items-center justify-center rounded-md bg-[#252525] text-white hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-md transition-all duration-300 ${
                    currentPage === page ? 'bg-[#FFFFFF] text-black font-bold' : 'bg-[#252525] text-white hover:bg-[#3A3A3A]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 h-10 flex items-center justify-center rounded-md bg-[#252525] text-white hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="text-center text-sm text-gray-400">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, placements.length)}-
              {Math.min(currentPage * itemsPerPage, placements.length)} of {placements.length} placements
            </div>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}
