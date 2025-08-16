"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Pagination from './Pagination';

interface NewsArticle {
  title: string;
  date: string;
  image: string;
  description: string;
  category: string;
}

interface NewsGridProps {
  articles: NewsArticle[];
  itemsPerPage?: number;
  showPagination?: boolean;
}

export default function NewsGrid({ 
  articles, 
  itemsPerPage = 6, 
  showPagination = true 
}: NewsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter articles by category
  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'All') return articles;
    return articles.filter(article => article.category === selectedCategory);
  }, [articles, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(articles.map(article => article.category))];
    return cats;
  }, [articles]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // Reset to page 1 when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center scroll-reveal">
        {categories.map((category, index) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 stagger-child gpu-accelerated ${
              selectedCategory === category
                ? 'bg-[#FFFFFF] text-black shadow-lg'
                : 'bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A] hover:bg-[#2A2A2A] hover:text-white'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-reveal">
        {currentArticles.map((article, index) => (
          <article 
            key={`${article.title}-${currentPage}`}
            className={`void-card group cursor-pointer hover-lift stagger-child gpu-accelerated`} 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover transform group-hover:scale-110 transition-transform duration-500 gpu-accelerated"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <time dateTime={article.date}>{article.date}</time>
                <span className="px-2 py-1 bg-[#FFFFFF]/20 rounded-full text-[#FFFFFF] transition-all duration-300 hover:bg-[#FFFFFF]/30 hover:scale-105 gpu-accelerated">
                  {article.category}
                </span>
              </div>
              
              <h2 className="text-xl font-bold group-hover:text-[#a2a2a2] transition-colors duration-300 line-clamp-2">
                {article.title}
              </h2>
              
              <p className="text-gray-400 line-clamp-3 text-sm leading-relaxed">
                {article.description}
              </p>

              <div className="pt-2">
                <span className="text-[#FFFFFF] text-sm font-medium group-hover:underline transition-all duration-300">
                  Read more →
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {currentArticles.length === 0 && (
        <div className="text-center py-16 scroll-reveal">
          <div className="void-card max-w-md mx-auto animate-scale-in">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Articles Found</h3>
            <p className="text-gray-400">
              No articles match the selected category. Try selecting a different category.
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="scroll-reveal">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-12"
          />
        </div>
      )}

      {/* Results Info */}
      {filteredArticles.length > 0 && (
        <div className="text-center text-sm text-gray-400 scroll-reveal">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length} articles
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </div>
      )}
    </div>
  );
}