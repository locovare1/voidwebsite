"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollProgress } from "@/components/FramerAnimations";
import ProductCard from "@/components/ProductCard";
import { newsService, type NewsArticle } from "@/lib/newsService";
import { youtubeService, type YouTubeVideo } from "@/lib/youtubeService";
import { productService, type Product } from "@/lib/productService";
import { PlayIcon } from "@heroicons/react/24/solid";

type DisplayArticle = {
  title: string;
  date: string;
  image: string;
  description: string;
};




export default function Home() {
  const [newsIndex, setNewsIndex] = useState(0);
  const [latestNews, setLatestNews] = useState<DisplayArticle[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [storeItems, setStoreItems] = useState<Product[]>([]);

  // Load latest news articles, YouTube videos, and Fourthwall products
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

    // Load YouTube videos - get more to filter for long-form (4+ minutes)
    (async () => {
      try {
        const allVideos = await youtubeService.getLatestVideos(50);
        if (!mounted) return;
        // Filter for long-form videos (4+ minutes) and take first 5
        const longFormVideos = allVideos.filter(video => {
          // Parse duration (format: "H:MM:SS" or "M:SS")
          const parts = video.duration.split(':');
          let totalSeconds = 0;
          
          if (parts.length === 3) {
            // Has hours: "H:MM:SS"
            const hours = parseInt(parts[0], 10) || 0;
            const minutes = parseInt(parts[1], 10) || 0;
            const seconds = parseInt(parts[2], 10) || 0;
            totalSeconds = hours * 3600 + minutes * 60 + seconds;
          } else if (parts.length === 2) {
            // Minutes and seconds only: "M:SS"
            const minutes = parseInt(parts[0], 10) || 0;
            const seconds = parseInt(parts[1], 10) || 0;
            totalSeconds = minutes * 60 + seconds;
          } else {
            // Invalid format, skip
            return false;
          }
          
          return totalSeconds >= 240; // 4 minutes = 240 seconds
        }).slice(0, 5);
        setYoutubeVideos(longFormVideos);
      } catch (error) {
        console.error('Error loading YouTube videos:', error);
      }
    })();

    // Load products from Firestore that are marked to display on home page
    (async () => {
      try {
        const allProducts = await productService.getAll();
        if (!mounted) return;
        // Filter products that should display on home page and limit to 5
        const homePageProducts = allProducts
          .filter(p => p.displayOnHomePage)
          .slice(0, 5);
        setStoreItems(homePageProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        setStoreItems([]);
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


  return (
    <div className="min-h-screen relative">
      <ScrollProgress />

      {/* Hero News Carousel */}
      <section className="relative h-[70vh] sm:h-[80vh] lg:h-screen w-full overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/50 sm:to-transparent"></div>
              <div className="absolute inset-0 flex items-end sm:items-center px-4 pb-8 sm:px-8 md:px-16 lg:px-24">
                <div className="max-w-xl text-left w-full">
                  <p className="text-xs sm:text-sm text-gray-300 mb-2">{latestNews[newsIndex].date}</p>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">{latestNews[newsIndex].title}</h1>
                  <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-4 sm:mb-6 line-clamp-3 sm:line-clamp-none">{latestNews[newsIndex].description}</p>
                  <Link href="/news" className="void-button pulse-glow text-sm sm:text-base inline-block min-h-[44px] flex items-center justify-center px-6">Read More</Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* Store Grid - Static */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="void-container relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 lg:mb-16 px-4 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400 mb-2">
                Shop Now
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Discover exclusive VOID merchandise
              </p>
            </div>
            <a 
              href="https://shop.voidesports.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="void-button pulse-glow text-sm sm:text-base inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
            >
              Visit Store
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
          
          {storeItems.length > 0 ? (
            <div className={`grid gap-6 sm:gap-8 px-4 ${
              storeItems.length === 1 
                ? 'grid-cols-1 max-w-md mx-auto'
                : storeItems.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto'
                : storeItems.length === 3
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : storeItems.length === 4
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
            }`}>
              {storeItems.map((item, index) => (
                <motion.div 
                  key={`${item.id}-${index}`} 
                  className="h-80 sm:h-96 lg:h-[480px]"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard item={item} index={index} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-gray-400 text-sm sm:text-base">
                No items displayed at this moment. Please check back later.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* YouTube Videos Grid */}
      {youtubeVideos.length > 0 && (
        <section className="py-8 sm:py-12 lg:py-20 bg-[#0F0F0F]">
          <div className="void-container">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 lg:mb-12 text-center text-purple-gradient px-4">Latest Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4">
              {youtubeVideos.map((video, index) => (
                <motion.div
                  key={`${video.id}-${index}`}
                  className="rounded-lg overflow-hidden shadow-lg cursor-pointer void-card group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                >
                  <div className="relative">
                    <div className="relative w-full aspect-video">
                      <Image 
                        src={video.thumbnail} 
                        alt={video.title} 
                        fill 
                        className="object-cover" 
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      />
                      {/* Play button overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg min-h-[44px] min-w-[44px]">
                          <PlayIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white ml-0.5" />
                        </div>
                      </div>
                      {/* Duration badge */}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-white font-semibold text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors leading-tight min-h-[2.5rem]">
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
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
