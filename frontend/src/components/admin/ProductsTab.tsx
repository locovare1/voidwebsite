"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { AnimatedCard } from '@/components/FramerAnimations';
import { productService, type Product, type CustomField, type Size } from '@/lib/productService';

interface CustomizationForm {
  hasCustomFields: boolean;
  hasSizes: boolean;
  hasSizeChart: boolean;
  customFields: CustomField[];
  sizes: Size[];
}

interface ProductsTabProps {
  products: Product[];
  loadingProducts: boolean;
  setProducts: (products: Product[]) => void;
  selectedProductForCustomization: Product | null;
  setSelectedProductForCustomization: (product: Product | null) => void;
  customizationForm: CustomizationForm;
  setCustomizationForm: (form: CustomizationForm | ((prev: CustomizationForm) => CustomizationForm)) => void;
  showProductModal: boolean;
  setShowProductModal: (show: boolean) => void;
  productMode: 'create' | 'edit';
  setProductMode: (mode: 'create' | 'edit') => void;
  editingProductId: string | null;
  setEditingProductId: (id: string | null) => void;
  productForm: Omit<Product, 'id' | 'createdAt'>;
  setProductForm: (form: Omit<Product, 'id' | 'createdAt'>) => void;
  onLogAction: (action: any, entity: any, entityId: string, details: string, options?: any) => Promise<string>;
  currentUser: any;
  router: any;
  openCreateProduct: () => void;
  openEditProduct: (product: Product) => void;
  addImageField: () => void;
  removeImageField: (index: number) => void;
  updateImageField: (index: number, value: string) => void;
  submitProduct: () => Promise<void>;
  reloadProducts: () => Promise<void>;
}

