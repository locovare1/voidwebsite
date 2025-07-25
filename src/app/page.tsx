"use client";

import Image from "next/image";
import Link from 'next/link';
import { useEffect } from 'react';

const featuredTeams = [
    {
      name: '',
      image: '/transparent.png',
      description: ' ',
    },
    {
      name: 'Fortnite',
      image: '/news/wavedashh.png',
      description: 'Rising stars in the competitive Fortnite scene.',
    },
    {
      name: '  ',
      image: '/transparent.png',
      description: '   ',
    },
];

const latestNews = [
  {
    title: 'Void Blu and Void Drvzy Qualify to FNCS Grand Finals',
    date: '2025-07-20',
    image: '/news/wavedashh.png',
    description: 'We are excited to announce that Both of our signings, Blue and Drvzy, qualified to FNCS Major 3 Grand Finals! We really wish them the best of luck in winning and qualifying to the FNCS Global Championships in France!'
  },
  {
    title: 'Void Announces Two New Signing',
    date: '2025-07-19',
    image: '/news/wavedashh.png',
    description: 'We are thrilled to announce our new signings for our Fortnite team, Blu and Drvzy!',
  },
];

export default function Home() {
  // Fade logo on scroll
  useEffect(() => {
    const handleScroll = () => {
      const logo = document.querySelector('.fade-on-scroll');
      if (logo) {
        const fadeStart = 0;
        const fadeEnd = 350;
        const scrollY = window.scrollY;
        let opacity = 1;
        if (scrollY > fadeStart) {
          opacity = Math.max(0, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
        }
        (logo as HTMLElement).style.opacity = String(opacity * 0.2);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center bg-[#0F0F0F] relative overflow-hidden">
        {/* Logo background */}
        <Image
          src="/logos/logo.png"
          alt="Void Logo Background"
          width={1200}
          height={1200}
          className="absolute left-1/2 top-1/2 w-[900px] md:w-[1200px] -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none select-none will-change-opacity fade-on-scroll"
          style={{ zIndex: 0 }}
        />
        <div className="text-center void-container relative z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 gradient-text">
            WELCOME TO VOID
          </h1>
          <p className="text-xl md:text-2xl #000000 mb-8 max-w-3xl mx-auto">
            A professional esports organization dedicated to excellence in competitive gaming
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teams" className="void-button">
              Our Teams
            </Link>
            <Link href="/about" className="void-button bg-transparent border-2 text-white border-[#FFFFFF] hover:bg-[#FFFFF] hover:text-black">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Teams Section */}
      <section className="py-20 bg-[#0F0F0F]">
        <div className="void-container">
          <h2 className="text-3xl font-bold mb-12 text-center gradient-text">Our Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTeams.map((team) => (
              <div key={team.name} className="void-card group">
                <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={team.image}
                    alt={team.name}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                <p className="text-gray-400">{team.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 bg-[#1A1A1A]">
        <div className="void-container">
          <h2 className="text-3xl font-bold mb-12 text-center gradient-text">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.map((news) => (
              <div key={news.title} className="void-card group cursor-pointer">
                <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="text-sm text-gray-400 mb-2">{news.date}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#a6a6a6] transition-colors">
                  {news.title}
                </h3>
                <p className="text-gray-400">{news.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/news" className="void-button">
              View All News
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
