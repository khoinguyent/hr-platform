const pool = require('../config/db');

class ContactModel {
  // Create a new client contact
  async createContact(contactData) {
    const {
      client_id,
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      contact_type,
      is_primary_contact,
      can_make_decisions,
      preferred_contact_method,
      timezone,
      availability_notes
    } = contactData;

    const query = `
      INSERT INTO client_contacts (
        client_id, first_name, last_name, email, phone, position, department,
        contact_type, is_primary_contact, can_make_decisions,
        preferred_contact_method, timezone, availability_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      client_id, first_name, last_name, email, phone, position, department,
      contact_type, is_primary_contact, can_make_decisions,
      preferred_contact_method, timezone, availability_notes
    ];

    try {
      const result = await pool.query(query, values);
      return { success: true, contact: result.rows[0] };
    } catch (error) {
      console.error('Error creating contact:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all contacts for a client
  async getContactsByClientId(clientId) {
    const query = `
      SELECT * FROM client_contacts 
      WHERE client_id = $1 AND is_active = true
      ORDER BY is_primary_contact DESC, created_at ASC
    `;

    try {
      const result = await pool.query(query, [clientId]);
      return { success: true, contacts: result.rows };
    } catch (error) {
      console.error('Error getting contacts:', error);
      return { success: false, error: error.message };
    }
  }

  // Get contact by ID
  async getContactById(contactId) {
    const query = `
      SELECT cc.*, c.company_name 
      FROM client_contacts cc
      JOIN clients c ON cc.client_id = c.id
      WHERE cc.id = $1 AND cc.is_active = true
    `;

    try {
      const result = await pool.query(query, [contactId]);
      if (result.rows.length === 0) {
        return { success: false, error: 'Contact not found' };
      }
      return { success: true, contact: result.rows[0] };
    } catch (error) {
      console.error('Error getting contact:', error);
      return { success: false, error: error.message };
    }
  }

  // Update contact
  async updateContact(contactId, updateData) {
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'position', 'department',
      'contact_type', 'is_primary_contact', 'can_make_decisions',
      'preferred_contact_method', 'timezone', 'availability_notes'
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

    values.push(contactId);
    const query = `
      UPDATE client_contacts 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return { success: false, error: 'Contact not found' };
      }
      return { success: true, contact: result.rows[0] };
    } catch (error) {
      console.error('Error updating contact:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete contact (soft delete)
  async deleteContact(contactId) {
    const query = `
      UPDATE client_contacts 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [contactId]);
      if (result.rows.length === 0) {
        return { success: false, error: 'Contact not found' };
      }
      return { success: true, contact: result.rows[0] };
    } catch (error) {
      console.error('Error deleting contact:', error);
      return { success: false, error: error.message };
    }
  }

  // Get primary contact for a client
  async getPrimaryContact(clientId) {
    const query = `
      SELECT * FROM client_contacts 
      WHERE client_id = $1 AND is_primary_contact = true AND is_active = true
      LIMIT 1
    `;

    try {
      const result = await pool.query(query, [clientId]);
      if (result.rows.length === 0) {
        return { success: false, error: 'Primary contact not found' };
      }
      return { success: true, contact: result.rows[0] };
    } catch (error) {
      console.error('Error getting primary contact:', error);
      return { success: false, error: error.message };
    }
  }

  // Set primary contact (removes primary from others)
  async setPrimaryContact(contactId, clientId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Remove primary from all other contacts for this client
      await client.query(`
        UPDATE client_contacts 
        SET is_primary_contact = false, updated_at = CURRENT_TIMESTAMP
        WHERE client_id = $1 AND id != $2
      `, [clientId, contactId]);

      // Set this contact as primary
      const result = await client.query(`
        UPDATE client_contacts 
        SET is_primary_contact = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND client_id = $2
        RETURNING *
      `, [contactId, clientId]);

      await client.query('COMMIT');

      if (result.rows.length === 0) {
        return { success: false, error: 'Contact not found' };
      }
      return { success: true, contact: result.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error setting primary contact:', error);
      return { success: false, error: error.message };
    } finally {
      client.release();
    }
  }

  // Search contacts
  async searchContacts(searchTerm, clientId = null) {
    let query = `
      SELECT cc.*, c.company_name 
      FROM client_contacts cc
      JOIN clients c ON cc.client_id = c.id
      WHERE cc.is_active = true AND (
        cc.first_name ILIKE $1 OR 
        cc.last_name ILIKE $1 OR 
        cc.email ILIKE $1 OR
        cc.position ILIKE $1
      )
    `;

    const values = [`%${searchTerm}%`];

    if (clientId) {
      query += ` AND cc.client_id = $2`;
      values.push(clientId);
    }

    query += ` ORDER BY cc.is_primary_contact DESC, cc.created_at ASC`;

    try {
      const result = await pool.query(query, values);
      return { success: true, contacts: result.rows };
    } catch (error) {
      console.error('Error searching contacts:', error);
      return { success: false, error: error.message };
    }
  }

  // Get contacts by type
  async getContactsByType(clientId, contactType) {
    const query = `
      SELECT * FROM client_contacts 
      WHERE client_id = $1 AND contact_type = $2 AND is_active = true
      ORDER BY is_primary_contact DESC, created_at ASC
    `;

    try {
      const result = await pool.query(query, [clientId, contactType]);
      return { success: true, contacts: result.rows };
    } catch (error) {
      console.error('Error getting contacts by type:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = ContactModel; 