export default function ProductsTab({
  products,
  loadingProducts,
  selectedProductForCustomization,
  customizationForm,
  setSelectedProductForCustomization,
  setCustomizationForm,
  reloadProducts,
  onLogAction
}: ProductsTabProps) {
  const router = useRouter();

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [productMode, setProductMode] = useState<'create' | 'edit'>('create');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Omit<Product, 'id' | 'createdAt'>>({
    name: '', price: 0, image: '', images: [], hoverImage: '', category: '', description: '', link: '', displayOnHomePage: false
  });

  const openCreateProduct = () => {
    setProductMode('create');
    setEditingProductId(null);
    setProductForm({ name: '', price: 0, image: '', images: [], hoverImage: '', category: '', description: '', link: '', displayOnHomePage: false });
    setShowProductModal(true);
  };

  const openEditProduct = (product: Product) => {
    setProductMode('edit');
    setEditingProductId(product.id!);
    setProductForm({
      name: product.name,
      price: product.price,
      image: product.image,
      images: product.images || [],
      hoverImage: product.hoverImage || '',
      category: product.category,
      description: product.description,
      link: product.link,
      displayOnHomePage: product.displayOnHomePage || false
    });
    setShowProductModal(true);
  };

  const addImageField = () => {
    setProductForm(prev => ({
      ...prev,
      images: [...(prev.images || []), '']
    }));
  };

  const removeImageField = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const updateImageField = (index: number, value: string) => {
    setProductForm(prev => ({
      ...prev,
      images: (prev.images || []).map((img, i) => i === index ? value : img)
    }));
  };

  const submitProduct = async () => {
    try {
      console.log('[ProductsTab] Submitting product - Form data:', productForm);
      console.log('[ProductsTab] Images being saved:', productForm.images);
      
      if (productMode === 'create') {
        const productId = await productService.create(productForm);
        console.log('[ProductsTab] Product created with ID:', productId, 'Images:', productForm.images);
        
        await onLogAction('create', 'product', productId, `Created product "${productForm.name}"`, {
          level: 'info',
          status: 'success',
          metadata: { category: productForm.category, price: productForm.price, imageCount: productForm.images?.length || 0 }
        });
      } else if (editingProductId) {
        // Get current product for change tracking
        const currentProducts = await productService.getAll();
        const currentProduct = currentProducts.find(p => p.id === editingProductId);

        console.log('[ProductsTab] Editing product - Current images from DB:', currentProduct?.images);
        console.log('[ProductsTab] Form images to save:', productForm.images);

        if (currentProduct) {
          const beforeSnapshot = {
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image,
            images: currentProduct.images,
            category: currentProduct.category,
            description: currentProduct.description,
            link: currentProduct.link,
            displayOnHomePage: currentProduct.displayOnHomePage
          };

          const afterSnapshot = {
            name: productForm.name,
            price: productForm.price,
            image: productForm.image,
            images: productForm.images,
            category: productForm.category,
            description: productForm.description,
            link: productForm.link,
            displayOnHomePage: productForm.displayOnHomePage
          };

          console.log('[ProductsTab] Calling productService.update with images:', productForm.images);
          await productService.update(editingProductId, productForm);
          console.log('[ProductsTab] Product updated successfully!');
          
          await onLogAction('update', 'product', editingProductId, `Updated product "${productForm.name}"`, {
            beforeSnapshot,
            afterSnapshot,
            level: 'info',
            status: 'success',
            metadata: { updatedFields: Object.keys(afterSnapshot), imageCount: productForm.images?.length || 0 }
          });
        } else {
          await productService.update(editingProductId, productForm);
          await onLogAction('update', 'product', editingProductId, `Updated product "${productForm.name}"`, {
            level: 'warn',
            status: 'warning',
            metadata: { note: 'Could not track changes - current product not found' }
          });
        }
      }

      await reloadProducts();
      setShowProductModal(false);
    } catch (e) {
      console.error(e);
      await onLogAction('error', 'product', editingProductId || 'unknown', `Failed to ${productMode} product`, {
        level: 'error',
        status: 'error',
        errorMessage: e instanceof Error ? e.message : 'Unknown error'
      });
    }
  };

  const handleUpdateProductCustomization = async () => {
    if (!selectedProductForCustomization) return;

    try {
      const updateData: any = {
        hasCustomFields: customizationForm.hasCustomFields,
        hasSizes: customizationForm.hasSizes,
        hasSizeChart: customizationForm.hasSizeChart,
      };

      if (customizationForm.hasCustomFields) {
        updateData.customFields = customizationForm.customFields;
      }

      if (customizationForm.hasSizes) {
        updateData.sizes = customizationForm.sizes;
      }

      await productService.update(selectedProductForCustomization.id!, updateData);
      await reloadProducts();
      setSelectedProductForCustomization(null);

      await onLogAction('update', 'product', selectedProductForCustomization.id!, `Updated customization settings for "${selectedProductForCustomization.name}"`, {
        level: 'info',
        status: 'success',
        metadata: {
          hasCustomFields: customizationForm.hasCustomFields,
          hasSizes: customizationForm.hasSizes,
          hasSizeChart: customizationForm.hasSizeChart,
          customFieldsCount: customizationForm.customFields.length,
          sizesCount: customizationForm.sizes.length
        }
      });

      alert('Product customization updated successfully!');
    } catch (error) {
      console.error('Error updating product customization:', error);
      alert('Failed to update product customization');
      await onLogAction('error', 'product', selectedProductForCustomization.id!, `Failed to update customization for "${selectedProductForCustomization.name}"`, {
        level: 'error',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <AnimatedCard className="admin-card shine-hover p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserIcon className="w-6 h-6" />
              Products Catalog
            </h2>
            <div className="flex gap-2">
              <button onClick={openCreateProduct} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Create Product</button>
              <button onClick={() => router.push('/adminpanel/products')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Open Products Manager</button>
            </div>
          </div>

          {loadingProducts ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFFFFF] mx-auto mb-2"></div>
              <p className="text-gray-400">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <AnimatedCard key={product.id} className="admin-card p-4">
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                    {product.image && product.image.trim() ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-medium mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-bold">${product.price.toFixed(2)}</span>
                    <span className="text-gray-500 text-xs bg-[#2A2A2A] px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
                    <p className="text-gray-500 text-xs">Product ID: {product.id}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => openEditProduct({ id: String(product.id), name: product.name, price: product.price, image: product.image, category: product.category, description: product.description, link: product.link || '', hoverImage: product.hoverImage || '', displayOnHomePage: product.displayOnHomePage || false, createdAt: product.createdAt || undefined as any })}
                      className="bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/30 text-yellow-400 px-3 py-1 rounded text-sm"
                    >
                      Edit (Modal)
                    </button>
                    <button
                      onClick={() => setSelectedProductForCustomization(product)}
                      className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 text-purple-400 px-3 py-1 rounded text-sm"
                    >
                      Customize
                    </button>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          )}
        </AnimatedCard>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">{productMode === 'create' ? 'Create' : 'Edit'} Product</h3>
                <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Name" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                <input type="number" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Price" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })} />
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Category" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} />
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Main Image URL" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} />
                {productForm.image?.trim() && (
                  <div className="h-40 rounded-lg border border-[#2A2A2A] overflow-hidden bg-[#0A0A0A]"><img src={productForm.image} className="object-contain w-full h-full" /></div>
                )}

                {/* Hover Image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Hover Image (optional)</label>
                  <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Hover Image URL" value={productForm.hoverImage || ''} onChange={e => setProductForm({ ...productForm, hoverImage: e.target.value })} />
                  {productForm.hoverImage?.trim() && (
                    <div className="h-40 rounded-lg border border-[#2A2A2A] overflow-hidden bg-[#0A0A0A]"><img src={productForm.hoverImage} className="object-contain w-full h-full" /></div>
                  )}
                </div>

                {/* Additional Images */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Additional Images</label>
                    <button
                      type="button"
                      onClick={addImageField}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      + Add Image
                    </button>
                  </div>
                  {(productForm.images || []).map((imageUrl, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white text-sm"
                          placeholder={`Additional Image ${index + 1} URL`}
                          value={imageUrl}
                          onChange={(e) => updateImageField(index, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      {imageUrl?.trim() && (
                        <div className="h-40 rounded-lg border border-[#2A2A2A] overflow-hidden bg-[#0A0A0A]">
                          <img src={imageUrl} className="object-contain w-full h-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <input className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white" placeholder="Product Link" value={productForm.link} onChange={e => setProductForm({ ...productForm, link: e.target.value })} />
                <textarea className="bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-white h-24" placeholder="Description" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowProductModal(false)} className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white py-2 rounded">Cancel</button>
                <button onClick={submitProduct} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Customization Modal */}
      {selectedProductForCustomization && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Customize Product: {selectedProductForCustomization.name}</h3>
                <button onClick={() => setSelectedProductForCustomization(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-6">
                {/* Configuration Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#2A2A2A]">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customizationForm.hasCustomFields}
                        onChange={(e) => setCustomizationForm((prev: typeof customizationForm) => ({ ...prev, hasCustomFields: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-white font-medium">Enable Custom Fields</span>
                    </label>
                    <p className="text-gray-400 text-xs mt-2">Allow customers to enter custom information (e.g., name on jersey, player number)</p>
                  </div>

                  <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#2A2A2A]">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customizationForm.hasSizes}
                        onChange={(e) => setCustomizationForm((prev: typeof customizationForm) => ({ ...prev, hasSizes: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-white font-medium">Enable Size Selection</span>
                    </label>
                    <p className="text-gray-400 text-xs mt-2">Allow customers to select sizes with optional price modifiers</p>
                  </div>

                  <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#2A2A2A]">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customizationForm.hasSizeChart}
                        onChange={(e) => setCustomizationForm((prev: typeof customizationForm) => ({ ...prev, hasSizeChart: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-white font-medium">Enable Size Chart</span>
                    </label>
                    <p className="text-gray-400 text-xs mt-2">Show a size guide link on the product page for this item</p>
                  </div>
                </div>

                {/* Custom Fields Section */}
                {customizationForm.hasCustomFields && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Custom Fields</h4>
                      <button
                        onClick={() => setCustomizationForm((prev: typeof customizationForm) => ({
                          ...prev,
                          customFields: [...prev.customFields, { id: `field_${Date.now()}`, label: '', type: 'text', required: false, placeholder: '', options: [] }]
                        }))}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Add Field
                      </button>
                    </div>
                    <div className="space-y-4">
                      {customizationForm.customFields.map((field, index) => (
                        <div key={index} className="bg-[#0F0F0F] rounded-lg p-4 border border-[#2A2A2A]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Field Name</label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => {
                                  const newFields = [...customizationForm.customFields];
                                  newFields[index].label = e.target.value;
                                  setCustomizationForm((prev: typeof customizationForm) => ({ ...prev, customFields: newFields }));
                                }}
                                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                                placeholder="e.g., Custom Text, Player Name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Field Type</label>
                              <select
                                value={field.type}
                                onChange={(e) => {
                                  const newFields = [...customizationForm.customFields];
                                  newFields[index].type = e.target.value as CustomField['type'];
                                  setCustomizationForm((prev: CustomizationForm) => ({ ...prev, customFields: newFields }));
                                }}
                                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                              >
                                <option value="text">Text</option>
                                <option value="textarea">Textarea</option>
                                <option value="select">Select</option>
                                <option value="number">Number</option>
                              </select>
                            </div>
                            <div>
                              <input
                                type="text"
                                value={field.placeholder || ''}
                                onChange={(e) => {
                                  const newFields = [...customizationForm.customFields];
                                  newFields[index].placeholder = e.target.value;
                                  setCustomizationForm((prev: CustomizationForm) => ({ ...prev, customFields: newFields }));
                                }}
                                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                                placeholder="Optional placeholder text"
                              />
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => {
                                    const newFields = [...customizationForm.customFields];
                                    newFields[index].required = e.target.checked;
                                    setCustomizationForm((prev: CustomizationForm) => ({ ...prev, customFields: newFields }));
                                  }}
                                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-300">Required</span>
                              </label>
                              <button
                                onClick={() => setCustomizationForm(prev => ({
                                  ...prev,
                                  customFields: prev.customFields.filter((_, i) => i !== index)
                                }))}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes Section */}
                {customizationForm.hasSizes && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Sizes</h4>
                      <button
                        onClick={() => setCustomizationForm((prev: typeof customizationForm) => ({
                          ...prev,
                          sizes: [...prev.sizes, { id: `size_${Date.now()}`, name: '', priceModifier: 0, available: true }]
                        }))}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Add Size
                      </button>
                    </div>
                    <div className="space-y-4">
                      {customizationForm.sizes.map((size, index) => (
                        <div key={index} className="bg-[#0F0F0F] rounded-lg p-4 border border-[#2A2A2A]">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Size Name</label>
                              <input
                                type="text"
                                value={size.name}
                                onChange={(e) => {
                                  const newSizes = [...customizationForm.sizes];
                                  newSizes[index].name = e.target.value;
                                  setCustomizationForm(prev => ({ ...prev, sizes: newSizes }));
                                }}
                                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                                placeholder="e.g., Small, Medium, Large"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Price Adjustment</label>
                              <input
                                type="number"
                                value={size.priceModifier}
                                onChange={(e) => {
                                  const newSizes = [...customizationForm.sizes];
                                  newSizes[index].priceModifier = Number(e.target.value);
                                  setCustomizationForm(prev => ({ ...prev, sizes: newSizes }));
                                }}
                                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-3 py-2 text-white"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Available</label>
                              <input
                                type="checkbox"
                                checked={size.available}
                                onChange={(e) => {
                                  const newSizes = [...customizationForm.sizes];
                                  newSizes[index].available = e.target.checked;
                                  setCustomizationForm(prev => ({ ...prev, sizes: newSizes }));
                                }}
                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Actions</label>
                              <button
                                onClick={() => setCustomizationForm(prev => ({
                                  ...prev,
                                  sizes: prev.sizes.filter((_, i) => i !== index)
                                }))}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-[#2A2A2A]">
                  <button
                    onClick={() => setSelectedProductForCustomization(null)}
                    className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProductCustomization}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Save Customization
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
