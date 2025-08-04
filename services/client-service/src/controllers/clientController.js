const ClientModel = require('../models/clientModel');
const ContactModel = require('../models/contactModel');
const InteractionModel = require('../models/interactionModel');

class ClientController {
  constructor() {
    this.clientModel = new ClientModel();
    this.contactModel = new ContactModel();
    this.interactionModel = new InteractionModel();
  }

  // Create a new client
  async createClient(req, res) {
    try {
      const clientData = {
        ...req.body,
        created_by: req.user.id
      };

      // Validate required fields
      if (!clientData.company_name) {
        return res.status(400).json({
          success: false,
          message: 'Company name is required'
        });
      }

      const result = await this.clientModel.createClient(clientData);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.status(201).json({
        success: true,
        message: 'Client created successfully',
        client: result.client
      });
    } catch (error) {
      console.error('Error creating client:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all clients with filtering and pagination
  async getAllClients(req, res) {
    try {
      const filters = {
        status: req.query.status,
        industry: req.query.industry,
        service_tier: req.query.service_tier,
        company_size: req.query.company_size,
        search: req.query.search,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const result = await this.clientModel.getAllClients(filters);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        clients: result.clients,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: result.clients.length
        }
      });
    } catch (error) {
      console.error('Error getting clients:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get client by ID with related data
  async getClientById(req, res) {
    try {
      const { clientId } = req.params;
      
      const result = await this.clientModel.getClientById(clientId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      // Get contacts for this client
      const contactsResult = await this.contactModel.getContactsByClientId(clientId);
      const contacts = contactsResult.success ? contactsResult.contacts : [];

      // Get recent interactions
      const interactionsResult = await this.interactionModel.getInteractionsByClientId(clientId, { limit: 5 });
      const interactions = interactionsResult.success ? interactionsResult.interactions : [];

      res.json({
        success: true,
        client: {
          ...result.client,
          contacts,
          recent_interactions: interactions
        }
      });
    } catch (error) {
      console.error('Error getting client:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update client
  async updateClient(req, res) {
    try {
      const { clientId } = req.params;
      const updateData = req.body;

      const result = await this.clientModel.updateClient(clientId, updateData);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        message: 'Client updated successfully',
        client: result.client
      });
    } catch (error) {
      console.error('Error updating client:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete client (soft delete)
  async deleteClient(req, res) {
    try {
      const { clientId } = req.params;

      const result = await this.clientModel.deleteClient(clientId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        message: 'Client deleted successfully',
        client: result.client
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Hard delete client (admin only)
  async hardDeleteClient(req, res) {
    try {
      const { clientId } = req.params;

      const result = await this.clientModel.hardDeleteClient(clientId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        message: 'Client permanently deleted',
        client: result.client
      });
    } catch (error) {
      console.error('Error hard deleting client:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Search clients
  async searchClients(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }

      const result = await this.clientModel.searchClients(q);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        clients: result.clients,
        searchTerm: q
      });
    } catch (error) {
      console.error('Error searching clients:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get client statistics
  async getClientStats(req, res) {
    try {
      const result = await this.clientModel.getClientStats();
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        stats: result.stats
      });
    } catch (error) {
      console.error('Error getting client stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get client dashboard data
  async getClientDashboard(req, res) {
    try {
      const { clientId } = req.params;

      // Get client info
      const clientResult = await this.clientModel.getClientById(clientId);
      if (!clientResult.success) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      // Get contacts
      const contactsResult = await this.contactModel.getContactsByClientId(clientId);
      const contacts = contactsResult.success ? contactsResult.contacts : [];

      // Get interactions
      const interactionsResult = await this.interactionModel.getInteractionsByClientId(clientId);
      const interactions = interactionsResult.success ? interactionsResult.interactions : [];

      // Get upcoming interactions
      const upcomingResult = await this.interactionModel.getUpcomingInteractions(clientId, 5);
      const upcoming = upcomingResult.success ? upcomingResult.interactions : [];

      // Get interaction stats
      const statsResult = await this.interactionModel.getInteractionStats(clientId);
      const stats = statsResult.success ? statsResult.stats : {};

      res.json({
        success: true,
        dashboard: {
          client: clientResult.client,
          contacts: contacts,
          interactions: interactions,
          upcoming_interactions: upcoming,
          stats: stats
        }
      });
    } catch (error) {
      console.error('Error getting client dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = ClientController; 