const jobModel = require('../models/jobModel');

const jobController = {
  // Create a new job posting
  async createJob(req, res) {
    try {
      const jobData = {
        ...req.body,
        posted_by: req.user.id // Assuming user info is attached by auth middleware
      };

      // Validate required fields
      const requiredFields = ['title', 'description', 'company_name'];
      for (const field of requiredFields) {
        if (!jobData[field]) {
          return res.status(400).json({
            success: false,
            message: `${field} is required`
          });
        }
      }

      const job = await jobModel.createJob(jobData);
      
      res.status(201).json({
        success: true,
        data: job,
        message: 'Job posted successfully'
      });
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create job posting',
        error: error.message
      });
    }
  },

  // Get all jobs with optional filters
  async getAllJobs(req, res) {
    try {
      const filters = {
        location: req.query.location,
        job_type: req.query.job_type,
        experience_level: req.query.experience_level,
        remote_option: req.query.remote_option,
        skills: req.query.skills ? req.query.skills.split(',') : null,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const jobs = await jobModel.getAllJobs(filters);
      
      res.status(200).json({
        success: true,
        data: jobs,
        count: jobs.length
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch jobs',
        error: error.message
      });
    }
  },

  // Get job by ID
  async getJobById(req, res) {
    try {
      const { id } = req.params;
      const job = await jobModel.getJobById(id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      res.status(200).json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch job',
        error: error.message
      });
    }
  },

  // Get jobs by user (posted_by)
  async getJobsByUser(req, res) {
    try {
      const userId = req.user.id;
      const status = req.query.status || null;
      
      const jobs = await jobModel.getJobsByUser(userId, status);
      
      res.status(200).json({
        success: true,
        data: jobs,
        count: jobs.length
      });
    } catch (error) {
      console.error('Error fetching user jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user jobs',
        error: error.message
      });
    }
  },

  // Update job
  async updateJob(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // First check if job exists and belongs to user
      const existingJob = await jobModel.getJobById(id);
      
      if (!existingJob) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      if (existingJob.posted_by !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own job postings'
        });
      }

      const updatedJob = await jobModel.updateJob(id, updateData);
      
      res.status(200).json({
        success: true,
        data: updatedJob,
        message: 'Job updated successfully'
      });
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update job',
        error: error.message
      });
    }
  },

  // Delete job (soft delete)
  async deleteJob(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // First check if job exists and belongs to user
      const existingJob = await jobModel.getJobById(id);
      
      if (!existingJob) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      if (existingJob.posted_by !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own job postings'
        });
      }

      const deletedJob = await jobModel.deleteJob(id, userId);
      
      res.status(200).json({
        success: true,
        data: deletedJob,
        message: 'Job deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete job',
        error: error.message
      });
    }
  },

  // Hard delete job (for admin purposes)
  async hardDeleteJob(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if user is admin (you might want to add admin check middleware)
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const deletedJob = await jobModel.hardDeleteJob(id, userId);
      
      if (!deletedJob) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      res.status(200).json({
        success: true,
        data: deletedJob,
        message: 'Job permanently deleted'
      });
    } catch (error) {
      console.error('Error hard deleting job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete job',
        error: error.message
      });
    }
  },

  // Search jobs
  async searchJobs(req, res) {
    try {
      const { q: searchTerm } = req.query;
      
      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }

      const filters = {
        location: req.query.location,
        job_type: req.query.job_type,
        limit: req.query.limit ? parseInt(req.query.limit) : 20
      };

      const jobs = await jobModel.searchJobs(searchTerm, filters);
      
      res.status(200).json({
        success: true,
        data: jobs,
        count: jobs.length,
        searchTerm
      });
    } catch (error) {
      console.error('Error searching jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search jobs',
        error: error.message
      });
    }
  }
};

module.exports = jobController; 