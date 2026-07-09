import React, { useState, useEffect } from 'react';
import { X, Search, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const MediaSelector = ({ isOpen, onClose, onSelect }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get('/upload');
      if (res.data.success) {
        setMedia(res.data.data.filter(m => m.mimeType.startsWith('image/')));
      }
    } catch (error) {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter(m => 
    m.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-background-dark w-full max-w-4xl max-h-[80vh] flex flex-col rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="h-5 w-5" /> Select Media
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search images..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-gold text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading images...</div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No images found. Please upload images in the Media Library first.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((file) => (
                <div 
                  key={file._id} 
                  onClick={() => {
                    onSelect(file);
                    onClose();
                  }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer group border border-transparent hover:border-gold transition-all relative aspect-square"
                >
                  <img src={file.secureUrl} alt={file.originalName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium">
                    Select
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaSelector;
