const express = require("express");
const router = express.Router();
const { extractLessonSkills } = require("../controllers/ai_skills_dev");
const { authenticateUser } = require("../middleware/authMiddleware");

router.post("/extract", authenticateUser, extractLessonSkills);

module.exports = router;
