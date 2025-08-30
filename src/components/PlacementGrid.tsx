 'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import AnimatedSection from '@/components/AnimatedSection';
import { AnimatedCard, StaggeredList, StaggeredItem } from '@/components/FramerAnimations';

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
  let paginatedPlacements = placements.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page whenever the incoming placements list changes (e.g., filter)
  useEffect(() => {
    setCurrentPage(1);
  }, [placements]);

  // Clamp current page to valid range if counts/itemsPerPage change
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(placements.length / itemsPerPage));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [placements.length, itemsPerPage, currentPage]);

  // Safety: if slice is empty but we have items (page out of range temporarily), fall back to first page slice
  if (paginatedPlacements.length === 0 && placements.length > 0) {
    paginatedPlacements = placements.slice(0, itemsPerPage);
  }

  return (
    <div className="space-y-8">
      <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedPlacements.map((placement, index) => (
          <StaggeredItem key={`${placement.game}-${placement.tournament}-${startIndex + index}`}>
            <AnimatedCard
              key={`card-${placement.game}-${placement.tournament}-${startIndex + index}`}
              delay={index * 0.05}
              className="void-card p-5 hover:-translate-y-1"
            >
              <div className="relative flex items-center gap-3 mb-3">
                <div className="w-10 h-10 relative">
                  <Image
                    src={placement.logo}
                    alt={`${placement.game} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg md:text-xl">
                    {placement.game}
                  </h3>
                  <p className="text-gray-400 text-sm">{placement.team}</p>
                </div>
                <span
                  className={`absolute right-0 top-0 m-2 text-xs md:text-sm font-bold ${
                    parseInt(placement.position.split(' ')[0].replace(/\D/g, ''), 10) <= 10
                      ? 'text-green-400'
                      : 'text-blue-400'
                  }`}
                >
                  #{placement.position.split(' ')[0].replace(/\D/g, '')}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Tournament</p>
                  <p className="text-white font-semibold leading-snug text-base md:text-lg">{placement.tournament}</p>
                </div>
                <div className="border-t border-white/5" />
                <div>
                  <p className="text-gray-400 text-sm mb-1">Position</p>
                  <p
                    className={`font-semibold underline text-base md:text-lg ${
                      parseInt(placement.position.split(' ')[0].replace(/\D/g, ''), 10) <= 10
                        ? 'text-green-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {placement.position}
                  </p>
                </div>
                <div className="border-t border-white/5" />
                <div>
                  <p className="text-gray-400 text-sm mb-1">Players</p>
                  <p className="text-white font-semibold text-base md:text-lg flex items-start gap-2">
                    <span className="text-gray-400 leading-6">•</span>
                    <span>{placement.players.join(', ')}</span>
                  </p>
                </div>
                {placement.prize && placement.prize !== "$0" && (
                  <div className="pt-2">
                    <p className="text-gray-400 text-sm mb-1">Prize Earned</p>
                    <p className="text-[#FFD700] font-semibold text-base md:text-lg">
                      {placement.prize}
                    </p>
                  </div>
                )}
                {placement.prize === "$0" && (
                  <div className="pt-2">
                    <p className="text-gray-400 text-sm mb-1">Prize Earned</p>
                    <p className="text-gray-300 font-medium text-base md:text-lg">$0</p>
                  </div>
                )}
              </div>
            </AnimatedCard>
          </StaggeredItem>
        ))}
      </StaggeredList>

      {totalPages > 1 && (
        <AnimatedSection animationType="fadeIn" delay={100}>
          <div className="flex flex-col items-center mt-10 space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="void-button h-10 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-md transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-white text-black font-bold'
                      : 'bg-transparent border border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="void-button h-10 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
