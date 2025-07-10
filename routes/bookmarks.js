const express = require("express");
const router = express.Router();
const saved_posts = require("../controllers/bookmarks");
const { authenticateUser } = require("../middleware/authMiddleware");

router.use(authenticateUser); // Ensure all routes are protected

router.patch("/:post_id", saved_posts.toggleBookmark);
router.get("/", saved_posts.getBookmarks); // GET query: ?postType=job/service (optional)
router.get("/bookmark/:postId", saved_posts.isBookmarked); // GET one bookmark

module.exports = router;
