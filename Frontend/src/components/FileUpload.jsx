import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import axios from 'axios';

const FileUpload = ({ 
  onUploadSuccess, 
  uploadType = 'design_file', 
  label = "Upload Design File", 
  accept = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'image/svg+xml': ['.svg']
  },
  maxSize = 10485760 // 10MB
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedMedia, setUploadedMedia] = useState(null);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError(`File rejected. Ensure it's under ${maxSize / 1024 / 1024}MB and is a supported format.`);
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setError(null);
      await uploadFile(selectedFile);
    }
  }, [maxSize, uploadType]);

  const uploadFile = async (selectedFile) => {
    setUploading(true);
    setProgress(0);
    
    try {
      // 1. Get the signature and exact matched parameters from backend
      const sigRes = await api.get(`/upload/signature?uploadType=${uploadType}`);
      const { signature, timestamp, folder, apiKey, cloudName } = sigRes.data;

      // 2. Construct FormData for Cloudinary
      const formData = new FormData();
      
      // The file must be appended to formData, but was purposefully EXCLUDED from backend signature
      formData.append('file', selectedFile); 
      
      // Append the EXACT parameters used during backend signing
      formData.append('folder', folder);
      formData.append('timestamp', timestamp); 
      formData.append('api_key', apiKey);
      formData.append('signature', signature);

      // 3. Send directly to Cloudinary API using standard axios (not api) to avoid injecting auth headers
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      
      const uploadRes = await axios.post(cloudinaryUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      const cloudinaryData = uploadRes.data;

      // 4. Save metadata back to our database
      const metadataRes = await api.post('/upload/metadata', {
        publicId: cloudinaryData.public_id,
        secureUrl: cloudinaryData.secure_url,
        originalName: selectedFile.name,
        mimeType: selectedFile.type,
        size: selectedFile.size,
        uploadType: uploadType
      });

      if (metadataRes.data.success) {
        setUploadedMedia(metadataRes.data.data);
        if (onUploadSuccess) onUploadSuccess(metadataRes.data.data);
      }
    } catch (err) {
      console.error('Upload Error:', err.response?.data || err);
      setError(err.response?.data?.error?.message || err.response?.data?.error || 'Upload failed. Please try again.');
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (e) => {
    e.stopPropagation(); // prevent opening dropzone
    if (uploadedMedia && uploadedMedia._id) {
      try {
        await api.delete(`/upload/${uploadedMedia._id}`);
      } catch (err) {
        console.error("Failed to delete from server", err);
      }
    }
    setFile(null);
    setUploadedMedia(null);
    setProgress(0);
    setError(null);
    if (onUploadSuccess) onUploadSuccess(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept, 
    maxSize,
    multiple: false
  });

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-900 dark:text-cream-dark mb-2">{label}</label>
      
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 
            ${isDragActive ? 'border-gold bg-gold/5' : 'border-gray-300 dark:border-gray-600 hover:border-gold hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDragActive ? 'Drop the file here...' : 'Drag & drop your file here, or click to select'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Supports PDF, PNG, JPG, SVG (Max 10MB)</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center shrink-0">
               {file.type.startsWith('image/') ? (
                 <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover rounded" />
               ) : (
                 <File className="h-6 w-6 text-gold" />
               )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 pl-4">
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div className="bg-gold h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-xs text-gray-500">{progress}%</span>
              </div>
            ) : uploadedMedia ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : null}
            
            <button 
              onClick={removeFile}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
