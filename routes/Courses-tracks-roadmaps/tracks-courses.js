const express = require('express');
const router = express.Router();
const { authenticateUser, authorize } = require('../../middleware/authMiddleware');
const tracksSummary = require('../../controllers/Courses-tracks-roadmaps/tracks-courses');

router.get('/tracks', authenticateUser, tracksSummary.getAllTracks);

router.get('/tracks/:trackId/courses', authenticateUser, tracksSummary.getTrackCourses);

module.exports = router;
