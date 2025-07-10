const bcrypt = require('bcryptjs');
const { pool } = require('../../config/db');

const registerCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirm_password,
      brief_description,
      contact_email,
      phone_number
    } = req.body;

    // Define role explicitly
    const role = "Customer";

     // Get uploaded profile picture
     const profile_picture = req.files?.profile_picture?.[0]?.filename || null;

    if (!name || !email || !password || !confirm_password) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await pool.query("SELECT * FROM customers WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = await pool.query(
      `INSERT INTO customers 
      (name, email, password, brief_description, contact_email, phone_number, role, profile_picture)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id, name, email, role, profile_picture`,
      [name, email, hashedPassword, brief_description, contact_email, phone_number, role, profile_picture]
    );

    res.status(201).json({
      message: "Customer registered successfully",
      user: newCustomer.rows[0]
    });

  } catch (error) {
    console.error("❌ Error in Customer Registration:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { registerCustomer };

