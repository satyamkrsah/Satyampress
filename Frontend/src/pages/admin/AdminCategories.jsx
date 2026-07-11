import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    customizationFields: []
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        description: category.description || '',
        status: category.status || 'active',
        seoTitle: category.seoTitle || '',
        seoDescription: category.seoDescription || '',
        seoKeywords: category.seoKeywords || '',
        customizationFields: category.customizationFields || []
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        status: 'active',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        customizationFields: []
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleAddField = () => {
    setFormData(prev => ({
      ...prev,
      customizationFields: [
        ...prev.customizationFields,
        { name: '', type: 'Select', isRequired: false, options: [] }
      ]
    }));
  };

  const handleRemoveField = (index) => {
    setFormData(prev => ({
      ...prev,
      customizationFields: prev.customizationFields.filter((_, i) => i !== index)
    }));
  };

  const handleFieldChange = (index, key, value) => {
    setFormData(prev => ({
      ...prev,
      customizationFields: prev.customizationFields.map((field, i) => 
        i === index ? { ...field, [key]: value } : field
      )
    }));
  };

  const handleAddOption = (fieldIndex) => {
    setFormData(prev => ({
      ...prev,
      customizationFields: prev.customizationFields.map((field, i) => 
        i === fieldIndex 
          ? { ...field, options: [...(field.options || []), { name: '', priceModifier: 0 }] }
          : field
      )
    }));
  };

  const handleRemoveOption = (fieldIndex, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      customizationFields: prev.customizationFields.map((field, i) => 
        i === fieldIndex 
          ? { ...field, options: field.options.filter((_, oI) => oI !== optionIndex) }
          : field
      )
    }));
  };

  const handleOptionChange = (fieldIndex, optionIndex, key, value) => {
    setFormData(prev => ({
      ...prev,
      customizationFields: prev.customizationFields.map((field, i) => 
        i === fieldIndex 
          ? { 
              ...field, 
              options: field.options.map((opt, oI) => 
                oI === optionIndex ? { ...opt, [key]: value } : opt
              )
            }
          : field
      )
    }));
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading categories...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Category Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${category.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {category.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(category)} className="p-1.5 text-gray-400 hover:text-gold transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(category._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg p-2" rows="3"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">SEO Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">SEO Title</label>
                    <input type="text" value={formData.seoTitle} onChange={(e) => setFormData({...formData, seoTitle: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">SEO Description</label>
                    <textarea value={formData.seoDescription} onChange={(e) => setFormData({...formData, seoDescription: e.target.value})} className="w-full border rounded-lg p-2 text-sm" rows="2"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">SEO Keywords</label>
                    <input type="text" value={formData.seoKeywords} onChange={(e) => setFormData({...formData, seoKeywords: e.target.value})} className="w-full border rounded-lg p-2 text-sm" placeholder="Comma separated" />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Customization Builder</h3>
                  <button type="button" onClick={handleAddField} className="text-sm text-gold hover:underline flex items-center gap-1">
                    <Plus className="h-4 w-4"/> Add Field
                  </button>
                </div>
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                  {formData.customizationFields.map((field, fIndex) => (
                    <div key={fIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-500 mb-1">Field Name</label>
                              <input required type="text" value={field.name} onChange={(e) => handleFieldChange(fIndex, 'name', e.target.value)} className="w-full border border-gray-300 rounded p-1.5 text-sm" placeholder="e.g. Paper GSM" />
                            </div>
                            <div className="w-32">
                              <label className="block text-xs text-gray-500 mb-1">Type</label>
                              <select value={field.type} onChange={(e) => handleFieldChange(fIndex, 'type', e.target.value)} className="w-full border border-gray-300 rounded p-1.5 text-sm">
                                <option value="Select">Select</option>
                                <option value="Radio">Radio</option>
                                <option value="Checkbox">Checkbox</option>
                                <option value="Text">Text</option>
                                <option value="Number">Number</option>
                                <option value="Color Picker">Color Picker</option>
                                <option value="File Upload">File Upload</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id={`req-${fIndex}`} checked={field.isRequired} onChange={(e) => handleFieldChange(fIndex, 'isRequired', e.target.checked)} />
                            <label htmlFor={`req-${fIndex}`} className="text-xs text-gray-600">Required field</label>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleRemoveField(fIndex)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {['Select', 'Radio', 'Checkbox'].includes(field.type) && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-gray-600">Options</span>
                            <button type="button" onClick={() => handleAddOption(fIndex)} className="text-xs text-blue-600 hover:underline">
                              + Add Option
                            </button>
                          </div>
                          <div className="space-y-2">
                            {field.options.map((opt, oIndex) => (
                              <div key={oIndex} className="flex gap-2 items-center">
                                <input required type="text" value={opt.name} onChange={(e) => handleOptionChange(fIndex, oIndex, 'name', e.target.value)} placeholder="Option name" className="flex-1 border border-gray-300 rounded p-1 text-xs" />
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-500">+₹</span>
                                  <input type="number" value={opt.priceModifier} onChange={(e) => handleOptionChange(fIndex, oIndex, 'priceModifier', Number(e.target.value))} className="w-20 border border-gray-300 rounded p-1 text-xs" />
                                </div>
                                <button type="button" onClick={() => handleRemoveOption(fIndex, oIndex)} className="text-gray-400 hover:text-red-500">
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {formData.customizationFields.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No customization fields added yet.</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
