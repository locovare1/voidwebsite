"use client";

import { useEffect, useState } from 'react';
import ProductGrid from '@/components/ProductGrid';
import AdPlaceholder from '@/components/AdPlaceholder';
import { products as fallbackProducts } from '@/data/products';
import { productService, type Product as FSProduct } from '@/lib/productService';

// Map Firestore product to legacy product format
type LegacyProduct = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  link: string;
  // Store the original Firestore ID for reference
  firestoreId?: string;
};

// Simple hash function to convert string IDs to consistent numeric IDs
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Ensure positive ID and avoid 0, and make it larger to avoid conflicts with hardcoded products
  const numericId = Math.abs(hash) || Math.floor(Math.random() * 1000000) + 1000;
  return numericId;
}

export default function ShopPage() {
  const [products, setProducts] = useState<LegacyProduct[]>(fallbackProducts);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await productService.getAll();
        if (!mounted) return;
        if (items && items.length > 0) {
          // Map Firestore products to legacy format using consistent hash of document ID
          const mapped: LegacyProduct[] = items.map((p: FSProduct) => ({
            id: p.id ? stringToHash(p.id) : Math.floor(Math.random() * 1000000) + 1000,
            name: p.name,
            price: p.price,
            image: p.image,
            category: p.category,
            description: p.description,
            link: p.link,
            firestoreId: p.id // Store the original Firestore ID
          }));
          setProducts(mapped);
        } else {
          setProducts(fallbackProducts);
        }
      } catch {
        setProducts(fallbackProducts);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-[#1a0a2e] via-[#2a1a3a] to-[#1a0a2e] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="void-container py-8 sm:py-12 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text">
            SHOP VOID
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto px-4">
            Discover official VOID merchandise including apparel, accessories, and gaming gear for true esports enthusiasts.
          </p>
        </div>

        {/* Ad Spot - Banner at top of shop */}
        <div className="mb-8">
          <AdPlaceholder size="banner" />
        </div>

        <ProductGrid products={products} itemsPerPage={12} />
      </div>
    </div>
  );
}