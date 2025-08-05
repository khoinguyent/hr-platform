import React, { useState } from 'react';
import documentService from '../services/documentService';

const DocumentUpload = ({ 
  clientId, 
  jobId, 
  userId, 
  onUploadSuccess, 
  onUploadError,
  allowedTypes = ['contract', 'appendix', 'invoice', 'proposal', 'agreement', 'template', 'other'],
  className = ''
}) => {
  const [formData, setFormData] = useState({
    documentName: '',
    documentType: 'contract',
    description: '',
    tags: '',
    expiredDate: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const documentTypes = [
    { value: 'contract', label: 'Contract' },
    { value: 'appendix', label: 'Appendix' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'agreement', label: 'Agreement' },
    { value: 'template', label: 'Template' },
    { value: 'other', label: 'Other' }
  ].filter(type => allowedTypes.includes(type.value));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    if (!formData.documentName.trim()) {
      setError('Please enter a document name');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('name', formData.documentName.trim());
      uploadFormData.append('document_type', formData.documentType);
      
      if (clientId) uploadFormData.append('client_id', clientId);
      if (jobId) uploadFormData.append('job_id', jobId);
      if (userId) uploadFormData.append('user_id', userId);
      if (formData.description) uploadFormData.append('description', formData.description);
      if (formData.tags) uploadFormData.append('tags', formData.tags);
      if (formData.expiredDate) uploadFormData.append('expired_date', formData.expiredDate);

      const response = await documentService.uploadDocument(uploadFormData);
      
      // Reset form
      setFormData({
        documentName: '',
        documentType: 'contract',
        description: '',
        tags: '',
        expiredDate: ''
      });
      setSelectedFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Upload failed. Please try again.';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Document Name */}
        <div>
          <label htmlFor="documentName" className="block text-sm font-medium text-gray-700 mb-1">
            Document Name *
          </label>
          <input
            type="text"
            id="documentName"
            name="documentName"
            value={formData.documentName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter document name"
            required
          />
        </div>

        {/* Document Type */}
        <div>
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
            Document Type *
          </label>
          <select
            id="documentType"
            name="documentType"
            value={formData.documentType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            File *
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            required
          />
          {selectedFile && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter document description"
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (JSON format)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='["tag1", "tag2"]'
          />
        </div>

        {/* Expired Date */}
        <div>
          <label htmlFor="expiredDate" className="block text-sm font-medium text-gray-700 mb-1">
            Expired Date
          </label>
          <input
            type="datetime-local"
            id="expiredDate"
            name="expiredDate"
            value={formData.expiredDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
};

export default DocumentUpload; 