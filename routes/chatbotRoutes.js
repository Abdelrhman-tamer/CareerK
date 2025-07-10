const express = require("express");
const router = express.Router();
const { ask, getHistory } = require("../controllers/chatbotController");
const { authenticateUser } = require("../middleware/authMiddleware");

router.post("/ask", authenticateUser, ask);

// GET /chatbot/history?session_id=optional
router.get("/history", authenticateUser, getHistory);

module.exports = router;
