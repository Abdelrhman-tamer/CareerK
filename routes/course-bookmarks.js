const express = require("express");
const router = express.Router();
const {
    addCourseBookmark,
    deleteCourseBookmark,
    fetchBookmarkedCourses,
    checkIfBookmarked,
    toggleBookmark,
} = require("../controllers/course-bookmarks");

const { authenticateUser } = require("../middleware/authMiddleware");

// router.post("/bookmark", authenticateUser, addCourseBookmark); // body: { courseId }
// router.delete("/bookmark/:courseId", authenticateUser, deleteCourseBookmark);
router.patch("/:courseId/bookmark", authenticateUser, toggleBookmark);
router.get("/bookmarks", authenticateUser, fetchBookmarkedCourses);
router.get("/:courseId/is-bookmarked", authenticateUser, checkIfBookmarked);

module.exports = router;
