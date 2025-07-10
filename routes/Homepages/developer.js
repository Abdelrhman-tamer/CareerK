const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../../middleware/authMiddleware");
const devHome = require("../../controllers/Homepages/developer");

router.get("/name", authenticateUser, devHome.fetchDeveloperName);

router.get("/courses", authenticateUser, devHome.fetchPopularCourses);

router.get("/tracks", authenticateUser, devHome.fetchTrackPreview);

router.get("/:trackId/courses", authenticateUser, devHome.fetchCoursesByTrack);

module.exports = router;
