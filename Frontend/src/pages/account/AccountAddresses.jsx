import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';

const AccountAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/addresses/${editId}`, formData);
        toast.success('Address updated');
      } else {
        await api.post('/addresses', formData);
        toast.success('Address added');
      }
      setShowForm(false);
      setEditId(null);
      setFormData({ street: '', city: '', state: '', zipCode: '', country: 'India', isDefault: false });
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      toast.success('Address deleted');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const handleEdit = (address) => {
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setEditId(address._id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
        <h2 className="text-2xl font-serif font-semibold text-black dark:text-cream-dark">My Addresses</h2>
        {!showForm && (
          <button 
            onClick={() => {
              setEditId(null);
              setFormData({ street: '', city: '', state: '', zipCode: '', country: 'India', isDefault: false });
              setShowForm(true);
            }}
            className="flex items-center gap-1 text-sm font-semibold text-gold hover:underline"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-surface-dark p-6 border border-black dark:border-white mb-8">
          <h3 className="font-serif font-semibold mb-4 text-black dark:text-white">{editId ? 'Edit Address' : 'Add New Address'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-black dark:text-cream-dark mb-1">Street Address</label>
              <input type="text" name="street" value={formData.street} onChange={handleChange} required className="w-full px-4 py-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-gold outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-black dark:text-cream-dark mb-1">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-gold outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-black dark:text-cream-dark mb-1">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full px-4 py-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-gold outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-black dark:text-cream-dark mb-1">Zip Code</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} required className="w-full px-4 py-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-gold outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-black dark:text-cream-dark mb-1">Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} required className="w-full px-4 py-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-gold outline-none" />
            </div>
            <div className="md:col-span-2 flex items-center gap-2 mt-2">
              <input type="checkbox" name="isDefault" id="isDefault" checked={formData.isDefault} onChange={handleChange} className="accent-gold w-4 h-4" />
              <label htmlFor="isDefault" className="text-sm text-black dark:text-white cursor-pointer">Set as default address</label>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="btn-gold px-6 py-2 uppercase text-xs tracking-wider">Save Address</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-black dark:border-white px-6 py-2 uppercase text-xs tracking-wider text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">Cancel</button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="text-center py-8 text-gold">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-300 dark:border-gray-700">
          <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No addresses saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map(addr => (
            <div key={addr._id} className="border border-black dark:border-white p-5 relative group">
              {addr.isDefault && (
                <span className="absolute top-0 right-0 bg-gold text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Default</span>
              )}
              <div className="pr-12">
                <p className="text-black dark:text-white font-medium mb-1">{addr.street}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{addr.city}, {addr.state} {addr.zipCode}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{addr.country}</p>
              </div>
              <div className="mt-4 flex gap-3 border-t border-gray-200 dark:border-gray-800 pt-3">
                <button onClick={() => handleEdit(addr)} className="text-xs flex items-center gap-1 text-black dark:text-white hover:text-gold transition-colors">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(addr._id)} className="text-xs flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountAddresses;
