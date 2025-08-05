import api from './api';

const documentService = {
  // Upload a document
  uploadDocument: async (formData) => {
    try {
      const response = await api.post('/upload/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Get documents for a client
  getClientDocuments: async (clientId) => {
    try {
      const response = await api.get(`/documents/client/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching client documents:', error);
      throw error;
    }
  },

  // Get documents for a job
  getJobDocuments: async (jobId) => {
    try {
      const response = await api.get(`/documents/job/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job documents:', error);
      throw error;
    }
  },

  // Get documents for a user
  getUserDocuments: async (userId) => {
    try {
      const response = await api.get(`/documents/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw error;
    }
  },

  // Get document by ID
  getDocument: async (documentId) => {
    try {
      const response = await api.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  // Get documents by status
  getDocumentsByStatus: async (status) => {
    try {
      const response = await api.get(`/documents/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents by status:', error);
      throw error;
    }
  },

  // Get expired documents
  getExpiredDocuments: async () => {
    try {
      const response = await api.get('/documents/expired');
      return response.data;
    } catch (error) {
      console.error('Error fetching expired documents:', error);
      throw error;
    }
  },
};

export default documentService; 