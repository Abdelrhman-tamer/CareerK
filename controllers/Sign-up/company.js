const bcrypt = require('bcryptjs');
const { pool } = require('../../config/db');

const registerCompany = async (req, res) => {
  try {
    const {
      company_name,
      email,
      password,
      confirm_password,
      brief_description,
      country,
      city,
      address,
      website,
      industry,
      contact_name,
      contact_email,
      phone_number,
      social_media_links
    } = req.body;

    // Define role explicitly
    const role = "Company";

    // Get uploaded profile picture
    const profile_picture = req.files?.profile_picture?.[0]?.filename || null;

    if (!company_name || !email || !password || !confirm_password) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await pool.query("SELECT * FROM companies WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // const socialMediaArray = social_media_links || [];
    const socialMediaArray = Array.isArray(social_media_links)
    ? social_media_links
    : social_media_links
    ? [social_media_links]
    : [];

    const newCompany = await pool.query(
      `INSERT INTO companies 
      (company_name, email, password, brief_description, country, city, address, website, industry, contact_name, contact_email, phone_number, social_media_links, role, profile_picture)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
      RETURNING id, company_name, email, role, profile_picture`,
      [
        company_name, email, hashedPassword, brief_description, country, city, address,
        website, industry, contact_name, contact_email, phone_number, socialMediaArray, role, profile_picture
      ]
    );

    res.status(201).json({
      message: "Company registered successfully",
      user: newCompany.rows[0]
    });

  } catch (error) {
    console.error("❌ Error in Company Registration:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { registerCompany };




// const bcrypt = require("bcryptjs");
// const pool = require("../config/db");
// const jwt = require("jsonwebtoken");

// exports.registerCompany = async (req, res) => {
//     const {
//         company_name,
//         email,
//         password,
//         description,
//         country,
//         city,
//         address,
//         website,
//         industry,
//         contact_name,
//         contact_email,
//         phone_number,
//         social_links
//     } = req.body;

//     try {
//         // Check if email exists
//         const existingCompany = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//         if (existingCompany.rows.length > 0) {
//             return res.status(400).json({ error: "Email already registered" });
//         }

//         // Hash Password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Insert into Database
//         const result = await pool.query(
//             `INSERT INTO users (role, company_name, email, password, description, country, city, address, 
//             website, industry, contact_name, contact_email, phone, social_links) 
//             VALUES ('company', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
//             [company_name, email, hashedPassword, description, country, city, address, website, industry, contact_name, contact_email, phone_number, social_links]
//         );

//         // Generate JWT Token
//         const token = jwt.sign(
//             { user_id: result.rows[0].id, email: result.rows[0].email, role: "company" },
//             process.env.JWT_SECRET,
//             { expiresIn: "7d" }
//         );

//         res.status(201).json({ message: "Company registered successfully", company_id: result.rows[0].id, token });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Server error" });
//     }
// };
