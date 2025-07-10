const express = require("express");
const router = express.Router();
const { authenticateUser} = require('../../middleware/authMiddleware');
const course_enrollments_progress = require("../../controllers/Courses-tracks-roadmaps/course-enrollment-progress");

// Enroll in a course
router.post("/enroll/:courseId", authenticateUser, course_enrollments_progress.enrollInCourse);

// Complete a lesson (course content)
router.post("/lessons/complete", authenticateUser, course_enrollments_progress.completeLesson);

// Get enrolled ongoing courses
router.get("/my-courses/ongoing", authenticateUser, course_enrollments_progress.getOngoingCourses);

// Get completed courses
router.get("/my-courses/completed", authenticateUser, course_enrollments_progress.getCompletedCourses);

module.exports = router;
