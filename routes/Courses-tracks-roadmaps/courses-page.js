const express = require("express");
const router = express.Router();
const {
    authenticateUser,
    authorize,
} = require("../../middleware/authMiddleware");
const courses_page = require("../../controllers/Courses-tracks-roadmaps/courses-page");

router.get("/developer-name", authenticateUser, courses_page.getProfile);

router.get("/search-courses", courses_page.searchCourses);

router.get("/roadmaps/preview", courses_page.getTrackPreview);

router.get(
    "/courses/ongoing",
    authenticateUser,
    courses_page.getOngoingCourses
);

router.get(
    "/courses/related",
    authenticateUser,
    courses_page.getRelatedCourses
);

module.exports = router;
