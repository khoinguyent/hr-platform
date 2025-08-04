const ContactModel = require('../models/contactModel');

class ContactController {
  constructor() {
    this.contactModel = new ContactModel();
  }

  // Create a new contact for a client
  async createContact(req, res) {
    try {
      const { clientId } = req.params;
      const contactData = {
        ...req.body,
        client_id: clientId
      };

      // Validate required fields
      if (!contactData.first_name || !contactData.last_name || !contactData.email) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, and email are required'
        });
      }

      // If this is set as primary contact, handle the logic
      if (contactData.is_primary_contact) {
        // The model will handle setting this as primary and removing others
      }

      const result = await this.contactModel.createContact(contactData);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.status(201).json({
        success: true,
        message: 'Contact created successfully',
        contact: result.contact
      });
    } catch (error) {
      console.error('Error creating contact:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all contacts for a client
  async getContactsByClient(req, res) {
    try {
      const { clientId } = req.params;
      
      const result = await this.contactModel.getContactsByClientId(clientId);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        contacts: result.contacts
      });
    } catch (error) {
      console.error('Error getting contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get contact by ID
  async getContactById(req, res) {
    try {
      const { contactId } = req.params;
      
      const result = await this.contactModel.getContactById(contactId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        contact: result.contact
      });
    } catch (error) {
      console.error('Error getting contact:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update contact
  async updateContact(req, res) {
    try {
      const { contactId } = req.params;
      const updateData = req.body;

      const result = await this.contactModel.updateContact(contactId, updateData);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        message: 'Contact updated successfully',
        contact: result.contact
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete contact
  async deleteContact(req, res) {
    try {
      const { contactId } = req.params;

      const result = await this.contactModel.deleteContact(contactId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        message: 'Contact deleted successfully',
        contact: result.contact
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get primary contact for a client
  async getPrimaryContact(req, res) {
    try {
      const { clientId } = req.params;
      
      const result = await this.contactModel.getPrimaryContact(clientId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        contact: result.contact
      });
    } catch (error) {
      console.error('Error getting primary contact:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Set a contact as primary
  async setPrimaryContact(req, res) {
    try {
      const { contactId } = req.params;
      const { clientId } = req.body;

      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      const result = await this.contactModel.setPrimaryContact(contactId, clientId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        message: 'Primary contact updated successfully',
        contact: result.contact
      });
    } catch (error) {
      console.error('Error setting primary contact:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Search contacts
  async searchContacts(req, res) {
    try {
      const { q } = req.query;
      const { clientId } = req.params;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }

      const result = await this.contactModel.searchContacts(q, clientId);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        contacts: result.contacts,
        searchTerm: q
      });
    } catch (error) {
      console.error('Error searching contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get contacts by type
  async getContactsByType(req, res) {
    try {
      const { clientId } = req.params;
      const { type } = req.query;
      
      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Contact type is required'
        });
      }

      const result = await this.contactModel.getContactsByType(clientId, type);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        contacts: result.contacts,
        type: type
      });
    } catch (error) {
      console.error('Error getting contacts by type:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = ContactController; 