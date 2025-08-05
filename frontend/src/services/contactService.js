import api from './api';

const contactService = {
  // Get all contacts for a client
  getClientContacts: async (clientId) => {
    try {
      const response = await api.get(`/clients/${clientId}/contacts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching client contacts:', error);
      throw error;
    }
  },

  // Get primary contact for a client
  getPrimaryContact: async (clientId) => {
    try {
      const response = await api.get(`/clients/${clientId}/contacts/primary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching primary contact:', error);
      throw error;
    }
  },

  // Create a new contact
  createContact: async (clientId, contactData) => {
    try {
      const response = await api.post(`/clients/${clientId}/contacts`, contactData);
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },

  // Update a contact
  updateContact: async (contactId, contactData) => {
    try {
      const response = await api.put(`/clients/contacts/${contactId}`, contactData);
      return response.data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  },

  // Delete a contact
  deleteContact: async (contactId) => {
    try {
      const response = await api.delete(`/clients/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  },

  // Set a contact as primary
  setPrimaryContact: async (clientId, contactId) => {
    try {
      const response = await api.put(`/clients/${clientId}/contacts/${contactId}/primary`);
      return response.data;
    } catch (error) {
      console.error('Error setting primary contact:', error);
      throw error;
    }
  },

  // Get contact by ID
  getContactById: async (contactId) => {
    try {
      const response = await api.get(`/clients/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  },

  // Search contacts
  searchContacts: async (clientId, searchTerm) => {
    try {
      const response = await api.get(`/clients/${clientId}/contacts/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }
  },

  // Get contacts by type
  getContactsByType: async (clientId, contactType) => {
    try {
      const response = await api.get(`/clients/${clientId}/contacts/type?type=${encodeURIComponent(contactType)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts by type:', error);
      throw error;
    }
  }
};

export default contactService; 