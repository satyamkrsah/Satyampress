import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Save, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import MediaSelector from './MediaSelector';

const AdminProductForm = ({ isOpen, onClose, onSuccess, productToEdit }) => {
  const [categories, setCategories] = useState([]);
  const [mediaSelectorState, setMediaSelectorState] = useState({ isOpen: false, type: 'thumbnail' });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    basePrice: '',
    stock: '',
    lowStockThreshold: 10,
    category: '',
    isActive: true,
    thumbnail: null,
    gallery: [],
    showInMainCatalog: true,
    collectionType: 'none'
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (productToEdit) {
        setFormData({
          name: productToEdit.name || '',
          sku: productToEdit.sku || '',
          description: productToEdit.description || '',
          basePrice: productToEdit.basePrice || '',
          stock: productToEdit.stock || '',
          lowStockThreshold: productToEdit.lowStockThreshold || 10,
          category: productToEdit.category?._id || productToEdit.category || '',
          isActive: productToEdit.isActive ?? true,
          thumbnail: productToEdit.thumbnail || null,
          gallery: productToEdit.gallery || [],
          showInMainCatalog: productToEdit.showInMainCatalog ?? true,
          collectionType: productToEdit.collectionType || 'none'
        });
      } else {
        setFormData({
          name: '',
          sku: '',
          description: '',
          basePrice: '',
          stock: '',
          lowStockThreshold: 10,
          category: '',
          isActive: true,
          thumbnail: null,
          gallery: [],
          showInMainCatalog: true,
          collectionType: 'none'
        });
      }
    }
  }, [isOpen, productToEdit]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleMediaSelect = (selected) => {
    if (mediaSelectorState.type === 'thumbnail') {
      setFormData({ ...formData, thumbnail: selected });
    } else {
      setFormData({ ...formData, gallery: [...formData.gallery, ...selected] });
    }
  };

  const removeGalleryImage = (index) => {
    setFormData({
      ...formData,
      gallery: formData.gallery.filter((_, i) => i !== index)
    });
  };

  const moveGalleryImage = (index, direction) => {
    const newGallery = [...formData.gallery];
    if (direction === 'left' && index > 0) {
      [newGallery[index], newGallery[index - 1]] = [newGallery[index - 1], newGallery[index]];
    } else if (direction === 'right' && index < newGallery.length - 1) {
      [newGallery[index], newGallery[index + 1]] = [newGallery[index + 1], newGallery[index]];
    }
    setFormData({ ...formData, gallery: newGallery });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        thumbnail: formData.thumbnail?._id || undefined,
        gallery: formData.gallery.map(m => m._id)
      };

      let res;
      if (productToEdit) {
        res = await api.put(`/products/${productToEdit._id}`, payload);
        toast.success('Product updated successfully');
      } else {
        res = await api.post('/products', payload);
        toast.success('Product created successfully');
      }

      if (res.data.success) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-background-dark w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {productToEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-2.5 focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-2.5 focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select
                required
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-2.5 focus:border-gold outline-none"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Price (₹) *</label>
              <input
                required
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-2.5 focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Quantity *</label>
              <input
                required
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-2.5 focus:border-gold outline-none"
              />
            </div>

            <div className="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-6 mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Product Image (Thumbnail)</label>
              {formData.thumbnail ? (
                <div className="flex items-start gap-4">
                  <div className="h-24 w-24 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    <img src={formData.thumbnail.secureUrl} alt="Thumbnail" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">{formData.thumbnail.originalName}</p>
                    <button 
                      type="button" 
                      onClick={() => setMediaSelectorState({ isOpen: true, type: 'thumbnail' })}
                      className="text-sm text-gold hover:underline"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMediaSelectorState({ isOpen: true, type: 'thumbnail' })}
                  className="w-full md:w-1/2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:border-gold hover:bg-gold/5 transition-colors"
                >
                  <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Select from Media Library</span>
                </button>
              )}
            </div>

            <div className="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gallery Images</label>
                <button 
                  type="button" 
                  onClick={() => setMediaSelectorState({ isOpen: true, type: 'gallery' })}
                  className="text-sm text-gold hover:underline flex items-center gap-1"
                >
                  + Add Images
                </button>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2">
                {formData.gallery.map((media, index) => (
                  <div key={`${media._id}-${index}`} className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200 shrink-0 group">
                    <img src={media.secureUrl} alt="Gallery item" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {index > 0 && (
                        <button type="button" onClick={() => moveGalleryImage(index, 'left')} className="p-1 bg-white/20 hover:bg-white text-white hover:text-black rounded">
                          <ChevronLeft className="h-3 w-3" />
                        </button>
                      )}
                      <button type="button" onClick={() => removeGalleryImage(index)} className="p-1 bg-white/20 hover:bg-red-500 text-white rounded">
                        <Trash2 className="h-3 w-3" />
                      </button>
                      {index < formData.gallery.length - 1 && (
                        <button type="button" onClick={() => moveGalleryImage(index, 'right')} className="p-1 bg-white/20 hover:bg-white text-white hover:text-black rounded">
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {formData.gallery.length === 0 && (
                  <div className="text-sm text-gray-500">No gallery images added.</div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-2.5 focus:border-gold outline-none"
              ></textarea>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-gold rounded border-gray-300 focus:ring-gold"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Product is active (visible in store)
              </label>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="showInMainCatalog"
                id="showInMainCatalog"
                checked={formData.showInMainCatalog}
                onChange={handleChange}
                className="w-4 h-4 text-gold rounded border-gray-300 focus:ring-gold"
              />
              <label htmlFor="showInMainCatalog" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show in Main Catalog
              </label>
            </div>

            <div className="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-6 mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Collection Type</label>
              <select
                name="collectionType"
                value={formData.collectionType}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-2.5 focus:border-gold outline-none"
              >
                <option value="none">None</option>
                <option value="premium">Premium Collection</option>
                <option value="bestSeller">Best Seller</option>
                <option value="newArrival">New Arrival</option>
                <option value="featured">Featured Product</option>
              </select>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-gold px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <MediaSelector 
        isOpen={mediaSelectorState.isOpen} 
        onClose={() => setMediaSelectorState({ ...mediaSelectorState, isOpen: false })}
        onSelect={handleMediaSelect}
        multiple={mediaSelectorState.type === 'gallery'}
      />
    </div>
  );
};

export default AdminProductForm;
