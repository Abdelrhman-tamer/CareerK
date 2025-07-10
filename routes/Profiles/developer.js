const express = require("express");
const router = express.Router();
const get_edit_profile = require("../../controllers/Profiles/developerProfile/get-edit-profile");
const {
    authenticateUser,
    authorize,
} = require("../../middleware/authMiddleware"); // For protecting the route
const handleUploads = require("../../middleware/upload");
const saved_posts = require("../../controllers/Profiles/developerProfile/saved-posts");
const my_courses = require("../../controllers/Profiles/developerProfile/my-courses");
const my_cv = require("../../controllers/Profiles/developerProfile/my-cv");
const applied_jobs = require("../../controllers/Profiles/developerProfile/applied-jobs");
const notifications = require("../../controllers/Profiles/developerProfile/notifications");
const upload = require("../../middleware/upload");

// Get Developer Profile
router.get(
    "/profile",
    authenticateUser,
    authorize("developer"),
    get_edit_profile.getProfile
);

// PUT Update Profile
router.patch(
    "/edit-profile",
    authenticateUser,
    upload.fields([
        { name: "profile_picture", maxCount: 1 },
        { name: "uploaded_cv", maxCount: 1 },
    ]),
    get_edit_profile.updateProfile
);

// router.post('/bookmark', authenticateUser, saved_posts.toggleBookmark);         // POST body: { post_id }
// router.get('/bookmarks', authenticateUser, saved_posts.getBookmarks);           // GET query: ?postType=job/service (optional)
// router.get('/bookmark/:postId', authenticateUser, saved_posts.isBookmarked);    // GET one bookmark

router.get("/my-courses", authenticateUser, my_courses.getMyCourses);
router.put(
    "/my-courses/:courseId",
    authenticateUser,
    my_courses.updateCourseProgress
);

router.get(
    "/my-applications",
    authenticateUser,
    applied_jobs.getMyApplications
);

router.get("/notifications", authenticateUser, notifications.getSettings);
router.put("/notifications", authenticateUser, notifications.updateSettings);

router.get("/my-cv", authenticateUser, my_cv.getDeveloperCVs);
router.put(
    "/my-cv",
    authenticateUser,
    upload.single("uploaded_cv"),
    my_cv.updateDeveloperCV
);
router.delete("/my-cv", authenticateUser, my_cv.deleteDeveloperCV);

module.exports = router;
