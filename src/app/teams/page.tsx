"use client";

import TeamGrid from '@/components/TeamGrid';
import { useEffect, useState } from 'react';

const teams = [
  {
    name: 'Fortnite',
    image: '/teams/fortnite.png',
    description: 'Our elite Fortnite squad competing at the highest level.',
    roster: ['Void Blu', 'Void Drvzy', 'Void Crzy', 'Void Jayse1x'],
    achievements: ['The Best Fortnite Group in the World.'],
  },
  {
    name: 'Ownership',
    image: '/logo.png',
    description: 'Void Esports Ownership Team',
    roster: ['Gruun', 'Frankenstein', 'Dixuez', 'DrPuffin'],
    achievements: ['The Owners of Void Esports'],
  },
];

export default function TeamsPage() {
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
        <h1 className="text-4xl md:text-5xl font-bold mb-12 gradient-text text-center stagger-child stagger-1">Our Teams</h1>
        
        <div className="scroll-reveal">
          <TeamGrid teams={teams} itemsPerPage={2} />
        </div>
      </div>
    </div>
  );
} 
