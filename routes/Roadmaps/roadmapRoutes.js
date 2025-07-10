const express = require('express');
const router = express.Router();
const roadmapController = require('../../controllers/Roadmaps/roadmapController');
const roadmapProgressController = require('../../controllers/Roadmaps/roadmapProgressController');
const {authenticateUser} = require('../../middleware/authMiddleware'); // For protecting the route

// GET /roadmaps/:roadmapId/progress
router.get('/:roadmapId/progress', authenticateUser, roadmapProgressController.getProgressByRoadmap);

// GET /roadmaps/:trackId/:level
router.get('/:trackId/:level', authenticateUser, roadmapController.getRoadmapByTrackAndLevel);

// POST /roadmaps/progress
router.post('/progress', authenticateUser, roadmapProgressController.markStepCompletion);



module.exports = router;
