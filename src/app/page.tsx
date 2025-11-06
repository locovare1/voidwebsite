"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollProgress } from "@/components/FramerAnimations";
import { newsService, type NewsArticle } from "@/lib/newsService";
import { youtubeService, type YouTubeVideo } from "@/lib/youtubeService";
import { PlayIcon } from "@heroicons/react/24/solid";

type DisplayArticle = {
  title: string;
  date: string;
  image: string;
  description: string;
};

const storeItems = [
  { id: 1, name: "VOID Esports Premium Jersey", image: "/store/jersey.png", link: "/reviews/325553639?name=VOID%20Esports%20Premium%20Jersey" },
  { id: 2, name: "Void Cobra Hoodie", image: "/store/CobraHoodie.png", link: "/reviews/1457167982?name=Void%20Cobra%20Hoodie" },
  { id: 3, name: "Void Hoodie", image: "/store/hoodie.png", link: "/reviews/1407363371?name=Void%20Hoodie" },
  { id: 4, name: "Void Hoodie (White Logo)", image: "/store/hoodie2.png", link: "/reviews/1077771209?name=Void%20Hoodie%20(White%20Logo)" },
  { id: 5, name: "FREE Test Product", image: "/store/sticker.png", link: "/reviews/1286715026?name=FREE%20Test%20Product" },
];



