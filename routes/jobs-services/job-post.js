const express = require('express');
const { 
  createJob, 
  getAllJobs, 
  getJobById, 
  updateJob, 
  deleteJob, 
  getMostRelevantJobs, 
  getRecentlyPostedJobs 
} = require('../../controllers/jobs-services/job-post');
const {authenticateUser} = require('../../middleware/authMiddleware');

const router = express.Router();

// Create a new job post
router.post('/create',authenticateUser, createJob);

// Get all job posts (with filters & pagination)
router.get('/get-job-posts', getAllJobs);

// Get a single job post by ID
router.get('/:id', getJobById);

// Update a job post
router.put('/:id',authenticateUser, updateJob);

// Delete a job post
router.delete('/:id',authenticateUser, deleteJob);

// Get most relevant jobs
router.get('/filter/most-relevant', getMostRelevantJobs);

// Get recently posted jobs
router.get('/filter/recently-posted', getRecentlyPostedJobs);

module.exports = router;
