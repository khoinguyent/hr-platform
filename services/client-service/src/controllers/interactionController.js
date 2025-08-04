const InteractionModel = require('../models/interactionModel');

class InteractionController {
  constructor() {
    this.interactionModel = new InteractionModel();
  }

  // Create a new interaction
  async createInteraction(req, res) {
    try {
      const { clientId } = req.params;
      const interactionData = {
        ...req.body,
        client_id: clientId,
        created_by: req.user.id
      };

      // Validate required fields
      if (!interactionData.interaction_type) {
        return res.status(400).json({
          success: false,
          message: 'Interaction type is required'
        });
      }

      const result = await this.interactionModel.createInteraction(interactionData);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.status(201).json({
        success: true,
        message: 'Interaction created successfully',
        interaction: result.interaction
      });
    } catch (error) {
      console.error('Error creating interaction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all interactions for a client
  async getInteractionsByClient(req, res) {
    try {
      const { clientId } = req.params;
      const filters = {
        interaction_type: req.query.type,
        status: req.query.status,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };
      
      const result = await this.interactionModel.getInteractionsByClientId(clientId, filters);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        interactions: result.interactions,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: result.interactions.length
        }
      });
    } catch (error) {
      console.error('Error getting interactions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get interaction by ID
  async getInteractionById(req, res) {
    try {
      const { interactionId } = req.params;
      
      const result = await this.interactionModel.getInteractionById(interactionId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        interaction: result.interaction
      });
    } catch (error) {
      console.error('Error getting interaction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update interaction
  async updateInteraction(req, res) {
    try {
      const { interactionId } = req.params;
      const updateData = req.body;

      const result = await this.interactionModel.updateInteraction(interactionId, updateData);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        message: 'Interaction updated successfully',
        interaction: result.interaction
      });
    } catch (error) {
      console.error('Error updating interaction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete interaction
  async deleteInteraction(req, res) {
    try {
      const { interactionId } = req.params;

      const result = await this.interactionModel.deleteInteraction(interactionId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        message: 'Interaction deleted successfully',
        interaction: result.interaction
      });
    } catch (error) {
      console.error('Error deleting interaction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get upcoming interactions
  async getUpcomingInteractions(req, res) {
    try {
      const { clientId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      
      const result = await this.interactionModel.getUpcomingInteractions(clientId, limit);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        interactions: result.interactions
      });
    } catch (error) {
      console.error('Error getting upcoming interactions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get overdue interactions
  async getOverdueInteractions(req, res) {
    try {
      const { clientId } = req.params;
      
      const result = await this.interactionModel.getOverdueInteractions(clientId);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        interactions: result.interactions
      });
    } catch (error) {
      console.error('Error getting overdue interactions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Mark interaction as completed
  async markInteractionCompleted(req, res) {
    try {
      const { interactionId } = req.params;
      const { outcome } = req.body;

      const result = await this.interactionModel.markInteractionCompleted(interactionId, outcome);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        message: 'Interaction marked as completed',
        interaction: result.interaction
      });
    } catch (error) {
      console.error('Error marking interaction completed:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get interaction statistics
  async getInteractionStats(req, res) {
    try {
      const { clientId } = req.params;
      
      const result = await this.interactionModel.getInteractionStats(clientId);
      
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
      console.error('Error getting interaction stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get global upcoming interactions (for dashboard)
  async getGlobalUpcomingInteractions(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      
      const result = await this.interactionModel.getUpcomingInteractions(null, limit);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        interactions: result.interactions
      });
    } catch (error) {
      console.error('Error getting global upcoming interactions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get global overdue interactions (for dashboard)
  async getGlobalOverdueInteractions(req, res) {
    try {
      const result = await this.interactionModel.getOverdueInteractions();
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      res.json({
        success: true,
        interactions: result.interactions
      });
    } catch (error) {
      console.error('Error getting global overdue interactions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = InteractionController; 