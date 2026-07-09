import React, { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, Trash2, Search, Download, Upload, Copy, X } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import FileUpload from '../../components/FileUpload';

const AdminMedia = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await api.get('/upload');
      if (res.data.success) {
        setMedia(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file permanently?')) return;
    try {
      const res = await api.delete(`/upload/${id}`);
      if (res.data.success) {
        toast.success('File deleted successfully');
        setMedia(media.filter(m => m._id !== id));
      }
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy URL');
    });
  };

  const handleUploadSuccess = (newMedia) => {
    if (newMedia) {
      toast.success('File uploaded successfully');
      setMedia([newMedia, ...media]);
      setIsUploadModalOpen(false);
    }
  };

  const filteredMedia = media.filter(m => 
    m.originalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.uploadedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading media library...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
        >
          <Upload className="h-4 w-4" /> Upload Files
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search by file name or uploader..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredMedia.map((file) => (
          <div key={file._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col">
            <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center">
              {file.mimeType.startsWith('image/') ? (
                <img src={file.secureUrl} alt={file.originalName} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                   <FileText className="h-12 w-12 mb-2" />
                   <span className="text-xs uppercase font-bold">{file.mimeType.split('/')[1]}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => copyToClipboard(file.secureUrl)}
                  className="p-2 bg-white rounded-full text-gray-900 hover:text-gold transition-colors"
                  title="Copy URL"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <a 
                  href={file.secureUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full text-gray-900 hover:text-blue-600 transition-colors"
                  title="View / Download"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button 
                  onClick={() => handleDelete(file._id)}
                  className="p-2 bg-white rounded-full text-gray-900 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <p className="text-sm font-medium text-gray-900 truncate mb-1" title={file.originalName}>
                {file.originalName}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
                <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-full">{file.uploadType.replace('_', ' ')}</span>
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 truncate">By: {file.uploadedBy?.name || 'Unknown'}</p>
            </div>
          </div>
        ))}
      </div>
      
      {filteredMedia.length === 0 && (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
           <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
           <p className="text-gray-500">No media files found.</p>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-background-dark w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Media</h2>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <FileUpload 
                onUploadSuccess={handleUploadSuccess} 
                uploadType="product_image"
                label="Select File"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
