"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { productService } from '@/lib/productService';
import { uploadService } from '@/lib/uploadService';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    image: '',
    hoverImage: '',
    category: '',
    description: '',
    link: '',
    displayOnHomePage: false
  });
  
  // Refs for file inputs
  const imageFileRef = useRef<HTMLInputElement>(null);
  const hoverImageFileRef = useRef<HTMLInputElement>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const all = await productService.getAll();
      setProducts(all);
    } catch (e) {
      console.error('Error loading products:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetProductForm = () => {
    setProductForm({ name: '', price: 0, image: '', hoverImage: '', category: '', description: '', link: '', displayOnHomePage: false });
    setEditingProduct(null);
    // Reset file inputs
    if (imageFileRef.current) imageFileRef.current.value = '';
    if (hoverImageFileRef.current) hoverImageFileRef.current.value = '';
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const downloadURL = await uploadService.uploadProductImage(file);
      setProductForm(prev => ({ ...prev, image: downloadURL }));
    } catch (error) {
      console.error('Error uploading product image:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to upload image: ${errorMsg}\n\n💡 Tip: Use the Image URL field above instead! Upload to Imgur (imgur.com) and paste the direct image URL.`);
    }
  };

  const handleHoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const downloadURL = await uploadService.uploadProductImage(file);
      setProductForm(prev => ({ ...prev, hoverImage: downloadURL || '' }));
    } catch (error) {
      console.error('Error uploading hover image:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to upload hover image: ${errorMsg}\n\n💡 Tip: Use the Hover Image URL field above instead! Upload to Imgur (imgur.com) and paste the direct image URL.`);
    }
  };

  const submitProduct = async () => {
    try {
      if (editingProduct?.id) {
        await productService.update(editingProduct.id, { ...productForm });
      } else {
        await productService.create({ ...productForm });
      }
      await loadProducts();
      resetProductForm();
    } catch (e) {
      console.error('Error saving product:', e);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.remove(id);
      await loadProducts();
    } catch (e) {
      console.error('Error deleting product:', e);
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const filteredProducts = searchTerm 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const productRequiredMissing = !productForm.name || !productForm.category || productForm.price < 0;
  
  // Count how many products are set to display on home page
  const homePageDisplayCount = products.filter(p => p.displayOnHomePage).length;
  const maxHomePageItems = 5;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Products Management</h1>
          <p className="text-gray-400 mt-1">Manage shop products and inventory</p>
        </div>
        <button 
          onClick={resetProductForm}
          className="bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name, category or description..."
            className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products List */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">Products</h2>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFFFFF] mx-auto mb-2"></div>
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No products found</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {filteredProducts.map((product) => {
                  const isChecked = product.displayOnHomePage || false;
                  const isDisabled = !isChecked && homePageDisplayCount >= maxHomePageItems;
                  
                  return (
                    <div key={product.id ?? product.name} className="p-4 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition-all duration-300">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white font-semibold truncate">{product.name}</h3>
                            <label className="relative flex items-center group cursor-pointer">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isDisabled}
                                  onChange={async (e) => {
                                    if (!product.id) return;
                                    const newValue = e.target.checked;
                                    if (newValue && homePageDisplayCount >= maxHomePageItems) return;
                                    try {
                                      await productService.update(product.id, { displayOnHomePage: newValue });
                                      await loadProducts();
                                    } catch (error) {
                                      console.error('Error updating product:', error);
                                    }
                                  }}
                                  className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${
                                  isDisabled 
                                    ? 'border-gray-600 bg-gray-700 cursor-not-allowed opacity-50' 
                                    : isChecked
                                    ? 'border-purple-500 bg-purple-500 cursor-pointer'
                                    : 'border-gray-400 bg-transparent cursor-pointer hover:border-purple-400'
                                }`}>
                                  {isChecked && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                {isDisabled && (
                                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-gray-700 shadow-lg">
                                    5 items is already checked
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                )}
                              </div>
                              <span className={`ml-2 text-xs ${isDisabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300'}`}>
                                Display on home page?
                              </span>
                            </label>
                          </div>
                          <p className="text-gray-400 text-sm truncate">{product.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-green-400 font-bold">${product.price.toFixed(2)}</span>
                            <span className="text-xs text-gray-500">{product.category}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setProductForm({
                                name: product.name,
                                price: product.price,
                                image: product.image,
                                hoverImage: product.hoverImage || '',
                                category: product.category,
                                description: product.description,
                                link: product.link,
                                displayOnHomePage: product.displayOnHomePage || false
                              });
                            }}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-400/10 transition-all duration-300"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          {product.id && (
                            <button
                              onClick={() => setShowDeleteConfirm(product.id!)}
                              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-all duration-300"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Product Form */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white">
              {editingProduct ? 'Edit Product' : 'Create Product'}
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input 
                value={productForm.name} 
                onChange={e=>setProductForm(p=>({...p,name:e.target.value}))} 
                placeholder="Product name" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
              />
              <input 
                type="number" 
                step="0.01" 
                value={productForm.price === 0 ? '' : productForm.price} 
                onChange={e=>setProductForm(p=>({...p,price:parseFloat(e.target.value)||0}))} 
                placeholder="Price" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
              />
              <input 
                value={productForm.category} 
                onChange={e=>setProductForm(p=>({...p,category:e.target.value}))} 
                placeholder="Category" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] md:col-span-2" 
              />
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Product Image URL</label>
                <input 
                  value={productForm.image} 
                  onChange={e=>setProductForm(p=>({...p,image:e.target.value}))} 
                  placeholder="Image URL" 
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]" 
                />
              </div>
              
              {/* File Upload for Product Image */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Or Upload Product Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={imageFileRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    id="product-image-upload"
                  />
                  <label 
                    htmlFor="product-image-upload"
                    className="flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-3 py-2 rounded cursor-pointer transition-colors"
                  >
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Choose File</span>
                  </label>
                  <span className="text-gray-400 text-sm">
                    {imageFileRef.current?.files?.[0]?.name || 'No file chosen'}
                  </span>
                </div>
              </div>
              
              {productForm.image && (
                <div className="md:col-span-2">
                  <div className="bg-gray-700 w-full h-32 rounded-lg flex items-center justify-center">
                    <Image 
                      src={productForm.image} 
                      alt="Product preview" 
                      width={200}
                      height={128}
                      className="max-h-32 max-w-full object-contain rounded" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextSibling?.addEventListener('click', () => {
                          target.style.display = 'block';
                        });
                      }}
                    />
                    <span className="text-gray-400 text-sm">Image preview</span>
                  </div>
                </div>
              )}
              
              {/* Hover Image Section */}
              <div className="md:col-span-2">
                <label htmlFor="hoverImageUrl" className="block text-sm text-gray-400 mb-1">Hover Image URL (Optional)</label>
                <input 
                  id="hoverImageUrl"
                  type="text"
                  value={productForm.hoverImage ?? ''} 
                  onChange={e=>setProductForm(p=>({...p,hoverImage:e.target.value || ''}))} 
                  placeholder="Hover Image URL" 
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-[#FFFFFF]" 
                />
              </div>
              
              {/* File Upload for Hover Image */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Or Upload Hover Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={hoverImageFileRef}
                    onChange={handleHoverImageUpload}
                    accept="image/*"
                    className="hidden"
                    id="hover-image-upload"
                  />
                  <label 
                    htmlFor="hover-image-upload"
                    className="flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white px-3 py-2 rounded cursor-pointer transition-colors"
                  >
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Choose Hover Image</span>
                  </label>
                  <span className="text-gray-400 text-sm">
                    {hoverImageFileRef.current?.files?.[0]?.name || 'No file chosen'}
                  </span>
                </div>
              </div>
              
              {productForm.hoverImage && (
                <div className="md:col-span-2">
                  <div className="bg-gray-700 w-full h-32 rounded-lg flex items-center justify-center">
                    <Image 
                      src={productForm.hoverImage} 
                      alt="Hover image preview" 
                      width={200}
                      height={128}
                      className="max-h-32 max-w-full object-contain rounded" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextSibling?.addEventListener('click', () => {
                          target.style.display = 'block';
                        });
                      }}
                    />
                    <span className="text-gray-400 text-sm">Hover image preview</span>
                  </div>
                </div>
              )}
              
              <input 
                value={productForm.link} 
                onChange={e=>setProductForm(p=>({...p,link:e.target.value}))} 
                placeholder="Purchase link" 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] md:col-span-2" 
              />
              <textarea 
                value={productForm.description} 
                onChange={e=>setProductForm(p=>({...p,description:e.target.value}))} 
                placeholder="Description" 
                rows={3} 
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] md:col-span-2" 
              />
              <div className="md:col-span-2 flex items-center gap-2">
                <label className="relative flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    id="displayOnHomePage"
                    checked={productForm.displayOnHomePage}
                    disabled={!productForm.displayOnHomePage && homePageDisplayCount >= maxHomePageItems}
                    onChange={(e) => {
                      if (e.target.checked && homePageDisplayCount >= maxHomePageItems) return;
                      setProductForm(p => ({ ...p, displayOnHomePage: e.target.checked }));
                    }}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${
                    !productForm.displayOnHomePage && homePageDisplayCount >= maxHomePageItems
                      ? 'border-gray-600 bg-gray-700 cursor-not-allowed opacity-50'
                      : productForm.displayOnHomePage
                      ? 'border-purple-500 bg-purple-500 cursor-pointer'
                      : 'border-gray-400 bg-transparent cursor-pointer hover:border-purple-400'
                  }`}>
                    {productForm.displayOnHomePage && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {!productForm.displayOnHomePage && homePageDisplayCount >= maxHomePageItems && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-gray-700 shadow-lg">
                      5 items is already checked
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </label>
                <label 
                  htmlFor="displayOnHomePage" 
                  className={`text-sm ${
                    !productForm.displayOnHomePage && homePageDisplayCount >= maxHomePageItems
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-300 cursor-pointer'
                  }`}
                >
                  Display on home page?
                </label>
                {!productForm.displayOnHomePage && homePageDisplayCount >= maxHomePageItems && (
                  <span className="text-xs text-gray-500">(5 items already selected)</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button 
                onClick={submitProduct} 
                disabled={productRequiredMissing} 
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex-1"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
              <button 
                onClick={resetProductForm} 
                className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <TrashIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Product</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={()=>setShowDeleteConfirm(null)} 
                  className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={()=>{ if (showDeleteConfirm) deleteProduct(showDeleteConfirm); }} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}