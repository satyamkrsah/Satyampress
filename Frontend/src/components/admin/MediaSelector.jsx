import React, { useState, useEffect } from 'react';
import { X, Search, Image as ImageIcon, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const MediaSelector = ({ isOpen, onClose, onSelect, multiple = false }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedFiles([]);
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

  const toggleSelection = (file) => {
    if (!multiple) {
      onSelect(file);
      onClose();
      return;
    }
    
    const isSelected = selectedFiles.some(f => f._id === file._id);
    if (isSelected) {
      setSelectedFiles(selectedFiles.filter(f => f._id !== file._id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleConfirmSelection = () => {
    onSelect(selectedFiles);
    onClose();
  };

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            {multiple && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFiles.length} selected
                </span>
                <button
                  onClick={handleConfirmSelection}
                  disabled={selectedFiles.length === 0}
                  className="btn-primary py-2 px-4 text-sm disabled:opacity-50 whitespace-nowrap"
                >
                  Insert Selected
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading images...</div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No images found. Please upload images in the Media Library first.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((file) => {
                const isSelected = selectedFiles.some(f => f._id === file._id);
                return (
                  <div 
                    key={file._id} 
                    onClick={() => toggleSelection(file)}
                    className={`bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer group border-2 transition-all relative aspect-square ${isSelected ? 'border-gold' : 'border-transparent hover:border-gold/50'}`}
                  >
                    <img src={file.secureUrl} alt={file.originalName} className="w-full h-full object-cover" />
                    {multiple && isSelected && (
                      <div className="absolute top-2 right-2 bg-white rounded-full">
                        <CheckCircle className="h-5 w-5 text-gold" />
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center text-white text-sm font-medium ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                      {multiple ? 'Select' : 'Insert'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaSelector;
