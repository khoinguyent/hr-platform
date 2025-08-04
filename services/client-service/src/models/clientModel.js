const pool = require('../config/db');

class ClientModel {
  // Create a new client
  async createClient(clientData) {
    const {
      company_name,
      industry,
      company_size,
      website,
      founded_year,
      description,
      primary_email,
      primary_phone,
      address,
      city,
      state,
      country,
      postal_code,
      annual_revenue,
      employee_count,
      business_type,
      service_tier,
      contract_start_date,
      contract_end_date,
      payment_terms,
      status,
      priority_level,
      notes,
      created_by
    } = clientData;

    const query = `
      INSERT INTO clients (
        company_name, industry, company_size, website, founded_year, description,
        primary_email, primary_phone, address, city, state, country, postal_code,
        annual_revenue, employee_count, business_type, service_tier,
        contract_start_date, contract_end_date, payment_terms,
        status, priority_level, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
    `;

    const values = [
      company_name, industry, company_size, website, founded_year, description,
      primary_email, primary_phone, address, city, state, country, postal_code,
      annual_revenue, employee_count, business_type, service_tier,
      contract_start_date, contract_end_date, payment_terms,
      status, priority_level, notes, created_by
    ];

    try {
      const result = await pool.query(query, values);
      return { success: true, client: result.rows[0] };
    } catch (error) {
      console.error('Error creating client:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all clients with optional filtering
  async getAllClients(filters = {}) {
    let query = `
      SELECT c.*, 
             COUNT(cc.id) as contact_count,
             COUNT(ci.id) as interaction_count
      FROM clients c
      LEFT JOIN client_contacts cc ON c.id = cc.client_id AND cc.is_active = true
      LEFT JOIN client_interactions ci ON c.id = ci.client_id
    `;

    const conditions = [];
    const values = [];
    let valueIndex = 1;

    // Add filters
    if (filters.status) {
      conditions.push(`c.status = $${valueIndex++}`);
      values.push(filters.status);
    }

    if (filters.industry) {
      conditions.push(`c.industry = $${valueIndex++}`);
      values.push(filters.industry);
    }

    if (filters.service_tier) {
      conditions.push(`c.service_tier = $${valueIndex++}`);
      values.push(filters.service_tier);
    }

    if (filters.company_size) {
      conditions.push(`c.company_size = $${valueIndex++}`);
      values.push(filters.company_size);
    }

    if (filters.search) {
      conditions.push(`(
        c.company_name ILIKE $${valueIndex} OR 
        c.primary_email ILIKE $${valueIndex} OR
        c.description ILIKE $${valueIndex}
      )`);
      values.push(`%${filters.search}%`);
      valueIndex++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC`;

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
      return { success: true, clients: result.rows };
    } catch (error) {
      console.error('Error getting clients:', error);
      return { success: false, error: error.message };
    }
  }

  // Get client by ID with related data
  async getClientById(clientId) {
    const query = `
      SELECT c.*, 
             COUNT(cc.id) as contact_count,
             COUNT(ci.id) as interaction_count
      FROM clients c
      LEFT JOIN client_contacts cc ON c.id = cc.client_id AND cc.is_active = true
      LEFT JOIN client_interactions ci ON c.id = ci.client_id
      WHERE c.id = $1
      GROUP BY c.id
    `;

    try {
      const result = await pool.query(query, [clientId]);
      if (result.rows.length === 0) {
        return { success: false, error: 'Client not found' };
      }
      return { success: true, client: result.rows[0] };
    } catch (error) {
      console.error('Error getting client:', error);
      return { success: false, error: error.message };
    }
  }

  // Update client
  async updateClient(clientId, updateData) {
    const allowedFields = [
      'company_name', 'industry', 'company_size', 'website', 'founded_year', 'description',
      'primary_email', 'primary_phone', 'address', 'city', 'state', 'country', 'postal_code',
      'annual_revenue', 'employee_count', 'business_type', 'service_tier',
      'contract_start_date', 'contract_end_date', 'payment_terms',
      'status', 'priority_level', 'notes'
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

    values.push(clientId);
    const query = `
      UPDATE clients 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return { success: false, error: 'Client not found' };
      }
      return { success: true, client: result.rows[0] };
    } catch (error) {
      console.error('Error updating client:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete client (soft delete)
  async deleteClient(clientId) {
    const query = `
      UPDATE clients 
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [clientId]);
      if (result.rows.length === 0) {
        return { success: false, error: 'Client not found' };
      }
      return { success: true, client: result.rows[0] };
    } catch (error) {
      console.error('Error deleting client:', error);
      return { success: false, error: error.message };
    }
  }

  // Hard delete client (for admin use)
  async hardDeleteClient(clientId) {
    const query = 'DELETE FROM clients WHERE id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [clientId]);
      if (result.rows.length === 0) {
        return { success: false, error: 'Client not found' };
      }
      return { success: true, client: result.rows[0] };
    } catch (error) {
      console.error('Error hard deleting client:', error);
      return { success: false, error: error.message };
    }
  }

  // Search clients
  async searchClients(searchTerm, filters = {}) {
    const query = `
      SELECT c.*, 
             COUNT(cc.id) as contact_count,
             COUNT(ci.id) as interaction_count
      FROM clients c
      LEFT JOIN client_contacts cc ON c.id = cc.client_id AND cc.is_active = true
      LEFT JOIN client_interactions ci ON c.id = ci.client_id
      WHERE (
        c.company_name ILIKE $1 OR 
        c.primary_email ILIKE $1 OR
        c.description ILIKE $1 OR
        c.industry ILIKE $1
      )
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    try {
      const result = await pool.query(query, [`%${searchTerm}%`]);
      return { success: true, clients: result.rows };
    } catch (error) {
      console.error('Error searching clients:', error);
      return { success: false, error: error.message };
    }
  }

  // Get client statistics
  async getClientStats() {
    const query = `
      SELECT 
        COUNT(*) as total_clients,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_clients,
        COUNT(CASE WHEN status = 'prospect' THEN 1 END) as prospect_clients,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_clients,
        COUNT(CASE WHEN service_tier = 'premium' THEN 1 END) as premium_clients,
        COUNT(CASE WHEN service_tier = 'enterprise' THEN 1 END) as enterprise_clients
      FROM clients
    `;

    try {
      const result = await pool.query(query);
      return { success: true, stats: result.rows[0] };
    } catch (error) {
      console.error('Error getting client stats:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = ClientModel; 