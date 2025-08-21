"use client";

import ProductGrid from '@/components/ProductGrid';

const products = [
  {
    id: 1,
    name: 'VOID Esports Premium Jersey',
    price: 55.00,
    image: '/store/jersey.png',
    category: 'Apparel',
    description: 'Official Void team jersey with premium quality fabric and player customization options.',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-premium-jersey',
  },
  {
    id: 2,
    name: 'Void Hoodie',
    price: 49.50,
    image: '/store/hoodie.png',
    category: 'Apparel',
    description: 'Premium cotton blend hoodie with embroidered Void logo.',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-unisex-hoodie',
  },
  {
    id: 3,
    name: 'Void Hoodie (White Logo)',
    price: 35.00,
    image: '/store/hoodie2.png',
    category: 'Apparel',
    description: 'Premium cotton blend hoodie with embroidered whiteVoid logo.',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-unisex-hoodie',
  },
  {
    id: 4,
    name: 'Void Cobra Hoodie',
    price: 40.99,
    image: '/store/CobraHoodie.png',
    category: 'Apparel',
    description: 'Premium cotton blend hoodie with embroidered Cobra branding with Void logo.',
    link: 'https://voidgamingshop.creator-spring.com/listing/void-cobra-custom-set?product=212&variation=5819',
  },
  {
    id: 5,
    name: 'VOID Esports Unisex T-Shirt',
    price: 27.50,
    image: '/store/tshirt1.png',
    category: 'Apparel',
    description: 'Structured cotton unisex classic VOID tee.',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-unisex-t-shirt-1',
  },
  {
    id: 6,
    name: 'VOID Esports Unisex T-Shirt',
    price: 27.50,
    image: '/store/tshirt2.png',
    category: 'Apparel',
    description: 'Structured cotton unisex classic VOID tee.',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-unisex-t-shirt',
  },
  {
    id: 7,
    name: 'VOID Esports T-Shirt (White Logo)',
    price: 20.90,
    image: '/store/tshirt3.png',
    category: 'Apparel',
    description: 'Structured cotton unisex classic VOID tee.',
    link: 'https://voidgamingshop.creator-spring.com/listing/white-logo-tshirts?product=2&variation=2397',
  },
  {
    id: 8,
    name: 'VOID Cobra T-Shirt (White Logo)',
    price: 24.00,
    image: '/store/CobraTSHIRT.png',
    category: 'Apparel',
    description: 'Structured cotton unisex classic VOID Cobra tee.',
    link: 'https://voidgamingshop.creator-spring.com/listing/void-cobra-custom-set?product=2&variation=2397',
  },
  {
    id: 9,
    name: 'VOID Esports Unisex Tank Top',
    price: 27.50,
    image: '/store/tanktop.png',
    category: 'Apparel',
    description: 'A classic, staple tank top. A timeless classic intended for anyone looking for great quality and softness. ',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-unisex-tank-top',
  },
  {
    id: 10,
    name: 'VOID Esports Unisex Fleece Sweatpants',
    price: 49.50,
    image: '/store/sweatpants.png',
    category: 'Apparel',
    description: 'Well made and lined with fleece. Comfortable sweatpants with sleek Void design.',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-unisex-fleece-sweatpants',
  },
  {
    id: 11,
    name: 'VOID Esports Unisex Dad Hat',
    price: 35.00,
    image: '/store/hat.png',
    category: 'Accessories',
    description: 'Dad hats arent just for dads. This ones got a low profile with an adjustable strap and curved visor.',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-unisex-dad-hat',
  },
  {
    id: 12,
    name: 'VOID Esports Compression Arm Sleeve',
    price: 22.00,
    image: '/store/sleeve.png',
    category: 'Accessories',
    description: 'This arm sleeve will make sure you play at your best with no friction!.',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-compression-arm-sleeve',
  },
  {
    id: 13,
    name: 'VOID Esports Mousepad',
    price: 25.00,
    image: '/store/mousepad.png',
    category: 'Perhipherals',
    description: 'This mousepad will make sure you play at your best with no friction!.',
    link: 'https://voidgamingshop.creator-spring.com/listing/black-mouse-pad-mat?product=1959&variation=105517',
  },
  {
    id: 14,
    name: 'VOID Esports Premium Flag',
    price: 45.00,
    image: '/store/flag.png',
    category: 'Accessories',
    description: 'Brighten up your space by adding this unique flag to your wall.',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-premium-flag',
  },
  {
    id: 15,
    name: 'VOID Esports Bubble Free Stickers',
    price: 4.00,
    image: '/store/sticker.png',
    category: 'Accessories',
    description: 'Brand all your items with the VOID Esports Sticker!',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-bubble-free-stickers',
  },
  {
    id: 16,
    name: 'VOID Esports Die Cut Stickers',
    price: 6.00,
    image: '/store/sticker2.png',
    category: 'Accessories',
    description: 'Brand all your items with the VOID Esports Sticker!',
    link: 'https://voidgamingshop.creator-spring.com/listing/void-die-sticker?product=794&variation=103544',
  },
];

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
        <ProductGrid products={products as any} itemsPerPage={12} />
      </div>
    </div>
  );
}