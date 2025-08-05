import React, { useState, useEffect } from 'react';
import documentService from '../services/documentService';

const DocumentList = ({ 
  clientId, 
  jobId, 
  userId, 
  onRefresh,
  excludeTypes = ['job_description', 'resume'],
  className = ''
}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const documentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'contract', label: 'Contract' },
    { value: 'appendix', label: 'Appendix' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'agreement', label: 'Agreement' },
    { value: 'template', label: 'Template' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'uploading', label: 'Uploading' },
    { value: 'processing', label: 'Processing' },
    { value: 'uploaded', label: 'Uploaded' },
    { value: 'failed', label: 'Failed' },
    { value: 'expired', label: 'Expired' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploaded':
        return 'bg-green-100 text-green-800';
      case 'uploading':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'contract':
        return 'bg-purple-100 text-purple-800';
      case 'appendix':
        return 'bg-indigo-100 text-indigo-800';
      case 'invoice':
        return 'bg-green-100 text-green-800';
      case 'proposal':
        return 'bg-blue-100 text-blue-800';
      case 'agreement':
        return 'bg-orange-100 text-orange-800';
      case 'template':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (clientId) {
        response = await documentService.getClientDocuments(clientId);
      } else if (jobId) {
        response = await documentService.getJobDocuments(jobId);
      } else if (userId) {
        response = await documentService.getUserDocuments(userId);
      } else {
        throw new Error('No ID provided for fetching documents');
      }

      // Filter out excluded types
      const filteredDocuments = response.documents?.filter(doc => 
        !excludeTypes.includes(doc.document_type)
      ) || [];

      setDocuments(filteredDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [clientId, jobId, userId]);

  useEffect(() => {
    if (onRefresh) {
      fetchDocuments();
    }
  }, [onRefresh]);

  const filteredDocuments = documents.filter(doc => {
    const typeMatch = filterType === 'all' || doc.document_type === filterType;
    const statusMatch = filterStatus === 'all' || doc.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const handleDownload = (document) => {
    if (document.s3_url) {
      window.open(document.s3_url, '_blank');
    } else {
      alert('Document is not yet available for download.');
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
        <div className="flex">
          <div className="text-red-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchDocuments}
              className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="typeFilter" className="block text-xs font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="typeFilter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="divide-y divide-gray-200">
        {filteredDocuments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No documents found
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <div key={document.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  {/* Document Icon */}
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  {/* Document Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {document.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {document.document_type} • {formatFileSize(document.file_size)} • Uploaded {formatDate(document.upload_date)}
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(document)}
                    disabled={document.status !== 'uploaded'}
                    className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 ${
                      document.status !== 'uploaded' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Download
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentList; 