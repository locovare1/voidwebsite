"use client";

import { useState, useEffect } from 'react';
import { productService } from '@/lib/productService';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon
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
    category: '',
    description: '',
    link: ''
  });

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
    setProductForm({ name: '', price: 0, image: '', category: '', description: '', link: '' });
    setEditingProduct(null);
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

  const productRequiredMissing = !productForm.name || !productForm.category || productForm.price <= 0;

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
                {filteredProducts.map((product) => (
                  <div key={product.id ?? product.name} className="p-4 rounded-lg border border-[#3A3A3A] hover:bg-[#2A2A2A] transition-all duration-300 transform hover:-translate-y-0.5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-semibold truncate">{product.name}</h3>
                        <p className="text-gray-400 text-sm truncate">{product.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-green-400 font-bold">${product.price.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">{product.category}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setProductForm({
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              category: product.category,
                              description: product.description,
                              link: product.link
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
                ))}
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
                value={productForm.price} 
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
              {productForm.image && (
                <div className="md:col-span-2">
                  <div className="bg-gray-700 w-full h-32 rounded-lg flex items-center justify-center">
                    <img 
                      src={productForm.image} 
                      alt="Product preview" 
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