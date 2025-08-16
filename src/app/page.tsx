"use client";

import Image from "next/image";
import Link from 'next/link';
import { useEffect } from 'react';
import { AnimatedElement, ParallaxElement, CounterAnimation, useEnhancedAnimations } from '@/components/EnhancedAnimations';

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
  // Use enhanced animations hook
  useEnhancedAnimations();

  return (
    <div className="min-h-screen page-wrapper gpu-accelerated">
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center bg-[#0F0F0F] relative overflow-hidden">
        {/* Enhanced background with parallax */}
        <ParallaxElement speed={0.3} className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/logos/logo.png"
            alt="Void Logo Background"
            width={1200}
            height={1200}
            className="w-[600px] md:w-[900px] lg:w-[1200px] opacity-20 pointer-events-none select-none will-change-opacity fade-on-scroll animate-float gpu-accelerated"
            style={{ zIndex: 0 }}
            priority
          />
        </ParallaxElement>
        
        <div className="text-center void-container relative z-10">
          <AnimatedElement animation="bounceIn" delay={200}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 gradient-text gpu-accelerated">
              WELCOME TO VOID
            </h1>
          </AnimatedElement>
          
          <AnimatedElement animation="slideInUp" delay={400}>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto gpu-accelerated">
              A professional esports organization dedicated to excellence in competitive gaming
            </p>
          </AnimatedElement>
          
          <AnimatedElement animation="scaleIn" delay={600}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/teams" className="void-button animate-glow hover-lift">
                Our Teams
              </Link>
              <Link href="/about" className="void-button bg-transparent border-2 text-white border-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-black hover-lift">
                Learn More
              </Link>
            </div>
          </AnimatedElement>
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

      {/* Stats Section */}
      <section className="py-20 bg-[#1A1A1A] scroll-reveal">
        <div className="void-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <AnimatedElement animation="scaleIn" delay={100}>
              <div className="stagger-child">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  <CounterAnimation end={15} suffix="+" />
                </div>
                <p className="text-gray-400">Active Players</p>
              </div>
            </AnimatedElement>
            
            <AnimatedElement animation="scaleIn" delay={200}>
              <div className="stagger-child">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  <CounterAnimation end={5} suffix="+" />
                </div>
                <p className="text-gray-400">Gaming Titles</p>
              </div>
            </AnimatedElement>
            
            <AnimatedElement animation="scaleIn" delay={300}>
              <div className="stagger-child">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  <CounterAnimation end={2500} prefix="$" />
                </div>
                <p className="text-gray-400">Prize Money Won</p>
              </div>
            </AnimatedElement>
            
            <AnimatedElement animation="scaleIn" delay={400}>
              <div className="stagger-child">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  <CounterAnimation end={2025} />
                </div>
                <p className="text-gray-400">Established</p>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </section>

      {/* Featured Teams Section */}
      <section className="py-20 bg-[#0F0F0F] scroll-reveal">
        <div className="void-container">
          <AnimatedElement animation="slideInUp">
            <h2 className="text-3xl font-bold mb-12 text-center gradient-text">Our Teams</h2>
          </AnimatedElement>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTeams.map((team, index) => (
              <AnimatedElement key={team.name} animation="scaleIn" delay={index * 150}>
                <div className="void-card group hover-lift gpu-accelerated">
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
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 bg-[#1A1A1A] scroll-reveal">
        <div className="void-container">
          <AnimatedElement animation="slideInUp">
            <h2 className="text-3xl font-bold mb-12 text-center gradient-text">Latest News</h2>
          </AnimatedElement>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.map((news, index) => (
              <AnimatedElement key={news.title} animation="slideInUp" delay={index * 150}>
                <Link href="/news" className="block">
                  <div className="void-card group cursor-pointer hover-lift gpu-accelerated">
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
              </AnimatedElement>
            ))}
          </div>
          <AnimatedElement animation="scaleIn" delay={600}>
            <div className="text-center mt-12">
              <Link href="/news" className="void-button hover-lift">
                View All News
              </Link>
            </div>
          </AnimatedElement>
        </div>
      </section>
    </div>
  );
}
