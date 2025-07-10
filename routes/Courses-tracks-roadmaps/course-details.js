const express = require('express');
const router = express.Router();
const { authenticateUser, authorize } = require('../../middleware/authMiddleware');
const courseDetails = require('../../controllers/Courses-tracks-roadmaps/course-details');

router.get('/:courseId/header', authenticateUser, courseDetails.getCourseHeader);

router.get('/:courseId/overview', authenticateUser, courseDetails.getCourseOverview);

router.get('/:courseId/contents', authenticateUser, courseDetails.getCourseContents);

router.get('/:courseId/reviews', authenticateUser, courseDetails.getCourseReviews);

module.exports = router;
