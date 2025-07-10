const express = require("express");
const router = express.Router();
const cvController = require("../controllers/cv-generation");
const { authenticateUser } = require("../middleware/authMiddleware");

// 1️⃣ Start a new session (form mode only)
router.post("/session", authenticateUser, cvController.startSession);

// 2️⃣ Submit full CV form data
router.put("/:sessionId/data", authenticateUser, cvController.updateData);

// 3️⃣ Generate and save CV PDF
router.post("/:sessionId/generate", authenticateUser, cvController.generateCV);

router.get(
    "/session/:sessionId",
    authenticateUser,
    cvController.getSessionData
);

// 🔹 Get latest CV session data for developer
router.get("/active-session", authenticateUser, cvController.getActiveSession);

router.get(
    "/current-session",
    authenticateUser,
    cvController.getCurrentSession
);

// 4 reGenerate cv after edit and save CV PDF
// router.post(
//     "/:sessionId/regenerate",
//     authenticateUser,
//     cvController.regenerateCV
// );

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const cvController = require('../controllers/cv-generation');
// const { authenticateUser } = require('../middleware/authMiddleware');

// // Start session (form or chat)
// router.post('/start', authenticateUser, cvController.startSession);

// // Update data (form or chat mode)
// router.put('/update/:sessionId', authenticateUser, cvController.updateData);

// // Get session data
// router.get(
//     "/session/:sessionId",
//     authenticateUser,
//     cvController.getSessionData
// );

// // Generate CV
// router.post('/generate/:sessionId', authenticateUser, cvController.generateCV);

// // Chatbot input
// router.post('/chat/:sessionId', authenticateUser, cvController.handleChatMessage);

// module.exports = router;
