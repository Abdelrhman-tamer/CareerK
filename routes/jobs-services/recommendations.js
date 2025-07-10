const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/authMiddleware');
const recommendationController = require('../../controllers/jobs-services/recommendations');

// GET recommended jobs and services for authenticated developer
router.get('/', authenticateUser, recommendationController.getRecommendations);

module.exports = router;
