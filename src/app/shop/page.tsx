"use client";

import { useEffect, useState } from 'react';
import ProductGrid from '@/components/ProductGrid';
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
};

export default function ShopPage() {
  const [products, setProducts] = useState<LegacyProduct[]>(fallbackProducts);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await productService.getAll();
        if (!mounted) return;
        if (items && items.length > 0) {
          // Map Firestore products to legacy format
          const mapped: LegacyProduct[] = items.map((p: FSProduct, idx: number) => ({
            id: idx,
            name: p.name,
            price: p.price,
            image: p.image,
            category: p.category,
            description: p.description,
            link: p.link
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
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text">
            SHOP VOID
          </h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Discover official VOID merchandise including apparel, accessories, and gaming gear for true esports enthusiasts.
          </p>
        </div>
        <ProductGrid products={products} itemsPerPage={12} />
      </div>
    </div>
  );
}