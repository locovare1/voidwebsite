"use client";

import Image from "next/image";
import Link from 'next/link';
import { useEffect } from 'react';
import ParallaxElement from '@/components/ParallaxElement';
import { useIntersectionObserver } from '@/components/useIntersectionObserver';
import { 
  AnimatedHeroSection, 
  AnimatedCard, 
  StaggeredList, 
  StaggeredItem, 
  ParallaxText, 
  FloatingElement, 
  ScrollProgress,
  GestureImage 
} from '@/components/FramerAnimations';

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
    title: 'Void Announces 1v1 Map Challenge Giveaway',
    date: '2025-08-18',
    image: '/news/wavedashh.png',
    description: 'Along with our new map we are doing another giveaway! Spend at least 30 minutes in our 1v1 map, then post on twitter with proof of you doing so! Then use #void1v1challenge and tag us! For every 30 minutes you get another entry into the giveaway! You can get unlimited entries so get to playing today! Giveaway ends on Saturday, August 23rd.',
  },
  {
    title: 'Void Earns in FNCS Grand Finals',
    date: '2025-08-3',
    image: '/news/FNCS.png',
    description: 'We are proud to say that Void Blu went crazy in FNCS Grands and earned over 2500 dollars split across his trio. We want to wish Blu good luck in the next FNCS and we are very proud of him.',
  },
  {
    title: 'Void Blu, Void Drvzy, and Void Fx1ine Qualify to FNCS Grand Finals',
    date: '2025-07-20',
    image: '/news/FNCS.png',
    description: 'We are excited to announce that three of our signings, Blue, Drvzy, and Fx1ine, qualified to FNCS Major 3 Grand Finals! We really wish them the best of luck in winning and qualifying to the FNCS Global Championships in France!',
  },
];

export default function Home() {
  const { elementRef: heroRef } = useIntersectionObserver();
  const { elementRef: teamsRef } = useIntersectionObserver();
  const { elementRef: newsRef } = useIntersectionObserver();

  // Use original data without translation
  const translatedFeaturedTeams = featuredTeams;
  const translatedLatestNews = latestNews;

  // Fade logo on scroll
  useEffect(() => {
    const handleScroll = () => {
      try {
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
      } catch (error) {
        console.warn('Scroll handler error:', error);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen loading-fade-in">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Hero Section */}
      <section ref={heroRef} className="h-screen flex items-center justify-center bg-[#0F0F0F] relative overflow-hidden parallax-container">
        {/* Parallax Background Elements */}
        <ParallaxElement speed={0.3} className="absolute inset-0">
          <FloatingElement duration={4} className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl" />
          <FloatingElement duration={6} className="absolute top-40 right-20 w-32 h-32 bg-white/3 rounded-full blur-xl" />
          <FloatingElement duration={5} className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/4 rounded-full blur-xl" />
        </ParallaxElement>

        {/* Logo background with enhanced parallax */}
        <ParallaxElement speed={0.1}>
          <FloatingElement duration={8}>
            <Image
              src="/logos/logo.png"
              alt="Void Logo Background"
              width={1200}
              height={1200}
              className="absolute left-1/2 top-1/2 w-[900px] md:w-[1200px] -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none select-none will-change-opacity fade-on-scroll"
              style={{ zIndex: 0 }}
              priority
            />
          </FloatingElement>
        </ParallaxElement>

        <div className="text-center void-container relative z-10">
          <AnimatedHeroSection>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 gradient-text text-reveal">
              WELCOME TO VOID
            </h1>
            <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto">
              A professional esports organization dedicated to excellence in competitive gaming
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/teams" className="void-button pulse-glow">
                Our Teams
              </Link>
              <Link href="/about" className="void-button bg-transparent border-2 text-white border-[#FFFFFF] hover:bg-[#FFFFF] hover:text-black glow-on-hover">
                Learn More
              </Link>
            </div>
          </AnimatedHeroSection>
        </div>
      </section>

      {/* Featured Teams Section */}
      <section ref={teamsRef} className="py-20 bg-[#0F0F0F]">
        <div className="void-container">
          <ParallaxText speed={0.3}>
            <h2 className="text-3xl font-bold mb-12 text-center gradient-text">
              Our Teams
            </h2>
          </ParallaxText>
          
          <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {translatedFeaturedTeams.map((team, index) => (
              <StaggeredItem key={team.name || index}>
                <AnimatedCard delay={index * 0.2} className="void-card group">
                  <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                    <GestureImage
                      src={team.image}
                      alt={team.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#a6a6a6] transition-colors duration-300">{team.name}</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{team.description}</p>
                </AnimatedCard>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Latest News Section */}
      <section ref={newsRef} className="py-20 bg-[#1A1A1A]">
        <div className="void-container">
          <ParallaxText speed={0.3}>
            <h2 className="text-3xl font-bold mb-12 text-center gradient-text">
              Latest News
            </h2>
          </ParallaxText>
          
          <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {translatedLatestNews.map((news, index) => (
              <StaggeredItem key={news.title}>
                <AnimatedCard delay={index * 0.2} className="void-card group cursor-pointer">
                  <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                    <GestureImage
                      src={news.image}
                      alt={news.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="text-sm text-gray-400 mb-2 group-hover:text-gray-300 transition-colors duration-300">{news.date}</div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#a6a6a6] transition-colors duration-300">
                    {news.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{news.description}</p>
                </AnimatedCard>
              </StaggeredItem>
            ))}
          </StaggeredList>
          
          <div className="text-center mt-12">
            <Link href="/news" className="void-button pulse-glow">
              View All News
            </Link>
          </div>
        </div>
      </section>
      

    </div>
  );
}