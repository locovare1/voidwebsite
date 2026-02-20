"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/lib/productService";

interface ProductCardProps {
  item: Product;
  index: number;
}

export default function ProductCard({ item, index }: ProductCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <a 
      key={`${item.id}-${index}`} 
      href={item.link || '#'} 
      target={item.link ? "_blank" : undefined}
      rel={item.link ? "noopener noreferrer" : undefined}
      className="block w-full h-full group"
    >
      <motion.div
        className="rounded-2xl overflow-hidden shadow-2xl cursor-pointer w-full h-full flex flex-col bg-[#0F0F0F] border-2 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300"
        whileHover={{ scale: 1.03, y: -8 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Image Container with Purple Background */}
        <div className="relative flex-1 w-full overflow-hidden bg-gradient-to-br from-purple-900/20 to-purple-600/10">
          <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors duration-300 z-10" />
          <motion.div
            animate={{ opacity: isHovering ? 0 : 1, scale: isHovering ? 1.1 : 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 p-4 sm:p-6"
          >
            <Image 
              src={item.image} 
              alt={item.name} 
              fill 
              className="object-contain" 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </motion.div>
          {item.hoverImage && (
            <motion.div
              animate={{ opacity: isHovering ? 1 : 0, scale: isHovering ? 1 : 1.1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 p-4 sm:p-6"
            >
              <Image 
                src={item.hoverImage} 
                alt={`${item.name} - Hover`} 
                fill 
                className="object-contain" 
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </motion.div>
          )}
        </div>
        
        {/* Product Info Section */}
        <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] p-4 sm:p-5 border-t border-purple-500/20">
          <h3 className="text-white text-center font-bold text-sm sm:text-base mb-3 line-clamp-2 min-h-[2.5rem] flex items-center justify-center group-hover:text-purple-300 transition-colors duration-300">
            {item.name}
          </h3>
          {item.price && (
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-r from-purple-600/20 to-purple-500/20 border border-purple-500/40 rounded-lg px-4 py-2 backdrop-blur-sm">
                <span className="text-purple-300 text-base sm:text-lg font-bold">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </a>
  );
}
