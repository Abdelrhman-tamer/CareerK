const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/db');
require('dotenv').config();

// Helper function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = null;
    let role = '';

    // Check in Developers table
    let result = await pool.query('SELECT * FROM developers WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      user = result.rows[0];
      role = 'developer';
    }

    // Check in Companies table
    if (!user) {
      result = await pool.query('SELECT * FROM companies WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        user = result.rows[0];
        role = 'company';
      }
    }

    // Check in Customers table
    if (!user) {
      result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        user = result.rows[0];
        role = 'customer';
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate Access & Refresh Tokens
    const { accessToken, refreshToken } = generateTokens({ id: user.id, email: user.email, role });

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('❌ Error in login:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// 🔹 Fix the refreshToken function
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const { accessToken, refreshToken } = generateTokens(decoded);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('❌ Error in refreshToken:', error.message);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// 🔹 Ensure refreshToken is exported
module.exports = { loginUser, refreshToken };










// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { pool } = require('../config/db');
// require('dotenv').config();

// // Helper function to generate tokens
// const generateTokens = (user) => {
//   const accessToken = jwt.sign(
//     { id: user.id, email: user.email, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: '15m' } // Short-lived access token
//   );

//   const refreshToken = jwt.sign(
//     { id: user.id, email: user.email, role: user.role },
//     process.env.REFRESH_SECRET,
//     { expiresIn: '7d' } // Longer-lived refresh token
//   );

//   return { accessToken, refreshToken };
// };

// // Login User
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' });
//     }

//     let user = null;
//     let role = '';

//     // Check in Developers table
//     let result = await pool.query('SELECT * FROM developers WHERE email = $1', [email]);
//     if (result.rows.length > 0) {
//       user = result.rows[0];
//       role = 'developer';
//     }

//     // Check in Companies table
//     if (!user) {
//       result = await pool.query('SELECT * FROM companies WHERE email = $1', [email]);
//       if (result.rows.length > 0) {
//         user = result.rows[0];
//         role = 'company';
//       }
//     }

//     // Check in Customers table
//     if (!user) {
//       result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
//       if (result.rows.length > 0) {
//         user = result.rows[0];
//         role = 'customer';
//       }
//     }

//     if (!user) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     // Generate Access & Refresh Tokens
//     const { accessToken, refreshToken } = generateTokens({ id: user.id, email: user.email, role });

//     res.json({
//       message: 'Login successful',
//       user: { id: user.id, email: user.email, role },
//       accessToken,
//       refreshToken,
//     });
//   } catch (error) {
//     console.error('❌ Error in login:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

// // Refresh Token Route
// const refreshToken = async (req, res) => {
//   const { token } = req.body;
//   if (!token) return res.status(401).json({ message: 'Refresh token required' });

//   try {
//     const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
//     const { accessToken, refreshToken } = generateTokens(decoded);

//     res.json({ accessToken, refreshToken });
//   } catch (error) {
//     res.status(403).json({ message: 'Invalid refresh token' });
//   }
// };

// module.exports = { loginUser, refreshToken };









// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { pool } = require('../config/db');
// require('dotenv').config();

// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' });
//     }

//     let user = null;
//     let role = '';

//     // Check in Developers table
//     let result = await pool.query('SELECT * FROM developers WHERE email = $1', [email]);
//     if (result.rows.length > 0) {
//       user = result.rows[0];
//       role = 'developer';
//     }

//     // Check in Companies table
//     if (!user) {
//       result = await pool.query('SELECT * FROM companies WHERE email = $1', [email]);
//       if (result.rows.length > 0) {
//         user = result.rows[0];
//         role = 'company';
//       }
//     }

//     // Check in Customers table
//     if (!user) {
//       result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
//       if (result.rows.length > 0) {
//         user = result.rows[0];
//         role = 'customer';
//       }
//     }

//     if (!user) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     // Generate JWT Token
//     const token = jwt.sign(
//       { id: user.id, email: user.email, role },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.json({
//       message: 'Login successful',
//       user: { id: user.id, email: user.email, role },
//       token
//     });
//   } catch (error) {
//     console.error('❌ Error in login:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

// module.exports = { loginUser };
