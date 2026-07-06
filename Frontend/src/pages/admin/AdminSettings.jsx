import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    storeName: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    gstNumber: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    googleMapsUrl: '',
    businessHours: '',
    seo: {
      defaultTitle: '',
      defaultDescription: '',
      defaultKeywords: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success && res.data.data) {
        setSettings({
          ...settings,
          ...res.data.data
        });
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Website Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">General Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input type="text" name="storeName" value={settings.storeName} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (Cloudinary)</label>
              <input type="text" name="logo" value={settings.logo} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input type="text" name="gstNumber" value={settings.gstNumber} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm focus:border-gold outline-none" />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Contact Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input type="email" name="email" value={settings.email} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
              <input type="text" name="phone" value={settings.phone} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
              <textarea name="address" value={settings.address} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm focus:border-gold outline-none" rows="2"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
              <input type="text" name="businessHours" value={settings.businessHours} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm focus:border-gold outline-none" />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Social Media</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
              <input type="text" name="facebook" value={settings.socialLinks.facebook} onChange={(e) => handleChange(e, 'socialLinks')} className="w-full border rounded-lg p-2 text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
              <input type="text" name="instagram" value={settings.socialLinks.instagram} onChange={(e) => handleChange(e, 'socialLinks')} className="w-full border rounded-lg p-2 text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
              <input type="text" name="twitter" value={settings.socialLinks.twitter} onChange={(e) => handleChange(e, 'socialLinks')} className="w-full border rounded-lg p-2 text-sm focus:border-gold outline-none" />
            </div>
          </div>
        </div>

        {/* SEO Defaults */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">SEO Defaults</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Title</label>
              <input type="text" name="defaultTitle" value={settings.seo.defaultTitle} onChange={(e) => handleChange(e, 'seo')} className="w-full border rounded-lg p-2 text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Description</label>
              <textarea name="defaultDescription" value={settings.seo.defaultDescription} onChange={(e) => handleChange(e, 'seo')} className="w-full border rounded-lg p-2 text-sm focus:border-gold outline-none" rows="2"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Keywords</label>
              <input type="text" name="defaultKeywords" value={settings.seo.defaultKeywords} onChange={(e) => handleChange(e, 'seo')} placeholder="Comma separated" className="w-full border rounded-lg p-2 text-sm focus:border-gold outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
