"use client";

import React from 'react';
import { motion } from 'framer-motion';
import SafeImage from './SafeImage';

interface PlayerCardProps {
  name: string;
  role: string;
  image: string;
  game: string;
  achievements?: string[];
  socialLinks?: {
    twitter?: string;
    twitch?: string;
    instagram?: string;
    youtube?: string;
  };
}

export default function PlayerCard({
  name,
  role,
  image,
  game,
  achievements = [],
  socialLinks = {}
}: PlayerCardProps) {
  return (
    <motion.div
      layoutId={`player-card-${name}`}
      className="player-card group cursor-pointer transition-transform duration-300 hover:-translate-y-1 h-full flex flex-col"
    >
      <div className="relative h-44 sm:h-52 md:h-48 lg:h-56 xl:h-64 mb-3 sm:mb-4 overflow-hidden rounded-lg">
        <SafeImage
          src={image || '/hero-bg.jpg'}
          alt={name}
          fill
          className="player-card-image object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={() => {
            console.warn(`Failed to load image for ${name}: ${image}`);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Game Badge */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/20 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full text-white text-xs sm:text-sm font-semibold transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          {game}
        </div>

        {/* Role Badge */}
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white/20 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full text-white text-xs sm:text-sm font-semibold transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
          {role}
        </div>

        {/* Social Links */}
        {Object.keys(socialLinks).length > 0 && (
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex gap-2 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-200">
            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter profile"
                className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            )}
            {socialLinks.twitch && (
              <a
                href={socialLinks.twitch}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitch channel"
                className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                </svg>
              </a>
            )}
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram profile"
                className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            )}
            {socialLinks.youtube && (
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube channel"
                className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>

      <div className="text-center px-2">
        <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 truncate group-hover:text-[#a6a6a6] transition-colors duration-300">
          {name}
        </h3>
        <p className="text-xs sm:text-sm md:text-base text-gray-400 mb-2 sm:mb-3 truncate group-hover:text-gray-300 transition-colors duration-300">
          {role}
        </p>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="space-y-1">
            {achievements.slice(0, 2).map((achievement, index) => (  // Limit achievements on mobile
              <p
                key={index}
                className={`text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300 truncate ${index === 0 ? 'delay-0' : index === 1 ? 'delay-50' : index === 2 ? 'delay-100' : index === 3 ? 'delay-150' : 'delay-200'}`}
              >
                {achievement}
              </p>
            ))}
            {achievements.length > 2 && (
              <p className="text-xs text-gray-500">+{achievements.length - 2} more</p>
            )}
          </div>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </motion.div>
  );
}
