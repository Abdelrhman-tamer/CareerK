const express = require('express');
const passport = require('../../config/passport');
const { loginUser, refreshToken } = require('../../controllers/Login/auth-login');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

// 🔹 Login with Email & Password
router.post('/login', loginUser);

// 🔹 Refresh Token Route
router.post('/refresh-token', refreshToken);
// , refreshToken

// 🔹 Google Authentication Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 🔹 Google Callback Route
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=No+account+found`);
  }

  // Generate tokens only if the user exists
  const accessToken = jwt.sign(
    { id: req.user.id, email: req.user.email, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: req.user.id, email: req.user.email, role: req.user.role },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return res.redirect(`${process.env.FRONTEND_URL}/auth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
});

// 🔹 GitHub Authentication Route
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// 🔹 GitHub Callback Route
router.get('/github/callback', passport.authenticate('github', { session: false }), (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=No+account+found`);
  }

  // Generate tokens only if the user exists
  const accessToken = jwt.sign(
    { id: req.user.id, email: req.user.email, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: req.user.id, email: req.user.email, role: req.user.role },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return res.redirect(`${process.env.FRONTEND_URL}/auth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
});

module.exports = router;









// const express = require("express");
// // const crypto = require("crypto");
// // const jwt = require("jsonwebtoken");
// // const bcrypt = require("bcryptjs");
// // const pool = require("../config/db"); // PostgreSQL connection
// // const sendEmail = require("../config/email");
// const { loginUser, requestPasswordReset, verifyOTP, resetPassword } = require("../controllers/authController");
// const passport = require("passport");


// const router = express.Router();

// router.post("/login", loginUser);

// // 1️⃣ Send OTP to user's email
// router.post("/forgot-password", requestPasswordReset);

// // 2️⃣ Verify 4-digit OTP
// router.post("/verify-otp", verifyOTP);

// // 3️⃣ Reset password after OTP verification
// router.post("/reset-password", resetPassword);



// // Store role in session before Google authentication
// router.get("/google/:role", (req, res, next) => {
//     req.session.role = req.params.role; // Store the role (company or developer)
//     next();
//   }, passport.authenticate("google", { scope: ["profile", "email"] }));
  
//   // Google callback
//   router.get(
//     "/google/callback",
//     passport.authenticate("google", { failureRedirect: "/login" }),
//     (req, res) => {
//       const token = jwt.sign({ id: req.user.id, role: req.user.role }, process.env.JWT_SECRET, {
//         expiresIn: "1d",
//       });
  
//       const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; // Default to local if not set

//         res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);

//     }
//   );
  
//   // Store role in session before GitHub authentication
//   router.get("/github/:role", (req, res, next) => {
//     req.session.role = req.params.role; // Store the role (company or developer)
//     next();
//   }, passport.authenticate("github", { scope: ["user:email"] }));
  
//   // GitHub callback
//   router.get(
//     "/github/callback",
//     passport.authenticate("github", { failureRedirect: "/login" }),
//     (req, res) => {
//       const token = jwt.sign({ id: req.user.id, role: req.user.role }, process.env.JWT_SECRET, {
//         expiresIn: "1d",
//       });
  
//       const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; // Default to local if not set

//         res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);

//     }
//   );

// // Logout
// router.get("/logout", (req, res) => {
//   req.logout();
//   res.redirect(process.env.CLIENT_URL);
// });


// module.exports = router;

