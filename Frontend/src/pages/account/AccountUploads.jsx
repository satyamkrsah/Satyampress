import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FileText, Image as ImageIcon, Download, Loader, UploadCloud } from 'lucide-react';

const AccountUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await api.get('/upload/myuploads');
        if (res.data.success) {
          setUploads(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load uploads:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUploads();
  }, []);

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('image')) return <ImageIcon className="w-8 h-8 text-gold" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <h2 className="text-2xl font-serif font-semibold mb-6 text-black dark:text-cream-dark border-b border-gray-200 dark:border-gray-800 pb-4">
        My Uploaded Files
      </h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : uploads.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-surface-dark border border-dashed border-gray-300 dark:border-gray-700">
          <UploadCloud className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">You haven't uploaded any files yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {uploads.map(file => (
            <div key={file._id} className="border border-black dark:border-white p-4 flex flex-col hover:shadow-md transition-shadow bg-white dark:bg-black group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {getFileIcon(file.mimeType)}
                </div>
                <a 
                  href={file.secureUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 text-gray-400 hover:text-gold transition-colors"
                  title="Download / View"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
              <div className="mt-auto">
                <p className="font-medium text-sm text-black dark:text-white truncate" title={file.originalName}>
                  {file.originalName}
                </p>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>{formatSize(file.size)}</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountUploads;
