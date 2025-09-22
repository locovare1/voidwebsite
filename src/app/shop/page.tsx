"use client";

import ProductGrid from '@/components/ProductGrid';
import { products } from '@/data/products';

export default function ShopPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text">SHOP VOID</h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Discover official VOID merchandise including apparel, accessories, and gaming gear for true esports enthusiasts.
          </p>
        </div>
          <ProductGrid products={products} itemsPerPage={12} />
      </div>
    </div>
  );
}