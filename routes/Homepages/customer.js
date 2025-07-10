const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/authMiddleware');
const customerHomepage = require('../../controllers/Homepages/customer');

// ✅ GET customer homepage (title, profile picture, posted services, developers)
router.get('/homepage', authenticateUser, customerHomepage.getCustomerHomepage);


module.exports = router;