export default function Home() {
  const [newsIndex, setNewsIndex] = useState(0);
  const [latestNews, setLatestNews] = useState<DisplayArticle[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);

  // Load latest news articles and YouTube videos
  useEffect(() => {
    let mounted = true;
    
    // Load news articles
    (async () => {
      try {
        const articles = await newsService.getAll();
        if (!mounted) return;
        
        if (articles && articles.length > 0) {
          // Get latest 5 articles and convert to display format
          const latest5 = articles.slice(0, 5).map((article: NewsArticle) => ({
            title: article.title,
            date: (article.date as any)?.toDate ? (article.date as any).toDate().toISOString().slice(0, 10) : '',
            image: article.image,
            description: article.description,
          }));
          setLatestNews(latest5);
        } else {
          // Fallback to default news if no articles in Firebase
          setLatestNews([
            {
              title: "VOID'S BIGGEST ANNOUNCEMENT",
              date: "2025-11-4",
              image: "/news/VOID-2-FINAL.png",
              description: "Void is excited to announce the signing of VerT, Takii, and Sails to our competitive roster. Each brings high-level experience, strong chemistry, and a winning mindset as we head into upcoming events and FNCS."
            },
            {
              title: "Void Announces 1v1 Map Challenge Giveaway",
              date: "2025-08-18",
              image: "/news/1v1_map_void.png",
              description: "Along with our new map we are doing another giveaway! Spend at least 30 minutes in our 1v1 map, then post on twitter with proof of you doing so! Then use #void1v1challenge and tag us! For every 30 minutes you get another entry into the giveaway! You can get unlimited entries so get to playing today! Giveaway ends on Saturday, August 23rd.",
            },
            {
              title: "Void Earns in FNCS Grand Finals",
              date: "2025-08-03",
              image: "/news/FNCS.png",
              description: "We are proud to say that Void Blu went crazy in FNCS Grands and earned over 2500 dollars split across his trio. We want to wish Blu good luck in the next FNCS and we are very proud of him.",
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading news:', error);
        // Fallback to default news on error
        setLatestNews([
          {
            title: "VOID'S BIGGEST ANNOUNCEMENT",
            date: "2025-11-4",
            image: "/news/VOID-2-FINAL.png",
            description: "Void is excited to announce the signing of VerT, Takii, and Sails to our competitive roster. Each brings high-level experience, strong chemistry, and a winning mindset as we head into upcoming events and FNCS."
          },
          {
            title: "Void Announces 1v1 Map Challenge Giveaway",
            date: "2025-08-18",
            image: "/news/1v1_map_void.png",
            description: "Along with our new map we are doing another giveaway! Spend at least 30 minutes in our 1v1 map, then post on twitter with proof of you doing so! Then use #void1v1challenge and tag us! For every 30 minutes you get another entry into the giveaway! You can get unlimited entries so get to playing today! Giveaway ends on Saturday, August 23rd.",
          },
          {
            title: "Void Earns in FNCS Grand Finals",
            date: "2025-08-03",
            image: "/news/FNCS.png",
            description: "We are proud to say that Void Blu went crazy in FNCS Grands and earned over 2500 dollars split across his trio. We want to wish Blu good luck in the next FNCS and we are very proud of him.",
          },
        ]);
      }
    })();

    // Load YouTube videos
    (async () => {
      try {
        const videos = await youtubeService.getLatestVideos(6);
        if (!mounted) return;
        setYoutubeVideos(videos);
      } catch (error) {
        console.error('Error loading YouTube videos:', error);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Hero news carousel every 12s
  useEffect(() => {
    if (latestNews.length === 0) return;
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % latestNews.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [latestNews]);

  // Duplicate store items for seamless infinite loop
  const duplicatedStoreItems = [...storeItems, ...storeItems, ...storeItems];
  
  // Duplicate YouTube videos for seamless infinite loop
  const duplicatedYouTubeVideos = [...youtubeVideos, ...youtubeVideos, ...youtubeVideos];

  return (
    <div className="min-h-screen relative">
      <ScrollProgress />

      {/* Hero News Carousel */}
      <section className="relative h-screen w-full overflow-hidden">
        {latestNews.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={newsIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full flex"
            >
              <Image src={latestNews[newsIndex].image} alt={latestNews[newsIndex].title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent sm:from-black/70 sm:via-black/40"></div>
              <div className="absolute inset-0 flex items-center px-6 sm:px-8 md:px-16 lg:px-24">
                <div className="max-w-xl text-left">
                  <p className="text-xs sm:text-sm text-gray-300 mb-2">{latestNews[newsIndex].date}</p>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">{latestNews[newsIndex].title}</h1>
                  <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-4 sm:mb-6 line-clamp-3 sm:line-clamp-none">{latestNews[newsIndex].description}</p>
                  <Link href="/news" className="void-button pulse-glow text-sm sm:text-base inline-block">Read More</Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* Store Carousel - Continuous Loop */}
      <section className="py-8 sm:py-12 lg:py-20 bg-[#1A1A1A] overflow-hidden">
        <div className="void-container">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 lg:mb-12 text-center text-purple-gradient px-4">Shop Now</h2>
          <div className="relative carousel-container">
            <motion.div
              className="flex gap-3 sm:gap-4 lg:gap-6 pl-4 sm:pl-6"
              animate={{
                x: [0, -((storeItems.length * 170))],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
            >
              {duplicatedStoreItems.map((item, index) => (
                <Link key={`${item.id}-${index}`} href={item.link}>
                  <motion.div
                    className="min-w-[140px] sm:min-w-[170px] lg:min-w-[200px] rounded-lg overflow-hidden shadow-lg cursor-pointer flex-shrink-0 void-card"
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative h-[140px] w-[140px] sm:h-[170px] sm:w-[170px] lg:h-[200px] lg:w-[200px]">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3 text-white text-center font-semibold text-xs sm:text-sm leading-tight">
                      <span className="line-clamp-2">{item.name}</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* YouTube Videos Carousel */}
      <section className="py-8 sm:py-12 lg:py-20 bg-[#0F0F0F] overflow-hidden">
        <div className="void-container">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 lg:mb-12 text-center text-purple-gradient px-4">Latest Videos</h2>
          <div className="relative carousel-container">
            <motion.div
              className="flex gap-3 sm:gap-4 lg:gap-6 pl-4 sm:pl-6"
              animate={{
                x: [0, -((youtubeVideos.length * 260))],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 25,
                  ease: "linear",
                },
              }}
            >
              {duplicatedYouTubeVideos.map((video, index) => (
                <motion.div
                  key={`${video.id}-${index}`}
                  className="min-w-[220px] sm:min-w-[260px] lg:min-w-[300px] rounded-lg overflow-hidden shadow-lg cursor-pointer flex-shrink-0 void-card group"
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                >
                  <div className="relative">
                    <div className="relative h-[124px] w-[220px] sm:h-[146px] sm:w-[260px] lg:h-[169px] lg:w-[300px]">
                      <Image 
                        src={video.thumbnail} 
                        alt={video.title} 
                        fill 
                        className="object-cover" 
                      />
                      {/* Play button overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white ml-0.5" />
                        </div>
                      </div>
                      {/* Duration badge */}
                      <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-3 lg:p-4">
                      <h3 className="text-white font-semibold text-xs sm:text-sm lg:text-base mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors leading-tight">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between text-gray-400 text-xs">
                        <span className="truncate">{video.views} views</span>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          <span className="text-xs">YT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
