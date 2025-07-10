// routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const {authenticateUser} = require('../middleware/authMiddleware'); // ensure developer is authenticated

// GET /developer/recommendations
router.get('/', authenticateUser, recommendationController.getDeveloperRecommendations);

module.exports = router;
