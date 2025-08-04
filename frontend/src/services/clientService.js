import api from './api';

export const clientService = {
  // Get all clients with optional filtering
  getClients: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/clients?${params.toString()}`);
    return response.data;
  },

  // Get client by ID
  getClientById: async (clientId) => {
    const response = await api.get(`/clients/${clientId}`);
    return response.data;
  },

  // Create new client
  createClient: async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  // Update client
  updateClient: async (clientId, clientData) => {
    const response = await api.put(`/clients/${clientId}`, clientData);
    return response.data;
  },

  // Delete client
  deleteClient: async (clientId) => {
    const response = await api.delete(`/clients/${clientId}`);
    return response.data;
  },

  // Search clients
  searchClients: async (searchTerm) => {
    const response = await api.get(`/clients/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  // Get client statistics
  getClientStats: async () => {
    const response = await api.get('/clients/stats');
    return response.data;
  },

  // Get client dashboard data
  getClientDashboard: async (clientId) => {
    const response = await api.get(`/clients/${clientId}/dashboard`);
    return response.data;
  },

  // Contact management
  getClientContacts: async (clientId) => {
    const response = await api.get(`/clients/${clientId}/contacts`);
    return response.data;
  },

  createContact: async (clientId, contactData) => {
    const response = await api.post(`/clients/${clientId}/contacts`, contactData);
    return response.data;
  },

  updateContact: async (contactId, contactData) => {
    const response = await api.put(`/clients/contacts/${contactId}`, contactData);
    return response.data;
  },

  deleteContact: async (contactId) => {
    const response = await api.delete(`/clients/contacts/${contactId}`);
    return response.data;
  },

  // Interaction management
  getClientInteractions: async (clientId, filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/clients/${clientId}/interactions?${params.toString()}`);
    return response.data;
  },

  createInteraction: async (clientId, interactionData) => {
    const response = await api.post(`/clients/${clientId}/interactions`, interactionData);
    return response.data;
  },

  updateInteraction: async (interactionId, interactionData) => {
    const response = await api.put(`/clients/interactions/${interactionId}`, interactionData);
    return response.data;
  },

  deleteInteraction: async (interactionId) => {
    const response = await api.delete(`/clients/interactions/${interactionId}`);
    return response.data;
  },

  // Global interactions
  getUpcomingInteractions: async (limit = 10) => {
    const response = await api.get(`/clients/interactions/upcoming?limit=${limit}`);
    return response.data;
  },

  getOverdueInteractions: async () => {
    const response = await api.get('/clients/interactions/overdue');
    return response.data;
  }
};

export default clientService; 