const express = require("express");
const { requestPasswordReset, verifyOTP, resetPassword } = require("../../controllers/Login/password-Reset");

const router = express.Router();

// Route to request password reset (Step 1)
router.post("/forgot-password", requestPasswordReset);

// Verify OTP before password reset
router.post("/verify-otp", verifyOTP);

router.post("/reset-password", resetPassword);

module.exports = router;
