"use client";

import Image from "next/image";
import Link from 'next/link';
import { useEffect, useState } from 'react';

const featuredTeams = [
    {
      name: 'Fortnite',
      image: '/teams/fortnite.png',
      description: 'Rising stars in the competitive Fortnite scene.',
    },
    {
      name: 'Valorant',
      image: '/teams/valorant.png',
      description: 'Building a competitive Valorant roster to compete regionally.',
    },
    {
      name: 'Void Community',
      image: '/logos/logo.png',
      description: 'Join our growing community spanning multiple game titles.',
    },
];

const latestNews = [
  {
    title: 'Void Announces New Giveaway',
    date: '2025-08-5',
    image: '/news/wavedashh.png',
    description: 'We are thrilled to announce our Fortnite Battle Pass giveaway. For more information scroll down to the bottom of this page and join our discord.',
  },
  {
    title: 'Void Earns in FNCS Grand Finals',
    date: '2025-08-3',
    image: '/news/FNCS.png',
    description: 'We are proud to say that Void Blu went crazy in FNCS Grands and earned over 2500 dollars split across his trio. We want to wish Blu good luck in the next FNCS and we are very proud of him.',
  },
  {
    title: 'Void Blu and Void Drvzy Qualify to FNCS Grand Finals',
    date: '2025-07-20',
    image: '/news/FNCS.png',
    description: 'We are excited to announce that Both of our signings, Blue and Drvzy, qualified to FNCS Major 3 Grand Finals! We really wish them the best of luck in winning and qualifying to the FNCS Global Championships in France!',
  },
];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    // Initialize scroll reveal animations
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FFFFFF]/20 border-t-[#FFFFFF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#0F0F0F] text-white transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section */}
      <section className="pt-20 h-screen flex items-center justify-center bg-[#0F0F0F] relative overflow-hidden">
        {/* Centered logo background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/logos/logo.png"
            alt="Void Logo Background"
            width={1200}
            height={1200}
            className="w-[600px] md:w-[900px] lg:w-[1200px] opacity-20 pointer-events-none select-none animate-float gpu-accelerated"
            style={{ zIndex: 0 }}
            priority
          />
        </div>
        
        <div className="text-center void-container relative z-10">
          <div className="stagger-child stagger-1">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 gradient-text animate-bounce-in gpu-accelerated">
              WELCOME TO VOID
            </h1>
          </div>
          
          <div className="stagger-child stagger-2">
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-slide-in-up gpu-accelerated">
              A professional esports organization dedicated to excellence in competitive gaming
            </p>
          </div>
          
          <div className="stagger-child stagger-3">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/teams" className="void-button animate-glow hover-lift animate-scale-in">
                Our Teams
              </Link>
              <Link href="/about" className="void-button bg-transparent border-2 text-white border-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-black hover-lift animate-scale-in">
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Floating particles for enhanced visual appeal */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#FFFFFF]/20 rounded-full animate-particle gpu-accelerated"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 12}s`,
                animationDuration: `${12 + Math.random() * 8}s`
              }}
            />
          ))}
        </div>
      </section>

      {/* Featured Teams Section */}
      <section className="py-20 bg-[#0F0F0F] scroll-reveal">
        <div className="void-container">
          <h2 className="text-3xl font-bold mb-12 text-center gradient-text stagger-child">Our Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTeams.map((team, index) => (
              <div key={`${team.name}-${index}`} className={`void-card group hover-lift gpu-accelerated stagger-child stagger-${index + 1}`}>
                <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={team.image}
                    alt={team.name}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-500 gpu-accelerated"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#a2a2a2] transition-colors duration-300">{team.name}</h3>
                <p className="text-gray-400">{team.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsored Banner (minimal) */}
      <section className="py-8 bg-[#0F0F0F] scroll-reveal">
        <div className="void-container">
          <a href="/shop" className="block">
            <div className="void-card flex items-center gap-4 justify-center hover-lift">
              <div className="text-xs uppercase tracking-widest text-gray-400">Sponsored</div>
              <div className="relative h-12 w-12 rounded-md overflow-hidden">
                <Image src="/store/CobraHoodie.png" alt="Shop Void Merch" fill className="object-contain" />
              </div>
              <div className="text-sm text-white">Check out our latest merch →</div>
            </div>
          </a>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 bg-[#1A1A1A] scroll-reveal">
        <div className="void-container">
          <h2 className="text-3xl font-bold mb-12 text-center gradient-text stagger-child">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.map((news, index) => (
              <Link key={news.title} href="/news" className="block">
                <div className={`void-card group cursor-pointer hover-lift gpu-accelerated stagger-child stagger-${index + 1}`}>
                  <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={news.image}
                      alt={news.title}
                      fill
                      className="object-cover transform group-hover:scale-110 transition-transform duration-500 gpu-accelerated"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="text-sm text-gray-400 mb-2">{news.date}</div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#a2a2a2] transition-colors duration-300 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-gray-400 line-clamp-3">{news.description}</p>
                  <div className="mt-3 text-[#FFFFFF] text-sm font-medium group-hover:underline">
                    Read more →
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12 stagger-child stagger-4">
            <Link href="/news" className="void-button hover-lift">
              View All News
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}