const pool = require('../config/db');

class InteractionModel {
  // Create a new client interaction
  async createInteraction(interactionData) {
    const {
      client_id,
      contact_id,
      interaction_type,
      subject,
      description,
      outcome,
      scheduled_date,
      completed_date,
      status,
      created_by
    } = interactionData;

    const query = `
      INSERT INTO client_interactions (
        client_id, contact_id, interaction_type, subject, description, outcome,
        scheduled_date, completed_date, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      client_id, contact_id, interaction_type, subject, description, outcome,
      scheduled_date, completed_date, status, created_by
    ];

    try {
      const result = await pool.query(query, values);
      return { success: true, interaction: result.rows[0] };
    } catch (error) {
      console.error('Error creating interaction:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all interactions for a client
  async getInteractionsByClientId(clientId, filters = {}) {
    let query = `
      SELECT ci.*, 
             cc.first_name as contact_first_name,
             cc.last_name as contact_last_name,
             cc.email as contact_email,
             c.company_name
      FROM client_interactions ci
      LEFT JOIN client_contacts cc ON ci.contact_id = cc.id
      JOIN clients c ON ci.client_id = c.id
      WHERE ci.client_id = $1
    `;

    const values = [clientId];
    let valueIndex = 2;

    // Add filters
    if (filters.interaction_type) {
      query += ` AND ci.interaction_type = $${valueIndex++}`;
      values.push(filters.interaction_type);
    }

    if (filters.status) {
      query += ` AND ci.status = $${valueIndex++}`;
      values.push(filters.status);
    }

    if (filters.date_from) {
      query += ` AND ci.scheduled_date >= $${valueIndex++}`;
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ` AND ci.scheduled_date <= $${valueIndex++}`;
      values.push(filters.date_to);
    }

    query += ` ORDER BY ci.scheduled_date DESC, ci.created_at DESC`;

    // Add pagination
    if (filters.limit) {
      query += ` LIMIT $${valueIndex++}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${valueIndex++}`;
      values.push(filters.offset);
    }

    try {
      const result = await pool.query(query, values);
      return { success: true, interactions: result.rows };
    } catch (error) {
      console.error('Error getting interactions:', error);
      return { success: false, error: error.message };
    }
  }

  // Get interaction by ID
  async getInteractionById(interactionId) {
    const query = `
      SELECT ci.*, 
             cc.first_name as contact_first_name,
             cc.last_name as contact_last_name,
             cc.email as contact_email,
             c.company_name
      FROM client_interactions ci
      LEFT JOIN client_contacts cc ON ci.contact_id = cc.id
      JOIN clients c ON ci.client_id = c.id
      WHERE ci.id = $1
    `;

    try {
      const result = await pool.query(query, [interactionId]);
      if (result.rows.length === 0) {
        return { success: false, error: 'Interaction not found' };
      }
      return { success: true, interaction: result.rows[0] };
    } catch (error) {
      console.error('Error getting interaction:', error);
      return { success: false, error: error.message };
    }
  }

  // Update interaction
  async updateInteraction(interactionId, updateData) {
    const allowedFields = [
      'contact_id', 'interaction_type', 'subject', 'description', 'outcome',
      'scheduled_date', 'completed_date', 'status'
    ];

    const updates = [];
    const values = [];
    let valueIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${valueIndex++}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return { success: false, error: 'No valid fields to update' };
    }

    values.push(interactionId);
    const query = `
      UPDATE client_interactions 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return { success: false, error: 'Interaction not found' };
      }
      return { success: true, interaction: result.rows[0] };
    } catch (error) {
      console.error('Error updating interaction:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete interaction
  async deleteInteraction(interactionId) {
    const query = 'DELETE FROM client_interactions WHERE id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [interactionId]);
      if (result.rows.length === 0) {
        return { success: false, error: 'Interaction not found' };
      }
      return { success: true, interaction: result.rows[0] };
    } catch (error) {
      console.error('Error deleting interaction:', error);
      return { success: false, error: error.message };
    }
  }

  // Get upcoming interactions
  async getUpcomingInteractions(clientId = null, limit = 10) {
    let query = `
      SELECT ci.*, 
             cc.first_name as contact_first_name,
             cc.last_name as contact_last_name,
             cc.email as contact_email,
             c.company_name
      FROM client_interactions ci
      LEFT JOIN client_contacts cc ON ci.contact_id = cc.id
      JOIN clients c ON ci.client_id = c.id
      WHERE ci.scheduled_date >= CURRENT_TIMESTAMP 
        AND ci.status = 'scheduled'
    `;

    const values = [];

    if (clientId) {
      query += ` AND ci.client_id = $1`;
      values.push(clientId);
    }

    query += ` ORDER BY ci.scheduled_date ASC LIMIT $${values.length + 1}`;
    values.push(limit);

    try {
      const result = await pool.query(query, values);
      return { success: true, interactions: result.rows };
    } catch (error) {
      console.error('Error getting upcoming interactions:', error);
      return { success: false, error: error.message };
    }
  }

  // Get overdue interactions
  async getOverdueInteractions(clientId = null) {
    let query = `
      SELECT ci.*, 
             cc.first_name as contact_first_name,
             cc.last_name as contact_last_name,
             cc.email as contact_email,
             c.company_name
      FROM client_interactions ci
      LEFT JOIN client_contacts cc ON ci.contact_id = cc.id
      JOIN clients c ON ci.client_id = c.id
      WHERE ci.scheduled_date < CURRENT_TIMESTAMP 
        AND ci.status = 'scheduled'
    `;

    const values = [];

    if (clientId) {
      query += ` AND ci.client_id = $1`;
      values.push(clientId);
    }

    query += ` ORDER BY ci.scheduled_date ASC`;

    try {
      const result = await pool.query(query, values);
      return { success: true, interactions: result.rows };
    } catch (error) {
      console.error('Error getting overdue interactions:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark interaction as completed
  async markInteractionCompleted(interactionId, outcome = null) {
    const query = `
      UPDATE client_interactions 
      SET status = 'completed', 
          completed_date = CURRENT_TIMESTAMP,
          outcome = COALESCE($2, outcome),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [interactionId, outcome]);
      if (result.rows.length === 0) {
        return { success: false, error: 'Interaction not found' };
      }
      return { success: true, interaction: result.rows[0] };
    } catch (error) {
      console.error('Error marking interaction completed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get interaction statistics
  async getInteractionStats(clientId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_interactions,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_interactions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_interactions,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_interactions,
        COUNT(CASE WHEN interaction_type = 'call' THEN 1 END) as call_interactions,
        COUNT(CASE WHEN interaction_type = 'email' THEN 1 END) as email_interactions,
        COUNT(CASE WHEN interaction_type = 'meeting' THEN 1 END) as meeting_interactions
      FROM client_interactions
    `;

    const values = [];

    if (clientId) {
      query += ` WHERE client_id = $1`;
      values.push(clientId);
    }

    try {
      const result = await pool.query(query, values);
      return { success: true, stats: result.rows[0] };
    } catch (error) {
      console.error('Error getting interaction stats:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = InteractionModel; 