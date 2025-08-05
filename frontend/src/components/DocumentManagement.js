import React, { useState } from 'react';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';

const DocumentManagement = ({ 
  clientId, 
  jobId, 
  userId, 
  excludeTypes = ['job_description', 'resume'],
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Switch to list tab and refresh
    setActiveTab('list');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUploadError = (error) => {
    console.error('Upload error:', error);
    // Could show a toast notification here
  };

  const tabs = [
    { id: 'list', label: 'Documents', icon: '📄' },
    { id: 'upload', label: 'Upload', icon: '📤' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'list' && (
          <DocumentList
            clientId={clientId}
            jobId={jobId}
            userId={userId}
            excludeTypes={excludeTypes}
            onRefresh={refreshTrigger}
          />
        )}
        
        {activeTab === 'upload' && (
          <DocumentUpload
            clientId={clientId}
            jobId={jobId}
            userId={userId}
            allowedTypes={['contract', 'appendix', 'invoice', 'proposal', 'agreement', 'template', 'other']}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentManagement; 