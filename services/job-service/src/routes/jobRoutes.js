const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/', jobController.getAllJobs);
router.get('/search', jobController.searchJobs);
router.get('/:id', jobController.getJobById);

// Protected routes (authentication required)
router.use(authMiddleware);

// Job management routes
router.post('/', jobController.createJob);
router.get('/user/my-jobs', jobController.getJobsByUser);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

// Admin routes (admin authentication required)
router.delete('/:id/hard', jobController.hardDeleteJob);

module.exports = router; 