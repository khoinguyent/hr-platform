const db = require('../config/db');

const jobModel = {
  // Create a new job posting
  async createJob(jobData) {
    const {
      title,
      description,
      company_name,
      location,
      salary_min,
      salary_max,
      salary_currency,
      job_type,
      experience_level,
      remote_option,
      skills,
      benefits,
      requirements,
      responsibilities,
      contact_email,
      contact_phone,
      application_deadline,
      posted_by
    } = jobData;

    const query = `
      INSERT INTO jobs (
        title, description, company_name, location, salary_min, salary_max,
        salary_currency, job_type, experience_level, remote_option, skills,
        benefits, requirements, responsibilities, contact_email, contact_phone,
        application_deadline, posted_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *;
    `;

    const values = [
      title, description, company_name, location, salary_min, salary_max,
      salary_currency, job_type, experience_level, remote_option, skills,
      benefits, requirements, responsibilities, contact_email, contact_phone,
      application_deadline, posted_by
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Get all active jobs with optional filters
  async getAllJobs(filters = {}) {
    let query = 'SELECT * FROM jobs WHERE status = $1';
    let values = ['active'];
    let paramCount = 1;

    // Add filters
    if (filters.location) {
      paramCount++;
      query += ` AND location ILIKE $${paramCount}`;
      values.push(`%${filters.location}%`);
    }

    if (filters.job_type) {
      paramCount++;
      query += ` AND job_type = $${paramCount}`;
      values.push(filters.job_type);
    }

    if (filters.experience_level) {
      paramCount++;
      query += ` AND experience_level = $${paramCount}`;
      values.push(filters.experience_level);
    }

    if (filters.remote_option) {
      paramCount++;
      query += ` AND remote_option = $${paramCount}`;
      values.push(filters.remote_option);
    }

    if (filters.skills && filters.skills.length > 0) {
      paramCount++;
      query += ` AND skills && $${paramCount}`;
      values.push(filters.skills);
    }

    // Add sorting
    query += ' ORDER BY created_at DESC';

    // Add pagination
    if (filters.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const { rows } = await db.query(query, values);
    return rows;
  },

  // Get job by ID
  async getJobById(id) {
    const query = 'SELECT * FROM jobs WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  // Get jobs by user (posted_by)
  async getJobsByUser(userId, status = null) {
    let query = 'SELECT * FROM jobs WHERE posted_by = $1';
    let values = [userId];

    if (status) {
      query += ' AND status = $2';
      values.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const { rows } = await db.query(query, values);
    return rows;
  },

  // Update job
  async updateJob(id, updateData) {
    const allowedFields = [
      'title', 'description', 'company_name', 'location', 'salary_min',
      'salary_max', 'salary_currency', 'job_type', 'experience_level',
      'remote_option', 'skills', 'benefits', 'requirements', 'responsibilities',
      'contact_email', 'contact_phone', 'application_deadline', 'status'
    ];

    const updates = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        paramCount++;
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    paramCount++;
    values.push(id);

    const query = `
      UPDATE jobs 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Delete job (soft delete by setting status to 'closed')
  async deleteJob(id, userId) {
    const query = `
      UPDATE jobs 
      SET status = 'closed' 
      WHERE id = $1 AND posted_by = $2
      RETURNING *;
    `;
    const { rows } = await db.query(query, [id, userId]);
    return rows[0];
  },

  // Hard delete job (for admin purposes)
  async hardDeleteJob(id, userId) {
    const query = 'DELETE FROM jobs WHERE id = $1 AND posted_by = $2 RETURNING *;';
    const { rows } = await db.query(query, [id, userId]);
    return rows[0];
  },

  // Search jobs by title or description
  async searchJobs(searchTerm, filters = {}) {
    let query = `
      SELECT * FROM jobs 
      WHERE status = 'active' 
      AND (title ILIKE $1 OR description ILIKE $1 OR company_name ILIKE $1)
    `;
    let values = [`%${searchTerm}%`];
    let paramCount = 1;

    // Add additional filters
    if (filters.location) {
      paramCount++;
      query += ` AND location ILIKE $${paramCount}`;
      values.push(`%${filters.location}%`);
    }

    if (filters.job_type) {
      paramCount++;
      query += ` AND job_type = $${paramCount}`;
      values.push(filters.job_type);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    const { rows } = await db.query(query, values);
    return rows;
  }
};

module.exports = jobModel; 