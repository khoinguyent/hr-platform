import React from 'react';
import DocumentManagement from '../components/DocumentManagement';

const DocumentTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Document Management Test</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Client Documents</h2>
            <DocumentManagement
              clientId="test-client-123"
              excludeTypes={['job_description', 'resume']}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentTestPage; 