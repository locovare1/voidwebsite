"use client";

import NewsGrid from '@/components/NewsGrid';
import { useEffect, useState } from 'react';

const newsArticles = [
  {
    title: 'Void Announces New Giveaway',
    date: '2025-08-5',
    image: '/news/wavedashh.png',
    description: 'We are thrilled to announce our Fortnite Battle Pass giveaway. For more information scroll down to the bottom of this page and join our discord.',
    category: 'Fortnite',
  },
  {
    title: 'Void Earns in FNCS Grand Finals',
    date: '2025-08-3',
    image: '/news/FNCS.png',
    description: 'We are proud to say that Void Blu went crazy in FNCS Grands and earned over 2500 dollars split across his trio. We want to wish Blu good luck in the next FNCS and we are very proud of him.',
    category: 'Fortnite',
  },
  {
    title: 'Void Blu and Void Drvzy Qualify to FNCS Grand Finals',
    date: '2025-07-20',
    image: '/news/FNCS.png',
    description: 'We are excited to announce that Both of our signings, Blue and Drvzy, qualified to FNCS Major 3 Grand Finals! We really wish them the best of luck in winning and qualifying to the FNCS Global Championships in France!',
    category: 'Fortnite',
  },
  {
    title: 'Void Announces Two New Signing',
    date: '2025-07-19',
    image: '/news/wavedashh.png',
    description: 'We are thrilled to announce our new signings for our Fortnite team, Blu and Drvzy!',
    category: 'Fortnite',
  },
  {
    title: 'Void Announces Upcoming Valorant Team',
    date: '2025-06-01',
    image: '/teams/valorant.png',
    description: 'We are thrilled to announce our new Valorant team, featuring some of the most talented players in the region. Get ready for an exciting season ahead!',
    category: 'Valorant',
  },
  {
    title: 'Void Updates Assets',
    date: '2025-06-01',
    image: '/logo.png',
    description: 'Void Esports has updated its branding assets, including a new logo and team colors. Check out our updated look!',
    category: 'Organization',
  },
  {
    title: 'Void Website Released',
    date: '2025-06-01',
    image: '/logo.png',
    description: 'We are excited to announce the launch of our new website, designed to provide a better experience for our fans and community.',
    category: 'Organization',
  },
];

export default function NewsPage() {
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
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white text-center stagger-child stagger-1">Latest News</h1>
        
        {/* Sponsored Banner (minimal) */}
        <div className="mb-8 scroll-reveal">
          <a href="/shop" className="block">
            <div className="void-card flex items-center gap-4 justify-center hover-lift">
              <div className="text-xs uppercase tracking-widest text-gray-400">Sponsored</div>
              <div className="text-sm text-white">Support Void — grab the latest merch →</div>
            </div>
          </a>
        </div>

        <div className="scroll-reveal">
          <NewsGrid articles={newsArticles} itemsPerPage={6} />
        </div>
      </div>
    </div>
  );
}
