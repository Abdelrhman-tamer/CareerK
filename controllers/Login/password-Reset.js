const { pool } = require("../../config/db");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendOTPEmail = require("../../config/sendOTPEmail");
const bcrypt = require('bcryptjs');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request Password Reset (Step 1: Generate & Send OTP)
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists (can be Developer, Company, or Customer)
    const user = await pool.query(
      "SELECT email FROM developers WHERE email = $1 UNION SELECT email FROM companies WHERE email = $1 UNION SELECT email FROM customers WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Store OTP in database (If email exists, update OTP)
    await pool.query(
      `INSERT INTO password_reset (email, otp, expires_at) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO UPDATE 
       SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
      [email, otp, expiresAt]
    );

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("❌ Error in requestPasswordReset:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyOTP = async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      // Check if OTP exists and is not expired
      const result = await pool.query(
        `SELECT * FROM password_reset WHERE email = $1 AND otp = $2 AND expires_at > NOW()`,
        [email, otp]
      );
  
      if (result.rows.length === 0) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
  
      // OTP is valid, return success
      res.status(200).json({ message: "OTP verified successfully" });
  
    } catch (error) {
      console.error("❌ Error in verifyOTP:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const resetPassword = async (req, res) => {
    try {
        const { email, otp, password, confirm_password } = req.body;
    
        // Check if all required fields are present
        if (!email || !otp || !password || !confirm_password) {
          return res.status(400).json({ message: "All fields are required" });
      }
  
      if (password !== confirm_password) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
  
      const otpRecord = await pool.query("SELECT * FROM password_reset WHERE email = $1 AND otp = $2", [email, otp]);
  
      if (otpRecord.rows.length === 0) {
        return res.status(400).json({ message: "Invalid OTP or email" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      let userTable = "developers";
      const userCheck = await pool.query(
        "SELECT 'developers' AS table_name FROM developers WHERE email = $1 UNION ALL SELECT 'companies' FROM companies WHERE email = $1 UNION ALL SELECT 'customers' FROM customers WHERE email = $1",
        [email]
      );
  
      if (userCheck.rows.length > 0) {
        userTable = userCheck.rows[0].table_name;
      } else {
        return res.status(400).json({ message: "User not found" });
      }
  
      await pool.query(`UPDATE ${userTable} SET password = $1 WHERE email = $2`, [hashedPassword, email]);
      await pool.query("DELETE FROM password_reset WHERE email = $1", [email]);
  
      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error in resetPassword:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };

module.exports = { requestPasswordReset, verifyOTP, resetPassword };
