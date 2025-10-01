'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Pagination from './Pagination';
import { useCart } from '@/contexts/CartContext';
import ReviewButton from './ReviewButton';
import { Product } from '@/data/products';

interface ProductGridProps {
	products: Product[];
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

	const handleAddToCart = async (product: Product) => {
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
		<div className="space-y-8">
			<div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
				<div className="flex flex-wrap gap-2">
					<span className="text-sm font-medium text-gray-400 mr-2 self-center">Filter:</span>
					{categories.map((category) => (
						<button
							key={category}
							onClick={() => handleCategoryChange(category)}
							className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category ? 'bg-[#FFFFFF] text-black shadow-lg' : 'bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A] hover:bg-[#2A2A2A] hover:text-white'}`}
						>
							{category}
						</button>
					))}
				</div>

				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-gray-400">Sort by:</span>
					<select
						value={sortBy}
						onChange={(e) => handleSortChange(e.target.value)}
						className="bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] transition-all duration-300 hover:border-[#FFFFFF]/50"
						aria-label="Sort products by"
					>
						<option value="name">Name</option>
						<option value="price-low">Price: Low to High</option>
						<option value="price-high">Price: High to Low</option>
					</select>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
				{currentProducts.map((product) => (
					<div
						key={product.id}
						className="bg-[#1A1A1A] rounded-xl overflow-hidden relative group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-[#2A2A2A] hover:border-[#3A3A3A]"
					>
						<div className="relative h-64 w-full overflow-hidden">
							<Image
								src={product.image && product.image.trim() ? product.image : '/logo.png'}
								alt={product.name}
								fill
								className="object-contain transition-transform duration-500 group-hover:scale-105 p-4"
							/>
							<div className="absolute top-3 right-3 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
								{product.price === 0 ? 'FREE' : `$${product.price.toFixed(2)}`}
							</div>
						</div>

						<div className="p-6 space-y-3">
							<div className="flex justify-between items-start gap-2 mb-2">
								<span className="px-3 py-1.5 bg-[#FFFFFF]/10 rounded-full text-[#FFFFFF] text-xs font-medium shadow-sm">
									{product.category}
								</span>
							</div>

							<h3 className="text-xl font-bold text-white group-hover:text-[#a2a2a2] transition-colors duration-300 mb-0">
								{product.name}
							</h3>
							<p className="text-gray-400 text-sm mb-0">
								{product.description}
							</p>

							<button
								className="w-full bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black text-center py-3 px-4 rounded-lg transition-all duration-300 mt-4 font-medium hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed glow-on-hover"
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
									`Add to Cart - $${product.price.toFixed(2)}`
								)}
							</button>

							<ReviewButton productId={product.id} productName={product.name} />
						</div>
					</div>
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
					<div className="text-center text-sm text-gray-400 mt-4">
						Showing {Math.min((currentPage - 1) * itemsPerPage + 1, processedProducts.length)}-
						{Math.min(currentPage * itemsPerPage, processedProducts.length)} of {processedProducts.length} results{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
					</div>
				</div>
			)}
		</div>
	);
}