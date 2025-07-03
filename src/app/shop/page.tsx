'use client';

import Image from 'next/image';

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
      <div className="void-container py-12">
        <h1 className="text-4xl font-bold mb-12 gradient-text text-center">Shop</h1>
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="void-card group">
              <div className="relative h-64 mb-4 overflow-hidden rounded-lg">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#8A2BE2] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-400">{product.category}</p>
                  </div>
                  <div className="text-xl font-bold text-[#8A2BE2]">
                    ${product.price}
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm">
                  {product.description}
                </p>
                <button className="w-full void-button" onClick={() => window.open(product.link, "_blank")}>
                Buy Now
              </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 