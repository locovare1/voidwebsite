'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Pagination from './Pagination';
import { useCart } from '@/contexts/CartContext';
import ReviewButton from './ReviewButton';
import { Product } from '@/data/products';
import { AnimatedCard } from '@/components/FramerAnimations';

// Extend the Product interface to include optional Firestore ID
interface ExtendedProduct extends Product {
  firestoreId?: string;
}

interface ProductGridProps {
	products: ExtendedProduct[];
	itemsPerPage?: number;
}

export default function ProductGrid({ products, itemsPerPage = 12 }: ProductGridProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedCategory, setSelectedCategory] = useState<string>('All');
	const [sortBy, setSortBy] = useState<string>('name');
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
		
		addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.image,
			category: product.category,
			description: product.description,
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
					<AnimatedCard key={product.id} className="void-card shine-hover overflow-hidden group">
						<div className="relative h-48 sm:h-56 lg:h-64 w-full overflow-hidden">
							<Image
								src={product.image && product.image.trim() ? product.image : '/logo.png'}
								alt={product.name}
								fill
								className="object-contain transition-transform duration-500 group-hover:scale-105 p-3 sm:p-4"
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
							/>
							<div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/80 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg">
								{product.price === 0 ? 'FREE' : `${product.price.toFixed(2)}`}
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

							<button
								className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black text-center py-3 px-4 rounded-lg transition-all duration-300 mt-4 font-medium hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed glow-on-hover min-h-[44px] text-sm sm:text-base"
								onClick={() => handleAddToCart(product)}
								disabled={addingToCart === product.id}
							>
								{addingToCart === product.id ? (
									<div className="flex items-center justify-center gap-2">
										<div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
										Adding...
									</div>
								) : product.price === 0 ? (
									'Add to Cart - FREE'
								) : (
									`Add to Cart - ${product.price.toFixed(2)}`
								)}
							</button>

							<ReviewButton productId={product.id} productName={product.name} />
						</div>
					</AnimatedCard>
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
