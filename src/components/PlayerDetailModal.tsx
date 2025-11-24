"use client";

import { useEffect, useRef } from 'react';
import { Player } from '@/lib/teamService';
import SafeImage from './SafeImage';

interface PlayerDetailModalProps {
    player: Player;
    isOpen: boolean;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    hasNext: boolean;
    hasPrev: boolean;
}

export default function PlayerDetailModal({
    player,
    isOpen,
    onClose,
    onNext,
    onPrev,
    hasNext,
    hasPrev
}: PlayerDetailModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                if (hasNext) onNext();
            }
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                if (hasPrev) onPrev();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, onNext, onPrev, hasNext, hasPrev]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-0 sm:p-4 overflow-hidden cursor-pointer"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full h-full sm:h-[90vh] max-w-7xl bg-[#0a0a0a] border border-white/10 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row animate-in fade-in zoom-in-95 duration-300 cursor-default"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-3 bg-black/40 hover:bg-white/10 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-all border border-white/5 hover:border-white/20 group"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Left Side: Image - Enhanced */}
                <div className="w-full lg:w-[45%] relative h-[40vh] lg:h-full bg-[#050505] overflow-hidden">
                    {/* Background blurred image for atmosphere */}
                    <div key={`bg-${player.name}`} className="absolute inset-0 opacity-30 blur-3xl scale-110 animate-in fade-in duration-1000">
                        <SafeImage
                            src={player.image || '/logo.png'}
                            alt=""
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Main Image */}
                    <div key={`img-${player.name}`} className="relative h-full w-full z-10 animate-in slide-in-from-bottom-8 fade-in duration-700">
                        <SafeImage
                            src={player.image || '/logo.png'}
                            alt={player.name}
                            fill
                            className="object-cover object-center lg:object-top"
                            sizes="(max-width: 1024px) 100vw, 45vw"
                        />
                    </div>

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/40 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#0a0a0a] z-20"></div>

                    {/* Mobile Header Overlay */}
                    <div key={`mobile-header-${player.name}`} className="absolute bottom-0 left-0 right-0 p-8 lg:hidden z-30 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100">
                        <h2 className="text-5xl font-bold text-white mb-2 tracking-tight">{player.name}</h2>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-full text-sm font-medium uppercase tracking-wider">
                                {player.role}
                            </span>
                            <span className="text-gray-400 font-medium">•</span>
                            <span className="text-gray-300 font-medium">{player.game}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Content - Enhanced */}
                <div className="w-full lg:w-[55%] flex flex-col relative bg-[#0a0a0a]">
                    {/* Desktop Header */}
                    <div key={`header-${player.name}`} className="hidden lg:block pt-12 px-12 pb-6 border-b border-white/5 animate-in slide-in-from-right-8 fade-in duration-500">
                        <h2 className="text-6xl font-bold text-white mb-4 tracking-tight">{player.name}</h2>
                        <div className="flex items-center gap-4">
                            <span className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-full text-sm font-semibold uppercase tracking-wider shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                                {player.role}
                            </span>
                            <span className="text-gray-500 text-lg">•</span>
                            <span className="text-gray-300 text-lg font-medium">{player.game}</span>
                        </div>
                    </div>

                    <div key={`content-${player.name}`} className="flex-grow overflow-y-auto custom-scrollbar p-6 sm:p-12 space-y-10">
                        {/* Description */}
                        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
                            <h3 className="text-xl font-medium text-white/40 uppercase tracking-widest mb-4">About</h3>
                            <p className="text-gray-300 text-lg leading-relaxed font-light">
                                {player.description || "No description available for this player."}
                            </p>
                        </div>

                        {/* Stats Grid - Enhanced */}
                        {player.stats && player.stats.length > 0 && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
                                <h3 className="text-xl font-medium text-white/40 uppercase tracking-widest mb-4">Statistics</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {player.stats.map((stat, idx) => (
                                        <div key={idx} className="group bg-white/[0.03] p-5 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300">
                                            <div className="text-gray-500 text-xs uppercase tracking-wider mb-2 group-hover:text-blue-400 transition-colors">{stat.label}</div>
                                            <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Achievements - Enhanced */}
                        {player.achievements && player.achievements.length > 0 && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
                                <h3 className="text-xl font-medium text-white/40 uppercase tracking-widest mb-4">Achievements</h3>
                                <div className="space-y-3">
                                    {player.achievements.map((achievement, idx) => (
                                        <div key={idx} className="flex items-center gap-4 text-gray-300 group">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:scale-150 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300"></div>
                                            <span className="text-lg group-hover:text-white transition-colors">{achievement}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Social Links - Enhanced */}
                        {player.socialLinks && Object.keys(player.socialLinks).length > 0 && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-400">
                                <h3 className="text-xl font-medium text-white/40 uppercase tracking-widest mb-4">Connect</h3>
                                <div className="flex gap-4">
                                    {player.socialLinks.twitter && (
                                        <a href={player.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-6 py-3 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-xl border border-[#1DA1F2]/20 hover:bg-[#1DA1F2]/20 hover:scale-105 transition-all duration-300">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                            <span className="font-medium">Twitter</span>
                                        </a>
                                    )}
                                    {player.socialLinks.twitch && (
                                        <a href={player.socialLinks.twitch} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-6 py-3 bg-[#9146FF]/10 text-[#9146FF] rounded-xl border border-[#9146FF]/20 hover:bg-[#9146FF]/20 hover:scale-105 transition-all duration-300">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" /></svg>
                                            <span className="font-medium">Twitch</span>
                                        </a>
                                    )}
                                    {player.socialLinks.instagram && (
                                        <a href={player.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-6 py-3 bg-[#E1306C]/10 text-[#E1306C] rounded-xl border border-[#E1306C]/20 hover:bg-[#E1306C]/20 hover:scale-105 transition-all duration-300">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons - Enhanced */}
                    <div className="p-6 sm:p-8 border-t border-white/5 flex justify-between items-center bg-[#0a0a0a]">
                        <button
                            onClick={onPrev}
                            disabled={!hasPrev}
                            className={`flex items-center gap-3 text-lg font-medium transition-all duration-300 px-4 py-2 rounded-lg ${hasPrev
                                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                                    : 'text-gray-800 cursor-not-allowed'
                                }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline">Previous</span>
                        </button>

                        <div className="text-gray-500 text-sm font-medium uppercase tracking-widest hidden sm:block">
                            Player Details
                        </div>

                        <button
                            onClick={onNext}
                            disabled={!hasNext}
                            className={`flex items-center gap-3 text-lg font-medium transition-all duration-300 px-4 py-2 rounded-lg ${hasNext
                                    ? 'text-white hover:bg-white/5'
                                    : 'text-gray-800 cursor-not-allowed'
                                }`}
                        >
                            <span className="hidden sm:inline">Next Player</span>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
