"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollProgress } from "@/components/FramerAnimations";

// Sample data
const latestNews = [
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
    description:
      "Along with our new map we are doing another giveaway! Spend at least 30 minutes in our 1v1 map, then post on twitter with proof of you doing so! Then use #void1v1challenge and tag us! For every 30 minutes you get another entry into the giveaway! You can get unlimited entries so get to playing today! Giveaway ends on Saturday, August 23rd.",
  },
  {
    title: "Void Earns in FNCS Grand Finals",
    date: "2025-08-03",
    image: "/news/FNCS.png",
    description:
      "We are proud to say that Void Blu went crazy in FNCS Grands and earned over 2500 dollars split across his trio. We want to wish Blu good luck in the next FNCS and we are very proud of him.",
  },
];

const storeItems = [
  { id: 1, name: "VOID Esports Premium Jersey", image: "/store/jersey.png", link: "/reviews/325553639?name=VOID%20Esports%20Premium%20Jersey" },
  { id: 2, name: "Void Cobra Hoodie", image: "/store/CobraHoodie.png", link: "/reviews/1457167982?name=Void%20Cobra%20Hoodie" },
  { id: 3, name: "Void Hoodie", image: "/store/hoodie.png", link: "/reviews/1407363371?name=Void%20Hoodie" },
  { id: 4, name: "Void Hoodie (White Logo)", image: "/store/hoodie2.png", link: "/reviews/1077771209?name=Void%20Hoodie%20(White%20Logo)" },
  { id: 5, name: "FREE Test Product", image: "/store/sticker.png", link: "/reviews/1286715026?name=FREE%20Test%20Product" },
];

export default function Home() {
  const [newsIndex, setNewsIndex] = useState(0);

  // Hero news carousel every 12s
  useEffect(() => {
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % latestNews.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Duplicate store items for seamless infinite loop
  const duplicatedStoreItems = [...storeItems, ...storeItems, ...storeItems];

  return (
    <div className="min-h-screen relative">
      <ScrollProgress />

      {/* Hero News Carousel */}
      <section className="relative h-screen w-full overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex items-center px-8 md:px-16 lg:px-24">
              <div className="max-w-xl text-left">
                <p className="text-sm text-gray-300 mb-2">{latestNews[newsIndex].date}</p>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{latestNews[newsIndex].title}</h1>
                <p className="text-base md:text-lg text-gray-200 mb-6">{latestNews[newsIndex].description}</p>
                <Link href="/news" className="void-button pulse-glow">Read More</Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Store Carousel - Continuous Loop */}
      <section className="py-20 bg-[#1A1A1A] overflow-hidden">
        <div className="void-container">
          <h2 className="text-3xl font-bold mb-12 text-center text-purple-gradient">Shop Now</h2>
          <div className="relative carousel-container">
            <motion.div
              className="flex gap-6"
              animate={{
                x: [0, -((storeItems.length * 220))],
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
                    className="min-w-[200px] rounded-lg overflow-hidden shadow-lg cursor-pointer flex-shrink-0 void-card"
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative h-[200px] w-[200px]">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-center font-semibold text-sm">
                      {item.name}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
