"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Pagination from './Pagination';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  link: string;
}

interface ProductGridProps {
  products: Product[];
  itemsPerPage?: number;
}

export default function ProductGrid({ products, itemsPerPage = 9 }: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  // Filter and sort products
  const processedProducts = useMemo(() => {
    const filtered = selectedCategory === 'All' 
      ? products 
      : products.filter(product => product.category === selectedCategory);

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, selectedCategory, sortBy]);

  // Get unique categories
  const categories = useMemo(() => {
    return ['All', ...new Set(products.map(product => product.category))];
  }, [products]);

  // Calculate pagination
  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = processedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Filters and Sort */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center scroll-reveal">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-400 mr-2 self-center">Filter:</span>
          {categories.map((category, index) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 stagger-child gpu-accelerated ${
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

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] transition-all duration-300 hover:border-[#FFFFFF]/50"
            aria-label="Sort products by"
          >
            <option value="name">Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 scroll-reveal">
        {currentProducts.map((product, index) => (
          <div 
            key={`${product.id}-${currentPage}`} 
            className={`void-card group hover-lift stagger-child gpu-accelerated`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative h-64 mb-4 overflow-hidden rounded-lg">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transform group-hover:scale-110 transition-transform duration-500 gpu-accelerated"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-bold">
                ${product.price}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <span className="px-2 py-1 bg-[#FFFFFF]/20 rounded-full text-[#FFFFFF] text-xs">
                  {product.category}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-white group-hover:text-[#a2a2a2] transition-colors duration-300 line-clamp-2">
                {product.name}
              </h3>
              
              <p className="text-gray-400 text-sm line-clamp-2">
                {product.description}
              </p>

              <button 
                className="w-full void-button hover-lift" 
                onClick={() => window.open(product.link, "_blank")}
              >
                Buy Now - ${product.price}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {currentProducts.length === 0 && (
        <div className="text-center py-16 scroll-reveal">
          <div className="void-card max-w-md mx-auto animate-scale-in">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
            <p className="text-gray-400">
              No products match your current filters. Try adjusting your selection.
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
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
      {processedProducts.length > 0 && (
        <div className="text-center text-sm text-gray-400 scroll-reveal">
          Showing {startIndex + 1}-{Math.min(endIndex, processedProducts.length)} of {processedProducts.length} products
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </div>
      )}
    </div>
  );
}