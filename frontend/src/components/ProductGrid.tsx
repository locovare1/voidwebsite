'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Pagination from './Pagination';
import { useCart } from '@/contexts/CartContext';
import ReviewButton from './ReviewButton';
import { Product } from '@/data/products';
import { AnimatedCard } from '@/components/FramerAnimations';
import { calculateSalePercentage, getDisplayPrice, detectUserCountry } from '@/lib/productService';

// Extend the Product interface to include optional Firestore ID and sale fields
interface ExtendedProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  link: string;
  firestoreId?: string;
  salePrice?: number;
  onSale?: boolean;
  countryPrices?: {
    [countryCode: string]: number;
  };
}

// Helper function to get location-specific price for ExtendedProduct
function getExtendedProductLocationPrice(product: ExtendedProduct, countryCode?: string): number {
  if (!countryCode || !product.countryPrices) {
    // Return sale price if on sale, otherwise regular price
    return product.onSale && product.salePrice ? product.salePrice : product.price;
  }
  
  // Check if there's a specific price for this country
  const countrySpecificPrice = product.countryPrices[countryCode.toUpperCase()];
  if (countrySpecificPrice) {
    return countrySpecificPrice;
  }
  
  // Fall back to sale price logic
  return product.onSale && product.salePrice ? product.salePrice : product.price;
}

interface ProductGridProps {
	products: ExtendedProduct[];
	itemsPerPage?: number;
}

export default function ProductGrid({ products, itemsPerPage = 12 }: ProductGridProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedCategory, setSelectedCategory] = useState<string>('All');
	const [sortBy, setSortBy] = useState<string>('name');
	const [userCountry, setUserCountry] = useState<string | null>(null);

	// Detect user country on component mount
	useEffect(() => {
		let mounted = true;
		const detectCountry = async () => {
			try {
				const country = await detectUserCountry();
				if (mounted) {
					setUserCountry(country);
				}
			} catch {
				if (mounted) {
					setUserCountry(null);
				}
			}
		};
		detectCountry();
		return () => { mounted = false; };
	}, []);
	const [addingToCart, setAddingToCart] = useState<number | null>(null);
	const { addItem } = useCart();

	const categories = useMemo(() => {
		const unique = Array.from(new Set(products.map(p => p.category)));
		return ['All', ...unique];
	}, [products]);

	const processedProducts = useMemo(() => {
		const filtered = selectedCategory === 'All'
			? [...products]
			: products.filter(p => p.category === selectedCategory);

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

	const totalPages = Math.ceil(processedProducts.length / itemsPerPage) || 1;
	const startIndex = (currentPage - 1) * itemsPerPage;
	const currentProducts = processedProducts.slice(startIndex, startIndex + itemsPerPage);

	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category);
		setCurrentPage(1);
	};

	const handleSortChange = (sort: string) => {
		setSortBy(sort);
		setCurrentPage(1);
	};

	const handleAddToCart = async (product: ExtendedProduct) => {
		setAddingToCart(product.id);
		
		// Add a small delay for better UX
		await new Promise(resolve => setTimeout(resolve, 500));
		
		// Use sale price if on sale, otherwise regular price
		const itemPrice = product.onSale && product.salePrice ? product.salePrice : product.price;
		
		addItem({
			id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
			productId: product.id,
			name: product.name,
			price: itemPrice,
			originalPrice: product.onSale && product.salePrice ? product.price : undefined,
			image: product.image,
			category: product.category,
			description: product.description,
			firestoreId: product.firestoreId,
			quantity: 1, // Default to 1 for shop page
		});
		
		setAddingToCart(null);
	};

	return (
		<div className="space-y-6 sm:space-y-8">
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap gap-2">
					<span className="text-sm font-medium text-gray-400 mr-2 self-center w-full sm:w-auto mb-1 sm:mb-0">Filter:</span>
					{categories.map((category) => (
						<button
							key={category}
							onClick={() => handleCategoryChange(category)}
							className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px] ${selectedCategory === category ? 'bg-[#FFFFFF] text-black shadow-lg' : 'bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A] hover:bg-[#2A2A2A] hover:text-white'}`}
						>
							{category}
						</button>
					))}
				</div>

				<div className="flex items-center gap-2 w-full sm:w-auto">
					<span className="text-sm font-medium text-gray-400 whitespace-nowrap">Sort by:</span>
					<select
						value={sortBy}
						onChange={(e) => handleSortChange(e.target.value)}
						className="bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] transition-all duration-300 hover:border-[#FFFFFF]/50 flex-1 sm:flex-initial min-h-[44px]"
						aria-label="Sort products by"
					>
						<option value="name">Name</option>
						<option value="price-low">Price: Low to High</option>
						<option value="price-high">Price: High to Low</option>
					</select>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
				{currentProducts.map((product) => (
					<Link key={product.id} href={`/products/${product.firestoreId || product.id}`} className="block">
						<AnimatedCard className="void-card shine-hover overflow-hidden group cursor-pointer">
							<div className="relative h-48 sm:h-56 lg:h-64 w-full overflow-hidden">
								<Image
									src={product.image && product.image.trim() ? product.image : '/logo.png'}
									alt={product.name}
									fill
									className="object-contain transition-transform duration-500 group-hover:scale-105 p-3 sm:p-4"
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
								/>
								<div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col items-end gap-1">
									<div className="bg-black/80 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg">
										{(() => {
											const displayPrice = getExtendedProductLocationPrice(product, userCountry || undefined);
											return displayPrice === 0 ? 'FREE' : `$${displayPrice.toFixed(2)}`;
										})()}
									</div>
									{(() => {
											const displayPrice = getExtendedProductLocationPrice(product, userCountry || undefined);
											const basePrice = product.price; // Always use base price for comparison
											const hasDiscount = displayPrice < basePrice && displayPrice > 0;
											
											if (hasDiscount) {
												const discountPercentage = Math.round(((basePrice - displayPrice) / basePrice) * 100);
												return (
													<div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
														-{discountPercentage}%
													</div>
												);
											}
											return null;
										})()}
								</div>
							</div>

							<div className="p-4 sm:p-6 space-y-3">
								<div className="flex justify-between items-start gap-2 mb-2">
									<span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#FFFFFF]/10 rounded-full text-[#FFFFFF] text-xs font-medium shadow-sm">
										{product.category}
									</span>
								</div>

								<h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#a2a2a2] transition-colors duration-300 mb-0 line-clamp-2">
									{product.name}
								</h3>
								<p className="text-gray-400 text-sm mb-0 line-clamp-2">
									{product.description}
								</p>

								<div className="text-center text-sm text-gray-400 mt-2">
									Click to view details
								</div>
							</div>
						</AnimatedCard>
					</Link>
				))}
				{currentProducts.length === 0 && (
					<div className="col-span-full text-center py-16">
						<div className="max-w-md mx-auto">
							<div className="text-gray-400 mb-4">
								<svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
									<path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM10 12a2 2 0 100-4 2 2 0 000 4z" />
								</svg>
							</div>
							<h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
							<p className="text-gray-400">No products match your current filters. Try adjusting your selection.</p>
						</div>
					</div>
				)}
			</div>

			{totalPages > 1 && (
				<div className="mt-12 flex flex-col items-center">
					<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
					<div className="text-center text-sm text-gray-400 mt-4 px-4">
						Showing {Math.min((currentPage - 1) * itemsPerPage + 1, processedProducts.length)}-
						{Math.min(currentPage * itemsPerPage, processedProducts.length)} of {processedProducts.length} results{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
					</div>
				</div>
			)}
		</div>
	);
}
