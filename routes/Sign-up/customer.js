const express = require('express');
const { registerCustomer } = require('../../controllers/Sign-up/customer');
const handleUploads = require('../../middleware/upload');

const router = express.Router();

// router.post('/register',upload.single('profile_picture'), registerCustomer);
router.post(
    '/register',
    handleUploads.fields([
      { name: 'profile_picture', maxCount: 1 }
    ]),
    registerCustomer
  );
// router.post('/register', registerCustomer);

module.exports = router;